---
name: director_storyboard
description: 导演分镜提示词技法 · 宠物拟人化Vlog（Pet Anthropomorphic Vlog）
metaData: director_skills
---

# 分镜提示词 · 宠物拟人化Vlog · 风格专属技法

---

## 适用范围

本 Skill 专用于**宠物拟人化Vlog（Pet Anthropomorphic Vlog）**风格的分镜提示词生成。

---

## 角色姿态：按行为切换（情境化拟人）

> 本题材的拟人是**情境化**的，镜头提示词必须**根据该镜的动作选择姿态**，不可一律写"后腿立起"：

| 该镜动作类型 | 姿态 | 提示词方向 |
|---|---|---|
| **操作类**（吃饭/做饭/用电脑/冲咖啡/看书/写字/拿物等用"手"的事） | **后腿坐起或立起 + 前爪像手一样操作** | 后腿坐起/立起，前爪操作物件，含背微弓，reared up / sitting up, forepaws handling objects |
| **位移类**（走路/跑/跳/进出门/移动/玩耍） | **自然四足兽态步态**，不直立行走 | 自然四足行走，real animal on all fours, natural quadruped gait, not walking upright |
| **静止/旁观**（趴卧/坐着发呆/晒太阳） | 自然动物休憩姿态（趴卧/蜷坐均可） | 自然动物坐卧姿态，natural resting animal pose |

- **判断口径**：镜头要表现"在用手做事"→ 立起操作态；要表现"在移动/行走"→ 四足兽态。**走路镜头严禁直立行走/人类化迈步**。
- 无论何种姿态，**身体始终是真实兽态**（大头短身、短小覆毛四肢、真实爪、含背微弓），穿**宠物服饰**，不得人形化、不穿人类成衣。

---

## 多图合成镜头的融合协调规范（消除违和感）

> 分镜图通常由「角色参考图 + 场景参考图 + 道具参考图」多张合成。若不主动要求融合，结果常常**像把各元素贴在一起**：角色偏 CG 玩具渲染、场景是实拍、光照各打各的、比例透视对不上、人物悬浮没落地。生成镜头提示词时**必须显式声明以下融合约束**。

### 一、统一质感（首要）

- 全画面**统一为同一种照片级写实质感**：角色、场景、道具都要"像在同一台相机、同一现场拍下来的"
- 角色须延续真实毛发与真实兽态质感，**不可呈现塑料/玩具/CG摆件感**；与写实场景同档真实度
- 提示词声明：`统一照片级写实质感，所有元素如同一现场实拍，one coherent photorealistic shot, unified rendering, consistent realism across character/scene/props`

### 二、统一光照与阴影

- 全画面共用**同一光源方向、色温与强度**；角色受光必须与场景光照一致（如黄金时刻暖光从右侧来，角色也从右侧受光）
- 角色与道具必须有**与地面/家具一致的接触阴影（contact shadow）与落地投影**，确保"踩实"在场景里、不悬浮
- 提示词声明：`统一光源方向与色温，角色受光与环境一致，真实接触阴影与落地投影，consistent lighting direction and color temperature, grounded contact shadows, matched ambient light`

### 三、统一比例与透视

- 角色、道具尺寸须**符合真实物理尺度**与场景透视（小兽尺度的角色 vs 街角/家具/蛋糕盒的合理大小关系），避免道具过大、角色过小/过大
- 角色站位须落在场景地面合理位置，**视平线与场景一致**
- 提示词声明：`比例与透视和场景一致，符合真实尺度，角色稳稳站在地面，correct scale and perspective, consistent horizon line, characters firmly on the ground plane`

### 四、统一色调与空气感

- 全画面做**统一色彩分级（color grading）**与统一白平衡，让角色融入场景色调，避免角色发色温、场景发冷的撕裂感
- 共享同一空气透视/景深，主体清晰、远景自然柔化
- 提示词声明：`统一色彩分级与白平衡，统一空气透视与景深，unified color grading, single white balance, cohesive atmosphere`

### 五、服饰与既有资产继承

- 角色服饰、道具外观一律**继承各自参考图**，镜头提示词不重新描述服装/鞋袜/配饰（见「美学禁止项」），只描述动作、表情、站位、镜头、光影
- 多角色同框时，逐一锚定各自参考图，禁止串味（A 的花色长到 B 身上）

### 六、角色数量与去重（防止同一角色出现多次）

