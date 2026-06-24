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
| **位移类**（走路/跑/跳/进出门/移动/玩耍） | **自然四足兽态步态** | 自然四足行走，real animal on all fours, natural quadruped gait |
| **静止/旁观**（趴卧/坐着发呆/晒太阳） | 自然动物休憩姿态（趴卧/蜷坐均可） | 自然动物坐卧姿态，natural resting animal pose |

- **判断口径**：镜头要表现"在用手做事"→ 立起操作态；要表现"在移动/行走"→ 四足兽态。**走路镜头严禁直立行走/人类化迈步**。
- 无论何种姿态，**身体始终是真实兽态**（大头短身、短小覆毛四肢、真实爪、含背微弓），穿**宠物服饰**，不得人形化、不穿人类成衣。

---

## 镜头视角分层（POV 多样化）

> 现有「第一人称 vlog 自拍 + 直视镜头」保留为互动型镜头，但**不应所有镜头都看镜头**。沉浸式打工、反应镜头、低机位观察视角/隐蔽拍摄视角等更适合第三人称观察视角——角色专注于手头的事、不看镜头，往往是最自然好笑的瞬间。

| 视角类型 | 占比建议 | 适用场景 | 提示词方向 |
|---|---|---|---|
| 第一人称自拍 | 30-40% | 开场亮相、互动吐槽、结尾收束 | 看向镜头与观众对视，looking at the camera, vlog selfie POV |
| 第三人称观察 | 40-50% | 沉浸式动作、反应镜头、低机位观察视角 | 角色专注手头的事、不看镜头，observational POV, low camera angle, subject focused on the task, not looking at the camera |
| 特写/细节 | 10-20% | 前爪操作、食物、道具 | 局部细节特写，不看镜头，close-up detail, not looking at the camera |

### 视角使用规则

| 编号 | 规则 |
|---|---|
| V1 | 单条视频混用两种视角，避免全程直视镜头导致叙事单一 |
| V2 | 「沉浸式打工/做饭/操作」类镜头优先第三人称观察，角色专注动作、不看镜头，更真实 |
| V3 | 第三人称观察镜头仍保持真实兽态、身份/场景稳定（防漂移规范不变） |
| V4 | 第一人称自拍仍保留「看向镜头与观众对视互动」，用于亮相、吐槽、收尾等需要交流感的时刻 |

---

## 景别优先级（短视频专用）

> 现有 5 级景别体系（大全景→特写）继承自电影工业，适合长脚本叙事。**短视频（15-25s）不需要大全景建立空间**——观众没耐心看远景，镜头越近、情绪越强。

| 景别 | 短视频占比 | 使用场景 |
|---|---|---|
| 近景/特写 | 60% | 角色表情、前爪动作、道具 |
| 中景 | 30% | 角色 + 场景关系 |
| 全景 | 10% | 仅开场建立空间（≤2s） |
| 大全景 | 0% | 短视频禁用 |

> 原则：**怼脸拍角色表情 > 远远看角色在房间里**。短脚本景别变化控制在 3 种以内；长脚本仍可沿用完整景别体系做舒缓叙事。

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

### 三、统一比例与透视（含真实兽体尺度——最易出错，必锁）

- 角色、道具尺寸须**符合真实物理尺度**与场景透视（小兽尺度的角色 vs 街角/家具/蛋糕盒的合理大小关系），避免道具过大、角色过小/过大
- 角色站位须落在场景地面合理位置，**视平线与场景一致**

> ⚠️ **真实兽体尺度是本题材最高频的违和点**：拟人宠物**仍是真实大小的小动物**，不是人类大小。模型很容易把猫/狗画成"人那么大"坐满整张地铁座椅、与成年人齐高，这是**严重违反真实世界逻辑**的硬伤。镜头里只要同时出现**参照物（人、座椅、车厢、门、桌子、餐具等）**，就必须显式锁定角色与参照物的真实大小关系。

**真实尺度参照基准（按种属，必须遵守）：**

| 角色种属 | 真实体长/肩高基准 | 与人的大小关系（同框时） |
|---|---|---|
| 猫 | 体长约 25–50cm，肩高约 25–30cm | 约成年人小腿—膝盖高度；坐在地铁座椅上**只占座椅约 1/3 宽度的一角**，头顶**不超过坐着的成年人腰部**，远小于身旁的人 |
| 小型犬 | 肩高约 20–35cm | 约成年人小腿高度 |
| 中型犬 | 肩高约 40–55cm | 约成年人大腿—髋部高度 |

