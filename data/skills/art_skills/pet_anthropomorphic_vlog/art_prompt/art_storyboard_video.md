# 视频提示词 · 视觉风格约束

生成视频提示词时，必须注入以下视觉风格标签：

| 模式 | 风格标签 |
|------|----------|
| **通用多参模式（英文）** | `photorealistic anthropomorphic pet, real animal body (large head small rounded body, hunched back, short stubby limbs, real paws), posture follows action: reared up on hind legs with forepaws handling objects for hand-tasks, natural quadruped gait when walking/moving, pet clothing, short furry legs, adorable dopey expression, big round eyes, natural ambient light, realistic detailed full-body fur, natural translucent glow, first-person vlog selfie POV, looking at the camera, lifestyle vlog mood` |
| **通用首尾帧模式（英文）** | `photorealistic anthropomorphic pet, real animal body (large head small rounded body, hunched back, short stubby limbs, real paws), posture follows action: reared up on hind legs with forepaws handling objects for hand-tasks, natural quadruped gait when walking/moving, pet clothing, short furry legs, adorable dopey expression, big round eyes, natural ambient light, realistic detailed full-body fur, natural translucent glow, first-person vlog selfie POV, looking at the camera, lifestyle vlog mood, shallow depth of field` |
| **Seedance 2.0（中文）** | `宠物拟人化，真实兽态（大头短身、含背微弓、短小四肢、真实前爪），姿态随动作：用手操作时后腿坐起/立起+前爪操作，走路移动时自然四足兽态，宠物专用服饰，下半身覆毛短腿，呆萌可爱、圆润大眼神态，照片级写实，自然日常光照，真实毛发清晰自然，自然透光感，第一人称vlog自拍视角，看向镜头，真实生活Vlog氛围` | | |

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
- **锁真实兽体尺度**：角色全程保持真实小动物体型，与画面中座椅/车厢/家具/餐具等参照物的大小关系符合真实世界逻辑，**全程保持真实小动物尺度、比例稳定不变**
- 提示词声明：`背景与光照全程一致，同一空间连贯，角色全程保持真实小动物体型、与座椅/家具/餐具等参照物大小关系符合真实世界逻辑、尺度稳定不变，consistent background and lighting, same location throughout, stable environment, pet keeps true real-life animal size throughout, scale vs surrounding objects stays physically correct, body scale stays stable`

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
`morphing, warping, shape-shifting, identity drift, inconsistent character, changing fur color, changing face, flickering, jittering, unstable body shape, inconsistent limbs, changing proportions, changing body scale, duplicated character, background changing, scene morphing, style shift, CG drift, switching posture mid-clip, exaggerated motion, fast erratic camera`

**模式A（中文，写入正向约束以替代负向）：**
`全程角色与场景稳定不漂移，无变形无渐变无闪烁，动作轻缓自然，镜头平稳`

> ✅ **一句话原则**：锁住"同一只角色、同一个场景、同一种真实质感"，只让它**轻轻做一个小动作**——锁得越死、动得越少，视频越不漂。

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
