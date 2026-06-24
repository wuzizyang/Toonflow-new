# Implementation Plan: 宠物拟人化Vlog 技能库重构（SSOT 收敛）

## Overview

本计划把「宠物拟人化Vlog」技能库（12 个静态 Markdown 文件）的结构性重构拆解为可增量执行的步骤。核心顺序是**先盘点、再裁定冲突、最后做破坏性编辑**：
1. 先建立重构前 Rule_ID 全量清单与基线快照（任何破坏性编辑之前）；
2. 形成冲突清单并经维护者确认（D-0 防漂移/去AI味 SSOT 归属、数值/措辞冲突）后才允许收敛；
3. 以 `prefix.md` 为全局 SSOT 收敛全局规则；
4. 逐个 `art_prompt/*` 文件删重复正文改引用（运行时由 prefix 注入补回）；
5. 逐个 `driector_skills/*` 文件保持自包含正文 + 同源 Rule_ID 标注（绝不退化为裸引用）；
6. 清理 README 规范性元素；
7. 用一次性 Node/TS 审计脚本加载 12 文件并复现 `getArtPrompt`/`readSkill` 两条加载路径，执行 8 项确定性审计作为采纳门禁；
8. 最终完整性检查并清理临时产物。

实现语言：**TypeScript/Node**（与既有代码库及 `src/utils/getArtPrompt.ts`、`src/routes/production/storyboard/regeneratePrompt.ts` 中的加载器一致）。被重构的内容本身为静态 Markdown。

> 说明：本特性为静态内容重构，输入固定（12 文件）、加载器既有且确定性，**不采用属性化测试（PBT）**；验证以 8 项确定性审计完成（见验证章节）。

## Tasks

- [x] 1. 重构前盘点与基线快照（破坏性编辑之前，只读）
  - [x] 1.1 构建重构前 Rule_ID 全量清单 `inventory.before`
    - 只读遍历全部 12 个文件，逐条枚举 Rule_ID（含 R1–R10、X1–X9 及 X6b/X6c/X3b/X3c、S1–S9/S8.1、E1–E5、M1–M4、L0–L5、F1–F4、C1–C4/C1–C10、V1–V4、P0–P2/P1–P4、B1–B4 等）
    - 每条产出条目字段：`ruleId`、`qualifiedId`(`<文件名>#<Rule_ID/锚点>`)、`family`(所属共享规则族)、`effectiveSemantics`、`enforcementLevel`、`preRefactorSources`（重构前出现位置列表）
    - 以 Markdown 表或 JSON 制品形式落盘到 spec 目录，作为完整性双射审计的输入
    - _Requirements: 7.1, 1.3, 10.1, 10.2_

  - [x] 1.2 构建 Rule_ID 命名空间冲突表与别名映射骨架
    - 基于 1.1 清单标出「同一 ID 文本在不同文件表不同规则」的全部命名空间冲突（R/X/L/C/S/P 等），证明「稳定标识必须文件限定」
    - 建立别名映射骨架：`deprecatedRef → canonical(file#id)`（如 `见 prefix S8`→`prefix.md#S8`；标注 art_character 的 S1–S4 工作流步骤非过审 S 系列）
    - _Requirements: 7.4, 7.5, 4.3_

  - [x] 1.3 采集两条加载路径的重构前基线快照
    - 用既有 `getArtPrompt` 复现 7 个 `art_prompt/*` 文件的 `Assembled_Prompt`（prefix + 正文），落盘快照
    - 用既有 `readSkill` 复现 3 个 `driector_skills/*` 文件的 `Assembled_Prompt`（无 prefix、仅去 frontmatter），落盘快照
    - 这些快照作为后续行为等价审计（审计 2）的「重构前」对照基准
    - _Requirements: 3.1, 3.2, 8.3, 8.4_

- [x] 2. 冲突清单（暂缓收敛、不自动选值）
  - [x] 2.1 构建冲突清单 Conflict Register
    - 记录设计级冲突 D-0（防漂移/去AI味 的 SSOT 归属：迁入 prefix 会扩大注入范围、违反 Behavioral_Equivalence；候选归属 `art_storyboard_video.md`）
    - 记录设计级冲突 D-1（prefix 内「色彩使用层级 L1–L3」与「曝光与去AI味光照 L1–L5」同名，需锚点消歧）
    - 记录内容收敛冲突：同源规则的数值冲突（真实兽体尺度立起高度「小腿」vs「膝盖/大腿」、色温/饱和度/曝光区间等）与措辞/强制级冲突
    - 每条字段：`conflictId`、`ruleId`、`sources[{loc,value}]`、`status=PENDING_MAINTAINER`、`resolution=null`；不自动选值
    - _Requirements: 3.4, 7.5_