**场景物件尺度锚定卡（猫基准 · 解决"无人参照"镜头比例飘忽）：**

> ⚠️ **"部分分镜比例不一致"的根因**：很多镜头（趴床、骑车、坐沙发、办公桌前）画面里**没有"人"做参照**，只靠"比人小"无法锚定，模型就各画各的——于是有的镜头猫偏大、有的偏小，全片体型忽大忽小。**解法**：把猫体型直接绑定到该镜里**真实存在的物件**上，按下表换算，不依赖"人"。

| 同框物件 | 真实猫体型与该物件的固定比例（必须遵守） |
|---|---|
| 双人床 | 猫蜷卧只占床面约 1/5–1/4；趴在枕头上身长约等于一个枕头宽 |
| 三人沙发 | 猫坐卧只占**一个坐垫的一半以内**，头顶远低于沙发靠背上沿 |
| 办公桌 + 椅 | 坐在办公椅上头顶约到椅背一半；趴在桌面身长约等于一个键盘长度 |
| 自行车 | 猫整体明显小于车轮直径，坐在车筐/后座上只占一小块，绝不与车架等大 |
| 地铁座椅 | 只占座椅约 1/3 宽度的一角，头顶不超过坐着成年人的腰部 |
| 餐桌 + 餐具 | 猫头约等于一个饭碗大小；身长约 1.5–2 个餐盘，绝不让餐具显得像玩具 |
| 笔记本电脑 | 猫头宽约等于半个屏幕；坐在电脑前上半身略高于屏幕顶 |
| 马克杯 / 咖啡杯 | 杯子约到猫的胸口高度，双爪可环抱，杯不显小 |
| 门 / 门框 | 猫四足站立头顶远低于门把手（门把手约 1m，猫肩高约 0.3m） |

- **同框参照物校准**：当画面含人、座椅、车厢、车门、桌椅、餐具、手机等参照物时，必须以参照物的真实尺寸反推角色大小——角色**不得**与人齐高、不得占满成人座位、不得让手机/餐具显得像玩具。宁可让角色"看起来很小一只"，也不要放大到人类尺寸
- **操作态不等于放大**：后腿立起操作时身高略增，但**整体仍是小兽尺度**，立起的猫顶多到成年人膝盖/大腿高度，绝不与人同高

**跨镜头尺度一致性（必锁 · 防"部分分镜不一致"）：**

- **全片同一基准**：所有分镜共用同一个真实尺度基准（同一只猫的真实大小），**A 镜与 B 镜中宠物相对同类物件（同样的椅/桌/床/杯）的占比必须一致**，不得这一镜小、下一镜突然变大
- **以物件反推、不以构图反推**：构图需要主体大时，靠**镜头拉近（景别变近）**实现，而**不是把宠物本体放大**——近景/特写是"凑近拍小猫"，不是"猫变大了"
- **每镜显式声明锚点**：含参照物的镜头，提示词须写明"本镜猫与 {该物件} 的比例 = {锚定卡换算}"，让每一镜都钉在同一把尺子上
- 提示词声明（模式A 中文）：`全片宠物体型采用同一真实尺度基准，本镜猫与{床/沙发/办公椅/餐具等}的大小比例严格按真实物理尺度（{按锚定卡换算}），与其他分镜保持同一体型基准、跨镜头比例一致不忽大忽小；需要主体更大时靠镜头拉近实现，不放大宠物本体`
- 提示词声明（模式B 英文）：`use one consistent real-life body scale for the pet across ALL shots, this shot's cat-to-{bed/sofa/office chair/tableware} size ratio strictly follows real-world physics, keep the SAME body-scale baseline as every other storyboard frame, scale stays consistent shot to shot, never bigger in one shot and smaller in another, achieve a larger subject only by moving the camera closer (tighter framing), never by enlarging the pet itself`
- 提示词声明（模式A 中文）：`比例与透视和场景一致，符合真实尺度，角色保持真实小动物体型（如真实猫咪大小），明显小于身旁的人、只到坐着的成年人腰部以下、坐在座椅上只占座椅约1/3宽度的一角，与画面中的座椅/车厢/桌椅/餐具等参照物大小关系符合真实世界逻辑，角色尺度稳定不变、宁小勿大，角色稳稳站在地面`
- 提示词声明（模式B 英文）：`correct scale and perspective matching the scene, the pet keeps its TRUE real-life small animal size (e.g. a real cat), clearly much smaller than nearby humans, no taller than a seated adult's waist, occupies only about one third of a seat, size relationship with seats / train car / furniture / props must follow real-world physics, body scale stays physically correct, err on the smaller side, consistent horizon line, characters firmly on the ground plane`

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
| 吐槽 / 崩溃 | 耷拉耳朵，圆眼瞪大 | 眼神死鱼/生无可恋 | 耳朵压平，尾巴炸毛 |
| 反转发泄 | 突然竖耳，嘴角歪 | 眼神狡黠/得意 | 耳朵嗖地竖起，尾巴翘高 |
| 社恐 / 尴尬 | 缩脖，耳朵贴头 | 眼神躲闪/不敢直视 | 胡须收拢，爪手遮脸 |
| 摆烂 / 放弃 | 瘫软，仰头望天 | 眼神放空/空洞 | 全身瘫软，尾巴垂地 |

