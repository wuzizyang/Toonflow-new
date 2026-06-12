# Frontend Load Performance Bugfix Design

## Overview

Toonflow（Electron 应用）在**首次打开**素材库、分镜、视频列表、图片流等列表密集型界面时，前端加载缓慢。根因集中在“缩略图缓存冷启动”这一路径上：本地资源（`data/oss/...`）通过本地服务 `http://localhost:PORT/oss/...` 加载，列表项普遍调用 `OSS.getSmallImageUrl` 取 URL，再由 `src/app.ts` 的 `/oss` 中间件按 `?size=` 参数用 `sharp` **同步**生成缩略图。

本设计针对四类缺陷给出最小且定向的修复策略，同时严格保留既有访问与正确性行为：

1. **冷缓存批量同步生成阻塞首屏** → 使用 `p-limit` 对缩略图生成做并发上限约束，避免一次性占满 CPU / 事件循环；生成期间或失败时以降级方式快速返回，使首屏不被阻塞。
2. **百分比缩放对超大原图仍偏大** → 为缩略图增加“最大边界封顶”（max-dimension cap），即使按百分比缩放也不会超过设定上限，保证缩略图体积处于轻量范围。
3. **视频走缩略图通道降级为完整视频** → 在 `getSmallImageUrl` 与 `/oss` 中间件中识别视频扩展名，返回轻量预览（首帧/封面缩略图）或视频元数据 URL，而非整段视频文件。
4. **`getImageBase64` 全尺寸 base64** → 为列表展示场景提供受限尺寸的轻量 base64（或缩略图 URL），全尺寸 base64 仅保留给生成视频等确需原图的链路。

修复遵循 Bug 条件方法论：仅改变满足 Bug 条件 `C(X)` 的输入行为（首次冷缓存图片、经缩略图通道的视频、用于列表展示的全尺寸 base64），其余输入 `¬C(X)`（热缓存、有效 `?size=`、原图全尺寸请求、生成失败降级、路径安全校验）行为保持与修复前完全一致。

## Glossary

- **Bug_Condition (C)**：触发慢加载的条件——首次打开且缩略图缓存为空的图片请求、经 `getSmallImageUrl` 通道加载的视频、为列表展示返回的全尺寸 base64。
- **Property (P)**：期望行为——满足 Bug 条件的请求 SHALL 提供轻量资源（缩略图/预览/受限 base64），且首屏不被同步批量生成阻塞。
- **Preservation（保留）**：不满足 Bug 条件时必须保持不变的既有行为（热缓存返回、有效 `?size=` 生成、原图全尺寸请求、降级返回原图、路径安全约束）。
- **F**：修复前的原始函数（`getSmallImageUrl` / `getImageBase64` / `/oss` 中间件）。
- **F'**：修复后的函数。
- **`getSmallImageUrl`**：`src/utils/oss.ts` 中的方法，列表场景下为资源生成 URL；当前实现仅在原图 URL 后追加 `?size=20`，`smallImage` 缓存写入逻辑已被注释。
- **`getImageBase64`**：`src/utils/oss.ts` 中的方法，读取完整原图并返回全尺寸 base64 Data URL。
- **`ensureThumbnail` / `resizeImage`**：`src/utils/image.ts` 中基于 `sharp` 的缩略图生成函数，支持 `dimensions` 与 `percentage` 两种模式，内部默认 256x256 `inside` 等比缩放。
- **`/oss` 中间件**：`src/app.ts` 中解析 `?size=` 并调用 `ensureThumbnail` 生成/返回缩略图、失败降级为 `express.static` 返回原图的中间件。
- **`resolveSafeLocalPath` / `normalizeUserPath`**：`src/utils/oss.ts` 中的路径规范化与 OSS 根目录内安全校验逻辑。
- **冷缓存（cold cache）**：`smallImage` 目录下对应缩略图文件不存在的状态；**热缓存（hot cache）** 反之。

## Bug Details

### Bug Condition

慢加载在以下三种情形下显现：
1. 首次打开列表界面且缩略图缓存（`smallImage`）为空时，`/oss` 中间件对列表内每个图片**同步**调用 `sharp` 生成缩略图，缺乏并发约束，造成首屏长时间阻塞。
2. 列表项为视频（`.mp4`）时也经过 `getSmallImageUrl`，但 `sharp` 无法处理视频，`ensureThumbnail` 失败后降级返回**完整视频文件**。
3. 接口为列表展示调用 `getImageBase64`，返回全尺寸原图 base64，传输与渲染负担过重。

**Formal Specification:**
```
FUNCTION isBugCondition(X)
  INPUT: X of type LoadRequest    // 一次列表/资源加载请求
  OUTPUT: boolean

  RETURN (X.isFirstOpen AND X.thumbnailCacheMissing AND X.isImage)
      OR (X.isVideo AND X.viaSmallImageUrl)
      OR (X.returnsFullSizeBase64 AND X.forListDisplay)
END FUNCTION
```