> 角色参考图常是**四视图/多视角设定图**，模型容易把"同一角色的多个视角"误读成"多个角色"，于是在一个画面里把同一角色画两遍（双胞胎/分身）。必须主动约束数量。

- **显式声明每个角色的数量**：镜头提示词中点明"画面中只有 1 只{角色名}"，多角色镜头则逐一写明各自数量（如"呼呼 1 只、小花 1 只"）
- **声明参考图性质**：当参考图为多视角设定图时，必须说明"参考图为同一角色的多视角，仅代表一个角色，不要复制成多个"
- **提示词声明**：`画面中{角色名}只出现一次，全画面仅一只{角色名}，禁止重复/分身/双胞胎`
- 英文：`exactly one {character}, single instance only, the reference sheet shows ONE character from multiple angles, do NOT duplicate or clone the character, no twins`

> ✅ **一句话原则**：镜头提示词要把多张参考图"焊"成一张照片——同一光、同一色、同一尺度、同一真实度，角色落地、服饰沿用参考图、**每个角色只出现规定的次数**。

---

## 情绪 → 面容/眼神词映射

> 宠物拟人角色的情绪表达兼用「五官表情」与「种属特征动态」（耳朵/尾巴/胡须）。
> **呆萌优先**：所有情绪默认带一层"呆萌天真"底色——圆润大眼、无辜眼神、偶尔放空发呆或微微歪头，避免精明锐利的人类化神情。

| 情绪输入 | 面容词 | 眼神词 | 种属特征/微表情补充 |
|----------|--------|--------|-----------|
| 心动 / 欣喜 | 圆润大眼，绒毛柔和 | 眼睛明亮，闪光高光 | 耳朵竖起，尾巴轻摆 |
| 悲伤 / 失落 | 耷拉神情，柔和绒毛 | 眼神湿润，目光低垂 | 耳朵下垂，尾巴垂落 |
| 惊讶 / 好奇 | 圆眼放大，竖耳 | 眼神集中，目光好奇 | 耳朵竖直，胡须前探 |
| 温柔 / 深情 | 柔和神情，暖色绒毛 | 眼神专注，目光柔和 | 耳朵自然，嘴角微弯 |
| 坚定 / 勇敢 | 神情明确，竖耳 | 眼神坚定，目光集中 | 耳朵竖立，姿态挺立 |
| 害羞 / 羞涩 | 脸颊粉晕，圆润绒毛 | 眼睛向下，不敢直视 | 耳朵微垂，爪手遮脸 |
| 温暖 / 感动 | 暖调神情，柔和绒毛 | 眼神温暖，目光柔和 | 耳朵放松，嘴角上扬 |
| 孤独 / 怀念 | 冷调神情，安静绒毛 | 眼神放空，若有所思 | 耳朵微垂，尾巴静垂 |
| 快乐 / 雀跃 | 弯月眼，明亮表情 | 眼睛弯弯，表情生动 | 耳朵竖起，尾巴欢摆 |
| 紧张 / 不安 | 神情拘谨，竖耳警觉 | 眼睛微缩，目光不定 | 耳朵微贴，胡须收拢 |

---

## 色彩氛围词库（宠物拟人Vlog风）

### 色相使用

| 场景类型 | 主色词 | 辅色词 | 氛围词 |
|--------|--------|--------|---------|
| 居家日常 | 奶油白 + 焦糖棕 | 暖橙点缀 | 温馨感，生活感 |
| 咖啡馆 | 暖橙 + 浅燕麦 | 焦糖棕 + 奶油白 | 惬意，仪式感 |
| 户外公园 | 抹茶绿 + 薄荷奶 | 雾霾蓝 + 奶油白 | 清新，治愈感 |
| 街头出游 | 暖阳橙 + 浅燕麦 | 蜜桃粉点缀 | 悠闲，烟火感 |
| 夜晚居家 | 雾霾蓝 + 炭灰 | 暖橙点缀 | 静谧，温馨感 |
| 回忆场景 | 浅燕麦 + 灰玫瑰 | 蜜桃粉点缀 | 怀旧，柔和感 |

### 情绪光影

