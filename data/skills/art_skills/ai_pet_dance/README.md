# AI 宠物跳舞短视频 · 美术技能包

## 简介

本技能包为 **AI 宠物跳舞短视频** 类型提供一套完整的美术风格参考，涵盖角色设计、换装衍生、场景/道具设计、视觉风格约束与分镜技法。适用于纯兽态写实3D渲染风格的宠物萌态律动短视频。

## 核心理念

- **写实3D渲染质感** — 电影级cinematic 3D render + photorealistic animal fur，真实动物解剖，非Pixar卡通，非2D插画
- **纯兽态** — 角色严格保留全身真实兽态与真实解剖结构，无人形化身体，无卡通化变形
- **萌态律动** — 舞蹈是"真实宠物在音乐下的萌态反应"，萌态来自真实动物本能而非夸张卡通化
- **换装系统** — 宠物服饰跨视频更换，每套独立可识别
- **产物分离** — 角色 / 场景 / 道具三类资产严格分离，**场景图与工具图严禁包含任何角色**（铁律 X12）

## 产物分类

| 产物 | 定义 | 文件 | 是否含角色 |
|------|------|------|----------|
| **角色四视图** | 同一角色在四个标准视角（头部特写+正视图+侧视图+后视图）的设定图，作为角色锚定参考图 | [art_character.md](file:///Users/ziyang/PycharmProjects/toonflow/Toonflow-app/data/skills/art_skills/ai_pet_dance/art_prompt/art_character.md) | 含角色（同一只） |
| **换装衍生图** | 同一角色换装后的衍生图，用于跨视频保持角色一致性 | [art_character_derivative.md](file:///Users/ziyang/PycharmProjects/toonflow/Toonflow-app/data/skills/art_skills/ai_pet_dance/art_prompt/art_character_derivative.md) | 含角色（同一只） |
| **场景图（scene）** | 纯环境/纯背景/纯舞台 | [art_scene.md](file:///Users/ziyang/PycharmProjects/toonflow/Toonflow-app/data/skills/art_skills/ai_pet_dance/art_prompt/art_scene.md) | **严禁含角色** |
| **工具图（prop）** | 纯道具/纯物件/单个物品 | [art_scene.md](file:///Users/ziyang/PycharmProjects/toonflow/Toonflow-app/data/skills/art_skills/ai_pet_dance/art_prompt/art_scene.md) | **严禁含角色** |

## 文件结构

```
ai_pet_dance/
├── prefix.md                            ← 全局美学基础（风格基因/色彩盘/约束规则/敏感词规避）
├── README.md                            ← 本文件
├── art_prompt/
│   ├── art_character.md                 ← 角色四视图提示词规范（含同一只角色四视角模板）
│   ├── art_character_derivative.md      ← 换装衍生提示词规范
│   └── art_scene.md                     ← 场景图/工具图提示词规范（均不含角色）
└── driector_skills/
    ├── director_planning_style.md       ← 视觉风格约束
    ├── director_storyboard.md           ← 表演指导（单镜头连续，不拆分镜）
    └── director_storyboard_table_style.md ← 视频描述模板（单镜头连续，不拆分镜）
```

## 与 pet_anthropomorphic_vlog 的风格差异

| 规则 | pet_anthropomorphic_vlog | ai_pet_dance |
|------|--------------------------|-------------|
| 质感锚词 | `photorealistic`, 实拍质感 | `cinematic 3D render, photorealistic animal fur, realistic anatomy, natural lighting` |
| 身体约束 | 全身真实兽态，照片级写实 | 全身真实兽态，写实3D渲染，真实动物解剖，头身比1:3-4 |
| 服饰约束 | 宠物专用服饰（日常款） | 宠物专用服饰（节日/主题/品牌/换装系列） |
| 光影约束 | 自然写实光照 | 自然光影+电影感打光+柔和景深 |
| 比例约束 | 真实猫咪尺度 | 自然幼宠比例（头身比1:3-4） |
| 姿态约束 | 操作态立起/行动态四足 | 舞蹈态后腿坐起/立起+前爪摆动 |
| 渲染差异 | 实拍手机vlog视角 | 电影级3D舞台视角，稳定机位 |

## 与卡通风格的差异（重点）

| 规则 | 卡通/Pixar风格 | ai_pet_dance（本技能包） |
|------|----------------|------------------------|
| 渲染风格 | Pixar/Disney CG cartoon | 写实3D渲染（cinematic 3D render） |
| 比例 | 夸张大眼、大头娃娃化、chibi | 自然幼宠比例1:3-4，真实解剖 |
| 毛发 | 卡通化平涂、塑料感绒毛 | 写实毛发，密度变化，逐根可见 |
| 五官 | 扁平化面部、夸张大眼眶 | 真实动物五官、真实瞳孔虹膜反光 |
| 萌态来源 | 夸张比例+卡通变形 | 真实动物本能与神态 |
