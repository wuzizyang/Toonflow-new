---
name: art_scene_dance
description: 舞台/背景场景 · AI宠物跳舞短视频 — 定义3D渲染纯兽态风格的场景与背景提示词规范。
metaData: art_prompt
---

# 舞台/背景场景提示词 · AI宠物跳舞短视频约束手册

---

## 一、场景设计原则

1. **简洁突出角色** — 背景服务于角色，不抢视觉焦点。角色是画面绝对主角
2. **写实3D渲染一致性** — 场景也是写实3D渲染质感，与角色风格统一，非Pixar卡通
3. **色彩对比** — 背景色与角色毛色/服饰色形成对比，让角色清晰突出
4. **场景匹配内容类型** — 不同子类型用不同场景基调

---

## 二、场景分类

| 场景类型 | 描述 | 适用内容 | 色调方向 |
|----------|------|---------|---------|
| **纯色渐变背景** | 单色或渐变色背景，极简 | 换装展示、纯萌态律动 | 按情绪色盘选择 |
| **摄影棚舞台** | 3D渲染的精致舞台/摄影棚，有打光 | 默认方案，通用 | 暖调为主 |
| **居家场景** | 3D渲染的温馨小公寓/客厅 | 情境萌态 | C1奶油白+C2焦糖棕 |
| **户外花园** | 3D渲染的花园/草坪/樱花树下 | 治愈向、季节内容 | C4抹茶绿+C10薄荷奶 |
| **节日主题** | 圣诞壁炉前/万圣节南瓜堆/春节红灯笼 | 节日内容 | 按节日配色 |
| **舞台聚光** | 暗色背景+聚光灯效果 | 酷炫向、潮牌内容 | C9炭灰+C3暖阳橙 |

---

## 三、场景提示词模板

### 纯色渐变背景（默认·换装展示）

```
clean gradient background, soft {色名} to {色名} gradient,
cinematic 3D render natural studio lighting, soft realistic shadows,
minimal background, character in center
```

### 摄影棚舞台（默认·通用）

```
cinematic 3D rendered studio stage, warm soft natural lighting from above,
clean polished floor with subtle realistic reflections,
soft bokeh background, warm natural color palette,
photorealistic 3D environment, realistic light scattering
```

### 居家场景

```
cinematic 3D rendered cozy apartment interior, warm wooden furniture with realistic texture,
soft warm natural sunlight through window, potted plants with real foliage,
warm cream and caramel natural color palette,
photorealistic 3D environment, cozy realistic atmosphere
```

### 户外花园

```
cinematic 3D rendered garden scene, green grass and blooming flowers with realistic botany,
soft natural sunlight, gentle breeze with moving foliage,
fresh mint and sage green natural color palette,
photorealistic 3D environment, peaceful realistic atmosphere
```

---

## 四、场景色彩与角色对比规则

| 角色毛色 | 推荐背景色 | 避免背景色 |
|----------|-----------|-----------|
| 银白/奶油白 | C5雾霾蓝、C4抹茶绿、C2焦糖棕 | C1奶油白（同色融合） |
| 焦糖棕/橘色 | C5雾霾蓝、C10薄荷奶、C1奶油白 | C2焦糖棕（同色融合） |
| 灰蓝/深灰 | C1奶油白、C6蜜桃粉、C8浅燕麦 | C9炭灰（同色融合） |
| 黑色 | C1奶油白、C3暖阳橙、C6蜜桃粉 | C9炭灰（同色融合） |

---

## 五、场景质量检查

- [ ] 场景为写实3D渲染质感，与角色风格统一，无Pixar卡通化
- [ ] 背景色与角色毛色/服饰色有足够对比
- [ ] 场景不抢角色视觉焦点
- [ ] 光影方向一致（无矛盾光源），自然光感
- [ ] 无卡通化元素混入写实3D渲染场景
