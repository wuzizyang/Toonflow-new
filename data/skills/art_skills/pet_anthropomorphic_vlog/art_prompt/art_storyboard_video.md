# 视频提示词 · 视觉风格约束

生成视频提示词时，必须注入以下视觉风格标签：

| 模式 | 风格标签 |
|------|----------|
| **通用多参模式（英文）** | `photorealistic anthropomorphic pet, real animal body (large head small rounded body, hunched back, short stubby limbs, real paws), posture follows action: reared up on hind legs with forepaws handling objects for hand-tasks, natural quadruped gait when walking/moving, pet clothing, short furry legs, adorable dopey expression, big round eyes, bright sufficient exposure with warm 5000K daylight, even soft balanced lighting, cream white and caramel warm palette, crisp visible fur strands and fine surface detail, main character in sharp focus, natural translucent glow, smooth stable motion, first-person vlog selfie POV, looking at the camera, lifestyle vlog mood` |
| **通用首尾帧模式（英文）** | `photorealistic anthropomorphic pet, real animal body (large head small rounded body, hunched back, short stubby limbs, real paws), posture follows action: reared up on hind legs with forepaws handling objects for hand-tasks, natural quadruped gait when walking/moving, pet clothing, short furry legs, adorable dopey expression, big round eyes, bright sufficient exposure with warm 5000K daylight, even soft balanced lighting, cream white and caramel warm palette, crisp visible fur strands and fine surface detail, main character in sharp focus, natural translucent glow, smooth stable motion, first-person vlog selfie POV, looking at the camera, lifestyle vlog mood, shallow depth of field` |
| **Seedance 2.0（中文）** | `宠物拟人化，真实兽态（大头短身、含背微弓、短小四肢、真实前爪），姿态随动作：用手操作时后腿坐起/立起+前爪操作，走路移动时自然四足兽态，宠物专用服饰，下半身覆毛短腿，呆萌可爱、圆润大眼神态，照片级写实，明亮充足曝光暖白日光5000K，均匀柔和受光左右均衡，奶油白焦糖棕暖色基调，真实毛发丝缕与表面细节清晰、避免涂抹塑料感，主角全程锁焦清晰，自然透光感，运动平滑稳定无跳变，第一人称vlog自拍视角，看向镜头，真实生活Vlog氛围` | | |

---

## 防漂移规范（视频内容不跑偏的关键）

> Vlog 视频常见"漂移"：角色在片段中**毛色/五官/兽态渐变、变回四足或人形、背景偷换、写实风格滑向 CG、动作越做越夸张以致畸变**。视频提示词必须主动锁住"身份 / 形态 / 场景 / 风格"，并把运动控制在小幅度、单一动作。

### 一、锁身份与形态（最易漂，优先级最高）

- 以**首帧图 / 角色参考图为准**，全程保持同一只角色：毛色、花纹、五官、体型、服饰**自始至终不变**
- 形态全程保持**真实兽态**，并保持与本镜动作匹配的**同一姿态模式**：操作镜全程后腿坐起/立起操作、移动镜全程自然四足行走；**片段内不得在立起与四足间来回切换、不得变形渐变、不得拉成人形或直立行走**
- 提示词声明：
  - 中文：`全程保持与首帧一致的角色外观与兽态，毛色花纹五官体型服饰不变，保持本镜姿态模式不变，不变形不渐变不切换形态，全程保持真实兽态`
  - 英文：`keep the exact same character as the first frame throughout, consistent fur color/markings/face/body/costume, no morphing, no identity drift, stays in the same action-appropriate posture mode the whole clip, always stays as a real animal`

### 二、锁场景与构图

- 背景环境、家具陈设、光照方向**全程一致**，镜头移动时场景应是连贯的同一空间，不偷换
- **锁真实兽体尺度**：角色全程保持真实小动物体型，**明显小于画面中的人、只到坐着的成年人腰部以下、坐在座椅上只占座椅约 1/3 的一角**，与画面中座椅/车厢/家具/餐具等参照物的大小关系符合真实世界逻辑，**全程保持真实小动物尺度、宁小勿大、比例稳定不变**
- 提示词声明：`背景与光照全程一致，同一空间连贯，角色全程保持真实小动物体型、明显小于身旁的人、坐在座椅上只占座椅约1/3的一角、与座椅/家具/餐具等参照物大小关系符合真实世界逻辑、尺度稳定不变宁小勿大，consistent background and lighting, same location throughout, stable environment, pet keeps true real-life animal size throughout, clearly much smaller than nearby humans, no taller than a seated adult's waist, occupies only about one third of a seat, scale vs surrounding objects stays physically correct, err on the smaller side, body scale stays stable`

### 三、锁写实风格

- 全程维持照片级写实质感，**不得在片段中滑向 CG/3D 渲染/卡通**
- 提示词声明：`photorealistic throughout, no style shift, no CG drift`