> ⚠️ **发疯向情绪过审提醒**：吐槽/崩溃/反转/摆烂等情绪仍须用**真实兽态神态**表达（耳朵压平、圆眼瞪大、尾巴炸毛、全身瘫软等），**不得卡通夸张变形**，并继续遵守 prefix.md S1-S8.1 与 X1-X8 约束。

---

## 角色表演维度（戏剧化表情）

> 「呆萌」保留为治愈日常的底色，但戏剧冲突需要更丰富的表情变化。以下为表演向维度（含身体语言与适用场景），用于发疯吐槽/反转发泄等内容；**所有表情仍用真实兽态神态表达，不卡通夸张变形**，并遵守 prefix.md S1-S8.1 与 X1-X8。

| 表演类型 | 面容 | 眼神 | 身体 | 适用场景 |
|---|---|---|---|---|
| 呆萌（保留） | 圆眼微歪头 | 无辜放空 | 软趴趴 | 治愈日常 |
| 惊恐 | 圆眼瞪大、耳朵压平 | 瞳孔放大 | 浑身僵住 | 被抓包/被吓到 |
| 崩溃 | 耷拉耳朵、嘴角下垂 | 死鱼眼/空洞 | 瘫软/趴桌 | 加班/周一 |
| 得意 | 嘴角歪翘、耳朵竖起 | 狡黠半眯 | 尾巴翘高 | 反击成功/摸鱼得逞 |
| 嫌弃 | 半眯眼、耳朵后转 | 鄙视斜视 | 前爪推开 | 被要求加班 |
| 摆烂 | 仰头望天、嘴微张 | 完全放空 | 四仰八叉 | 放弃抵抗 |

### 表演节奏

| 编号 | 规则 |
|---|---|
| P1 | 每 3-5s 换一个表情，小表情持续微变化 |
| P2 | 走「呆萌→突变（惊恐/崩溃）→回落（得意/摆烂）」的三段式 |
| P3 | 突变瞬间最出戏剧效果，停留 1-2s 即可，不拖长 |
| P4 | 表情变化靠真实兽态特征（耳朵/瞳孔/尾巴/体态）承载，单镜头内动作仍轻缓（防漂移不变） |

---

## 短脚本分镜模板（15-25s 快节奏）

> 适用于短视频平台单梗内容（见 prefix.md 第六节时长分档）。长脚本继续沿用上方完整防漂移与多图融合规范；短脚本在保留身份/形态/场景/风格四锁的前提下，**用更快的镜头切换承载单梗情绪**。

### 短脚本节奏结构（四段式）

| 阶段 | 时长 | 内容 |
|---|---|---|
| 建立 | 0-3s | 角色亮相 + 场景一瞥 |
| 冲突 | 3-8s | 痛点/矛盾出现 |
| 反转 | 8-13s | 角色反差反应 |
| 落点 | 13-15s | 情绪落点 + 钩子 |

- 短脚本每个镜头 2-4s，3-5 个镜头快速拼接
- 每个镜头仍遵守「单一轻缓动作 + 真实兽态 + 身份/场景稳定」，靠**剪辑节奏**而非镜头内大动作制造快节奏

### 短脚本分镜示例（发疯吐槽向 · 加班梗）

| 镜号 | 时长 | 景别 | 画面 | 动作 |
|---|---|---|---|---|
| 1 | 3s | 中景 | 猫咪后腿坐在工位上，屏幕亮着 | 圆眼盯着屏幕，尾巴垂着 |
| 2 | 3s | 特写 | 屏幕显示"18:00 下班" | 耳朵突然竖起 |
| 3 | 3s | 近景 | 同事走过来 | 猫咪浑身一抖，耳朵压平 |
| 4 | 4s | 中景 | 同事示意"加个班" | 圆眼瞪大→突然瘫倒在桌上 |
| 5 | 3s | 特写 | 猫咪趴在键盘上装死 | 字幕（画外）：已死，勿扰 |