- [x] 3. Checkpoint - 维护者确认门禁
  - 向维护者出示冲突清单，确认 D-0（防漂移/去AI味 SSOT 归属）与全部数值/措辞冲突的采用值；未确认项保留两处原文、暂缓收敛。Ensure all tests pass, ask the user if questions arise.

- [x] 4. prefix.md 全局 SSOT 收敛
  - [x] 4.1 消解 prefix.md 内部 L 命名冲突（D-1）
    - 对「色彩使用层级 L1–L3」与「曝光与去AI味光照 L1–L5」以锚点限定消歧（如 `#色彩层级-Ln` / `#曝光层-Ln`）
    - 两套局部 Rule_ID 文本逐字符保持不变，仅在 qualifiedId/锚点层面区分
    - _Requirements: 7.2, 7.5, 5.1_

  - [x] 4.2 确立 prefix.md 为全局规范来源
    - 确认风格基因、全局色彩盘 C1–C10/E1–E5/色温/容差、曝光去AI味光照 L1–L5、全局必守 R1–R6/R4b、严禁 X1–X8/X6b/X6c、敏感词 S1–S9/S8.1（含风险词→安全替换映射表逐行）、情绪维度 M1–M4、短视频策略层 6.1–6.5 在 prefix 中各有且仅有一份规范正文
    - 为每条全局规则提供全库唯一稳定锚点；保持现有章节顺序与 Rule_ID 文本不变；仅做「合并同义重复 + 统一表述」，不下调任何 SHALL/必须/严禁 力度
    - 仅接收「重构前已对全部 art_prompt 文件生效」的规则；资产专属族不得迁入（注入范围守恒）
    - _Requirements: 1.1, 1.3, 1.4, 2.4, 3.3, 6.2_

