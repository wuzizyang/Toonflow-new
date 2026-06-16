# 视频提示词 · 视觉风格约束

生成视频提示词时，必须注入以下视觉风格标签：

| 模式 | 风格标签 |
|------|----------|
| **通用多参模式（英文）** | `photorealistic anthropomorphic pet, real animal reared up on hind legs (not human standing), hunched rounded back, short stubby limbs, real paws and digitigrade feet, large head small rounded body, upper-body garment with bare furry hind legs, real-life footage, shot on camera, photorealistic photography, true-to-life, realistic detailed full-body fur, subsurface scattering, cinematic lighting, lifestyle vlog mood` |
| **通用首尾帧模式（英文）** | `photorealistic anthropomorphic pet, real animal reared up on hind legs (not human standing), hunched rounded back, short stubby limbs, real paws and digitigrade feet, large head small rounded body, upper-body garment with bare furry hind legs, real-life footage, shot on camera, photorealistic photography, true-to-life, realistic detailed full-body fur, subsurface scattering, cinematic lighting, lifestyle vlog mood, shallow depth of field` |
| **Seedance 2.0（中文）** | `宠物拟人化，动物自然后腿立起姿态（含背微弓、前爪收胸前、趾行爪足，非人类站姿），保留真实兽态（大头短身、短小四肢、真实前爪），上装为主下半身留覆毛兽腿，照片级写实真实摄影实拍质感，逐根真实毛发，次表面散射，电影级光照，真实生活Vlog氛围` |

---

## 防漂移规范（视频内容不跑偏的关键）

> Vlog 视频常见"漂移"：角色在片段中**毛色/五官/兽态渐变、变回四足或人形、背景偷换、写实风格滑向 CG、动作越做越夸张以致畸变**。视频提示词必须主动锁住"身份 / 形态 / 场景 / 风格"，并把运动控制在小幅度、单一动作。

### 一、锁身份与形态（最易漂，优先级最高）

- 以**首帧图 / 角色参考图为准**，全程保持同一只角色：毛色、花纹、五官、体型、服饰**自始至终不变**
- 形态全程锁定"动物后腿立起兽态"：**不得在片段中变回四足爬行、也不得拉直成人形**
- 提示词声明：
  - 中文：`全程保持与首帧一致的角色外观与兽态，毛色花纹五官体型服饰不变，不变形不渐变不切换形态`
  - 英文：`keep the exact same character as the first frame throughout, consistent fur color/markings/face/body/costume, no morphing, no identity drift, stays reared-up animal posture the whole clip`

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
`morphing, warping, shape-shifting, identity drift, inconsistent character, changing fur color, changing face, flickering, jittering, melting, deformed limbs, extra limbs, duplicated character, background changing, scene morphing, style shift, CG drift, turning into human, turning four-legged, exaggerated motion, fast erratic camera, distorted anatomy`

**模式A（中文，写入正向约束以替代负向）：**
`全程角色与场景稳定不漂移，无变形无渐变无闪烁，动作轻缓自然，镜头平稳`

> ✅ **一句话原则**：锁住"同一只角色、同一个场景、同一种真实质感"，只让它**轻轻做一个小动作**——锁得越死、动得越少，视频越不漂。
