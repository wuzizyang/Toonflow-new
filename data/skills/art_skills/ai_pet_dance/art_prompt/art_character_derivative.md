---
name: art_character_derivative_dance
description: 换装衍生 · AI宠物跳舞短视频 — 定义3D渲染纯兽态风格的换装衍生提示词规范。
metaData: art_prompt
---

# 换装衍生提示词 · AI宠物跳舞短视频约束手册

---

## 一、换装设计原则

1. **基础体不变** — 换装只改变宠物服饰+配饰，角色身体（毛色/体型/五官/种属特征/兽态）永远锁定
2. **每套服饰独立可识别** — 服饰之间色系、风格、剪裁要有足够差异化，让观众一眼看出"换了"
3. **服饰在兽态上** — 宠物专用服饰贴合动物身形，为四肢与尾巴预留位，强化"穿着宠物衣服的真实宠物在跳舞"的可爱感
4. **风格跨度大** — 从日常宠物卫衣到节日主题装到潮流宠物服饰，跨度越大视觉冲击越强

---

## 二、宠物服饰分类体系

| 类别 | 示例 | 适用场景 |
|------|------|---------|
| 日常休闲 | 宠物卫衣、宠物小背心、宠物T恤、运动风宠物外套 | 萌态律动、情境萌态 |
| 节日/主题 | 圣诞宠物装（圣诞帽+红围巾）、万圣节宠物装、春节唐装宠物版 | 节日热点内容 |
| 潮牌/联名 | 品牌宠物服饰（某潮牌宠物卫衣/某运动品牌宠物外套） | 品牌植入、年轻化内容 |
| 萌趣道具 | 宠物墨镜、宠物小书包、宠物领结、宠物头巾、宠物小翅膀 | 增加萌点和辨识度 |
| 文化/国风 | 宠物汉服、宠物旗袍改良版、宠物和服 | 文化类内容 |
| 季节限定 | 夏季宠物凉感背心、冬季宠物棉袄、雨天宠物雨衣 | 季节性内容 |

---

## 三、换装衍生提示词规范

### 英文模板

```
{保持角色基础形象不变的锚定词},
use the reference image as body/pose anchor,
keep authentic realistic animal body, natural animal proportions, realistic skeletal structure, short stubby limbs, real paws and short legs unchanged, photorealistic fur texture,
only change outfit to {宠物服饰描述},
cinematic 3D render, photorealistic animal fur, realistic anatomy, natural lighting,
pet clothing fitted for animal body, preserving tail and limb positions,
{舞蹈动作/姿势描述},
{背景/舞台描述},
soft natural lighting, natural curious expression
```

### 中文模板

```
{保持角色基础形象不变的锚定词}，
以角色基准图为形态参考，保持真实兽态、真实动物解剖、自然头身比1:3-4、短小四肢、真实前爪与短腿不变，写实毛发质感，
仅更换宠物服饰为{服饰描述}，
写实3D渲染，真实动物毛发质感，真实解剖结构，自然光影，
宠物专用服饰，贴合动物身形，保留尾巴与四肢位置，
角色正在{舞蹈动作/姿势}，
{背景/舞台描述}，
柔和自然光，自然好奇表情
```

---

## 四、角色锚定词（每次衍生必须包含）

| 锚定项 | 英文 | 中文 |
|--------|------|------|
| 品种 | {品种} with {毛色} fur | {品种}，{毛色}毛发 |
| 瞳色 | {瞳色} eyes with realistic iris reflection | {瞳色}眼睛有真实虹膜反光 |
| 标志性特征 | {标志性配饰/特征} | {标志性配饰/特征} |
| 体型 | natural animal proportions head-to-body 1:3-4, realistic anatomy | 自然动物比例头身比1:3-4，真实解剖 |
| 兽态 | authentic realistic animal body, realistic skeletal structure, short stubby limbs, real paws | 真实兽态，真实骨骼结构，短小四肢，真实前爪 |
| 毛发 | photorealistic fur with natural density variation | 写实毛发有自然密度变化 |

---

## 五、质量检查

### 换装一致性检查
- [ ] 角色毛色未因换装而改变
- [ ] 角色面部五官比例未漂移（保持真实动物解剖，无卡通化）
- [ ] 标志性配饰（如有）始终保留
- [ ] 服饰贴合动物身形，无穿模
- [ ] 服饰色彩与背景形成对比但不冲突
- [ ] 尾巴位置合理（从服饰预留孔穿出）
- [ ] 四肢保持短小真实前爪，未因服饰而变形
- [ ] 写实3D渲染质感保持，无Pixar卡通化漂移