| 情绪基调 | 光影类型 | 补充约束 |
|----------|----------|---------|
| 心动/温情 | 暖色柔光 | 黄金时刻光晕，主体突出 |
| 悲伤/失落 | 冷色柔光 | 饱和度降低，柔和阴影 |
| 快乐/活力 | 明亮自然光 | 饱和度适中，色彩丰富 |
| 怀旧/回忆 | 低饱和柔调光 | 色调统一，柔和泛黄 |
| 居家/温馨 | 暖橙窗光/灯光 | 柔和对比，温暖光晕 |
| 夜晚/静谧 | 冷调暖灯点缀 | 暖光点缀，层次清晰 |

---

## 场景质感约束词（按场景类型）

| 场景类型 | 必加约束词 |
|----------|-----------|
| 拟人角色 | 保留真实动物全身特征与体态，**姿态按动作（操作类后腿坐起/立起+前爪操作，移动类自然四足兽态）**，保留真实兽态（大头短身、短小四肢、真实前爪、含背微弓），宠物服饰，真实毛发清晰自然，真实解剖结构，照片级写实 |
| 居家空间 | 温馨家具，木质布艺，暖色调，生活细节，柔和窗光 |
| 咖啡馆 | 木桌椅，暖光吊灯，咖啡器具，惬意氛围 |
| 户外自然 | 柔和绿植，自然光，清新色调，治愈氛围 |
| 街头景观 | 温馨店面，行道树，柔和阳光，烟火气 |
| 夜晚空间 | 暖黄灯光，冷调背景，温馨光晕，层次清晰 |
| 食物道具 | 圆润诱人，柔和高光，温润质感 |

---

## 固定风格锚定词（所有输出必须包含）

**宠物拟人化风格锚定（必选）：**

宠物拟人化，保留真实动物全身特征与体态，**姿态按本镜动作切换（操作类→后腿坐起/立起+前爪操作；移动类→自然四足兽态、不直立行走）**，保留真实兽态（大头短身、短小四肢、真实前爪、含背微弓），宠物专用服饰，照片级写实·真实摄影（日常生活随拍质感，real-life photo），自然日常光照

**真实毛发质感（所有输出必选）：**

真实毛发清晰自然，皮毛层次，自然透光感，真实光泽

**生活Vlog质感（所有输出必选）：**

真实生活Vlog氛围，写实生活感，自然景深，生活细节

**光影色彩（所有输出必选）：**

自然写实光照，柔和环境光，真实阴影，暖色调

**氛围锚定（必选）：**

温暖治愈氛围，真实拟人反差，陪伴式情感，呆萌可爱，圆润大眼无辜神态，自然真实

**多图融合锚定（含角色/场景/道具多张参考图时必选）：**

模式A（中文）：
统一照片级写实质感，所有元素如同一现场实拍，统一光源方向与色温，角色受光与环境一致，真实接触阴影与落地投影，比例透视与场景一致符合真实尺度，角色稳稳站在地面，统一色彩分级与白平衡，画面浑然一体无拼贴感

模式B（英文）：
one coherent photorealistic shot, unified rendering and realism across character/scene/props, consistent lighting direction and color temperature, character lit by the same light as the environment, grounded contact shadows, correct scale and perspective matching the scene, consistent horizon line, unified color grading and white balance, seamless composite, no pasted-on look

**画质锁定词（所有输出必须包含，置于风格收尾之后）：**

模式A（中文）——默认：
照片级写实，手机随手拍质感，毛发清晰自然，色彩自然朴素不加滤镜，光线平淡真实，自然日常光照

模式A（中文）——画内文字场景（画面描述中含招牌/标识等道具文字时）：
照片级写实，手机随手拍质感，毛发清晰自然，色彩自然朴素不加滤镜，光线平淡真实，自然日常光照，招牌/标识等道具文字清晰可读

模式B（英文）——默认：
photorealistic, real-life photo, shot on iPhone, casual smartphone snapshot, photorealistic photography, true-to-life, casual everyday snapshot, natural ambient light, realistic detailed fur, individual fur strands, natural translucent glow, natural realistic colors, no noise, no artifacts

模式B（英文）——画内文字场景（画面描述中含招牌/标识等道具文字时）：
photorealistic, real-life photo, shot on iPhone, casual smartphone snapshot, photorealistic photography, true-to-life, casual everyday snapshot, natural ambient light, realistic detailed fur, individual fur strands, natural translucent glow, natural realistic colors, no noise, no artifacts, legible text on signs and props

**负向词模板（模式B 必须包含，置于提示词末尾）：**