> 短脚本的情绪映射用「吐槽/崩溃」「反转发泄」「社恐/尴尬」「摆烂/放弃」等发疯向行（见上方情绪映射表）；画外字幕属于 UI 层文字，按现有规则不写入画面，仅作平台后期叠加参考。

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

宠物拟人化，保留真实动物全身特征与体态，**姿态按本镜动作切换（操作类→后腿坐起/立起+前爪操作；移动类→自然四足兽态）**，保留真实兽态（大头短身、短小四肢、真实前爪、含背微弓），宠物专用服饰，照片级写实（photorealistic），自然日常光照

**真实毛发质感（所有输出必选）：**

真实毛发清晰自然，皮毛层次，自然透光感，真实光泽

**生活Vlog质感（所有输出必选）：**

真实生活Vlog氛围，第一人称vlog自拍视角，角色看向镜头与观众对视互动，自然景深，生活细节

**光影色彩（所有输出必选）：**

自然写实光照，柔和环境光，真实阴影，暖色调

**氛围锚定（必选）：**

温暖治愈氛围，真实拟人反差，陪伴式情感，呆萌可爱，圆润大眼无辜神态，自然真实

**多图融合锚定（含角色/场景/道具多张参考图时必选）：**

模式A（中文）：
统一照片级写实质感，所有元素如同一现场实拍，统一光源方向与色温，角色受光与环境一致，真实接触阴影与落地投影，比例透视与场景一致符合真实尺度，角色保持真实小动物体型、明显小于身旁的人、坐在座椅上只占座椅约1/3的一角，与座椅/车厢/家具/餐具等参照物大小关系符合真实世界逻辑、尺度稳定不变宁小勿大、全片所有分镜采用同一体型基准、跨镜头比例一致不忽大忽小（需要主体更大时靠镜头拉近实现、不放大宠物本体），角色稳稳站在地面，统一色彩分级与白平衡，画面浑然一体无拼贴感

模式B（英文）：
one coherent photorealistic shot, unified rendering and realism across character/scene/props, consistent lighting direction and color temperature, character lit by the same light as the environment, grounded contact shadows, correct scale and perspective matching the scene, the pet keeps its true real-life small animal size, clearly much smaller than nearby humans, no taller than a seated adult's waist, occupies only about one third of a seat, size relationship with seats / furniture / props follows real-world physics, body scale stays physically correct, err on the smaller side, use one consistent body-scale baseline across all storyboard shots, scale stays consistent shot to shot, never bigger in one shot and smaller in another, achieve a larger subject only by moving the camera closer not by enlarging the pet, consistent horizon line, unified color grading and white balance, seamless composite, no pasted-on look

**画质锁定词（所有输出必须包含，置于风格收尾之后）：**

模式A（中文）——默认：
照片级写实，第一人称vlog自拍视角，角色看向镜头与观众对视互动，毛发清晰自然，色彩自然朴素不加滤镜，自然日常光照

模式A（中文）——画内文字场景（画面描述中含招牌/标识等道具文字时）：
照片级写实，第一人称vlog自拍视角，角色看向镜头与观众对视互动，毛发清晰自然，色彩自然朴素不加滤镜，自然日常光照，招牌/标识等道具文字清晰可读

模式B（英文）——默认：
photorealistic, natural ambient light, first-person vlog selfie POV, subject looking into the camera, realistic detailed fur, individual fur strands, natural translucent glow, natural realistic colors, no noise, no artifacts

模式B（英文）——画内文字场景（画面描述中含招牌/标识等道具文字时）：
photorealistic, natural ambient light, first-person vlog selfie POV, subject looking into the camera, realistic detailed fur, individual fur strands, natural translucent glow, natural realistic colors, no noise, no artifacts, legible text on signs and props

**负向词模板（模式B 必须包含，置于提示词末尾）：**

> ⚠️ Seedream（模式A）**不支持负向提示词**，负向词仅适用于模式B。模式A 通过正向词中的质感锚定和画质锁定来保证画面质量。

