# inventory.before — 重构前 Rule_ID 全量清单（只读盘点）

> Spec Task 1.1 · _Requirements: 7.1, 1.3, 10.1, 10.2_
>
> 本清单由**只读**遍历 `pet_anthropomorphic_vlog/` 下 12 个技能文件枚举得到，**未修改任何技能文件**。
> 机器可读全量条目（含 `effectiveSemantics`/`enforcementLevel`/`preRefactorSources` 等字段）见同目录 `inventory.before.json`（共 **264** 条）。
> 本制品作为内容完整性双射审计（design.md 审计 1）的「重构前」对照基准。

## 1. 盘点范围与加载器

| 文件 | 加载器 | 引用策略含义 |
|---|---|---|
| `README.md` | 不被任一加载器注入 | 人类可读概述，无规范性 Rule_ID |
| `prefix.md` | GetArtPrompt（前置注入到所有 art_prompt） | 全局 SSOT 候选载体 |
| `art_prompt/`（7 文件） | GetArtPrompt（prefix 自动前置拼接） | 可引用（运行时由 prefix 注入补回） |
| `driector_skills/`（3 文件） | ReadSkill（不拼接 prefix） | 须自包含（裸引用 = 规则丢失） |

## 2. 每文件 Rule_ID 清单（按出现位置）

### 2.1 prefix.md（全局，66 条）
- **风格基因**：`风格基因`（一级/二级风格、情感基调、质感锚词、核心定位）
- **全局色彩盘**：色彩使用层级 `色彩层级-L1/L2/L3`；色值 `C1`–`C10`；`硬约束色`、`软约束色`、`情绪色盘`；情绪色盘使用规则 `E1`–`E5`；`色温约束`；曝光与去AI味光照 `曝光层-L1`–`曝光层-L5`；`容差与例外`
- **全局约束规则**：必守 `R1`、`R2`、`R3`、`R4`、`R4b`、`R5`、`R6`；严禁 `X1`–`X5`、`X6`、`X6b`、`X6c`、`X7`、`X8`
- **敏感词规避**：`风险词→安全替换映射表`（9 行）；`S1`–`S9`；`S8.1`
- **情绪扩展维度**：`M1`–`M4`
- **短视频内容策略层**：`6.1`–`6.5`

### 2.2 README.md（1 条）
- 无任何带编号 Rule_ID、十六进制色值或数值阈值/区间；仅叙述性风格概述（重构后须维持此「零规范性元素」状态，需求 6）。

### 2.3 art_prompt/art_character.md（24 条）
- 形态锁定工作流步骤 `S1(工作流)`/`S2(工作流)`/`S3(工作流)`（**非过审 S 系列**）
- 必守 `R1`–`R10`；严禁 `X1`、`X2`、`X3`、`X3b`、`X3c`、`X4`–`X9`

### 2.4 art_prompt/art_character_derivative.md（38 条）
- 叠加层级 `L0`–`L5`
- L1 线索分析步骤 `S1(L1线索)`–`S4(L1线索)`（**非过审 S 系列**）
- 必守 `R1`–`R13`；严禁 `X1`–`X15`

### 2.5 art_prompt/art_prop.md（11 条）
- 必守 `R1`–`R3`；严禁 `X1`–`X8`

### 2.6 art_prompt/art_prop_derivative.md（13 条）
- 必守 `R1`–`R4`；严禁 `X1`–`X9`

### 2.7 art_prompt/art_scene.md（21 条）
- 打工场景优先级 `P0`/`P1`/`P2`
- 必守 `R1`–`R5`、`R5b`、`R6`–`R8`；严禁 `X1`–`X9`

### 2.8 art_prompt/art_scene_derivative.md（18 条）
- 必守 `R1`–`R10`；严禁 `X1`–`X8`

### 2.9 art_prompt/art_storyboard_video.md（26 条）
- `视频风格标签`（三模式正文）
- 防漂移规范六节 `防漂移-一`…`防漂移-六` + `防漂移负向词`
- 去AI味/反退化六节 `去AI味-一`…`去AI味-六` + `去AI味负向词`
- `短脚本节奏结构`；短脚本视频规范 `F1`–`F4`；`运镜分级`；`剪辑节奏指导`；剪辑节奏 `C1`–`C4`（**剪辑节奏，非 prefix 色名 C**）

### 2.10 driector_skills/director_planning_style.md（16 条，须自包含）
- `色调体系`、`情绪向场景色`、`色彩节奏`
- `光影方案A-F`
- 光线真实感 `L1(光线真实感)`/`L2(光线真实感)`/`L3(光线真实感)`（**与 prefix 曝光层 L 同名不同义**）；`光线瑕疵美学`
- `质感方向`、`生活场景空间元素`
- 声音约束 `声音约束`、`B1`–`B4`、`字幕设计规范`

### 2.11 driector_skills/director_storyboard.md（24 条，须自包含）
- `角色姿态按行为切换`
- 镜头视角分层 `V1`–`V4`；`景别优先级`
- 多图融合六节 `多图融合-一`…`多图融合-六`（其中 `多图融合-三` = 真实兽体尺度参照基准表 + 场景物件尺度锚定卡 + 跨镜头一致性）
- `情绪→面容眼神映射`；表演节奏 `P1`–`P4`（**表演节奏，非 art_scene 场景优先级 P**）；`角色表演维度`
- `短脚本分镜模板`、`色彩氛围词库`、`场景质感约束词`
- `固定风格锚定词`、`负向词模板`、`美学禁止项`