> ⚠️ Seedream（模式A）**不支持负向提示词**，负向词仅适用于模式B。模式A 通过正向词中的质感锚定和画质锁定来保证画面质量。

模式B（英文）：
cartoon, illustration, claymation, 2.5D, cel-shaded, toy-like, plastic, rubber, flat shading, anime, 3D render look, CGI, octane render, plastic toy figurine, no human-only face without animal features, no humanoid human body, no human torso, no elongated human arms, no human five-finger hands, no broad human shoulders, no vertical human spine, no stiff human standing, no walking upright on two legs, no human bipedal walking gait, no trousers covering legs, no human legs silhouette, no human garment, keep real animal body with hunched back, short stubby limbs, real paws and digitigrade feet, pet clothing, no pasted-on look, no collage, no sticker cutout, no floating characters, no mismatched lighting, no inconsistent scale, duplicate character, cloned character, twins, same character appearing twice, repeated subject, multiple copies of the same character, no horror, no distorted anthropomorph, no neon colors

---

## 美学禁止项（生成时严格规避）

以下词汇/风格不得出现于输出提示词中：

- ❌ 卡通/插画/黏土/2.5D扁平/玩具感/塑料感等非写实质感
- ❌ 失去真实动物身体特征的纯人类/人形化躯干角色
- ❌ 过度拟人：人类化修长躯干/宽肩/修长手臂/灵巧五指人手/挺直军姿/垂直脊柱（身体须为真实兽态：大头短身、含背微弓、短小四肢、真实前爪）
- ❌ 人腿剪影与人类成衣：长裤/长袜遮盖后腿造成人类双腿轮廓；人类成衣剪裁（应为宠物专用服饰、上身/披挂为主、下半身留覆毛兽腿与爪足）
- ❌ **直立行走/人类化迈步走路**：走路、移动、奔跑须为自然四足兽态；后腿立起仅用于"用手的操作行为"（操作态）。注意：四足是移动镜头的正确姿态，不属于错误
- ❌ 恐怖/怪诞/扭曲/畸形拟人造型
- ❌ 高饱和荧光色/赛博霓虹色
- ❌ **角色入镜时重新描述/新增服饰**：当画面带有角色参考图时，服饰一律继承参考图，提示词中**不得**再写"穿着白T恤/卡其裤/赤脚"等任何服装、鞋袜、配饰描述（避免与参考图冲突、避免冒出长裤等被禁款式）
- ❌ 画外叠加文字（字幕、水印、标题卡、旁白叠字等 UI 层文字，画面必须为纯视觉画面）

> 💡 **例外**：故事世界内的道具文字（招牌、菜单、路牌、书籍等场景中自然存在的文字）**不属于禁止范围**。当分镜画面描述中包含此类内容时，应如实描写其存在并要求文字清晰。

> 👕 **服饰继承原则**：分镜/场景图中的角色服饰由角色参考图（基础形象/服化衍生资产）决定。生成镜头提示词时**只描述动作、表情、镜头、场景、光影**，服饰交由参考图保持一致——只需声明"服饰与参考图一致 / keep costume identical to reference"，不展开任何具体服装描述。需要换装时应回到服化衍生环节产出新的角色资产，而非在镜头提示词里临时改写。

---

## 完整生成示例

> 以下为同一输入分别使用模式A和模式B的对照展示，实际使用时**仅输出其中一种**。

### 输入（分镜表行数据）

| 序号 | 画面描述 | 场景 | 关联资产名称 | 时长 | 景别 | 运镜 | 角色动作 | 情绪 | 光影氛围 |
|------|---------|------|-------------|------|------|------|---------|------|----------|
| 1 | 拟人橘猫坐在咖啡馆窗边，端起马克杯轻嗅咖啡香 | 咖啡馆 | 角色A | 5s | 中景 | 缓慢推进 | 端杯轻嗅，耳朵微动 | 惬意 / 温暖 | 黄金时刻暖光 + 窗光 |

### 示例输出A（模式A · Seedream）