- [x] 5. art_prompt/* 引用化重构（可引用，运行时由 prefix 注入补回）
  - [x] 5.1 重构 art_prompt/art_character.md
    - 删除已被 prefix 覆盖的全局规则正文（体型/姿态全局陈述、写实词、真实兽体尺度全局规范、反卡通等），改为指向 prefix 稳定标识的单处 Cross_Reference（`prefix.md#R2`/`#R4b`/`#X6`/`#X8`/`#S8` 等）
    - 保留四视图规范、形态锁定工作流、面容/毛发/体型/服装等角色专属正文与角色专属 R1–R10/X1–X9；四视图尺度数值作为专属保留
    - _Requirements: 1.2, 2.2, 2.4, 4.1, 4.3, 5.2, 7.3_

  - [x] 5.2 重构 art_prompt/art_character_derivative.md
    - 全局质感/写实/反卡通词改为引用 prefix；保留 L0–L5 叠加层、面部状态矩阵等衍生专属正文
    - _Requirements: 1.2, 2.2, 2.4, 4.1, 4.3, 5.2, 7.3_

  - [x] 5.3 重构 art_prompt/art_prop.md
    - 全局反卡通/荧光色/写实词改为引用 prefix；保留纯道具静物约束、四宫格、材质等道具专属正文（含资产专属严禁项如「无角色」）
    - _Requirements: 1.2, 2.2, 2.4, 4.1, 4.3, 5.2, 7.3_

  - [x] 5.4 重构 art_prompt/art_prop_derivative.md
    - 全局族改为引用 prefix；保留材质状态变体等衍生专属正文
    - _Requirements: 1.2, 2.2, 2.4, 4.1, 4.3, 5.2, 7.3_

  - [x] 5.5 重构 art_prompt/art_scene.md
    - 季节→色盘的应用映射保留为场景专属，引用 prefix 色名/色温；保留场景层次、杭州默认定位 R5b、效果图禁忌等场景专属正文；S8/S8.1 引用形式保留并校准为 `prefix.md#S8`/`#S8.1`
    - _Requirements: 1.2, 2.2, 2.4, 4.1, 4.3, 5.2, 7.3_

  - [x] 5.6 重构 art_prompt/art_scene_derivative.md
    - 保留景别/时段/天候/角度变体等衍生专属正文；S8/S8.1 引用形式保留
    - _Requirements: 1.2, 2.2, 2.4, 4.1, 4.3, 5.2, 7.3_

  - [x] 5.7 重构 art_prompt/art_storyboard_video.md（本族单一来源）
    - **保留**防漂移六节、去AI味/反退化六节、视频风格标签、F1–F4、C1–C4 作为视频资产族的规范正文（本族 SSOT，依 D-0 维护者确认结论）
    - 其引用 prefix 的全局光照/色温/S8 处保持为指向 `prefix.md` 的引用；视频专属 C1–C4 以文件限定标识与 prefix 色名 C1–C10 区分
    - _Requirements: 1.2, 1.4, 2.2, 2.4, 4.1, 4.3, 5.2, 7.3_

- [x] 6. Checkpoint - art_prompt 路径等价初核
  - 对 7 个 art_prompt 文件抽样复现 `getArtPrompt`，确认引用化后 prefix 注入可补回被删正文。Ensure all tests pass, ask the user if questions arise.

- [x] 7. driector_skills/* 自包含重构（须自包含，禁止裸引用）
  - [x] 7.1 重构 driector_skills/director_planning_style.md
    - 保留色调体系、光影方案 A–F、光线真实感 L1–L3、质感方向（情境化姿态）、声音约束 B1–B4 等生成时实际生效正文于文件内
    - 同源规则以与 prefix 逐字符相同的 Rule_ID 标注，并附「同源于 prefix.md#… / art_storyboard_video.md#…」溯源 Cross_Reference；不得替换为裸引用
    - 注意 director 局部光线真实感 L1–L3 与 prefix 曝光层 L1–L5 以文件限定区分
    - _Requirements: 1.5, 2.3, 4.2, 4.4, 5.2, 9.3_

  - [x] 7.2 重构 driector_skills/director_storyboard.md
    - 自包含保留姿态切换表、POV 分层 V1–V4、景别优先级、多图融合（真实兽体尺度参照基准表/尺度锚定卡/模式A·B 声明）、情绪映射、表演维度 P1–P4、固定风格锚定词、负向词模板、美学禁止项
    - 真实兽体尺度/S1–S9/S8.1/姿态等同源处标同 Rule_ID + 溯源引用；过审约束正文须在文件内可检出（不裸引用）
    - _Requirements: 1.5, 2.3, 4.2, 4.4, 5.2, 9.3_

  - [x] 7.3 重构 driector_skills/director_storyboard_table_style.md
    - 自包含保留分镜表色彩/光影/动作节奏（真实兽体尺度、跨镜头基准）、运镜禁忌、防漂移第六节视频生成稳定性正文
    - 同源处标同 Rule_ID + 溯源引用；不得裸引用
    - _Requirements: 1.5, 2.3, 4.2, 4.4, 5.2, 9.3_

- [x] 8. README 职责边界清理
  - [x] 8.1 清理 README.md 规范性元素、保留人类可读概述
    - 移除/确认零规范性元素：带编号规则条目（R/X/S/L/E/M/C+数字）、十六进制色值（如 #FAF3E7）、数值阈值/区间（4800-5800K、50-70%、±10°）
    - 保留风格概述、适用范围、严禁内容的叙述性正文（不因校验删除人类可读概述）
    - _Requirements: 6.1, 6.3, 6.5_

- [x] 9. 重构后清单与别名映射定稿
  - [x] 9.1 构建重构后 Rule_ID 清单 `inventory.after` 并完成别名映射
    - 为每个重构前 Rule_ID 给出重构后唯一规范承载位置（`file#id` 或带锚点小节）；director 自包含同源副本经 `selfContainedCopies` 标注，不计为额外承载位置
    - 完成 `deprecated_id → canonical(file#id)` 别名映射全表，使历史引用仍可定位
    - _Requirements: 7.4, 7.6, 10.1, 10.2, 10.3_

- [x] 10. 验证：一次性审计脚本与 8 项确定性审计（采纳门禁）
  - [x] 10.1 构建一次性 Node/TS 审计脚本骨架
    - 脚本加载全部 12 个文件，并复用既有 `getArtPrompt`（7 个 art_prompt）与 `readSkill`（3 个 director）逻辑复现两条加载路径产物
    - 提供逐项审计的「通过/失败 + 失败明细」输出框架；声明为一次性校验工具（非长驻进程），运行后清理临时产物
    - _Requirements: 8.3, 8.4_

  - [x] 10.2 审计 1：内容完整性清单双射（核心门禁）
    - 以 `(ruleId, effectiveSemantics)` 语义归并去重后，建立 `inventory.before ↔ inventory.after` 双向一一对应
    - 断言：每条 before 在 after 恰有一规范承载位置；每条 after 在 before 恰有一来源；去重后计数相等；director 自包含副本不计额外约束
    - 失败时输出丢失/新增 Rule_ID 列表
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 10.3 审计 2：两条加载路径行为等价
    - 2A：对 7 个 art_prompt 文件，断言 `getArtPrompt` 产物（prefix+正文）非空，且按 Rule_ID/语义归并后的有效约束集合与 1.3 基线等价（不增/不删/不弱化），S1–S9+S8.1 全部可检出
    - 2B：对 3 个 director 文件，断言 `readSkill` 产物（无 prefix）非空，有效约束集合与基线等价，且过审/姿态/尺度等生效正文均在文件内自包含可检出（非裸引用）
    - _Requirements: 3.1, 3.2, 8.3, 8.4, 9.2, 9.3_

  - [x]* 10.4 审计 3：去重彻底性
    - 对每条 Shared_Rule 规范正文做全库扫描：在其规范来源文件出现次数=1；不在来源之外任何文件以完整正文重复（director 自包含副本除外，且须带同 Rule_ID + 溯源）
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.4_

  - [x]* 10.5 审计 4：引用策略一致性
    - 对 3 个 director 文件：断言每处溯源引用均随附生效正文、无裸引用
    - 对 7 个 art_prompt 文件：断言被改为引用的全局规则其规范定义确在 prefix.md（运行时会被注入）
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x]* 10.6 审计 5：交叉引用有效性
    - 解析全部文件 Cross_Reference，断言每处解析到唯一存在目标（库内文件/目标文件锚点/已定义 Rule_ID）；未解析引用数=0；无残留指向旧位置的引用
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x]* 10.7 审计 6：README/prefix 职责边界扫描
    - 正则扫描 README.md：断言不含带编号规则条目、十六进制色值（`#[0-9A-Fa-f]{6}`）、数值阈值/区间（`\d+-\d+K`、`\d+-\d+%`、`±\d+°`）；命中即失败
    - 断言 README 人类可读概述段落仍存在（未被误删）
    - _Requirements: 6.1, 6.3, 6.4, 6.5_

  - [x]* 10.8 审计 7：受保护命名/代码契约
    - 断言基准目录、`art_prompt/`、`driector_skills/`（含既有拼写）、`prefix.md`、`README.md`、art_prompt 7 文件名、driector_skills 3 文件名全部未变
    - 断言两个加载器对各文件按原固定路径仍可定位（产物非空间接覆盖）
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x]* 10.9 审计 8：冲突清单闭合
    - 断言仍处 `PENDING_MAINTAINER` 的冲突项未被自动收敛（两处原文仍在）；已收敛项均有维护者确认记录
    - _Requirements: 3.4, 7.5_

- [x] 11. 最终完整性检查与收尾
  - [x] 11.1 运行全部审计、确认零丢失/零新增并清理临时产物
    - 汇总 8 项审计结果，确认完整性双射通过、两条路径行为等价、引用零死链、命名契约未破坏、冲突清单闭合
    - 任一审计失败则按 Error Handling 回退相关改动、保留原正文；通过后清理一次性审计脚本与中间产物
    - _Requirements: 8.5, 10.6_

## Notes

- 标记 `*` 的子任务为可选审计（去重/引用/交叉引用/README/命名/冲突闭合扫描），可在快速迭代中暂缓；但本重构的安全性依赖 8 项审计作为采纳门禁，强烈建议全部执行。
- 审计 1（完整性双射）与审计 2（行为等价）为核心门禁，未标记为可选——它们直接守护 Behavioral_Equivalence 这一首要约束。
- 任务顺序保证「盘点 → 冲突裁定 → 破坏性编辑」：1（盘点）与 2/3（冲突清单+维护者门禁）先于第 4 起的所有编辑。
- 每条任务标注其满足的具体需求条款编号，便于追溯。
- 本特性不使用属性化测试（PBT）：输入固定（12 文件）、加载器既有且确定性，验证为确定性审计。
- 受保护命名（含 `driector_skills` 既有拼写）一律冻结，不在本次重构范围内重命名。

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3", "10.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "7.1", "7.2", "7.3", "8.1"] },
    { "id": 6, "tasks": ["9.1"] },
    { "id": 7, "tasks": ["10.2", "10.3", "10.4", "10.5", "10.6", "10.7", "10.8", "10.9"] },
    { "id": 8, "tasks": ["11.1"] }
  ]
}
```
