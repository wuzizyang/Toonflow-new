# Implementation Plan

## Overview

本任务列表基于 `design.md` 与 `bugfix.md`，遵循 Bug 条件方法论的探索式工作流：
**先探索（在未修复代码上复现 Bug）→ 再固化保留行为 → 然后实施修复 → 最后校验（Fix Checking + Preservation Checking）**。

- **F**：修复前的原始函数；**F'**：修复后的函数。
- 涉及文件：`src/utils/image.ts`、`src/utils/oss.ts`、`src/app.ts`（`/oss` 中间件）。
- 依赖现状：`p-limit ^7.3.0`、`sharp ^0.34.5` 已可用；**仓库当前无 ffmpeg 依赖**（见任务 3.2 的决策点）。

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["0"],
      "description": "准备测试环境（Vitest + fast-check、夹具、清缓存工具）"
    },
    {
      "wave": 2,
      "tasks": ["1", "2"],
      "description": "在未修复代码上：探索 Bug 条件（应失败）+ 固化保留行为（应通过）"
    },
    {
      "wave": 3,
      "tasks": ["3.1", "3.2"],
      "description": "image.ts：百分比封顶 + 独立视频缩略图入口（含 ffmpeg 决策点）"
    },
    {
      "wave": 4,
      "tasks": ["3.3"],
      "description": "oss.ts：恢复缓存 + 视频识别 + 轻量 base64 变体（依赖 3.1/3.2）"
    },
    {
      "wave": 5,
      "tasks": ["3.4"],
      "description": "app.ts /oss 中间件：p-limit 并发约束 + 视频预览分支（依赖 3.3）"
    },
    {
      "wave": 6,
      "tasks": ["3.5", "3.6"],
      "description": "校验：Fix Checking（Property 1 转通过）+ Preservation Checking（Property 2 仍通过）"
    },
    {
      "wave": 7,
      "tasks": ["4", "5"],
      "description": "补充单元/集成测试 + 检查点（全套测试 + lint + 清理）"
    }
  ]
}
```

## Tasks

- [x] 0. 准备测试环境（前置任务）
  - 仓库当前 `devDependencies` 中无测试框架；安装并配置 **Vitest** 作为单测/集成测试运行器，并安装 **fast-check** 用于属性测试（PBT）
  - 在 `package.json` 增加脚本：`"test": "vitest --run"`、`"test:pbt": "vitest --run"`（属性测试单次执行，避免 watch 模式阻塞）
  - 约定测试目录（如 `src/utils/__tests__/`、`src/__tests__/`），并准备临时 `data/oss` / `data/oss/smallImage` 测试夹具（fixtures），含：超大原图、普通图片、`.mp4` 视频样本
  - 提供清空 `smallImage` 缓存的测试工具函数，用于模拟“冷缓存”首次打开场景
  - _说明：若团队已有其他测试约定，可调整为对应框架，但需保证可运行属性测试_

## 阶段一：探索式 Bug 条件检查（在未修复代码上复现）

- [x] 1. 编写 Bug 条件探索测试（在实施修复之前）
  - **Property 1: Bug Condition** - 首次加载提供轻量资源且不阻塞首屏
  - **CRITICAL**：本测试在未修复代码上 **必须失败** —— 失败即证实 Bug 存在
  - **DO NOT** 在本任务中尝试修复测试或代码；失败是预期且正确的结果
  - **NOTE**：本测试编码了期望行为（`servesLightweightAsset = true` 且 `firstScreenNotBlocked = true`），修复后它将转为通过以验证修复
  - **GOAL**：surface 反例，证实 `design.md` 中四类缺陷确实存在
  - **Scoped PBT 方法**：对确定性缺陷，将属性收窄到具体可复现的失败用例：
    - 缺陷 1.1（冷缓存批量同步生成阻塞）：清空 `smallImage` 缓存，对 N 张图片并发请求 `/oss/...?size=20`，测量首屏/批量响应时延与并发 `sharp` 生成数 —— 断言无并发上限、首屏被阻塞（FAIL）
    - 缺陷 1.2（超大原图缩略图偏大）：对超大原图（如 6000x4000）请求 `?size=20`，断言输出缩略图最长边/字节数超过轻量阈值（如最长边 > 512px）（FAIL）
    - 缺陷 1.3（视频降级为完整文件）：对 `.mp4` 调用 `OSS.getSmallImageUrl` 并请求结果 URL，断言响应体大小等于完整视频（即降级返回整段 mp4）（FAIL）
    - 缺陷 1.4（列表全尺寸 base64）：以“列表展示”用途调用 `OSS.getImageBase64`，断言返回 base64 长度对应全尺寸原图（FAIL）
  - 在 **未修复代码** 上运行测试
  - **EXPECTED OUTCOME**：测试 **FAIL**（正确，证明 Bug 存在）
  - 记录反例（counterexamples）以理解根因，例如：“冷缓存下 30 张图无并发约束，首屏空白数秒”“`getSmallImageUrl('x.mp4')` 返回整段视频 URL”等
  - 若任一反例无法复现（证伪某条根因），返回 `design.md` 的 *Hypothesized Root Cause* 重新假设
  - 当测试已编写、已运行、失败已记录后，标记本任务完成
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

## 阶段二：保留行为固化（观察优先，在实施修复之前）

- [x] 2. 编写保留属性测试（在实施修复之前）
  - **Property 2: Preservation** - 非 Bug 条件行为保持不变
  - **IMPORTANT**：遵循 **观察优先（observation-first）** 方法论 —— 先在未修复代码上观察真实输出，再写测试断言这些输出
  - 在 **未修复代码** 上观察并记录以下非 Bug 输入（`isBugCondition(X) = false`）的行为：
    - 热缓存命中（3.1）：`smallImage` 缩略图已存在时，观察 `/oss` 中间件直接返回缓存缩略图
    - 有效 `?size=`（3.2）：观察 `200x300` 维度模式与百分比模式各自生成的尺寸结果（记录维度模式语义）
    - 原图全尺寸（3.3）：不带 `size` 的图片请求、视频/音频原文件下载、生成视频所需的 `getImageBase64` 全尺寸 base64，观察返回完整未缩放内容
    - 失败/无效降级（3.4）：缩略图生成失败或 `size` 无效时，观察降级返回原图
    - 路径安全（3.5）：越权路径请求，观察被 `resolveSafeLocalPath` / `normalizeUserPath` 拒绝
  - 编写 **属性测试（PBT）** 捕获上述观察到的行为模式（在输入域上断言 `F(X) = F'(X)` 的不变性），PBT 可自动生成大量用例提供更强保证：
    - 随机有效 `?size=`（维度/百分比）→ 维度模式语义不变
    - 随机原图请求 / 全尺寸 base64 → 返回完整内容
    - 随机无效 `size` → 降级返回原图
    - 随机越权路径 → 被拒绝
  - 在 **未修复代码** 上运行测试
  - **EXPECTED OUTCOME**：测试 **PASS**（确认这是需要保留的基线行为）
  - 当测试已编写、已运行、并在未修复代码上通过后，标记本任务完成
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

