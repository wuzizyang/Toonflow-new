# Requirements Document

## Introduction

本规格针对「宠物拟人化Vlog（Pet Anthropomorphic Vlog）」美术风格技能库的**重构**。该技能库位于 `Toonflow-app/data/skills/art_skills/pet_anthropomorphic_vlog/`，由 12 个 Markdown 文件构成（`README.md`、`prefix.md`、`art_prompt/` 下 7 个文件、`driector_skills/` 下 3 个文件），定义了该风格的提示词生成规则、模板、过审约束与短视频策略。

本次重构的**核心目标**是**消除规则重复、建立单一事实来源（SSOT）**：把当前分散在多个文件中重复出现的同一规则（如真实兽体尺度/比例、写实词不堆叠 S8、情境化姿态切换、防漂移、去 AI 味、色彩盘等）收敛到一个集中的共享规则库（以 `prefix.md` 为 SSOT 载体），其他文件改为引用，从而降低维护成本、消除多副本不一致风险。

本次重构是一次**纯结构性/组织性重构**：在不改变最终生成提示词「有效语义与生成行为」的前提下重新组织规则归属。这要求重构必须尊重一个关键的运行时事实——**当前存在两种不同的技能加载器**：

- `getArtPrompt`（用于 `art_prompt/*` 全部文件）：**总是把 `prefix.md` 的内容拼接在目标文件之前**。因此 `prefix.md` 对美术提示词文件而言已是事实上自动注入的共享基底。
- `readSkill`（用于 `driector_skills/director_storyboard.md` 等导演文件）：**仅读取单个文件正文、不拼接 `prefix.md`**。

这一不对称性决定了重构的安全边界：美术提示词文件可以安全地把共享规则上移到 `prefix.md` 并改为引用（运行时会自动注入）；而导演技法文件因加载时不含 `prefix.md`，**不能退化为对 SSOT 的纯引用**，否则相关规则会在生成时静默丢失，导致生成行为发生变化。

## Glossary

- **技能库（Skill_Library）**：`pet_anthropomorphic_vlog/` 目录下的全部 Markdown 文件集合（重构对象）。
- **共享规则库（SSOT_Library）**：作为单一事实来源承载共享规则的文件，本规格中即 `prefix.md`。
- **共享规则（Shared_Rule）**：当前在两个或更多文件中重复出现、表达同一约束的规则条目（如真实兽体尺度、S8 写实词不堆叠、情境化姿态切换、防漂移规范、去 AI 味规范、全局色彩盘、敏感词规避等）。
- **美术提示词文件（Art_Prompt_File）**：`art_prompt/` 目录下的文件（`art_character`、`art_character_derivative`、`art_prop`、`art_prop_derivative`、`art_scene`、`art_scene_derivative`、`art_storyboard_video`）。
- **导演技法文件（Director_Skill_File）**：`driector_skills/` 目录下的文件（`director_planning_style`、`director_storyboard`、`director_storyboard_table_style`）。
- **GetArtPrompt_Loader**：`src/utils/getArtPrompt.ts` 中的加载器，加载 `Art_Prompt_File` 时总是把 `prefix.md` 内容前置拼接。
- **ReadSkill_Loader**：`src/routes/production/storyboard/regeneratePrompt.ts` 中的 `readSkill`，加载 `Director_Skill_File` 时不拼接 `prefix.md`、仅去除 frontmatter。
- **组装提示词（Assembled_Prompt）**：某个加载器在某条调用路径上最终交给下游模型的完整文本（含被自动拼接的内容）。
- **规则编号（Rule_ID）**：文件中既有的编号标识（如 R1–R10、X1–X9、S1–S9、E1–E5、M1–M4、L0–L5、F1–F4、C1–C4、V1–V4、P1–P4、B1–B4 等）。
- **交叉引用（Cross_Reference）**：文件中指向其他文件或规则的引用文本（如「见 prefix.md S8」「见 director_storyboard.md」「见 prefix.md 第六节」）。
- **生成行为等价（Behavioral_Equivalence）**：对相同的调用路径与输入，重构后 `Assembled_Prompt` 所携带的有效约束集合与重构前一致（措辞可整理，但不得新增、删除或弱化任何约束）。
- **维护者（Maintainer）**：负责后续修改、扩展该技能库的人。

