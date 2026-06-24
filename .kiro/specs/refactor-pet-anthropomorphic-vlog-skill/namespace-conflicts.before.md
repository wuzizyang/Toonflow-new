# namespace-conflicts.before — Rule_ID 命名空间冲突表与别名映射骨架

> Spec Task 1.2 · _Requirements: 7.4, 7.5, 4.3_
>
> 输入：`inventory.before.json`（264 条）与 `inventory.before.md`（Task 1.1，只读盘点）。
> 本制品**只读分析**，未修改 `pet_anthropomorphic_vlog/` 下任何技能文件。
> 目的：(1) 用实证数据标出「同一 ID 文本在不同文件表不同规则」的全部命名空间冲突，证明
> **稳定标识必须文件限定**（`<文件名>#<Rule_ID/锚点>`）；(2) 建立别名映射骨架
> `deprecatedRef → canonical(file#id)`，使历史/不一致引用在重构后仍可定位（需求 7.4）。
> 机器可读全量见同目录 `alias-map.skeleton.json`。

---

## 1. 结论先行：稳定标识必须文件限定

下表的实证数据表明，裸 Rule_ID（`R1`/`X1`/`L1`/`C1`/`S1`/`P1` 等）在 12 文件范围内**不是全库唯一**：
同一段 ID 文本在不同文件（甚至同一文件不同小节）承载语义完全不同的规则。因此：

- **唯一稳定标识 = `<文件名>#<Rule_ID 或锚点>`**（如 `prefix.md#S8`、`art_character.md#R8`、`art_storyboard_video.md#C1`）。这是 Cross_Reference 唯一可消歧的解析目标（需求 5.1）。
- 每个 Rule_ID 的**局部文本逐字符保留不变**（需求 7.2），消歧只发生在 `qualifiedId`/锚点层面，绝不改动正文编号。
- 冲突项**暂缓自动收敛**（需求 7.5）：维护者确认前两处原文均保留，记别名映射不丢历史引用。

---

## 2. 命名空间冲突表（同一 ID 文本 → 不同语义）

数据来源：对 `inventory.before.json` 的 `ruleId` 按裸文本聚合、跨 `qualifiedId` 文件去重统计。

### 2.1 `R1`–`R10/R13`：必守规则编号在 7 个文件各表不同规则（跨文件冲突）

| 裸 ID | 各文件语义（节选，证明同号异义） |
|---|---|
| `R1` | `prefix.md#R1`=宠物拟人化+照片级写实风格锚定词 · `art_character.md#R1`=保留完整真实动物头部特征 · `art_character_derivative.md#R1`=叠加后种属头部与轮廓与底模一致 · `art_prop.md#R1`=纯净中性灰背景 · `art_prop_derivative.md#R1`=道具核心造型可识别 · `art_scene.md#R1`=场景前中后景层次 · `art_scene_derivative.md#R1`=空间结构/家具在变体中一致 |
| `R2` | `prefix.md#R2`=保留真实动物全身体态+情境化姿态 · `art_character.md#R2`=四视图为真实宠物 · `art_prop.md#R2`=道具材质与工艺 · `art_scene.md#R2`=温馨生活Vlog氛围 …（7 文件各异） |
| `R3` | `prefix.md#R3`=真实毛发清晰自然 · `art_prop_derivative.md#R3`=四宫格 2×2 布局 · `art_scene.md#R3`=单画面主视图不拼接 …（7 文件各异） |
| `R4` | `prefix.md#R4`=真实解剖结构+真实比例 · `art_character.md#R4`=保留种属尾巴 · `art_scene_derivative.md#R4`=单画面不拼接 …（6 文件各异） |
| `R5` | `prefix.md#R5`=真实生活Vlog氛围/vlog自拍视角 · `art_character.md#R5`=纯净中性灰背景 · `art_scene.md#R5`=场景图严禁出现角色 …（5 文件各异） |
| `R6` | `prefix.md#R6`=优先呆萌可爱神态 · `art_scene.md#R6`=照片级真实只用单个 photorealistic · `art_scene_derivative.md#R6`=场景图严禁角色 …（5 文件各异） |
| `R7` | `art_character.md#R7`=全身立像完整不裁切 · `art_scene.md#R7`=自然写实光照 · `art_scene_derivative.md#R7`=自行判断变化维度 …（4 文件各异） |
| `R8` | `art_character.md#R8`=身高/真实动物体态比例（数值约束） · `art_scene.md#R8`=照片级真实质感 · `art_scene_derivative.md#R8`=单个 photorealistic（引用 prefix） …（4 文件各异） |
| `R9` | `art_character.md#R9`=头部特写完整展示耳到肩 · `art_character_derivative.md#R9`=禁止场景描述 · `art_scene_derivative.md#R9`=自然写实光照 |
| `R10` | `art_character.md#R10`=photorealistic 不堆叠（引用 prefix S8） · `art_character_derivative.md#R10`=禁止道具交互 · `art_scene_derivative.md#R10`=真实质感 |
| `R11`–`R13` | 仅 `art_character_derivative.md`（无跨文件冲突，文件限定即可） |
| `R5b` | 仅 `art_scene.md#R5b`（公共/室外默认定位杭州；无冲突，文件限定即可） |
| `R4b` | 仅 `prefix.md#R4b`（真实兽体尺度全局；无同号冲突，但属同源族，见第 4 节数值冲突） |

