# inventory.after — 重构后 Rule_ID 清单与承载位置映射（Task 9.1）

> 制品：`inventory.after.json`（权威）/ 本文件（人类可读摘要）。别名映射定稿见 `alias-map.json`。
> 来源：对已完成重构（Task 4.1–8.1）的 12 个技能文件**只读再扫描**，逐条比对 `inventory.before.json`（264 条）。未修改任何技能文件。
> 需求：7.4 / 7.6 / 10.1 / 10.2 / 10.3。

## 结论

- 重构前 **264** 条 Rule_ID **全部**有唯一规范承载位置：**零丢失、零新增、Rule_ID 文本零改动**。
- 去重后唯一规范承载位置 **237** 个；另 **27** 条为副本/引用，解析至 SSOT、**不计为额外承载位置**（需求 10.3）。
- 双射（before ↔ after）建立完毕，待 Task 10.2 审计1 以脚本复核。

## 264 → 承载位置映射类型分布

| 映射类型 | 计数 | 含义 |
|---|---:|---|
| `prefix-ssot` | 66 | 全局规范唯一正文，承载于 `prefix.md`（全局 SSOT），canonical = 自身 |
| `asset-ssot` | 107 | 资产专属规则，承载于各自 art_prompt 文件（本族单一来源），canonical = 自身 |
| `video-ssot` | 26 | 视频资产族（防漂移/去AI味/F/C/运镜/风格标签），承载于 `art_storyboard_video.md`（D-0），canonical = 自身 |
| `director-proprietary` | 37 | 导演技法专属（V/P/光影方案/光线真实感 L/声音 B/多图融合/锚定词/情绪向场景色等），canonical = 自身（ReadSkill 自包含） |
| `art-prompt-reference` | 12 | art_prompt 全局副本已改为指向 `prefix.md` 的 Cross_Reference，canonical = prefix SSOT（注入补回） |
| `global-redundant-copy` | 6 | art_character 第九节仍保留全局严禁本地正文（未改引用），canonical = prefix SSOT，本地为冗余副本（待审计3 复核） |
| `director-self-contained-copy` | 9 | director 自包含同源副本（须自包含，需求 4.2/9.3），canonical = SSOT，经 `selfContainedCopies` 标注**不计额外承载** |
| `readme-narrative-nonnormative` | 1 | README 叙述性概述，非规范承载、永不注入（需求 6.5 保留） |
| **合计** | **264** | |

## 共享规则族 SSOT 承载与自包含副本（需求 10.3）

| 规则族 | SSOT 规范承载位置 | director 自包含同源副本（不计额外承载） |
|---|---|---|
| 情境化姿态 | `prefix.md#R2/#X6/#X6b/#X6c` | 角色姿态按行为切换、质感方向、固定风格锚定词、场景质感约束词、动作节奏 |
| 真实兽体尺度 | `prefix.md#R4b/#X8/#R4` | 多图融合-三、动作节奏、固定风格锚定词、质感方向（CONF-001 PENDING） |
| 写实词不堆叠 | `prefix.md#S8/#S8.1` | director S8/S8.1、质感方向、固定风格锚定词 |
| 敏感词过审 | `prefix.md#S1…#S9/#风险词映射表` | director_storyboard S1–S9 + 风险词映射表（ReadSkill 自包含·需求 9.3） |
| 全局严禁 | `prefix.md#X1…#X8/#X6b/#X6c` | 美学禁止项、负向词模板 |
| 全局色彩盘 | `prefix.md#C1…#C10/#色温约束/#E1…#E5/#情绪色盘` | 一-色调体系、二-色彩与氛围（CONF-002/003 PENDING） |
| 曝光去AI味光照 | `prefix.md#曝光层-L1…-L5` | 光线真实感 L1-L3、光线瑕疵美学、三-光影与质感动态（CONF-004 PENDING） |
| 防漂移/去AI味 | `art_storyboard_video.md#防漂移规范/#去AI味规范`（D-0 视频族单一来源） | 六-视频生成稳定性、五-运镜禁忌、V3、P4 |
| 短视频策略层 | `prefix.md#6.1…#6.5` | art_storyboard_video / director 短脚本以引用指向；V1–V4 为 6.4 详规 |

## 设计级裁定落地状态

- **D-1（prefix 内 L 同名）**：已落地 —— `#色彩使用层级-L1..L3` 与 `#曝光层-L1..L5` 锚点消歧；三套 L（含 director 光线真实感、derivative 服装叠加 L0-L5）文件限定区分；正文逐字符不变。
- **D-0（防漂移/去AI味 SSOT 归属）**：已落地 —— 单一来源 = `art_storyboard_video.md`，不迁入 prefix（注入范围守恒）。

## 冲突暂缓（PENDING_MAINTAINER · 各处原文保留、未收敛）

| 冲突 | 共存来源（不收敛） |
|---|---|
| CONF-001 立起高度『小腿』vs『膝盖/大腿』 | prefix.md#R4b · art_character.md#R8 · director_storyboard.md#多图融合-三 · director_storyboard_table_style.md#四-动作节奏 |
| CONF-002 色温区间 vs 5000K 单点 | prefix.md#色温约束/#曝光层-L3 · director_planning_style.md#一-色调体系 · art_storyboard_video.md#视频风格标签/#去AI味-四 |
| CONF-003 饱和度区间复述 | prefix.md#色温约束 · director_planning_style.md#一-色调体系 · art_storyboard_video.md#去AI味-四 |
| CONF-004 曝光/均匀受光强制级与措辞 | prefix.md#曝光层-L1..L5 · art_storyboard_video.md#去AI味-四 · director_planning_style.md#光线真实感-L3/#光线瑕疵美学 |

## 校验勾稽

- 264 行映射、264 唯一 before、零缺漏零多余（已脚本核验）。
- 每个 canonical 承载位置均落在 12 个在范围文件内、且与 `alias-map.json` 对齐。
- `effectiveSemantics` / `enforcementLevel` 逐项不变（结构性重构），语义以 beforeQualifiedId 关联回 `inventory.before.json`。
