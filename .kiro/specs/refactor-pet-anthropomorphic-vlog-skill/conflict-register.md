# conflict-register — 冲突清单 Conflict Register（暂缓收敛、不自动选值）

> Spec Task 2.1 · _Requirements: 3.4, 7.5_
>
> 输入：`inventory.before.json`（264 条，Task 1.1）、`namespace-conflicts.before.md §4`
> valueWordingConflictsPointer（Task 1.2）、`design.md` Error Handling（D-0/D-1/内容收敛冲突）
> 与 Data Models §3（Conflict Register Entry schema）。
> 机器可读全量见同目录 `conflict-register.json`。
>
> **本制品只读登记冲突**，未修改 `pet_anthropomorphic_vlog/` 下任何技能文件。
> 所有冲突 `status = PENDING_MAINTAINER`、`resolution = null`：**不自动收敛、不自动选值**，
> 维护者确认前每条冲突涉及的各处原文均保留。

---

## 0. 登记策略

| 项 | 值 |
|---|---|
| 自动收敛 | ❌ 否 |
| 自动选值 | ❌ 否 |
| 默认状态 | `PENDING_MAINTAINER` |
| 原文处置 | 确认前各冲突源处原文全部保留 |
| 条目 schema | `conflictId` · `ruleId` · `sources[{loc,value}]` · `status` · `resolution`（+ 辅助说明字段 `category` / `description` / `maintainerDecisionNeeded`） |

---

## 1. 设计级冲突（重构方案内部需先裁定）

### CONF-D0 — 防漂移/去AI味 的 SSOT 归属

- **ruleId**：防漂移规范 / 去AI味·反退化规范（SSOT 归属）
- **冲突**：需求 1.4 将该族列为待收敛为单一来源（候选 `prefix.md`）；但 `prefix.md` 经 GetArtPrompt_Loader **总是前置注入到全部 7 个 art_prompt 文件**，迁入会把视频专属约束注入到角色/道具/场景等无关文件 → **扩大注入范围、违反 Behavioral_Equivalence（需求 3）**。

| 来源 loc | value |
|---|---|
| `requirements.md#需求1.4` | 要求「防漂移、去AI味/反退化」收敛为单一来源（候选 prefix.md 全局 SSOT） |
| `art_storyboard_video.md#防漂移规范(六节)+去AI味/反退化规范(六节)` | 现状两族规范正文自包含于视频资产文件；候选单一来源 = `art_storyboard_video.md`（不迁入 prefix，符合需求 2.4 与注入范围守恒） |
| `director_storyboard_table_style.md#六、视频生成稳定性(防漂移)` | 分镜阶段稳定性正文（ReadSkill 须自包含），与视频族同源 |
| `director_planning_style.md#光线真实感层级 / 光线瑕疵美学` | 去AI味相关 director 自包含正文，与视频族同源 |

- **status**：`PENDING_MAINTAINER` ｜ **resolution**：`null`
- **待维护者裁定**：确认本族单一来源定为 `art_storyboard_video.md`（而非 `prefix.md`），以同时满足「全库唯一规范正文」与「注入范围守恒」。

### CONF-D1 — prefix 内 L1–L3（色彩层级）与 L1–L5（曝光层）同名

- **ruleId**：L1–L3（色彩使用层级） vs L1–L5（曝光与去AI味光照）
- **冲突**：`prefix.md` 文件内部两套以 `L` 前缀编号、语义完全不同的规则共存，裸 `Ln` 无法消歧。

| 来源 loc | value |
|---|---|
| `prefix.md#色彩使用层级-L1…-L3` | L1 硬约束 / L2 软约束 / L3 例外机制（色彩约束强度层级） |
| `prefix.md#曝光层-L1…-L5` | L1 曝光充足 / L2 照明均匀 / L3 维持暖调(4800-5800K) / L4 主体受光对比 / L5 保留毛发织物微观细节 |

- **status**：`PENDING_MAINTAINER` ｜ **resolution**：`null`
- **待维护者裁定**：确认以锚点限定消歧（如 `#色彩层级-Ln` / `#曝光层-Ln`）；两套局部 Rule_ID 文本逐字符保留不变，仅在 qualifiedId/锚点层面区分。

---

## 2. 内容收敛冲突（同源规则数值 / 措辞 / 强制级，需求 3.4 / 7.5）

### CONF-001 — 真实兽体尺度 · 操作态立起高度（数值/措辞冲突）

- **ruleId**：真实兽体尺度 · 操作态立起高度（R4b / 真实尺度参照基准）
- **冲突**：同源「操作态后腿立起相对成年人的高度」在不同文件给出不一致表述——「小腿（约 40–50cm）」 vs 「膝盖/大腿」。

| 来源 loc | value |
|---|---|
| `prefix.md#R4b` | 角色明显小于身旁的人（只到坐着的成年人腰部以下、**站立成年人小腿高度**）……操作态后腿立起仅略增高度，整体仍为小兽尺度 |
| `art_character.md#R8` | 坐卧肩高约 25–30cm、**操作态立起约 40–50cm，约成年人小腿高度** |
| `director_storyboard.md#多图融合三·真实尺度参照基准(猫)` | 猫：体长约 25–50cm，肩高约 25–30cm；**约成年人小腿—膝盖高度** |
| `director_storyboard.md#多图融合三·操作态不等于放大` | **立起的猫顶多到成年人膝盖/大腿高度** |