**处置**：全部文件限定 `<文件名>#Rn`；局部文本不变（需求 7.2/7.3）。

### 2.2 `X1`–`X9`（含 `X3b/X3c`、`X6b/X6c`、`X10`–`X15`）：严禁项编号在 7 文件各表不同规则

| 裸 ID | 各文件语义（节选，证明同号异义） |
|---|---|
| `X1` | `prefix.md#X1`=严禁卡通/插画/黏土等非写实 · `art_character.md#X1`=严禁着装不得体/人类成衣 · `art_prop.md#X1`=严禁复杂场景背景 · `art_scene.md#X1`=严禁背景纯白/纯黑/无场景 …（7 文件各异） |
| `X2` | `prefix.md#X2`=严禁失去真实动物特征的人形躯干 · `art_prop.md#X2`=严禁道具与角色同画面 · `art_scene.md#X2`=严禁极端天候 …（7 文件各异） |
| `X3` | `prefix.md#X3`=严禁高饱和荧光/赛博霓虹 · `art_prop.md#X3`=严禁出现任何角色形象 · `art_scene.md#X3`=严禁场景无层次 …（7 文件各异） |
| `X4`–`X8` | 7 文件各表不同严禁项（如 `prefix.md#X8`=严禁角色尺度违反真实世界逻辑 vs `art_scene.md#X8`=严禁高饱和荧光/过曝梦幻光晕 vs `art_character.md#X8`=严禁忽略身高与体态比例） |
| `X9` | `art_character.md#X9`=严禁塑料/橡胶感 · `art_character_derivative.md#X9`=严禁道具交互 · `art_prop_derivative.md#X9`=严禁高饱和荧光 · `art_scene.md#X9`=严禁恐怖阴森氛围 |
| `X3b/X3c` | 仅 `art_character.md`（姿态/类人形细化；文件限定即可） |
| `X6b/X6c` | 仅 `prefix.md`（位移行动四足兽态细化；文件限定即可） |
| `X10`–`X15` | 仅 `art_character_derivative.md`（无跨文件冲突） |

**处置**：全部文件限定 `<文件名>#Xn`；局部文本不变。`prefix.md#X1/#X3/#X7` 为全局严禁项（收敛矩阵 SSOT），各 art_prompt 本地同号严禁项中属全局者改引用、属资产专属者保留（需求 4.3）。

### 2.3 `L0`–`L5`：四套不同语义，含 **prefix 文件内同名冲突（D-1）**

| qualifiedId | 语义 | 说明 |
|---|---|---|
| `prefix.md#色彩使用层级-L1` / `-L2` / `-L3` | 色彩约束强度层级（硬/软/例外） | **D-1：与下方曝光层在 prefix 内同用 `L` 前缀** |
| `prefix.md#曝光层-L1` … `#曝光层-L5` | 曝光与去AI味光照层级 | **D-1：同文件内 `L1–L5` 已被色彩层级 `L1–L3` 占用** → 必须以锚点限定消歧 |
| `art_character_derivative.md#L0` … `#L5` | 服装叠加层级（底模/面部/头造/内搭/外衣/配饰） | 跨文件冲突，文件限定即可 |
| `director_planning_style.md#光线真实感-L1` … `-L3` | 光线真实感层级（手机级/电影级/效果图禁用） | director 专属层，与 prefix 曝光层 L 同名不同义；自包含保留 + 文件限定 |

**处置**：**D-1（设计级冲突，见 design.md Error Handling）**——prefix 内两套 L 用锚点限定为 `#色彩层级-Ln` 与 `#曝光层-Ln`（清单中已如此编码）；跨文件用文件限定。两套局部文本均保留不变。