### 四、控制运动幅度（漂移的根源）

- **一个镜头只做一个小动作**（端杯轻嗅 / 翻一页书 / 耳朵微动 / 缓慢转头），避免连续多动作与大幅度肢体运动
- 运镜：固定或极缓慢推拉/跟随，**禁止快速运镜、甩镜、旋转**，越稳越不容易漂
- 动作用"轻、缓、自然"修饰，明确动作的起止，避免开放式大动作
- 种属微表情（耳朵、尾巴、胡须）做小幅自然摆动即可，传情不靠大动作
- 提示词声明：`单一轻缓动作，肢体小幅自然运动，镜头固定或缓慢，subtle minimal motion, single gentle action, slow steady camera, stable framing`

### 五、首尾帧模式优先（条件允许时）

- 有首尾帧能力的模型，**优先用首帧 + 尾帧锁定起止状态**，让模型只补间中间运动，最大限度抑制漂移
- 首尾帧应是**同一角色、同一场景、同一服饰**，仅有小幅动作/表情差异，避免首尾差异过大导致中段乱补

### 六、时长与稳定

- 单段时长不宜过长（建议 ≤5s），时长越长身份与场景越易漂；需要更长内容用多段短镜头拼接，每段都以同一参考图锚定

### 防漂移负向词

**模式B（英文，置于负向区）：**
`morphing, warping, shape-shifting, identity drift, inconsistent character, changing fur color, changing face, flickering, jittering, unstable body shape, inconsistent limbs, changing proportions, changing body scale, oversized pet, human-sized cat, pet as big as a human, giant cat, enlarged animal, pet filling an adult seat, duplicated character, background changing, scene morphing, style shift, CG drift, switching posture mid-clip, exaggerated motion, fast erratic camera`

**模式A（中文，写入正向约束以替代负向）：**
`全程角色与场景稳定不漂移，无变形无渐变无闪烁，动作轻缓自然，镜头平稳`

> ✅ **一句话原则**：锁住"同一只角色、同一个场景、同一种真实质感"，只让它**轻轻做一个小动作**——锁得越死、动得越少，视频越不漂。

---

## 去 AI 味 / 反退化规范（视频生成专用，优先级与防漂移并列）

> 实测发现：持续运动的 Vlog 视频最易出现 **AI 塑料感** —— 全画面纹理被涂抹成平滑色块、画面中心主体在中段细节崩塌（"融化"）、帧间忽快忽慢有微跳帧。这些不是"漂移"而是**生成退化**，需单独约束。所有正向词仍受 prefix.md S8 / S8.1 约束：**写实同义词最多保留 1 个 `photorealistic`，严禁堆叠 RAW/ultra realistic/真实照片实拍 等**，本节靠"具体材质细节 + 稳定运动 + 充足曝光"提质感，不靠堆真实感同义词。

### 一、纹理保真（反涂抹，最高优先级）

- 退化表现：背景与主体被抹平成无细节的平滑色块，失去毛发丝缕、织物纹理、皮肤/物体表面的微观细节
- 提示词声明（具体材质，不堆真实感同义词）：
  - 中文：`清晰可见的真实毛发丝缕、织物纹理与表面微观细节，画面通透有细节层次，避免涂抹平滑、避免塑料感糊面`
  - 英文：`crisp visible fur strands, fabric weave and fine surface micro-detail, detailed throughout, no smeared flat patches, no plastic smooth blur`
- 背景即便虚化也应保留自然颗粒与细节质感，不得整片糊成色块

### 二、中心主体锁定（反"融化"）

- 退化表现：画面中心（主角所在位置）在镜头中段细节完全崩塌，主体糊成模糊色块、边缘消失
- 提示词声明：
  - 中文：`主角全程位于画面焦点、五官与毛发细节自始至终清晰锐利，中心主体不融化不模糊不糊面，全程保持清晰可辨`
  - 英文：`main character stays in sharp focus the whole clip, facial features and fur detail crisp from start to end, center subject never melts or blurs, consistently sharp and well-defined`
- 配合防漂移第四节：主体动作越小，中心越不易融化；优先让主体在画面中**相对静止**，由环境/前景产生运动感

### 三、帧间稳定（反跳帧/闪烁）

- 退化表现：运动忽快忽慢、有微跳帧、中段噪点异常、画面闪烁
- 提示词声明：
  - 中文：`运动匀速平滑连贯，帧间稳定无跳变无闪烁，画面噪点均匀干净，无忽快忽慢`
  - 英文：`smooth even continuous motion, stable between frames, no jitter no flicker no frame jumps, clean even grain throughout`
- 优先**首尾帧模式**（防漂移第五节）让模型只做匀速补间；运镜越慢越稳，帧间越不易跳变

### 四、曝光与光照（反过暗 / 反冷调 / 反左右失衡）

