# 视频提示词 · 视觉风格约束

生成视频提示词时，必须注入以下视觉风格标签：

| 模式 | 风格标签 |
|------|----------|
| **通用多参模式（英文）** | `photorealistic anthropomorphic pet, real animal body (large head small rounded body, hunched back, short stubby limbs, real paws and animal paw feet), posture follows action: reared up on hind legs with forepaws handling objects for hand-tasks, natural quadruped gait when walking/moving (never walking upright), pet clothing, fluffy animal hind legs, adorable dopey expression, big round innocent eyes, real-life footage, shot on camera, photorealistic photography, true-to-life, casual everyday snapshot aesthetic, natural ambient light, realistic detailed full-body fur, natural translucent glow, lifestyle vlog mood` |
| **通用首尾帧模式（英文）** | `photorealistic anthropomorphic pet, real animal body (large head small rounded body, hunched back, short stubby limbs, real paws and animal paw feet), posture follows action: reared up on hind legs with forepaws handling objects for hand-tasks, natural quadruped gait when walking/moving (never walking upright), pet clothing, fluffy animal hind legs, adorable dopey expression, big round innocent eyes, real-life footage, shot on camera, photorealistic photography, true-to-life, casual everyday snapshot aesthetic, natural ambient light, realistic detailed full-body fur, natural translucent glow, lifestyle vlog mood, shallow depth of field` |
| **Seedance 2.0（中文）** | `宠物拟人化，真实兽态（大头短身、含背微弓、短小四肢、真实前爪、趾行爪足），姿态随动作：用手操作时后腿坐起/立起+前爪操作，走路移动时自然四足兽态（绝不直立行走），宠物专用服饰，下半身覆毛兽腿，呆萌可爱、圆润大眼无辜神态，照片级写实真实摄影日常生活随拍质感，自然日常光照，真实毛发清晰自然，自然透光感，真实生活Vlog氛围` | | |

---

## 防漂移规范（视频内容不跑偏的关键）

> Vlog 视频常见"漂移"：角色在片段中**毛色/五官/兽态渐变、变回四足或人形、背景偷换、写实风格滑向 CG、动作越做越夸张以致畸变**。视频提示词必须主动锁住"身份 / 形态 / 场景 / 风格"，并把运动控制在小幅度、单一动作。

### 一、锁身份与形态（最易漂，优先级最高）

- 以**首帧图 / 角色参考图为准**，全程保持同一只角色：毛色、花纹、五官、体型、服饰**自始至终不变**
- 形态全程保持**真实兽态**，并保持与本镜动作匹配的**同一姿态模式**：操作镜全程后腿坐起/立起操作、移动镜全程自然四足行走；**片段内不得在立起与四足间来回切换、不得变形渐变、不得拉成人形或直立行走**
- 提示词声明：
  - 中文：`全程保持与首帧一致的角色外观与兽态，毛色花纹五官体型服饰不变，保持本镜姿态模式不变，不变形不渐变不切换形态，不直立行走`
  - 英文：`keep the exact same character as the first frame throughout, consistent fur color/markings/face/body/costume, no morphing, no identity drift, stays in the same action-appropriate posture mode the whole clip (no switching between reared-up and quadruped), always stays as animal, never walks upright`

### 二、锁场景与构图

- 背景环境、家具陈设、光照方向**全程一致**，镜头移动时场景应是连贯的同一空间，不偷换
- 提示词声明：`背景与光照全程一致，同一空间连贯，consistent background and lighting, same location throughout, stable environment`

### 三、锁写实风格

- 全程维持真实摄影实拍质感，**不得在片段中滑向 CG/3D 渲染/卡通**
- 提示词声明：`全程真实摄影实拍质感，photorealistic live-action look throughout, no style shift, no CG drift`

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
`morphing, warping, shape-shifting, identity drift, inconsistent character, changing fur color, changing face, flickering, jittering, unstable body shape, inconsistent limbs, changing proportions, duplicated character, background changing, scene morphing, style shift, CG drift, humanoid transformation, bipedal walking, switching posture mid-clip, exaggerated motion, fast erratic camera`

**模式A（中文，写入正向约束以替代负向）：**
`全程角色与场景稳定不漂移，无变形无渐变无闪烁，动作轻缓自然，镜头平稳`

> ✅ **一句话原则**：锁住"同一只角色、同一个场景、同一种真实质感"，只让它**轻轻做一个小动作**——锁得越死、动得越少，视频越不漂。