### 2.4 `C1`–`C10` / `C1`–`C4`：色名 vs 剪辑节奏（跨文件冲突）

| qualifiedId | 语义 |
|---|---|
| `prefix.md#C1` … `#C10` | 全局色彩盘色名（C1=奶油白 #FAF3E7、C2=焦糖棕 #C08B5C、C3=暖阳橙、C4=抹茶绿 …） |
| `art_storyboard_video.md#C1` … `#C4` | 剪辑节奏规则（C1=情绪突变跳切、C2=时间流逝硬切、C3=剪辑节奏与情绪同步、C4=剪辑为后期环节） |

**处置**：文件限定 `prefix.md#C1`(色) vs `art_storyboard_video.md#C1`(剪辑)。原文已在 video 文件就地标注「此 C1 为剪辑节奏规则，非 prefix 色名」，重构保留该标注。

### 2.5 `S1`–`S9` / `S8.1`：过审敏感词 vs 工作流步骤标签（跨文件冲突）

| qualifiedId | 语义 | 类别 |
|---|---|---|
| `prefix.md#S1` … `#S9`、`prefix.md#S8.1` | 敏感词规避 / 过审约束（S8=真实感关键词严禁堆叠、最高优先级；S8.1=snapshot aesthetic 禁用） | **过审 S 系列** |
| `art_character.md#形态锁定工作流-S1` … `-S3` | 形态锁定工作流步骤（选种/固化/扩散） | **非过审 S 系列** |
| `art_character_derivative.md#L1线索-S1` … `-S4` | L1 面部状态线索分析步骤 | **非过审 S 系列** |

**处置**：文件限定。**别名表显式标注 art_character / art_character_derivative 的 `S1–S4` 为工作流步骤标签，非过审 S 系列**（防止与 `prefix.md#S1–#S9` 过审约束混淆，关乎需求 9 过审零损失）。

### 2.6 `P0`–`P2` / `P1`–`P4`：场景优先级 vs 表演节奏（跨文件冲突）

| qualifiedId | 语义 |
|---|---|
| `art_scene.md#P0` / `#P1` / `#P2` | 打工场景优先级（P1=地铁通勤、P2=会议室/下班街角 …） |
| `director_storyboard.md#P1` … `#P4` | 表演节奏（P1=每3-5s换表情、P2=三段式表演 …） |

**处置**：文件限定 `art_scene.md#P1`(场景优先级) vs `director_storyboard.md#P1`(表演节奏)。原文已就地标注「非场景优先级」，保留。

### 2.7 无跨文件冲突的编号（文件限定即足够，列入完整性）

| 裸 ID | 唯一出现位置 |
|---|---|
| `E1`–`E5` | `prefix.md`（情绪色盘使用规则） |
| `M1`–`M4` | `prefix.md`（情绪扩展维度） |
| `V1`–`V4` | `director_storyboard.md`（镜头视角分层） |
| `B1`–`B4` | `director_planning_style.md`（声音约束） |
| `F1`–`F4` | `art_storyboard_video.md`（短脚本视频规范） |
| `6.1`–`6.5` | `prefix.md`（短视频内容策略层） |

---

## 3. 冲突汇总矩阵

| 裸 ID 文本 | 冲突类型 | 涉及文件数 | 处置 |
|---|---|---|---|
| `R1`–`R10` | 跨文件同号异义 | 7 | 文件限定 |
| `X1`–`X9` | 跨文件同号异义 | 7 | 文件限定（全局严禁项归 prefix） |
| `L1`–`L3` / `L1`–`L5` | **prefix 文件内同名（D-1）** + 跨文件 | 1(内) + 3 | 锚点限定（`#色彩层级-Ln`/`#曝光层-Ln`）+ 文件限定 |
| `C1`–`C4` | 跨文件（色名 vs 剪辑） | 2 | 文件限定 |
| `S1`–`S4` | 跨文件（过审 vs 工作流步骤） | 3 | 文件限定 + 别名标注「非过审 S 系列」 |
| `P1`–`P2` | 跨文件（场景优先级 vs 表演节奏） | 2 | 文件限定 |

---

## 4. 同源族数值/措辞冲突（指向 Task 2.1 冲突清单，非命名空间冲突）

以下属**同一规则在两处取值/措辞不一致**（需求 3.4/7.5），非编号命名冲突；此处仅登记指针，
具体收敛由 Task 2.1 `Conflict Register` 记录，`status=PENDING_MAINTAINER`，**暂缓收敛、不自动选值**：