## Requirements

### Requirement 1: 建立单一事实来源（SSOT）

**User Story:** 作为维护者，我希望所有共享规则只在一处定义，以便修改规则时只改一个地方、避免多副本不同步。

#### Acceptance Criteria

1. THE Refactored_Skill_Library SHALL 把每一条 Shared_Rule 的规范定义（canonical definition）收敛到 SSOT_Library 中，使每条 Shared_Rule 的规范正文在 SSOT_Library 中的出现次数恰为 1，且其规范正文不在 SSOT_Library 之外的任何文件中以完整正文形式再次出现（依需求 4 必须在 Director_Skill_File 内自包含保留的正文除外）。
2. WHERE 一条 Shared_Rule 当前在两个或更多文件中重复出现，THE Refactored_Skill_Library SHALL 在 SSOT_Library 中保留其唯一规范定义，并在所有经 GetArtPrompt_Loader 加载的其余文件中，以恰好一处指向该规范定义稳定标识（Rule_ID 或锚点）的 Cross_Reference 取代该规则的重复正文。
3. THE SSOT_Library SHALL 为每条收敛后的 Shared_Rule 赋予一个全库唯一、且重构前后保持文本不变的稳定标识（既有 Rule_ID，或带可定位锚点的小节标题），使任意 Cross_Reference 可凭该标识唯一定位到该规则。
4. THE Refactored_Skill_Library SHALL 至少将以下重复规则族各自收敛为 SSOT_Library 中的单一来源，且每一族的规范正文在 SSOT_Library 中的出现次数恰为 1：真实兽体尺度与参照物比例、写实词不堆叠（S8/S8.1）、情境化姿态切换（操作态/行动态）、防漂移规范、去 AI 味/反退化规范、全局色彩盘与色温约束、敏感词规避（S1–S9）。
5. WHERE 一条待收敛的 Shared_Rule 同时被经 ReadSkill_Loader 加载的 Director_Skill_File 使用，THE Refactored_Skill_Library SHALL 在 SSOT_Library 保留其唯一规范定义的同时，于该 Director_Skill_File 内保留该规则在生成时实际生效所需的正文，并以相同 Rule_ID 标注两处为同源，而非以仅含稳定标识的裸 Cross_Reference 取代其正文。

### Requirement 2: 去除重复内容

**User Story:** 作为维护者，我希望删除冗余的规则副本，以便文件更短、职责更清晰。

#### Acceptance Criteria

1. WHEN 重构完成后扫描 Skill_Library，IF 两处或更多正文表达同一约束（同一 Rule_ID，或语义等价的同一约束），THEN 它们被判定为 Shared_Rule 的重复副本。
2. WHEN 重构完成后扫描 Skill_Library，THE Refactored_Skill_Library SHALL 使任意一条 Shared_Rule 的规范正文仅存在于 SSOT_Library 中一处，且不在任何 Art_Prompt_File 中以完整正文形式重复出现（依需求 4 须在 Director_Skill_File 内自包含保留的正文除外）。
3. IF 一条规则因运行时加载契约（需求 4）必须在 Director_Skill_File 中保留正文，THEN THE Refactored_Skill_Library SHALL 以与 SSOT_Library 规范定义逐字符相同的 Rule_ID 标注该正文，并在该正文处附带指向 SSOT_Library 规范定义的 Cross_Reference，使两处可被一一识别为同源。
4. THE Refactored_Skill_Library SHALL 保持每个文件的单一职责边界：通用全局约束（风格基因、色彩盘、R/X/S/L/E/M 等全局规则）归于 SSOT_Library，特定资产类型（角色/道具/场景/分镜/视频）的专属规则归于对应文件，且任一 Art_Prompt_File 内不得保留任何已收敛到 SSOT_Library 的 Shared_Rule 的完整正文。

### Requirement 3: 生成行为等价（重构安全性）

**User Story:** 作为维护者，我希望重构后生成的提示词与重构前在约束上完全等价，以便重构不会改变出图/出片效果。

#### Acceptance Criteria

