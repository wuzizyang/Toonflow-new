# AI 宠物跳舞短视频 · 美术技能包

## 简介

本技能包为 **AI 宠物跳舞短视频** 类型提供一套完整的美术风格参考，涵盖角色设计、换装衍生、场景设计、视觉风格约束与分镜技法。适用于纯兽态写实3D渲染风格的宠物萌态律动短视频。

## 核心理念

- **写实3D渲染质感** — 电影级cinematic 3D render + photorealistic animal fur，真实动物解剖，非Pixar卡通，非2D插画
- **纯兽态** — 角色严格保留全身真实兽态与真实解剖结构，无人形化身体，无卡通化变形
- **萌态律动** — 舞蹈是"真实宠物在音乐下的萌态反应"，萌态来自真实动物本能而非夸张卡通化
- **换装系统** — 宠物服饰跨视频更换，每套独立可识别

## 文件结构

```
ai_pet_dance/
├── prefix.md                            ← 全局美学基础（风格基因/色彩盘/约束规则/敏感词规避）
├── README.md                            ← 本文件
├── art_prompt/
│   ├── art_character.md                 ← 角色基础形象提示词规范
│   ├── art_character_derivative.md      ← 换装衍生提示词规范
│   └── art_scene.md                     ← 舞台/背景场景提示词规范
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
