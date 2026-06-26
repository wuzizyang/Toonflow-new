---
name: art_character_dance
description: 角色基础形象 · AI宠物跳舞短视频 — 定义3D渲染纯兽态风格的角色四视图提示词规范。
metaData: art_prompt
---

# 角色基础形象生成 · AI宠物跳舞短视频约束手册

---

## 一、基础形象原则

1. **种属即灵魂** — 真实动物种属特征（耳形/口鼻/胡须/真实毛发/尾巴/真实骨骼结构）是角色唯一锚点，跨视图必须高度统一
2. **纯兽态、写实3D渲染** — 全身真实兽态（真实动物头骨、自然短身躯、短小四肢、真实前爪），写实3D渲染质感（cinematic 3D render + photorealistic animal fur + realistic anatomy），自然头身比1:3-4（接近真实幼宠比例）。**无人形化躯干、无人臂人手、无直立人腿**。穿戴宠物专用服饰
3. **四视图一致** — 种属/毛色/体型/服饰跨视图高度统一
4. **写实3D渲染质感** — cinematic 3D render, photorealistic animal fur, realistic anatomy, natural lighting。**非Pixar卡通，非2D插画，非夸张Q版**
5. **3D模型参考图锁一致性** — 四视图设定图同时作为3D模型参考图（character reference），锁定跨视频一致性

---

## 二、形态锁定工作流

> 写实3D渲染 + 纯兽态 + 萌态律动，文生图模型也可能向"卡通化"或"人形"收敛。采用"先定基准、再以图生图扩散"的工作流。

### 工作流三步

| 步骤 | 做法 | 目的 |
|---|---|---|
| **S1 选种** | 用文生图模板批量出图，**只挑形态最"真实兽态"的一张**作为基准图：自然坐姿/站姿的真实宠物、真实动物头骨结构、自然短身躯、短小四肢、真实前爪与短腿、写实3D渲染质感（非卡通） | 先拿到一张"对的"真实形态 |
| **S2 固化** | 把选中的基准图设为该角色的**形态参考图（character reference）+ 3D模型参考图**，并据它定稿四视图基础形象图 | 把真实兽态固化成可复用的视觉锚点 |
| **S3 扩散** | 后续衍生（换装/分镜/视频首帧）一律 **img2img / 参考图模式**，以基准图为形态底，仅改服饰、动作、场景 | 让每次产出都继承已锁定的真实兽态 |

### 选基准图的验收清单（S1 必须逐项过）

- [ ] **自然真实宠物姿态（坐姿/站姿）**
- [ ] **真实动物头骨结构**，不是卡通化圆球头
- [ ] **自然短身躯、真实腹部曲线**，不是人类瘦长躯干也不是卡通球身
- [ ] **前肢是短小真实前爪**，不是修长人臂
- [ ] **下半身是覆毛兽腿 + 短腿**，没有人腿剪影
- [ ] **头身比约1:3-4**，接近真实幼宠比例（不夸张大头化）
- [ ] **写实3D渲染质感**，毛发有自然密度与层次
- [ ] 头部种属特征（耳形/口鼻/胡须）真实清晰
- [ ] **无卡通化特征**：无夸张大眼眶、无扁平化面部、无Q版变形

### 提示词配合（img2img / 参考图阶段）

- 英文：`use the reference image as body/pose anchor, keep authentic realistic animal body, natural animal proportions, realistic skeletal structure, short stubby limbs, real paws and short legs unchanged, photorealistic fur texture, only change {variable}`
- 参考强度建议 0.65-0.85

---

## 三、面容约束

| 项目 | 约束 |
|---|---|
| 种属特征 | 由角色设定确定，必须保留对应真实耳形、口鼻、胡须、真实毛发纹理与面部轮廓 |
| 五官 | 由种属与性格自然推导，**真实动物五官**（真实瞳孔/虹膜反光/湿润鼻头/真实胡须根部），五官比例遵循真实动物解剖，**不得夸张放大眼眶或卡通化变形** |
| 风格底色 | cinematic 3D render, photorealistic animal fur, realistic anatomy, natural lighting |
| 气质 | 必须从角色设定提炼整体气质关键词，**默认偏向"真实萌态"基调**——萌态来自真实动物本身的可爱特征 |
| 表情 | 中性微表情，优先真实动物萌态：自然好奇眼神、微微歪头、本能小动作、放空发呆；**不得通过卡通化大眼或夸张弧线实现可爱** |

---

## 四、毛发与肤感约束