1. WHEN 对相同调用路径与相同输入通过 GetArtPrompt_Loader 加载任一 Art_Prompt_File，THE Assembled_Prompt（含运行时自动前置拼接的 prefix.md）SHALL 携带与重构前按 Rule_ID 与语义归并后一一对应的有效约束集合，不新增、不删除、不弱化任何约束（Behavioral_Equivalence）。
2. WHEN 对相同调用路径与相同输入通过 ReadSkill_Loader 加载任一 Director_Skill_File，THE Assembled_Prompt（不含 prefix.md，因 ReadSkill_Loader 不前置拼接）SHALL 携带与重构前按 Rule_ID 与语义归并后一一对应的有效约束集合，故该文件须自包含其生成时实际生效所需的约束正文（Behavioral_Equivalence）。
3. THE Refactored_Skill_Library SHALL NOT 删除、弱化或与原意相悖地改写任何既有约束；其中全局色彩盘色值、色温/饱和度/曝光等数值区间、真实兽体尺度与参照物比例、S1–S9（含 S8.1）过审约束的有效语义 SHALL 逐项保持不变，措辞整理仅限于合并同义重复与统一表述，且不得下调任何强制级（SHALL/必须/严禁）表述的约束力度。
4. IF 重构过程中发现两条同源规则在重构前存在数值或措辞冲突，THEN THE Refactored_Skill_Library SHALL 在冲突清单中记录其来源位置与各自取值，并暂缓收敛、不自动选值，直至由维护者确认采用值后方可收敛为单一定义。

### Requirement 4: 尊重加载器差异的引用策略

**User Story:** 作为维护者，我希望引用策略匹配各文件实际的加载方式，以便引用不会导致运行时规则丢失。

#### Acceptance Criteria

1. WHERE 一条 Shared_Rule 被 Art_Prompt_File 使用，THE Refactored_Skill_Library SHALL 允许在该文件中以 Cross_Reference 取代正文；其可验证终态为：经 GetArtPrompt_Loader 加载后，因 prefix.md 被前置拼接，该规则的规范定义仍存在于 Assembled_Prompt 中。
2. WHERE 一条 Shared_Rule 被 Director_Skill_File 使用且该文件经 ReadSkill_Loader 加载，THE Refactored_Skill_Library SHALL 在该文件内保留该规则在生成时实际生效所需的正文（即在不拼接 prefix.md 时仅凭该文件正文即可独立成立），可附带指向 SSOT_Library 的溯源 Cross_Reference（与需求 2 同 Rule_ID），但不得以「仅含指向其他文件/Rule_ID 的引用文本、无随附等价约束正文」的裸引用取代正文。
3. WHEN 重构调整任一文件的引用策略，THE Refactored_Skill_Library SHALL 依据该文件实际加载器判定其引用策略：经 GetArtPrompt_Loader 加载者判定为「可引用」，经 ReadSkill_Loader 加载者判定为「须自包含」。
4. IF 任一经 ReadSkill_Loader 加载的 Director_Skill_File 在重构后仅余裸引用而缺少该规则实际生效所需的正文，THEN THE Refactored_Skill_Library SHALL 被判定为未通过引用策略校验，并在补回该正文前拒绝采纳该改动、保留原正文。

### Requirement 5: 交叉引用有效性

**User Story:** 作为维护者，我希望所有交叉引用都指向真实存在的目标，以便文档导航不出现死链。

#### Acceptance Criteria

1. WHEN 重构完成后扫描 Skill_Library 的全部文件，THE Refactored_Skill_Library SHALL 使每一处 Cross_Reference 都能解析到唯一存在的目标，即满足以下之一：被引用的文件存在于技能库目录中、被引用的小节标题（锚点）在目标文件中存在、或被引用的 Rule_ID 在目标文件中已定义。
2. IF 重构移动或重命名了某条规则的承载位置（文件、小节或 Rule_ID），THEN THE Refactored_Skill_Library SHALL 在同一次重构变更内同步更新所有指向旧位置的 Cross_Reference 使其指向新位置，且不残留任何仍指向旧位置的 Cross_Reference。
3. WHEN 重构完成后扫描 Skill_Library，THE Refactored_Skill_Library SHALL 使指向已删除正文、不存在小节或未定义 Rule_ID 的未解析 Cross_Reference 数量为 0。
4. IF 某处 Cross_Reference 的目标（文件、小节或 Rule_ID）在 Skill_Library 中无法被解析到，THEN THE Refactored_Skill_Library SHALL 将该处 Cross_Reference 标记为校验失败项，并判定其未通过交叉引用有效性校验。