## 阶段三：实施修复

- [x] 3. 修复首屏冷缓存慢加载（缩略图封顶 + 视频预览 + 并发约束 + 轻量 base64）

  - [x] 3.1 `src/utils/image.ts`：为百分比缩放增加最大边界封顶
    - 在 `resizeImage` / `ensureThumbnail` 的 `percentage` 分支中引入 `MAX_THUMB_EDGE`（如 512），对计算出的目标 `w/h` 做 `min` 封顶，保证缩略图最长边 ≤ 上限
    - `dimensions` 模式语义 **保持不变**（由调用方 `?size=` 显式指定，不得被封顶逻辑改变）
    - 保留缓存命中直接返回的行为（保留 3.1），保留生成失败返回 `null` 的对外契约（保留 3.4）
    - _Bug_Condition: isBugCondition(X) where X.isImage AND X.thumbnailCacheMissing（缺陷 1.2）_
    - _Expected_Behavior: result.servesLightweightAsset = true（缩略图最长边 ≤ MAX_THUMB_EDGE）_
    - _Preservation: dimensions 模式语义不变；缓存命中返回；失败返回 null_
    - _Requirements: 2.2, 3.1, 3.2, 3.4_

  - [x] 3.2 `src/utils/image.ts`：新增独立的视频首帧/封面缩略图入口（决策点）
    - 新增 `ensureVideoThumbnail`，与图片 `sharp` 路径分离，避免对视频调用 `sharp`
    - **DECISION POINT（必须先决策）**：仓库当前 **无 ffmpeg 依赖**，视频首帧提取技术需三选一：
      1. 预生成封面（由上游生成流程产出封面图，本函数仅读取）
      2. 引入 ffmpeg（如 `fluent-ffmpeg` + `ffmpeg-static`）提取首帧 —— 需新增依赖，确认体积/打包/许可影响
      3. 占位预览（统一占位图 / 视频元数据 URL）作为最小可行方案
    - 在选定方案前，先与用户确认；选定后实现并保证不破坏视频原文件下载链路（保留 3.3）
    - _Bug_Condition: isBugCondition(X) where X.isVideo AND X.viaSmallImageUrl（缺陷 1.3）_
    - _Expected_Behavior: result.servesLightweightAsset = true（返回首帧/封面/预览，而非整段视频）_
    - _Preservation: 不带预览标记的视频请求仍返回完整文件_
    - _Requirements: 2.3, 3.3_

  - [x] 3.3 `src/utils/oss.ts`：恢复并约束 `smallImage` 缓存 + 视频识别 + 轻量 base64 变体
    - 在 `getSmallImageUrl` 中重新启用基于 `smallImage` 目录的缩略图缓存：命中直接返回缓存 URL（强化热缓存路径，保留 3.1），冷缓存走受封顶约束的生成
    - 增加视频扩展名识别分支（`.mp4` 等）：对视频返回轻量预览 URL（首帧/封面缩略图 URL 或带预览标记的元数据 URL），而非追加 `?size=20`；不带预览标记的视频下载链路仍返回完整文件（保留 3.3）
    - 为列表展示新增轻量 base64 变体（如 `getImageThumbBase64(path, maxEdge)` 返回受限尺寸 base64，或列表场景改用缩略图 URL）；保留原 `getImageBase64` 全尺寸语义供生成视频/图像链路使用（保留 3.3）
    - 所有新增路径计算继续经 `resolveSafeLocalPath` / `normalizeUserPath`（保留 3.5）
    - _Bug_Condition: isBugCondition(X)（缺陷 1.3、1.4，及冷缓存 1.1 的 URL 入口）_
    - _Expected_Behavior: result.servesLightweightAsset = true（视频预览 URL / 受限 base64 / 缓存缩略图 URL）_
    - _Preservation: 原 getImageBase64 全尺寸语义、视频原文件下载、路径安全约束不变_
    - _Requirements: 2.3, 2.4, 3.1, 3.3, 3.5_

  - [x] 3.4 `src/app.ts`：`/oss` 中间件并发上限约束 + 视频预览分支
    - 引入模块级 `p-limit` 实例（如 `const limit = pLimit(N)`，`N` 取与 CPU 核数相关的小值），将 `ensureThumbnail(...)` 调用包裹进 `limit(() => ...)`，限制同时进行的缩略图生成数量，避免冷缓存批量请求压垮 CPU/事件循环
    - 增加视频路径与预览标记识别分支，路由到视频首帧/封面缩略图（任务 3.2 的入口）；不带预览标记的视频请求继续由 `express.static` 提供完整文件（保留 3.3）
    - 保留 `dimensMatch` / `percentMatch` 参数解析、无效 `size` 降级 `express.static`、生成失败降级原图的现有分支（保留 3.2、3.4）
    - _Bug_Condition: isBugCondition(X) where X.isFirstOpen AND X.thumbnailCacheMissing（缺陷 1.1）_
    - _Expected_Behavior: result.firstScreenNotBlocked = true（受并发上限约束，首屏不被同步批量生成阻塞）_
    - _Preservation: size 解析、无效 size 降级、失败降级、视频原文件下载不变_
    - _Requirements: 2.1, 2.3, 3.2, 3.3, 3.4_

  - [x] 3.5 验证 Bug 条件探索测试现在通过
    - **Property 1: Expected Behavior** - 首次加载提供轻量资源且不阻塞首屏
    - **IMPORTANT**：重新运行任务 1 中的 **同一测试** —— 不要编写新测试
    - 任务 1 的测试已编码期望行为；当它通过时，即确认期望行为被满足
    - 运行阶段一的 Bug 条件探索测试
    - **EXPECTED OUTCOME**：测试 **PASS**（确认四类缺陷已修复：缩略图封顶、视频预览、并发约束、轻量 base64）
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.6 验证保留测试仍然通过
    - **Property 2: Preservation** - 非 Bug 条件行为保持不变
    - **IMPORTANT**：重新运行任务 2 中的 **同一测试** —— 不要编写新测试
    - 运行阶段二的保留属性测试
    - **EXPECTED OUTCOME**：测试 **PASS**（确认无回归：热缓存、有效 `?size=`、原图全尺寸、失败降级、路径安全均不变）
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