| 项目 | 约束 | 提示词 |
|---|---|---|
| 毛色 | 按种属设定、写实3D渲染质感、自然色泽渐变与色深变化 | {毛色} photorealistic fur, natural coat color with gradient |
| 质感 | 逐根毛发、真实密度变化（背密腹软面短）、自然层次感、有真实毛发分缝 | detailed individual fur strands, natural density variation, realistic fur layering, natural fur parting |
| 光泽 | 自然光泽、环境光反射、阳光下微微透光、无塑料感无卡通平涂 | realistic fur sheen, natural light reflection, subsurface scattering, no plastic, no flat shading |
| 头部 | 完整真实动物头部骨骼与肌肉、耳朵竖立或垂落、面部毛发真实分布 | realistic animal head anatomy, {耳形}, natural facial fur distribution |
| 皮肤 | 真实动物皮肤质感（鼻头/肉垫湿润纹理、无卡通化平涂） | realistic animal skin texture, moist nose, detailed paw pads |

---

## 五、体型与姿态约束

| 项目 | 约束 | 提示词 |
|---|---|---|
| 头身比 | **1:3-4**，接近真实幼宠比例（不夸张大头化） | natural animal proportions, head-to-body ratio 1:3-4 |
| 体态比例 | 真实动物体态：自然头骨、短颈、自然短身躯、短小四肢、自然腹部曲线 | realistic animal anatomy, natural skull, short neck, natural short body, short stubby limbs |
| 脊柱/重心 | 含背微弓、非垂直，重心压在后腿与臀部，遵循真实动物脊柱曲线 | natural animal spine curve, slightly hunched back, weight on hindquarters |
| 舞蹈姿态 | **萌态律动**：后腿坐起/立起+前爪随节拍摆动，动物自然萌态 | sitting up on hind legs, forepaws waving to the beat, head bobbing |
| 静止姿态 | 自然坐姿/趴卧，耳朵微动 | natural resting pose, ears twitching |
| 后肢/脚 | 真实动物后腿，短而覆毛 | short furry legs |
| 前肢/手 | 真实动物前爪，短小覆毛 | short furry forelimbs, realistic cat paws |
| 尾巴 | 保留种属尾巴、可随节拍摆动 | fluffy tail wagging to the rhythm |
| 服饰 | **宠物专用服饰**（宠物卫衣/背心/斗篷/项圈领结） | pet clothing, {服饰描述}, fitted for animal body |

---

## 六、四视图设定图规范

| 视图 | 要求 |
|------|------|
| 头部特写 | 真实动物头部骨骼与肌肉特征，写实3D渲染毛发，真实五官比例（非卡通大眼），耳朵/口鼻/胡须清晰 |
| 正视图 | 真实兽态全身，自然坐姿/站姿，自然头身比1:3-4，展示真实解剖与毛发质感 |
| 侧视图 | 侧面轮廓，展示真实脊柱曲线与尾巴、短小四肢、自然腹部线条 |
| 后视图 | 背面，展示尾巴与背部毛发真实层次与密度变化 |

**背景**：纯色浅灰（#E8E8E8），统一写实3D渲染自然光
**姿态**：自然宠物姿态（坐姿/站姿），非跳舞姿态——基础设定图锁定角色本体

---

## 七、提示词模板（文生图 · 基础形象）

### 英文模板

```
cinematic 3D render, photorealistic animal fur, realistic anatomy, natural lighting,
a {品种} with {毛色} fur, {瞳色} eyes, {标志性特征},
natural sitting pose, resting animal posture,
realistic animal proportions head-to-body 1:3-4, short stubby limbs, real paws, fluffy tail,
photorealistic fur with natural density variation and layering, individually visible strands, realistic sheen,
realistic animal head anatomy, natural facial fur distribution, moist nose,
wearing a {宠物服饰描述} fitted for animal body,
soft natural studio lighting, clean light gray background,
natural curious expression, slightly tilted head
```

### 中文模板

```
写实3D渲染，真实动物毛发质感，真实解剖结构，自然光影，
一只{品种}，{毛色}毛发，{瞳色}眼睛，{标志性特征}，
自然坐姿，安静的动物姿态，
自然动物比例头身比1:3-4，短小四肢，真实前爪，蓬松尾巴，
写实毛发有自然密度变化与层次，逐根可见，自然光泽，
真实动物头部解剖，面部毛发自然分布，湿润鼻头，
穿着{宠物服饰描述}，贴合动物身形，
柔和自然摄影棚光，干净浅灰背景，
自然好奇表情，微微歪头
```