### Requirement 6: README 与 prefix 职责边界

**User Story:** 作为维护者，我希望 README 与 prefix 不再重叠描述同一内容，以便读者清楚各自用途。

#### Acceptance Criteria

1. THE README SHALL 仅承载面向人类读者的风格概述与适用范围，不承载「规范性约束正文」——即不含带编号的规则条目（R/X/S/L/E/M/C 等）、十六进制色值（如 #FAF3E7）或数值阈值/区间（如 4800-5800K、50-70%、±10°）。
2. THE SSOT_Library SHALL 承载会被加载器注入到提示词中的全部规范性全局约束。
3. WHERE README 与 SSOT_Library 当前重复描述同一「风格基因」内容，THE Refactored_Skill_Library SHALL 消除 README 中该内容的规范性正文，使每条规范性约束在 SSOT_Library 中恰有一处唯一定义、且 README 中该重叠内容不再以规范性条款形式出现。
4. WHEN 加载器组装提示词，THE Refactored_Skill_Library SHALL 确保仅 SSOT_Library 的内容被注入到 Assembled_Prompt，README 内容永不被注入。
5. IF README 在重构后仍包含任一规范性元素（带编号规则条目、十六进制色值或数值阈值/区间），THEN THE Refactored_Skill_Library SHALL 被判定为未通过职责边界校验；README 中面向人类读者的可读概述正文 SHALL 不因本校验被自动删除。

### Requirement 7: 规则编号体系的保留与可追溯

**User Story:** 作为维护者，我希望既有规则编号在重构后仍可追溯，以便历史引用与沟通不失效。

#### Acceptance Criteria

1. THE Refactored_Skill_Library SHALL 完整保留重构前出现的全部 Rule_ID（包括但不限于 R1–R10、X1–X9、S1–S9、E1–E5、M1–M4、L0–L5、F1–F4、C1–C4、V1–V4、P1–P4、B1–B4），重构后既不新增也不删除任何 Rule_ID。
2. WHEN 某 Rule_ID 的承载位置在重构中被移动或其所在小节被调整，THE Refactored_Skill_Library SHALL 保持该 Rule_ID 的标识文本逐字符不变（包含字母大小写、数字序号与分隔符）。
3. IF 某个 Rule_ID 在重构中被移动到 SSOT_Library，THEN THE Refactored_Skill_Library SHALL 在全部引用方以与原标识逐字符相同的 Rule_ID 指代该规则。
4. WHERE 多个文件曾使用不一致的编号或措辞指代同一规则，THE Refactored_Skill_Library SHALL 收敛为单一规范 Rule_ID 与单一规范表述，并保留被弃用编号到该规范 Rule_ID 的别名映射记录，使历史引用仍可定位。
5. IF 重构中发现编号冲突（同一 Rule_ID 指代不同规则，或两个不同 Rule_ID 指代同一规则），THEN THE Refactored_Skill_Library SHALL 暂缓该处合并、记录冲突详情，并在由维护者确认采用的单一规范 Rule_ID 之前不执行收敛。
6. WHEN 维护者按 Rule_ID 对照重构前后的规则清单，THE Refactored_Skill_Library SHALL 为每一个重构前 Rule_ID 提供其在重构后的唯一承载位置，且不残留指向不存在 Rule_ID 的引用。

### Requirement 8: 不破坏代码调用契约

**User Story:** 作为维护者，我希望重构不破坏应用代码对技能文件的读取，以便功能在重构后照常运行。

#### Acceptance Criteria