- **status**：`PENDING_MAINTAINER` ｜ **resolution**：`null`
- **待维护者裁定**：统一立起高度参照（「小腿」vs「膝盖/大腿」），并校准 `director_storyboard.md` 内「小腿—膝盖」与「膝盖/大腿」的自身不一致。确认前各处原文保留。

### CONF-002 — 色温区间复述一致性（数值冲突）

- **ruleId**：色温区间复述一致性（色温约束 / 曝光层-L3 / 视频暖白日光）
- **冲突**：同源「整体暖调色温」多处复述，区间值与单点值并存。

| 来源 loc | value |
|---|---|
| `prefix.md#色温约束` | 整体色温 暖调 **4800-5800K**（推荐）；毛色色温 微暖 **5000-5500K**（推荐） |
| `prefix.md#曝光层-L3` | 维持暖调（**4800-5800K**），冷光场景也以暖色铺底 |
| `director_planning_style.md#一、色调体系` | 整体色温偏暖（**4800-5800K**） |
| `art_storyboard_video.md#视觉风格标签 / 去AI味第四节` | **暖白日光 5000K / warm 5000K daylight**（单点）；注「与 prefix.md 对齐：暖底 4800-5800K」 |

- **status**：`PENDING_MAINTAINER` ｜ **resolution**：`null`
- **待维护者裁定**：确认色温规范值（区间 4800-5800K vs 视频侧单点 5000K）是否统一表述或保留场景化差异。确认前各处原文保留。

### CONF-003 — 饱和度区间复述一致性（数值冲突）

- **ruleId**：饱和度区间复述一致性（饱和度约束 / 色调体系）
- **冲突**：同源「中等饱和度」在 prefix 与 director_planning_style 复述（区间一致 50-70%），video 侧为定性表述；登记以确认复述一致性与单一规范来源。

| 来源 loc | value |
|---|---|
| `prefix.md#色温约束(饱和度行)` | 饱和度 中等 **50-70%**（建议区间）；容差：饱和度偏移 **±12%** |
| `director_planning_style.md#一、色调体系` | 饱和度中等（**50-70%**） |
| `art_storyboard_video.md#去AI味第四节` | **中等饱和**（定性，无数值，注「与 prefix.md 对齐」） |

- **status**：`PENDING_MAINTAINER` ｜ **resolution**：`null`
- **待维护者裁定**：确认饱和度规范来源与复述一致性（区间 50-70% ± 12%）。确认前各处原文保留。

### CONF-004 — 曝光/光照约束的强制级与措辞冲突（措辞/强制级冲突）

- **ruleId**：曝光/光照约束强制级与措辞（曝光层-L1…L5 / 去AI味第四节 / 光线真实感-L3）
- **冲突**：同源「曝光充足、均匀受光、暖调、主体受光」约束在不同文件强制级措辞与语义有出入。

| 来源 loc | value |
|---|---|
| `prefix.md#色温约束 / 曝光层-L1…L5` | 色温/饱和度标『推荐/建议』；L1 曝光充足、L2 整体照明均匀柔和（左右均衡）、L5 保留微观细节 |
| `art_storyboard_video.md#去AI味第四节(曝光与光照)` | **强制**：明亮充足曝光、暖白日光5000K、均匀柔和整体照明左右均衡、主体受光对比（反过暗/反冷调/反左右失衡） |
| `director_planning_style.md#光线真实感-L3 + 光线瑕疵美学` | L3 效果图（过曝、**均匀柔光**、无阴影）＝**禁用**；允许窗边轻微过曝/暗部噪点（瑕疵美学），**避免均匀完美打光** |

- **status**：`PENDING_MAINTAINER` ｜ **resolution**：`null`
- **待维护者裁定**：裁定曝光/均匀受光约束的统一强制级与措辞，协调「均匀柔和受光」（prefix L2 / video）与「避免均匀完美打光的瑕疵美学」（planning）之间的语义张力。**措辞整理不得下调任何 SHALL/必须/严禁 强制力**；确认前各处原文保留。

---

## 3. 冲突汇总

| conflictId | category | ruleId（简） | 源文件数 | status |
|---|---|---|---|---|
| CONF-D0 | design-level | 防漂移/去AI味 SSOT 归属 | 4 | PENDING_MAINTAINER |
| CONF-D1 | design-level | prefix 内 L 同名（色彩层级 vs 曝光层） | 1（文件内 2 套） | PENDING_MAINTAINER |
| CONF-001 | content-numeric | 真实兽体尺度·立起高度（小腿 vs 膝盖/大腿） | 3 | PENDING_MAINTAINER |
| CONF-002 | content-numeric | 色温区间复述（4800-5800K vs 5000K） | 4 | PENDING_MAINTAINER |
| CONF-003 | content-numeric | 饱和度区间复述（50-70%） | 3 | PENDING_MAINTAINER |
| CONF-004 | content-wording | 曝光/均匀受光强制级与措辞 | 3 | PENDING_MAINTAINER |

> 闭合校验（审计 8 输入）：以上 6 条均为 `PENDING_MAINTAINER`，对应各源处原文未被收敛、未被改写、未自动选值。
> 维护者确认后由 Checkpoint（Task 3）回填 `resolution` 并解锁后续收敛（Task 4+）。