### 2.12 driector_skills/director_storyboard_table_style.md（6 条，须自包含）
- `分镜表定位`、`色彩与氛围`、`光影与质感动态`、`动作节奏`（含真实兽体尺度+跨镜头基准）、`运镜禁忌`、`视频生成稳定性防漂移`

## 3. Rule_ID 命名空间冲突（同一 ID 文本在不同文件表不同规则）

> 实证「稳定标识必须文件限定（`<文件名>#<Rule_ID>`）」。这是冲突处理（需求 7.5）与别名映射（任务 1.2）的输入。

| ID 文本 | 不同语义出现位置 |
|---|---|
| `R1`–`R10/R13` | prefix(R1–R6 全局) · art_character(R1–R10) · art_character_derivative(R1–R13) · art_prop(R1–R3) · art_prop_derivative(R1–R4) · art_scene(R1–R8) · art_scene_derivative(R1–R10) 各表不同规则 |
| `X1`–`X9/X15`（含 X6b/X6c/X3b/X3c） | prefix 与各 art_prompt 文件各有一套严禁项 |
| `L1`–`L5` | prefix 色彩使用层级(L1–L3) **与** prefix 曝光层(L1–L5) **同文件内冲突** · art_character_derivative 叠加层(L0–L5) · director_planning_style 光线真实感(L1–L3) |
| `C1`–`C10` / `C1`–`C4` | prefix 色名 C1–C10 **与** art_storyboard_video 剪辑节奏 C1–C4 冲突 |
| `S1`–`S9` | prefix 敏感词 S1–S9/S8.1 **与** art_character 工作流 S1–S3、art_character_derivative L1 线索 S1–S4 冲突 |
| `P1`–`P4` / `P0`–`P2` | director_storyboard 表演节奏 P1–P4 **与** art_scene 打工场景优先级 P0–P2 冲突 |
| `E1`–`E5`、`M1`–`M4`、`V1`–`V4`、`B1`–`B4`、`F1`–`F4` | 各仅在单一文件出现，无跨文件冲突 |

## 4. 共享规则族（family）汇总

盘点中标注的主要共享规则族（重构时的收敛对象）：

| family | 说明 | 跨文件出现（节选） |
|---|---|---|
| `style-gene` | 风格基因/photorealistic 锚定 | README、prefix(R1/R3/R5/R6/风格基因)、director_planning_style |
| `real-animal-scale` | 真实兽体尺度与参照物比例 | prefix(R4/R4b/X8)、art_character(R8/X8)、art_storyboard_video(防漂移二)、director_storyboard(多图融合三)、director_storyboard_table_style(动作节奏) |
| `situational-posture` | 情境化姿态切换（操作态/行动态） | prefix(R2/X6/X6b/X6c)、art_character(X3b/X3c/体型姿态)、art_character_derivative(X13)、director_planning_style(质感方向)、director_storyboard(姿态切换/场景质感约束词) |
| `realistic-word-no-stack` | 写实词不堆叠 S8/S8.1 | prefix(S8/S8.1)、art_character(R10)、art_scene(R6)、art_scene_derivative(R8)、art_storyboard_video(去AI味一)、director(锚定词) |
| `sensitive-word` | 敏感词过审 S1–S9 + 映射表 | prefix(四节)；director 依赖处自包含 |
| `color-palette` | 全局色彩盘 C/E/色温/容差 | prefix(二节)、art_scene(季节色调)、director_planning_style(色调体系)、director_storyboard(色彩氛围词库)、director_storyboard_table_style(色彩与氛围) |
| `exposure-deai-light` | 曝光与去AI味光照 L1–L5 | prefix(曝光层)；art_storyboard_video(去AI味四)溯源 |
| `global-forbid` | 反卡通/反塑料/反荧光 X 类 | prefix(X1/X3/X7) + 各 art_prompt 本地 X 表 + director(美学禁止项) |
| `anti-drift` | 防漂移规范 | art_storyboard_video(防漂移六节)、director_storyboard(V3)、director_storyboard_table_style(六) |
| `deai-degradation` | 去AI味/反退化 | art_storyboard_video(去AI味六节)、director_planning_style(光线真实感/瑕疵美学) |
| `short-video-strategy` | 短视频策略层 6.x | prefix(六节)、art_storyboard_video、director_storyboard 引用 |

## 5. 完整性审计输入说明

- 本清单（重构前）与后续 `inventory.after`（任务 9.1）以 `(ruleId, effectiveSemantics)` 按语义归并去重后建立双向一一对应（审计 1）。
- `director_skills/*` 中因 ReadSkill 须自包含而保留的同源副本，重构后将以相同 Rule_ID 经 `selfContainedCopies` 标注，**不计为额外承载位置或额外约束**（需求 10.3）。
- 命名空间冲突项（第 3 节）在重构中**暂缓自动收敛**，按 design.md Error Handling 交维护者裁定（需求 7.5）。