## 阶段四：补充测试与检查点

- [x] 4. 补充单元测试与集成测试
  - 单元测试（`image.ts`）：百分比封顶（超大原图缩略图最长边 ≤ 上限）、`dimensions` 模式语义不变、缓存命中直接返回、生成失败返回 `null`
  - 单元测试（`oss.ts`）：`getSmallImageUrl` 对图片/视频分别返回正确 URL 类型、视频识别分支、列表用途轻量 base64 变体、路径安全校验
  - 单元测试（`/oss` 中间件）：`p-limit` 包裹下的生成、有效/无效 `size` 分支、视频预览分支、降级分支
  - 集成测试：首次打开素材库/分镜/视频列表/图片流端到端，冷缓存下首屏在合理时延内可见（2.1）；上下文切换后缩略图/视频预览正确加载；视频列表显示首帧/封面，点击/下载仍可获取完整视频（2.3 + 3.3）；生成视频链路仍可获取全尺寸 base64（3.3）
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. 检查点 - 确保所有测试通过
  - 运行完整测试套件（单测 + 属性测试 + 集成测试），确认 Property 1（Fix Checking）与 Property 2（Preservation）均通过
  - 运行 `yarn lint`（`tsc --noEmit`）确认无类型错误
  - 清理验证过程中产生的临时文件/测试夹具
  - 如出现问题，向用户确认后再继续

## Notes

- **测试框架决策点**：仓库当前无测试框架，任务 0 默认采用 Vitest + fast-check；若团队已有其他约定，可替换为对应框架，但需保证可运行属性测试（PBT）。
- **视频首帧提取决策点（任务 3.2）**：仓库当前无 ffmpeg 依赖。需在实施前三选一：预生成封面 / 引入 ffmpeg（新增依赖，注意打包体积与许可）/ 占位预览。建议先与用户确认方案。
- **属性测试运行说明**：使用 `vitest --run` 单次执行，避免 watch 模式阻塞自动化流程。
- **方法论提醒**：阶段一探索测试在未修复代码上 **必须失败**；阶段二保留测试在未修复代码上 **必须通过**。修复后两者均应通过。
- 若探索阶段证伪某条根因，返回 `design.md` 的 *Hypothesized Root Cause* 重新假设后再实施。