模式B（英文）：
cartoon, illustration, claymation, 2.5D, cel-shaded, toy-like, plastic, rubber, flat shading, anime, 3D render look, CGI, octane render, plastic toy figurine, keep real animal body with hunched back, short stubby limbs, real paws, pet clothing, no pasted-on look, no collage, no sticker cutout, no floating characters, no mismatched lighting, no inconsistent scale, scale changing between shots, inconsistent scale across shots, pet bigger in one shot smaller in another, oversized pet, human-sized cat, pet as big as a human, pet as tall as a person, pet filling an adult seat, giant cat, enlarged animal, duplicate character, cloned character, twins, same character appearing twice, repeated subject, multiple copies of the same character, no neon colors

---

## 美学禁止项（生成时严格规避）

以下词汇/风格不得出现于输出提示词中：

- ❌ 卡通/插画/黏土/2.5D扁平/玩具感/塑料感等非写实质感
- ❌ 失去真实动物身体特征的纯人类/人形化躯干角色
- ❌ 过度拟人：人类化修长躯干/宽肩/修长手臂/灵巧人手/挺直军姿/垂直脊柱（身体须为真实兽态：大头短身、含背微弓、短小四肢、真实前爪）
- ❌ 人腿剪影：长裤/长袜遮盖后腿造成人类双腿轮廓（应为宠物专用服饰、上身/披挂为主、下半身留覆毛短腿）
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
宠物拟人化，保留真实动物全身特征与体态，动物自然后腿立起姿态（含背微弓、前爪收胸前、短腿），照片级写实，自然日常光照，中景构图，拟人角色半身入镜，真实毛发清晰自然，皮毛层次，自然透光感，真实光泽，真实生活Vlog氛围，第一人称vlog自拍视角，角色看向镜头与观众对视互动，自然景深，生活细节，柔和环境光，真实阴影，暖色调，拟人橘猫坐在咖啡馆窗边，端起马克杯轻嗅咖啡香，耳朵微动，眼神柔和看向镜头，窗边自然光，温暖治愈氛围，真实拟人反差，陪伴式情感，呆萌可爱，圆润大眼无辜神态，色彩自然朴素不加滤镜。
Based on the reference image of 角色A, maintain consistent: animal head features, fur color, costume. The reference is one character shown from multiple angles — render exactly ONE 角色A, do not duplicate or clone. Generate a new scene: anthropomorphic orange cat sitting by the cafe window, holding a mug and sniffing coffee, ears twitching softly. Keep character appearance identical to reference.

### 示例输出B（模式B · Nanobanana）

```xml
<role>
You are an anthropomorphic pet vlog storyboard artist.
Maintain strict visual continuity across all shots.
</role>
<character_reference>
Image [1]: 角色A — photorealistic anthropomorphic cat, realistic animal head and full-body features kept, realistic detailed fur, real animal body (large head small rounded body, hunched back, short stubby limbs, real paws), posture follows action (reared up with forepaws for hand-tasks / quadruped when moving), pet clothing, natural lighting
</character_reference>
<continuity_rules>
- Same fur color, animal head features, costume across ALL shots
- Inherit costume from the character reference image; do NOT re-describe or add any clothing/footwear in the shot prompt
- Same environment, color palette, warm lighting
- Only framing, angle, action, expression may change
- Keep real animal head and full-body features; posture follows the action — reared up / sitting up on hind legs with forepaws handling objects for hand-tasks (eating, cooking, using computer), or natural quadruped gait when walking/moving; always stays as a real animal in body shape
- Do NOT introduce new characters not in reference images
- Exactly one instance of each character; the reference sheet shows ONE character from multiple angles — do NOT duplicate, clone, or mirror the character into the frame
</continuity_rules>
<shot>
Medium shot, photorealistic anthropomorphic orange cat sitting by the cafe window, holding a mug and sniffing coffee, ears twitching, soft gaze looking into the camera, realistic detailed fur, individual fur strands, natural translucent glow, first-person vlog selfie POV, subject looking into the camera, cozy window light, natural ambient light, natural realistic colors, lifestyle vlog mood, no noise, no artifacts.
</shot>
<negative>
cartoon, illustration, claymation, 2.5D, cel-shaded, toy-like, plastic, rubber, flat shading, anime, 3D render look, CGI, octane render, plastic toy figurine, keep real animal body with hunched back, short stubby limbs, real paws, pet clothing, no pasted-on look, no collage, no sticker cutout, no floating characters, no mismatched lighting, no inconsistent scale, scale changing between shots, inconsistent scale across shots, pet bigger in one shot smaller in another, oversized pet, human-sized cat, pet as big as a human, pet as tall as a person, pet filling an adult seat, giant cat, enlarged animal, duplicate character, cloned character, twins, same character appearing twice, repeated subject, multiple copies of the same character, no neon colors
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