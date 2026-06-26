---
name: art_character_dance
description: 角色基础形象 · AI宠物跳舞短视频 — 定义3D渲染纯兽态风格的角色四视图提示词规范。
metaData: art_prompt
---

# 角色基础形象生成 · AI宠物跳舞短视频约束手册

---

## 一、基础形象原则

1. **种属即灵魂** — 真实动物种属特征（耳形/口鼻/胡须/真实毛发/尾巴）是角色唯一锚点，跨视图必须高度统一
2. **纯兽态、3D渲染** — 全身真实兽态（大头短身、圆润肚腩、短小四肢、真实前爪），3D渲染可爱化质感（Pixar/Disney级别CG），头身比1:2.5-3。**无人形化躯干、无人臂人手、无直立人腿**。穿戴宠物专用服饰
3. **四视图一致** — 种属/毛色/体型/服饰跨视图高度统一
4. **3D渲染质感** — 3D render, Pixar quality, CG animation, cute proportions。**非照片级写实，非2D插画，非卡通**
5. **3D模型参考图锁一致性** — 四视图设定图同时作为3D模型参考图（character reference），锁定跨视频一致性

---

## 二、形态锁定工作流

> 3D渲染 + 纯兽态 + 萌态律动，文生图模型也可能向"人形"收敛。采用"先定基准、再以图生图扩散"的工作流。

### 工作流三步

| 步骤 | 做法 | 目的 |
|---|---|---|
| **S1 选种** | 用文生图模板批量出图，**只挑形态最"兽"的一张**作为基准图：自然坐姿/站姿的真实宠物、大头短身、短小四肢、真实前爪与短腿、3D渲染可爱化 | 先拿到一张"对的"形态 |
| **S2 固化** | 把选中的基准图设为该角色的**形态参考图（character reference）+ 3D模型参考图**，并据它定稿四视图基础形象图 | 把兽态固化成可复用的视觉锚点 |
| **S3 扩散** | 后续衍生（换装/分镜/视频首帧）一律 **img2img / 参考图模式**，以基准图为形态底，仅改服饰、动作、场景 | 让每次产出都继承已锁定的兽态 |

### 选基准图的验收清单（S1 必须逐项过）

- [ ] **自然真实宠物姿态（坐姿/站姿）**
- [ ] **大头短身、圆润肚腩**，不是人类瘦长躯干
- [ ] **前肢是短小真实前爪**，不是修长人臂
- [ ] **下半身是覆毛兽腿 + 短腿**，没有人腿剪影
- [ ] **头身比约1:2.5-3**，头大身小的可爱比例
- [ ] **3D渲染质感**，毛发蓬松有光泽
- [ ] 头部种属特征（耳形/口鼻/胡须）清晰

### 提示词配合（img2img / 参考图阶段）

- 英文：`use the reference image as body/pose anchor, keep authentic animal body, large head small body, short stubby limbs, real paws and short legs unchanged, only change {variable}`
- 参考强度建议 0.6-0.8

---

## 三、面容约束

| 项目 | 约束 |
|---|---|
| 种属特征 | 由角色设定确定，必须保留对应耳形、口鼻、胡须、真实毛发纹理 |
| 五官 | 由种属与性格自然推导，3D渲染的圆润大眼（真实瞳孔/虹膜/湿润高光），真实鼻头与胡须 |
| 风格底色 | 3D render, Pixar quality, CG animation, cute proportions |
| 气质 | 必须从角色设定提炼整体气质关键词，**默认偏向"呆萌"基调** |
| 表情 | 中性微表情，优先呆萌神态：圆润大眼、无辜眼神、微微歪头、放空发呆 |

---

## 四、毛发与肤感约束

| 项目 | 约束 | 提示词 |
|---|---|---|
| 毛色 | 按种属设定、3D渲染质感、有色泽渐变 | {毛色}3D rendered fur, natural coat color |
| 质感 | 逐根毛发、3D渲染层次感、蓬松有立体感 | detailed individual 3D fur strands, fluffy and glossy, fur grooming |
| 光泽 | 3D渲染光泽、阳光下微微透光、无塑料感 | 3D rendered glossy fur, natural translucent glow, no plastic |
| 头部 | 完整真实动物头部、耳朵竖立或垂落 | 3D rendered animal head, {耳形}, realistic furry face |

---

## 五、体型与姿态约束

| 项目 | 约束 | 提示词 |
|---|---|---|
| 头身比 | **1:2.5-3**，头大身小的可爱比例 | large head, small body, cute proportions 1:2.5 |
| 体态比例 | 真实动物体态：相对大头、短颈、圆润短身躯、短小四肢、饱满肚腩 | natural animal body proportion, large head, short rounded body, chubby belly, short stubby limbs |
| 脊柱/重心 | 含背微弓、非垂直，重心压在后腿与臀部 | slightly hunched rounded back, natural animal spine curve |
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
| 头部特写 | 真实动物头部特征，3D渲染毛发，大眼可爱化，耳朵/口鼻/胡须清晰 |
| 正视图 | 3D兽态全身，自然坐姿/站姿，大头短身比例，展示头身比与毛发质感 |
| 侧视图 | 侧面轮廓，展示圆润身躯与尾巴、短小四肢 |
| 后视图 | 背面，展示尾巴与背部毛发层次 |

**背景**：纯色浅灰（#E8E8E8），统一3D渲染光
**姿态**：自然宠物姿态（坐姿/站姿），非跳舞姿态——基础设定图锁定角色本体

---

## 七、提示词模板（文生图 · 基础形象）

### 英文模板

```
3D render, Pixar quality, CG animation, cute proportions,
a {品种} with {毛色} fur, {瞳色} eyes, {标志性特征},
natural sitting pose, resting animal posture,
large head small body, short stubby limbs, real paws, fluffy tail,
3D rendered fur, individually visible strands, glossy and soft,
wearing a {宠物服饰描述},
soft studio lighting, clean light gray background,
adorable innocent expression, slightly tilted head
```

### 中文模板

```
3D渲染，Pixar品质，CG动画，可爱化比例，
一只{品种}，{毛色}毛发，{瞳色}眼睛，{标志性特征}，
自然坐姿，安静的动物姿态，
大头短身，短小四肢，真实前爪，蓬松尾巴，
3D渲染毛发，逐根可见，光泽柔软，
穿着{宠物服饰描述}，
柔和摄影棚光，干净浅灰背景，
呆萌无辜表情，微微歪头
```
