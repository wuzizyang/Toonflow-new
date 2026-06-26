---
name: art_scene_dance
description: 场景图与工具图 · AI宠物跳舞短视频 — 定义写实3D渲染纯兽态风格的场景与道具提示词规范。场景图与工具图均不含角色。
metaData: art_prompt
---

# 场景图 / 工具图提示词 · AI宠物跳舞短视频约束手册

---

## 〇、产物定义与铁律

> **本文件定义两类独立的图片产物**：场景图（scene）与工具图（prop）。**两类产物均严禁包含任何角色（猫/狗/任何动物）**，只生成纯环境或纯道具。

| 产物类型 | 包含内容 | 严禁 |
|----------|---------|------|
| **场景图（scene）** | 纯环境、纯背景、纯舞台、纯空间 | 严禁出现角色（猫、狗等任何动物） |
| **工具图（prop）** | 纯道具、纯物件、单个物品 | 严禁出现角色，背景纯净 |

> **为什么严格分离**：角色一致性是 AI 视频生成最大的难题。角色资产只在 `art_character.md` 与 `art_character_derivative.md` 中定义，场景/工具图不含角色，避免任何"场景里画出一只不同的猫"导致参考图污染。

---

## 一、场景图（scene）· 纯环境

### 1.1 场景图设计原则

1. **只画环境，不画角色** — 画面里只有空间、背景、装饰物，绝对不能出现任何动物
2. **写实3D渲染** — 场景本身也是写实3D渲染质感，与未来角色叠加后风格统一
3. **服务角色气质** — 场景基调为角色后续入画提供氛围与色彩，不抢戏
4. **构图留白** — 画面中心或主要表演区域保留干净留白，等待角色入画

### 1.2 场景图分类

| 场景类型 | 描述 | 适用内容 | 色调方向 |
|----------|------|---------|---------|
| **纯色渐变背景** | 单色或渐变色背景，极简 | 换装展示、纯萌态律动 | 按情绪色盘选择 |
| **摄影棚舞台** | 写实3D渲染的精致舞台/摄影棚，有打光 | 默认方案，通用 | 暖调为主 |
| **居家场景** | 写实3D渲染的温馨小公寓/客厅 | 情境萌态 | C1奶油白+C2焦糖棕 |
| **户外花园** | 写实3D渲染的花园/草坪/樱花树下 | 治愈向、季节内容 | C4抹茶绿+C10薄荷奶 |
| **节日主题** | 圣诞壁炉前/万圣节南瓜堆/春节红灯笼 | 节日内容 | 按节日配色 |
| **舞台聚光** | 暗色背景+聚光灯效果 | 酷炫向、潮牌内容 | C9炭灰+C3暖阳橙 |

### 1.3 场景图提示词模板

> ⚠️ 模板中**显式声明 no animal, no character, no pet**，让模型明确知道不要画猫。

#### 纯色渐变背景（默认·换装展示）

```
clean gradient background, soft {色名} to {色名} gradient,
cinematic 3D render natural studio lighting, soft realistic shadows,
empty scene, no animal, no character, no pet,
center stage area clear for subject placement
```

#### 摄影棚舞台（默认·通用）

```
cinematic 3D rendered studio stage, warm soft natural lighting from above,
clean polished floor with subtle realistic reflections,
soft bokeh background, warm natural color palette,
photorealistic 3D environment, realistic light scattering,
empty stage, no animal, no character, no pet,
center stage clear
```

#### 居家场景

```
cinematic 3D rendered cozy apartment interior, warm wooden furniture with realistic texture,
soft warm natural sunlight through window, potted plants with real foliage,
warm cream and caramel natural color palette,
photorealistic 3D environment, cozy realistic atmosphere,
empty room, no animal, no character, no pet,
interior shot only
```

#### 户外花园

```
cinematic 3D rendered garden scene, green grass and blooming flowers with realistic botany,
soft natural sunlight, gentle breeze with moving foliage,
fresh mint and sage green natural color palette,
photorealistic 3D environment, peaceful realistic atmosphere,
empty garden, no animal, no character, no pet,
landscape shot only
```