1. THE Refactored_Skill_Library SHALL 保持被应用代码以固定路径/文件名读取的全部命名不变，受保护清单包括：基准目录路径、`art_prompt` 与 `driector_skills` 子目录名、`prefix.md` 与 `README.md`、`art_prompt/` 下 7 个文件名、`driector_skills/` 下 3 个文件名。
2. IF 重构需要改变任一受保护命名，THEN THE Refactored_Skill_Library SHALL 二者择一执行：将该改动标记为超出本次重构范围而不执行，或在同步更新两个加载器侧（GetArtPrompt_Loader 与 ReadSkill_Loader）全部固定路径引用后方可执行。
3. WHEN 通过 GetArtPrompt_Loader 加载任一 Art_Prompt_File，THE Assembled_Prompt SHALL 返回字符长度大于 0 的文本，且满足与重构前的 Behavioral_Equivalence（见需求 3）。
4. WHEN 通过 ReadSkill_Loader 加载任一 Director_Skill_File，THE Assembled_Prompt SHALL 返回字符长度大于 0 的文本，且满足与重构前的 Behavioral_Equivalence（见需求 3）。
5. IF 任一受保护文件无法被其对应加载器按原固定文件名定位，THEN THE Refactored_Skill_Library SHALL 被判定为违反代码调用契约、未通过校验。

### Requirement 9: 过审与敏感词约束的完整保留

**User Story:** 作为维护者，我希望过审相关约束在重构中零损失，以便重构不会增加内容被审核拒绝的风险。

#### Acceptance Criteria

1. THE Refactored_Skill_Library SHALL 保留 S1–S9（含 S8.1）每一条过审约束的 Rule_ID 与其有效语义，使重构后按 Rule_ID 枚举的过审约束集合与重构前一一对应、不增、不减、不弱化（措辞整理仅限合并同义重复与统一表述）。
2. WHEN 通过 GetArtPrompt_Loader 加载任一 Art_Prompt_File，THE Assembled_Prompt SHALL 携带与重构前等价的全部 S1–S9（含 S8.1）过审约束（由 GetArtPrompt_Loader 在运行时自动前置注入 prefix.md 提供）。
3. WHEN 通过 ReadSkill_Loader 加载任一在生成时依赖过审约束的 Director_Skill_File，THE Assembled_Prompt SHALL 携带该文件生成时实际生效所需的全部过审约束正文（因 ReadSkill_Loader 不注入 prefix.md），而非仅保留指向 prefix.md 的裸引用。
4. THE Refactored_Skill_Library SHALL NOT 因去重删除风险词→安全替换映射表中的任何行，且 SHALL 保持每个风险词条目与其对应安全替换表述的映射关系不变（表行数与风险词↔安全替换的对应关系一一保留）。
5. IF 某条过审约束（S1–S9 任一 Rule_ID，或风险词→安全替换映射表中的任一行）在重构后无法在其所依赖加载路径产出的 Assembled_Prompt 中被检出，THEN 重构 SHALL 被判定为未通过过审约束保留校验。

### Requirement 10: 内容完整性校验

**User Story:** 作为维护者，我希望能验证重构前后规则集合一致，以便确认没有规则在重构中丢失。

#### Acceptance Criteria

1. THE Refactored_Skill_Library SHALL 产出一份以 Rule_ID 为主键的约束清单，使重构后清单（按 Rule_ID 与语义归并去重后）与重构前清单构成双向一一对应：重构前每一条约束在重构后清单中恰有一条对应项，重构后每一条约束在重构前清单中亦恰有一条对应来源项，且两份去重后清单的条目计数相等。
2. WHEN 维护者执行重构前后约束清单的比对，THE Refactored_Skill_Library SHALL 为每一条重构前约束提供一条映射记录，标明其在重构后的唯一规范承载位置（以承载文件名加 Rule_ID 或带锚点的小节标题表示）。
3. WHERE 某条约束依据需求 4 须在 Director_Skill_File 中保留正文副本，THE Refactored_Skill_Library SHALL 以相同 Rule_ID 将该副本标注为同源，使其在完整性校验中不被计为额外的规范承载位置或额外约束。
4. IF 某条重构前约束在重构后清单中无对应承载位置（约束丢失），THEN THE Refactored_Skill_Library SHALL 被判定为未通过完整性校验，并在校验输出中标识该丢失约束的 Rule_ID。
5. IF 重构后清单中某条约束在重构前清单中无对应来源项（约束新增），THEN THE Refactored_Skill_Library SHALL 被判定为未通过完整性校验，并在校验输出中标识该新增约束的 Rule_ID。
6. WHEN 重构前后清单的双向一一对应映射全部建立、且无丢失项与无新增项，THE Refactored_Skill_Library SHALL 被判定为通过完整性校验。
