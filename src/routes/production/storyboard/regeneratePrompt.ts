import express from "express";
import * as fs from "fs";
import path from "path";
import { z } from "zod";
import u from "@/utils";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

/** 去掉 skill 文件头部的 frontmatter，仅保留正文 */
function stripFrontmatter(content: string): string {
  return content.replace(/^\uFEFF?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/, "").trim();
}

/** 安全读取一个 skill 文件正文，文件不存在时返回空串 */
async function readSkill(...segments: string[]): Promise<string> {
  try {
    const filePath = u.getPath(["skills", ...segments]);
    if (!fs.existsSync(filePath)) return "";
    const raw = await fs.promises.readFile(filePath, "utf-8");
    return stripFrontmatter(raw);
  } catch {
    return "";
  }
}

/** 从模型输出中提取 <prompt> 标签内容；若无标签则回退为去除常见包裹后的全文 */
function extractPrompt(text: string): string {
  const regex = /<prompt[^>]*>([\s\S]*?)<\/prompt>/gi;
  const matches = [...text.matchAll(regex)];
  if (matches.length) {
    const longest = matches.reduce((a, b) => (b[1].length > a[1].length ? b : a));
    return longest[1].trim();
  }
  // 回退：去掉可能的代码块包裹
  return text.replace(/```[a-zA-Z]*\n?/g, "").trim();
}

const TYPE_LABEL: Record<string, string> = {
  role: "角色",
  scene: "场景",
  tool: "道具",
};

export default router.post(
  "/",
  validateFields({
    storyboardId: z.number(),
    extraInstruction: z.string().optional().nullable(),
  }),
  async (req, res) => {
    const { storyboardId, extraInstruction } = req.body as {
      storyboardId: number;
      extraInstruction?: string | null;
    };

    // 1. 取分镜数据
    const storyboard = await u.db("o_storyboard").where({ id: storyboardId }).first();
    if (!storyboard) return res.status(404).send(error("未找到该分镜"));

    // 2. 取项目风格信息
    const project = await u.db("o_project").where("id", storyboard.projectId).select("artStyle", "directorManual").first();
    if (!project) return res.status(404).send(error("未找到所属项目"));

    // 3. 按引用顺序取关联资产（重建 @图N 映射）
    const relRows = await u
      .db("o_assets2Storyboard")
      .where("storyboardId", storyboardId)
      .orderBy("rowid")
      .select("assetId");
    const assetIds = relRows.map((r: any) => r.assetId);
    let assetLines = "";
    if (assetIds.length) {
      const assetRows = await u.db("o_assets").whereIn("id", assetIds).select("id", "name", "type");
      const id2asset = new Map<number, any>();
      assetRows.forEach((a: any) => id2asset.set(a.id, a));
      assetLines = assetIds
        .map((id: number, idx: number) => {
          const a = id2asset.get(id);
          const label = a ? `${a.name ?? ""}（${TYPE_LABEL[a.type] ?? a.type ?? "资产"}）` : "未知资产";
          return `@图${idx + 1} = ${label}`;
        })
        .join("\n");
    }

    // 4. 加载技法
    const panelSkill = await readSkill("production_execution_storyboard_panel.md");
    const promptTech = await readSkill("production_skills", "storyboard_prompt_techniques.md");
    const styleTech = project.artStyle ? await readSkill("art_skills", project.artStyle, "driector_skills", "director_storyboard.md") : "";

    // 5. 构造系统提示词（聚焦单条 · 首位帧模式 第4~6步）
    const systemPrompt = [
      "你是视频制作项目的执行层 Agent，现在只负责为「单条分镜」重新生成图片提示词（prompt）。",
      "严格遵循首位帧模式的提示词生成规范：图像资产标注（@图N）、首帧原则、六项忠实性校验，并禁止出现任何光影/色温/明暗/色调/音乐描述。",
      "",
      "## 通用提示词技法（必须遵循）",
      promptTech || "（未找到通用技法，按常规分镜提示词规范处理）",
      "",
      "## 风格专属分镜技法（与通用技法冲突时以本节为准）",
      styleTech || "（未找到风格专属技法）",
      "",
      "## 分镜面板写入规范节选（首位帧模式）",
      panelSkill || "",
      "",
      "## 输出格式（强制）",
      "只输出最终提示词，包裹在如下标签内，禁止任何解释、汇报或多余文字：",
      "<prompt>这里是重新生成的提示词</prompt>",
    ].join("\n");

    // 6. 构造用户输入
    const userPrompt = [
      "请基于以下分镜信息，重新生成该分镜的图片提示词。",
      "",
      "### 该分镜的视频描述（videoDesc，含画面/场景/景别/运镜/角色动作/朝向/空间关系/情绪等结构化信息）",
      storyboard.videoDesc || "（无）",
      "",
      "### 当前提示词（供参考，可改写优化）",
      storyboard.prompt || "（无）",
      "",
      "### 关联图像资产（用于 @图N 标注，N 为引用顺序）",
      assetLines || "（无关联资产，提示词中不要使用 @图N 标注）",
      "",
      "### 用户额外指令（最高优先级，用于引导风格/重点；不得违反忠实性与光影/音乐排除约束）",
      extraInstruction?.trim() ? extraInstruction.trim() : "（无）",
      "",
      "请直接输出 <prompt>...</prompt>。",
    ].join("\n");

    try {
      const result = await u.Ai.Text("productionAgent:storyboardPanelAgent").invoke({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const newPrompt = extractPrompt(result.text ?? "");
      if (!newPrompt) return res.status(500).send(error("提示词生成失败：模型未返回有效内容"));

      // 7. 回写
      await u.db("o_storyboard").where({ id: storyboardId }).update({ prompt: newPrompt });

      res.status(200).send(success({ prompt: newPrompt }, "重新生成提示词成功"));
    } catch (e) {
      res.status(500).send(error(u.error(e).message || "提示词生成失败"));
    }
  },
);