### Examples

- **图片冷缓存批量生成（缺陷 1.1）**：首次打开素材库，30 张原图各自触发一次同步 `sharp` 生成，无并发上限 → 首屏数秒空白。期望：受并发上限约束，首屏快速可见。
- **超大原图百分比缩放（缺陷 1.2）**：一张 6000x4000 原图，`?size=20`（20%）生成 1200x800 缩略图，仍然偏大。期望：封顶到例如最长边 ≤512px，体积轻量。
- **视频走缩略图通道（缺陷 1.3）**：视频列表项 `xxx.mp4` 经 `getSmallImageUrl` → `?size=20` → `sharp` 失败 → 降级返回整段 mp4。期望：返回首帧/封面缩略图或视频元数据 URL，不下载整段视频。
- **列表全尺寸 base64（缺陷 1.4）**：列表展示通过 `getImageBase64` 返回数 MB 的 Data URL。期望：返回缩略图 URL 或受限尺寸 base64。
- **边界示例（热缓存，¬C）**：第二次打开同一列表，`smallImage` 缩略图已存在 → 直接返回缓存缩略图，行为不变。

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors（必须继续工作）：**
- 缩略图缓存已存在（热缓存）时，直接返回已缓存缩略图并快速加载（对应需求 3.1）。
- 携带有效 `?size=` 参数（`200x300` 维度格式或百分比格式）时，仍按该参数生成并返回对应尺寸缩略图（对应需求 3.2）。
- 请求原始全尺寸资源（不带 `size` 参数、视频/音频原文件下载、生成视频所需的原图 base64）时，仍返回完整未缩放的原始内容（对应需求 3.3）。
- 缩略图生成失败或 `size` 参数无效时，仍降级返回原图，保证资源可访问不报错（对应需求 3.4）。
- 路径校验发现请求路径不在 OSS 根目录内时，仍拒绝访问并保持现有安全约束（对应需求 3.5）。

**Scope：**
所有不满足 Bug 条件的输入 `¬C(X)` 应完全不受本修复影响，包括：
- 热缓存命中的缩略图请求。
- 显式带有效 `?size=` 的请求（其行为由参数决定，不被新封顶逻辑悄悄改变维度模式语义）。
- 不带 `size` 的原图请求、视频原文件下载链路、生成视频所需的全尺寸 base64 链路（如 `generateVideo.ts`、`batchGenerateVideo.ts`、`batchGenerateImage.ts`、`generateFlowImage.ts` 中确需原图的调用）。
- 经 `resolveSafeLocalPath` 拒绝的越权路径请求。

**Note：** 满足 Bug 条件时的期望正确行为定义在 Correctness Properties 的 Property 1；本节聚焦“不可改变”的行为。

## Hypothesized Root Cause

基于代码分析，最可能的根因如下：

1. **缺少并发约束的同步缩略图生成**：`/oss` 中间件在每次请求上独立调用 `ensureThumbnail`，列表场景下并发请求数等于列表项数，`sharp` 大量并行解码/缩放占满 CPU 与事件循环，首屏被拖慢。`p-limit ^7.3.0` 已在依赖中但未被使用。

2. **百分比缩放缺少最大边界封顶**：`getSmallImageUrl` 固定追加 `?size=20`，`image.ts` 的 `percentage` 分支按 `meta.width/height * pct` 计算目标尺寸，不设上限；原图越大缩略图越大，无法保证轻量。同时 `getSmallImageUrl` 注释中曾有的 512 封顶逻辑已被禁用。

3. **视频未被识别即走图片缩略图通道**：`getSmallImageUrl` 不区分扩展名，视频也追加 `?size=20`；`/oss` 中间件对视频路径调用 `sharp` 必然失败，`ensureThumbnail` 返回 `null` → 降级 `express.static` 返回整段视频。缺少“视频 → 首帧/封面预览”的分支。

4. **`getImageBase64` 不区分用途**：同一方法既服务于“列表展示”（应轻量），又服务于“生成视频/图像所需原图”（必须全尺寸），当前一律返回全尺寸，导致列表场景负担过重。

5. **（次要）静态文件 `acceptRanges: false`**：视频以 `express.static({ acceptRanges: false })` 提供，禁用 Range 请求会影响视频按需分段加载；属于视频预览策略需要一并考虑的上下文（非本 Bug 的核心，但在视频预览方案中需注意保留下载链路）。

## Correctness Properties

Property 1: Bug Condition - 首次加载提供轻量资源且不阻塞首屏