[Prompt]
宠物拟人化，保留真实动物全身特征与体态，动物自然后腿立起姿态（含背微弓、前爪收胸前、趾行爪足），照片级写实·真实摄影（手机随手拍质感），自然日常光照，中景构图，拟人角色半身入镜，真实毛发清晰自然，皮毛层次，自然透光感，真实光泽，真实生活Vlog氛围，写实生活感，自然景深，生活细节，自然写实光照，柔和环境光，真实阴影，暖色调，拟人橘猫坐在咖啡馆窗边，端起马克杯轻嗅咖啡香，耳朵微动，眼神柔和，窗边自然光，温暖治愈氛围，真实拟人反差，陪伴式情感，呆萌可爱，圆润大眼无辜神态，自然真实，照片级写实，手机随手拍质感，毛发清晰自然，色彩自然朴素不加滤镜，光线平淡真实，自然日常光照。
Based on the reference image of 角色A, maintain consistent: animal head features, fur color, costume. The reference is one character shown from multiple angles — render exactly ONE 角色A, do not duplicate or clone. Generate a new scene: anthropomorphic orange cat sitting by the cafe window, holding a mug and sniffing coffee, ears twitching softly. Keep character appearance identical to reference.

### 示例输出B（模式B · Nanobanana）

```xml
<role>
You are an anthropomorphic pet vlog storyboard artist.
Maintain strict visual continuity across all shots.
</role>
<character_reference>
Image [1]: 角色A — photorealistic anthropomorphic cat, realistic animal head and full-body features kept, realistic detailed fur, real animal body (large head small rounded body, hunched back, short stubby limbs, real paws and digitigrade feet), posture follows action (reared up with forepaws for hand-tasks / quadruped when moving), pet clothing with bare furry hind legs, real-life photo, shot on iPhone, casual smartphone snapshot, photorealistic photography
</character_reference>
<continuity_rules>
- Same fur color, animal head features, costume across ALL shots
- Inherit costume from the character reference image; do NOT re-describe or add any clothing/footwear in the shot prompt
- Same environment, color palette, warm lighting
- Only framing, angle, action, expression may change
- Keep real animal head and full-body features; posture follows the action — reared up / sitting up on hind legs with forepaws handling objects for hand-tasks (eating, cooking, using computer), or natural quadruped gait when walking/moving; do NOT turn into a human/humanoid body and do NOT walk upright on two legs
- Do NOT introduce new characters not in reference images
- Exactly one instance of each character; the reference sheet shows ONE character from multiple angles — do NOT duplicate, clone, or mirror the character into the frame
</continuity_rules>
<shot>
Medium shot, photorealistic anthropomorphic orange cat sitting by the cafe window, holding a mug and sniffing coffee, ears twitching, soft gaze, realistic detailed fur, individual fur strands, natural translucent glow, real-life photo, shot on iPhone, casual smartphone snapshot, photorealistic photography, true-to-life, casual everyday snapshot, cozy window light, natural ambient light, natural realistic colors, lifestyle vlog mood, no noise, no artifacts.
</shot>
<negative>
cartoon, illustration, claymation, 2.5D, cel-shaded, toy-like, plastic, rubber, flat shading, anime, 3D render look, CGI, octane render, plastic toy figurine, no human-only face without animal features, no humanoid human body, no human torso, no elongated human arms, no human five-finger hands, no broad human shoulders, no vertical human spine, no stiff human standing, no walking upright on two legs, no human bipedal walking gait, no trousers covering legs, no human legs silhouette, no human garment, keep real animal body with hunched back, short stubby limbs, real paws and digitigrade feet, pet clothing, no pasted-on look, no collage, no sticker cutout, no floating characters, no mismatched lighting, no inconsistent scale, duplicate character, cloned character, twins, same character appearing twice, repeated subject, multiple copies of the same character, no horror, no distorted anthropomorph, no neon colors
</negative>
```

## 快速参考卡

### 情绪 → 画面词速查

| 情绪 | 面容/特征关键词 | 色彩匹配 |
|------|-----------|---------|
| 心动 | 圆润大眼，耳朵竖起 | 蜜桃粉 + 暖橙对比 |
| 悲伤 | 耳朵下垂，眼神湿润 | 雾霾蓝 + 灰玫瑰单色 |
| 温柔 | 柔和神情，暖色绒毛 | 浅燕麦 + 奶油白柔和 |
| 浪漫 | 脸颊粉晕，目光交汇 | 蜜桃粉 + 暖橙对比 |
| 感动 | 嘴角上扬，暖调绒毛 | 暖橙 + 浅燕麦主色 |
| 孤独 | 耳朵微垂，眼神放空 | 雾霾蓝 + 炭灰单色 |
| 快乐 | 弯月眼，尾巴欢摆 | 暖橙 + 抹茶绿对比 |