- 退化表现：整体欠曝偏暗（平均亮度仅 ~110/255）、色调偏蓝灰冷调、左右亮度严重失衡（单侧过曝单侧欠曝）、主体与背景对比不足
- 提示词声明：
  - 中文：`明亮充足的曝光，画面通透不发暗，高光与暗部均保留细节；暖白日光 5000K 暖调，奶油白+焦糖棕暖色基调，符合温暖治愈氛围；均匀柔和的整体照明，左右明暗均衡，避免单侧强光源造成的明暗失衡；主角受光充足、与背景拉开明暗对比、清晰突出`
  - 英文：`bright sufficient exposure, clear not dark, detail retained in both highlights and shadows; warm 5000K daylight, cream white and caramel brown warm palette, cozy healing mood; even soft overall lighting, balanced left-right brightness, no single-side blown-out or underexposed half; main character well-lit and clearly separated from background with good contrast`
- 与 prefix.md「色温约束」「曝光与去 AI 味光照」对齐：暖底 4800-5800K、中等饱和、避免蓝灰冷调

### 去 AI 味负向词

**模式B（英文，置于负向区）：**
`AI look, plastic texture, smeared details, flat smooth patches, melting subject, blurry center, loss of detail mid-clip, texture smearing, waxy skin, over-smoothed, temporal flicker, frame jumps, jitter, stutter, uneven motion, patterned noise, underexposed, too dark, dim, blue-grey cold cast, color cast, blown-out highlights, uneven side lighting, low contrast subject`

**模式A（中文，写入正向约束以替代负向）：**
`画面通透明亮、纹理清晰真实、主体全程锐利不融化、运动平滑稳定、暖调均匀受光`

> ✅ **一句话原则**：让画面**亮起来、暖起来、清晰起来、稳下来** —— 充足暖光 + 清晰材质细节 + 主体锁焦 + 匀速运动，是去除"AI 塑料感"的四把锁。

---

## 短脚本节奏约束（≤25s 适用）

> 短视频平台单梗内容（见 prefix.md 第六节时长分档）节奏更快。短脚本在**完整保留上方防漂移六节规范**的前提下，用更短的单段时长与更快的镜头拼接承载情绪，**不靠镜头内大动作提速**。

### 节奏结构（四段式）

| 阶段 | 时长 | 内容 |
|---|---|---|
| 建立 | 0-3s | 角色亮相 + 场景一瞥 |
| 冲突 | 3-8s | 痛点/矛盾出现 |
| 反转 | 8-13s | 角色反差反应 |
| 落点 | 13-15s | 情绪落点 + 钩子 |

### 短脚本视频规范

| 编号 | 规则 |
|---|---|
| F1 | 短脚本每个镜头 2-4s，3-5 个镜头快速拼接，每段都以同一参考图锚定身份与兽态 |
| F2 | 单镜头内仍只做一个轻缓小动作（防漂移第四节不变），快节奏由**剪辑切换**实现，而非镜头内连续多动作 |
| F3 | 发疯吐槽/反转发泄等情绪用真实兽态神态表达（耳朵压平、圆眼瞪大、尾巴炸毛、瘫软），不卡通夸张变形 |
| F4 | 长脚本（30s 以上）保留现有防漂移规范与单段 ≤5s 建议，不受本节影响 |

### 运镜分级

> 防漂移要求「固定/极缓运镜」，本表细化各档位的适用范围。短视频的张力不在运镜，在**剪辑切换**。

| 级别 | 方式 | 适用 |
|---|---|---|
| 静态 | 完全固定，无任何运动 | 约 80% 镜头 |
| 微动 | 极缓慢推拉（画面位移极小） | 情绪升温镜头 |
| 手持感 | 轻微呼吸式晃动（幅度极小） | vlog 自拍镜头 |
| 禁用 | 快摇、甩镜、旋转、快速变焦 | 所有镜头 |

### 剪辑节奏指导

> 短视频魅力在「切」。镜头时长与切换节奏按脚本档位匹配（档位定义见 prefix.md 第六节）。

| 脚本类型 | 镜头时长 | 镜头数 | 节奏感 |
|---|---|---|---|
| 短脚本（15-25s） | 2-4s/镜 | 5-8 镜 | 快切，有卡点 |
| 中脚本（30-45s） | 3-5s/镜 | 6-10 镜 | 有快有慢 |
| 长脚本（50-65s） | 4-8s/镜 | 8-12 镜 | 舒缓叙事 |

| 编号 | 规则 |
|---|---|
| C1 | 情绪突变时用跳切（两镜间无过渡） |
| C2 | 时间流逝用硬切 + 光影变化暗示，不用淡入淡出/叠化等传统转场 |
| C3 | 剪辑节奏与情绪同步：发疯向快切卡点，治愈向舒缓硬切 |
| C4 | 剪辑为后期环节，**不进入视频生成提示词**；生成阶段仍是单镜头单一轻缓动作 |