_For any_ 满足 Bug 条件的请求 `X`（`isBugCondition(X)` 返回 true：首次冷缓存图片、经缩略图通道的视频、或用于列表展示的全尺寸 base64），修复后的函数 `F'` SHALL 返回轻量资源（受最大边界约束的缩略图、视频首帧/封面预览或受限尺寸 base64），且缩略图生成以受并发上限约束的方式进行，使首屏不被同步批量生成阻塞（`result.servesLightweightAsset = true` 且 `result.firstScreenNotBlocked = true`）。

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - 非 Bug 条件行为保持不变

_For any_ 不满足 Bug 条件的请求 `X`（`isBugCondition(X)` 返回 false：热缓存命中、有效 `?size=` 请求、原图全尺寸请求、生成失败降级、越权路径），修复后的函数 `F'` SHALL 产生与原始函数 `F` 完全相同的结果，保留热缓存快速返回、按 `?size=` 生成、原图未缩放返回、失败降级返回原图、以及 OSS 根目录路径安全约束等既有行为。

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

假设上述根因分析成立，进行以下定向修改。

### Changes Required

**File**: `src/utils/image.ts`

**Function**: `resizeImage` / `ensureThumbnail`

**Specific Changes**:
1. **百分比最大边界封顶**：在 `percentage` 分支计算出 `w/h` 后，引入 `MAX_THUMB_EDGE`（如 512）对目标宽高做 `min` 封顶，保证最长边不超过上限；`dimensions` 模式保持原语义不变（由调用方显式指定，属于 `?size=` 路径，不能改变其结果）。
2. **生成失败语义保持**：`ensureThumbnail` 在缓存命中时直接返回（保留 3.1）、生成失败时返回 `null`（保留 3.4），不改变其对外契约。
3. **（视频支持入口，可选拆分）**：新增独立的视频首帧/封面缩略图生成函数 `ensureVideoThumbnail`，不与图片 `sharp` 路径混用，避免对视频调用 `sharp`。

**File**: `src/utils/oss.ts`

**Function**: `getSmallImageUrl` / 新增视频预览辅助

**Specific Changes**:
4. **恢复并约束缩略图缓存**：重新启用基于 `smallImage` 目录的缩略图缓存返回（命中直接返回缓存 URL → 强化 3.1 的热缓存路径），冷缓存时走受封顶约束的生成。
5. **视频识别分支**：在 `getSmallImageUrl` 中按扩展名识别视频（`.mp4` 等），对视频返回轻量预览 URL（首帧/封面缩略图 URL，或带预览标记的元数据 URL），而非追加 `?size=20` 让其走图片缩略图通道。原视频文件下载链路（不带预览标记）保持返回完整文件（保留 3.3）。
6. **`getImageBase64` 用途区分**：为列表展示提供轻量变体（如新增 `getImageThumbBase64(path, maxEdge)` 返回受限尺寸 base64，或在列表场景改用缩略图 URL）；保留原 `getImageBase64` 全尺寸语义供生成视频/图像链路使用（保留 3.3）。
7. **路径安全不变**：所有新增路径计算继续经 `resolveSafeLocalPath` / `normalizeUserPath`，维持 OSS 根目录约束（保留 3.5）。

**File**: `src/app.ts`

**Function**: `/oss` 中间件

**Specific Changes**:
8. **并发上限约束**：引入模块级 `p-limit` 实例（如 `limit = pLimit(N)`，`N` 取 CPU 核数相关的小值），将 `ensureThumbnail(...)` 调用包裹进 `limit(() => ...)`，限制同时进行的缩略图生成数量，避免冷缓存批量请求压垮 CPU/事件循环（满足 2.1，强化 Property 1 的 `firstScreenNotBlocked`）。
9. **视频预览分支**：在中间件中识别视频路径与预览标记，路由到视频首帧/封面缩略图（满足 2.3）；不带预览标记的视频请求继续由 `express.static` 提供完整文件（保留 3.3）。
10. **保留降级与参数解析**：维持 `dimensMatch` / `percentMatch` 解析、无效 `size` 降级 `express.static`、生成失败降级原图的现有分支（保留 3.2、3.4）。

> 说明：以上为基于根因假设的实现轮廓。若探索性检查（见下）证伪某条根因，需返回本节重新假设并调整。视频首帧提取的具体技术选型（如是否引入 ffmpeg、或使用预生成封面）将在任务阶段依据实际可用工具确定；当前仓库未检出 ffmpeg 依赖，需在任务阶段评估方案（预生成封面 / 引入 ffmpeg / 占位预览）。

## Testing Strategy

### Validation Approach

采用两阶段策略：先在**未修复**代码上复现并固化反例（确认 Bug 条件与根因），再验证修复满足期望行为且不破坏既有行为。

### Exploratory Bug Condition Checking

