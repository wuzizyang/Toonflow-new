---
name: director_storyboard_dance
description: 表演指导 · AI宠物跳舞短视频 — 定义写实3D渲染纯兽态风格的单镜头表演节奏与运镜规范。
metaData: director_skills
---

# 表演指导 · AI宠物跳舞短视频 · 技法参考

---

## 一、单镜头核心

> 本类型为**单镜头（single shot）一镜到底**，不拆分镜、不剪切、不转场。整条视频是一段连续画面，表演在单一连续镜头内自然流转。

### 表演节奏参考（非强制分段）

整条视频的萌态律动建议有起伏感，但**不需要按秒拆分时间段**，自然过渡即可：

- **开场**：角色静坐/轻动，建立形象与场景
- **递进**：萌态律动逐渐展开，动作从小到大
- **高潮**：最萌动作/定格pose瞬间
- **收束**：渐缓/凝固，回归安静

> 以上仅为创作思路参考，实际生成时用一段连续的提示词描述整条视频的动作流转，不要拆成独立镜头。

---

## 二、运镜规范

| 运镜 | 说明 | 适用 |
|------|------|------|
| 固定 | 画面不动，角色在画面中心表演 | 默认方案，最稳，推荐 |
| 缓推 | 从全景缓慢推到近景 | 递进段，强调表情 |
| 缓拉 | 从近景缓慢拉到中景 | 收束段，展示全貌 |

**铁律**：
- 运镜微调幅度≤10%画面，避免影响AI生成稳定性
- 单镜头内运镜变化不超过1次（如固定→缓推，或缓推→固定），避免频繁切换
- 推荐默认用「固定镜头」最稳定

---

## 三、画面构图

| 构图 | 说明 | 适用 |
|------|------|------|
| 中心构图 | 角色在画面正中 | 默认，最常见 |
| 三分法 | 角色偏左/偏右，留出呼吸空间 | 有背景元素时 |
| 低角度仰拍 | 镜头低于角色，显得更萌更可爱 | 强化萌感 |

---

## 四、景别选择

- **中景是默认主力** — 角色在画面中心，半身入镜，既能交代动作又能展示服饰
- **近景强调表情** — 推近到头部+上半身，展示耳朵/眼睛/胡须的萌态微表情
- **全景用于建立** — 开场展示角色+场景全貌

> 单镜头内景别尽量保持一致，如需变化只做缓慢推拉，不跳跃切换。

---

## 五、视频生成提示词结构

### 提示词分层结构（单段连续描述）

```
[风格锚定] + [角色描述] + [服饰] + [连续动作流转] + [场景/背景] + [光影] + [运镜] + [情绪/表情]
```

> **关键**：动作描述用一段连续的自然语言描述整条视频的萌态律动流转，不要拆成"0-3s做什么、3-6s做什么"的分镜句式。

### 英文模板示例

```
cinematic 3D render, photorealistic animal fur, realistic anatomy, natural lighting,
a {品种} with {毛色} fur, {瞳色} eyes with realistic iris reflection, natural animal proportions head-to-body 1:3-4, short stubby limbs, real paws with paw pads, fluffy tail,
realistic animal skull structure, natural facial fur distribution, moist nose,
wearing a {宠物服饰描述},
{连续动作描述：如 the cat starts sitting quietly with ears twitching, then naturally starts bobbing its head to the beat, forepaws begin waving as rhythm builds, body swaying side to side, tail wagging, finally slowing down to a peaceful resting pose},
{场景描述},
soft natural studio lighting,
camera fixed, medium shot,
natural curious expression throughout
```

### 中文模板示例

```
写实3D渲染，真实动物毛发质感，真实解剖结构，自然光影，
一只{品种}，{毛色}毛发，{瞳色}眼睛有真实虹膜反光，自然动物比例头身比1:3-4，短小四肢，真实前爪与肉垫，蓬松尾巴，
真实动物头骨结构，面部毛发自然分布，湿润鼻头，
穿着{宠物服饰描述}，
{连续动作描述：如 猫咪安静坐着耳朵微动，随后自然地随节拍晃动脑袋，前爪开始随节奏摆动，身体左右摇摆，尾巴摆动，最后动作渐缓回到安静的坐姿},
{场景描述}，
柔和自然摄影棚光，
镜头固定，中景，
全程自然好奇表情
```
