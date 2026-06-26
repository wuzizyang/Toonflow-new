# AI 宠物跳舞短视频 · 美术技能包

## 简介

本技能包为 **AI 宠物跳舞短视频** 类型提供一套完整的美术风格参考，涵盖角色设计、换装衍生、场景设计、视觉风格约束与分镜技法。适用于纯兽态3D渲染风格的宠物萌态律动短视频。

## 核心理念

- **3D渲染质感** — Pixar/Disney级别CG，非照片级写实，非2D插画
- **纯兽态** — 角色严格保留全身真实兽态，无人形化身体
- **萌态律动** — 舞蹈是"真实宠物在音乐下的萌态反应"
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
    ├── director_storyboard.md           ← 分镜技法
    └── director_storyboard_table_style.md ← 分镜表样式模板
```

## 与 pet_anthropomorphic_vlog 的风格差异

| 规则 | pet_anthropomorphic_vlog | ai_pet_dance |
|------|--------------------------|-------------|
| 质感锚词 | `photorealistic` | `3D render, Pixar quality, CG animation, cute proportions` |
| 身体约束 | 全身真实兽态，照片级写实 | 全身真实兽态，3D渲染可爱化，头身比1:2.5-3 |
| 服饰约束 | 宠物专用服饰（日常款） | 宠物专用服饰（节日/主题/品牌/换装系列） |
| 光影约束 | 自然写实光照 | 3D渲染光，精致打光 |
| 比例约束 | 真实猫咪尺度 | 3D可爱比例（头身比1:2.5-3） |
| 姿态约束 | 操作态立起/行动态四足 | 舞蹈态后腿坐起/立起+前爪摆动 |