**Goal**：在实施修复**之前**，先surface反例以证实/证伪根因。若证伪则返回 Hypothesized Root Cause 重新假设。

**Test Plan**：构造列表场景请求，对未修复代码观察以下现象。

**Test Cases**:
1. **冷缓存批量生成阻塞（缺陷 1.1）**：清空 `smallImage` 缓存，并发请求 N 张图片的 `?size=20`，测量首屏/批量响应时延与并发 `sharp` 进程数（will fail / 表现为高时延、无并发上限）。
2. **超大原图缩略图偏大（缺陷 1.2）**：对超大原图请求 `?size=20`，断言输出缩略图最长边/字节数超过轻量阈值（will fail on unfixed code）。
3. **视频降级为完整文件（缺陷 1.3）**：对 `.mp4` 调用 `getSmallImageUrl` 并请求结果 URL，断言响应体大小等于完整视频（will fail on unfixed code）。
4. **列表全尺寸 base64（缺陷 1.4）**：对列表用途调用 `getImageBase64`，断言返回 base64 长度对应全尺寸（will fail on unfixed code）。

**Expected Counterexamples**:
- 冷缓存下无并发约束、首屏阻塞；超大原图缩略图未封顶；视频返回整段文件；列表 base64 为全尺寸。
- 可能成因：`/oss` 中间件无 `p-limit`；`percentage` 分支无最大边界；`getSmallImageUrl` 不识别视频；`getImageBase64` 不区分用途。

### Fix Checking

**Goal**：验证对所有满足 Bug 条件的输入，修复后函数产生期望行为。

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition(X) DO
  result := F'(X)
  ASSERT result.servesLightweightAsset = true   // 缩略图/预览/受限 base64，而非全尺寸或整段视频
  ASSERT result.firstScreenNotBlocked = true     // 受并发上限约束，首屏不被同步批量生成阻塞
END FOR
```

### Preservation Checking

**Goal**：验证对所有不满足 Bug 条件的输入，修复后函数与原始函数结果一致。

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR
```

**Testing Approach**：保留检查推荐使用基于属性的测试（PBT），因为：
- 能在输入域上自动生成大量用例。
- 能覆盖手写单测易遗漏的边界。
- 能为“非 Bug 输入行为不变”提供更强保证。

**Test Plan**：先在**未修复**代码上观察热缓存、有效 `?size=`、原图全尺寸、失败降级、越权路径的行为，固化为期望，再编写 PBT 断言修复后保持一致。

**Test Cases**:
1. **热缓存保留**：缩略图已存在时，观察未修复代码直接返回缓存缩略图，写测试断言修复后仍返回同一缓存结果（3.1）。
2. **有效 `?size=` 保留**：对 `200x300` 与百分比格式，观察未修复代码生成结果，断言修复后维度模式语义不变（3.2）。
3. **原图全尺寸保留**：不带 `size` 的图片、视频/音频原文件下载、生成视频所需的全尺寸 base64，断言修复后仍返回完整未缩放内容（3.3）。
4. **失败/无效降级保留**：缩略图生成失败或 `size` 无效时，断言修复后仍降级返回原图（3.4）。
5. **路径安全保留**：越权路径请求，断言修复后仍被 `resolveSafeLocalPath` 拒绝（3.5）。

### Unit Tests

- `image.ts`：百分比封顶逻辑（超大原图缩略图最长边 ≤ 上限）；`dimensions` 模式语义不变；缓存命中直接返回；生成失败返回 `null`。
- `oss.ts`：`getSmallImageUrl` 对图片/视频分别返回正确 URL 类型；视频识别分支；列表用途的轻量 base64 变体；路径安全校验。
- `/oss` 中间件：`p-limit` 包裹下的生成；有效/无效 `size` 分支；视频预览分支；降级分支。

### Property-Based Tests

- **Property 1（Fix Checking）**：在满足 Bug 条件的随机输入（随机原图尺寸、随机列表规模、视频/图片混合、列表 base64 用途）下，断言始终返回轻量资源且缩略图生成受并发上限约束。
- **Property 2（Preservation）**：在不满足 Bug 条件的随机输入（热缓存、随机有效 `?size=`、原图请求、失败/无效 size、随机越权路径）下，断言 `F(X) = F'(X)`。
- 随机生成原图尺寸验证缩略图最长边恒定 ≤ 上限（封顶不变量）。

### Integration Tests

- 首次打开素材库/分镜/视频列表/图片流端到端：冷缓存下首屏在合理时延内可见（满足 2.1）。
- 上下文切换：在不同列表视图间切换后缩略图/视频预览正确加载。
- 视频列表：列表显示首帧/封面预览，点击/下载仍可获取完整视频（2.3 + 3.3）。
- 生成视频链路：仍可获取全尺寸 base64 原图，生成结果正确（3.3）。
