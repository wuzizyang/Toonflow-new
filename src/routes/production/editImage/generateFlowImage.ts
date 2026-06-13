import express from "express";
import u from "@/utils";
import { z } from "zod";
import { error, success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import axios from "axios";
const router = express.Router();

/**
 * 将缩略图相对路径还原为原图相对路径。
 * 缩略图缓存命名为 `smallImage/<dir>/<base>_<pct>p<ext>`，
 * 需同时剥除 `/smallImage` 前缀（已由 replaceUrl 处理）与文件名末尾的 `_<pct>p` 尺寸后缀。
 */
function thumbToOriginalRelPath(imageUrl: string): string {
  const rel = u.replaceUrl(imageUrl).replace(/^smallImage\//, "");
  // 去掉缩略图尺寸后缀：xxx_20p.jpg / xxx_200x300.jpg -> xxx.jpg
  return rel.replace(/_(\d+(?:\.\d+)?p|\d+x\d+)(\.[^./]+)$/i, "$2");
}

async function urlToBase64(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("/oss/")) {
    return await u.oss.getImageBase64(thumbToOriginalRelPath(imageUrl));
  }
  imageUrl = await u.oss.getFileUrl(u.replaceUrl(imageUrl));
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const contentType = response.headers["content-type"] || "image/png";
  const base64 = Buffer.from(response.data, "binary").toString("base64");
  return `data:${contentType};base64,${base64}`;
}
export default router.post(
  "/",
  validateFields({
    model: z.string(),
    references: z.array(z.string()).optional(),
    quality: z.string(),
    ratio: z.string(),
    prompt: z.string(),
    projectId: z.number(),
  }),
  async (req, res) => {
    const { model, references = [], quality, ratio, prompt, projectId } = req.body;
    try {
      const imageClass = await u.Ai.Image(model).run(
        {
          prompt: prompt,
          referenceList: await (async () => {
            const list: { type: "image"; base64: string }[] = [];
            for (const url of references) {
              list.push({ type: "image" as const, base64: await urlToBase64(url) });
            }
            return list;
          })(),
          size: quality,
          aspectRatio: ratio,
        },
        {
          taskClass: "工作流图片生成",
          describe: "工作流图片生成",
          relatedObjects: JSON.stringify(req.body),
          projectId: projectId,
        },
      );
      const savePath = `${projectId}/workFlow/${u.uuid()}.jpg`;
      await imageClass.save(savePath);

      const url = await u.oss.getSmallImageUrl(savePath);
      return res.status(200).send(success({ url }));
    } catch (e) {
      res.status(400).send(error(u.error(e).message));
    }
  },
);