#### 节日主题（以圣诞为例）

```
cinematic 3D rendered Christmas scene, warm fireplace with glowing fire,
decorated Christmas tree with realistic ornaments, soft warm lighting,
red and gold holiday color palette,
photorealistic 3D environment, warm festive atmosphere,
empty scene, no animal, no character, no pet,
interior holiday shot
```

---

## 二、工具图（prop）· 纯道具

> 工具图用于视频中需要的道具/物件（如宠物小玩具、宠物碗、装饰物件、节日道具等）。**纯物件展示，不含任何角色**。

### 2.1 工具图设计原则

1. **只画物件，不画角色** — 画面中心是一个或一组道具，无动物出现
2. **背景纯净** — 工具图背景必须干净（浅灰/纯色），便于后续与角色合成
3. **物件细节真实** — 写实3D渲染质感，木质/织物/金属等材质纹理清晰
4. **可识别性** — 道具在画面中清晰可辨，能识别种类、材质、颜色

### 2.2 工具图分类

| 道具类型 | 示例 | 适用内容 |
|----------|------|---------|
| 宠物用品 | 宠物小碗、宠物玩具球、宠物梳子、猫爬架局部 | 日常萌态、生活场景 |
| 服饰单品 | 宠物小卫衣、宠物项圈、宠物领结、宠物帽子（未穿状态） | 换装系列、节日前置 |
| 节日道具 | 圣诞袜、圣诞帽、小南瓜、灯笼、对联 | 节日主题 |
| 食物道具 | 猫罐头、宠物饼干、小鱼干、奶瓶 | 美食向、治愈向 |
| 装饰物件 | 气球、礼物盒、丝带、小灯笼 | 庆祝、节日 |

### 2.3 工具图提示词模板

> ⚠️ 模板中**显式声明 no animal, no character, no pet, product display only**。

#### 通用工具图模板

```
cinematic 3D render, photorealistic material texture, natural lighting,
{道具名}，{材质}，{颜色}，{细节描述}，
product display style, single object centered,
clean light gray background or pure white background,
realistic shadows and reflections,
no animal, no character, no pet, no human, no model,
product photography style
```

#### 英文模板示例（宠物小卫衣）

```
cinematic 3D render, photorealistic fabric texture, natural soft lighting,
a small light gray pet hoodie, soft cotton fabric, fitted for cat body shape,
with sleeve holes for front paws and a tail opening at the back,
no animal wearing it, no character, no pet, no human, no model,
product display style, single item centered,
clean light gray background,
realistic soft shadows,
product photography composition
```

#### 中文模板示例

```
写实3D渲染，真实材质纹理，自然光影，
一件浅灰色宠物小卫衣，柔软棉质面料，贴合猫身形，
有前爪袖口和后背尾巴开口，
无任何动物穿着，无角色，无宠物，无人类，无模特，
商品展示风格，单品居中，
干净浅灰背景，
真实柔和阴影，
商品摄影构图
```

---

## 三、场景图 / 工具图质量检查

### 场景图自检
- [ ] 画面中是否**没有出现任何动物/角色/宠物**？（核心铁律）
- [ ] 场景为写实3D渲染质感，与角色风格统一，无Pixar卡通化
- [ ] 背景色与角色毛色/服饰色有足够对比
- [ ] 场景不抢角色视觉焦点，留白合理
- [ ] 光影方向一致（无矛盾光源），自然光感
- [ ] 提示词中显式声明了 `no animal, no character, no pet`

### 工具图自检
- [ ] 画面中是否**没有出现任何动物/角色/宠物/人类/模特**？（核心铁律）
- [ ] 道具在画面中清晰可辨（种类/材质/颜色）
- [ ] 背景干净纯净（浅灰或纯色）
- [ ] 写实3D渲染质感，材质纹理真实
- [ ] 提示词中显式声明了 `no animal, no character, no pet, no model`

### 命名建议
- 场景图：`scene_{场景名}_{编号}.png`，如 `scene_studio_01.png`
- 工具图：`prop_{道具名}_{编号}.png`，如 `prop_hoodie_01.png`