- **真实兽体尺度立起高度**：`prefix.md#R4b` / `art_character.md#R8`（约成年人小腿高度 40–50cm）与 director_storyboard 多图融合尺度参照（立起到膝盖/大腿）措辞需维护者裁定 → 见 Task 2.1 `CONF-*`。
- **色温 / 饱和度 / 曝光区间**：`prefix.md#曝光层-L3`（4800-5800K）等区间在 director 自包含正文中的复述一致性 → 见 Task 2.1。

---

## 5. 别名映射骨架（deprecatedRef → canonical）

骨架原则：
- `canonical` 一律为文件限定 `file#id` 形式；
- 仅登记**历史/不一致写法**与**需消歧的裸编号**，正文本身不改（需求 7.2）；
- 一处历史引用指向多目标时拆为多条；
- 完整定稿（含重构后承载位置回填）在 Task 9.1 `inventory.after` 完成。

### 5.1 实证既有引用（从技能文件原文采集，read-only）

| deprecatedRef（原文写法 / 位置） | canonical |
|---|---|
| `见 prefix S8`（`art_scene.md#R6`，无 `.md` 后缀） | `prefix.md#S8` |
| `见 prefix S8`（`art_character.md#R10`） | `prefix.md#S8` |
| `见 prefix S8/S8.1`（`art_scene_derivative.md#R8`） | `prefix.md#S8` ＋ `prefix.md#S8.1` |
| `见 prefix.md 第六节时长分档`（`director_storyboard.md` 短脚本分镜模板） | `prefix.md#六-短视频内容策略层` |
| `见 prefix.md 第六节时长分档`（`art_storyboard_video.md` 短脚本节奏约束） | `prefix.md#六-短视频内容策略层` |
| `档位定义见 prefix.md 第六节`（`art_storyboard_video.md` 剪辑节奏指导） | `prefix.md#六-短视频内容策略层` |
| `色名见 prefix.md 全局色彩盘`（`director_planning_style.md` 情绪向场景色） | `prefix.md#二-全局色彩盘` |
| `详见 art_scene.md R5b`（`director_planning_style.md` 公共场所默认定位） | `art_scene.md#R5b` |
| `见 art_scene.md X7/X8`（`director_planning_style.md` 光线真实感 L3 旁注） | `art_scene.md#X7` ＋ `art_scene.md#X8` |

### 5.2 命名消歧别名（裸编号 → 文件限定规范标识）

| deprecatedRef（裸/易混写法） | canonical | 备注 |
|---|---|---|
| `S8`（裸引用，泛指过审堆叠约束） | `prefix.md#S8` | 全局最高优先级过审约束 |
| `S8.1`（裸引用） | `prefix.md#S8.1` | snapshot aesthetic 禁用 |
| `prefix S8`（无 `.md`） | `prefix.md#S8` | 规范化为文件限定 |
| `S1`/`S2`/`S3`（art_character 语境，形态锁定工作流） | `art_character.md#形态锁定工作流-S1` … `-S3` | **非过审 S 系列**（工作流步骤标签） |
| `S1`–`S4`（art_character_derivative 语境，L1 线索分析） | `art_character_derivative.md#L1线索-S1` … `-S4` | **非过审 S 系列**（线索分析步骤） |
| `L1`–`L3`（prefix 色彩语境） | `prefix.md#色彩使用层级-L1` … `-L3` | D-1 消歧锚点 |
| `L1`–`L5`（prefix 曝光/去AI味光照语境） | `prefix.md#曝光层-L1` … `-L5` | D-1 消歧锚点 |
| `L1`–`L3`（director 光线真实感语境） | `director_planning_style.md#光线真实感-L1` … `-L3` | director 专属，自包含 |
| `L0`–`L5`（服装叠加语境） | `art_character_derivative.md#L0` … `#L5` | 叠加层级 |
| `C1`–`C4`（剪辑节奏语境） | `art_storyboard_video.md#C1` … `#C4` | 非 prefix 色名 |
| `C1`–`C10`（色名语境） | `prefix.md#C1` … `#C10` | 全局色彩盘 |
| `P1`–`P2`（场景优先级语境） | `art_scene.md#P1` / `#P2`（及 `#P0`） | 打工场景优先级 |
| `P1`–`P4`（表演节奏语境） | `director_storyboard.md#P1` … `#P4` | 表演节奏 |

> 骨架完整性说明：本表为 **skeleton**（骨架），列入全部已知冲突维度与实证引用；
> 重构推进（Task 4–9）中如发现新的不一致历史写法将增补，最终在 Task 9.1 与
> `inventory.after` 的 `canonicalLocation` 对齐校验（审计 5/6）。
