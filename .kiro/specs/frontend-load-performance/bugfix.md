# Bugfix Requirements Document

## Introduction

Toonflow（Electron 应用）在**首次打开**素材库、分镜、视频列表、图片流等包含大量本地资源的界面时，前端加载明显变慢。资源存储在本地 `data/oss/` 下，前端通过本地服务（`http://localhost:PORT/oss/...`）加载图片与视频。

经代码分析，前端在列表场景中主要通过 `OSS.getSmallImageUrl` 获取资源 URL，并由 `src/app.ts` 中的 `/oss` 中间件按 `?size=` 参数生成缩略图。慢加载集中出现在“缩略图缓存为空”的首次访问，主要由以下几点导致：

1. **缩略图缓存冷启动**：首次打开时 `smallImage` 缓存不存在，`/oss` 中间件需要对列表中每个图片**同步**调用 `sharp` 生成缩略图，大量图片并发生成造成首屏长时间等待。
2. **缩略图按百分比缩放**：`getSmallImageUrl` 追加 `?size=20`（按原图 20% 等比缩放）。原图越大，缩略图越大，对超大原图无法保证小体积，列表加载仍然偏重。
3. **视频走缩略图通道退化为原文件**：视频（`.mp4`）也会经过 `getSmallImageUrl`，但 `sharp` 无法处理视频，`ensureThumbnail` 失败后降级返回**完整视频文件**，列表实际下载的是整段视频而非轻量预览。
4. **base64 全尺寸数据**：`getImageBase64` 读取完整原图并转为 base64 Data URL，体积大，相关接口响应与前端渲染变慢。

本 Bugfix 旨在描述上述慢加载的 Bug 条件、期望的快速加载行为，以及必须保持不变的既有行为，便于后续设计与验证。

## Bug Analysis

### Current Behavior (Defect)

首次打开包含大量本地资源的界面时，前端加载缓慢。

1.1 WHEN 用户首次打开列表界面且缩略图缓存（`smallImage`）为空 THEN 系统对列表内每个图片同步调用 `sharp` 生成缩略图，导致首屏长时间阻塞、加载缓慢
1.2 WHEN 列表中存在超大尺寸原图 THEN 系统按原图 20% 百分比缩放生成缩略图，对超大原图产生的缩略图仍然偏大，列表加载体积过重
1.3 WHEN 列表项为视频（`.mp4`）且通过 `getSmallImageUrl` 获取 URL THEN 系统因 `sharp` 无法处理视频而降级返回完整视频文件，前端下载整段视频造成加载缓慢
1.4 WHEN 接口通过 `getImageBase64` 返回图片 THEN 系统读取并返回全尺寸原图的 base64 Data URL，传输与渲染负担过重导致加载缓慢

### Expected Behavior (Correct)

首次打开界面时应快速呈现轻量资源（缩略图/预览），避免一次性加载全尺寸资源。

2.1 WHEN 用户首次打开列表界面且缩略图缓存为空 THEN 系统 SHALL 以不阻塞首屏的方式提供缩略图（如限制并发生成、异步生成并先返回占位/降级、或后台预生成），使列表在合理时间内可见
2.2 WHEN 列表中存在超大尺寸原图 THEN 系统 SHALL 生成受最大边界约束的缩略图，保证缩略图体积处于轻量范围而不随原图无限增大
2.3 WHEN 列表项为视频（`.mp4`） THEN 系统 SHALL 返回轻量的视频预览（如首帧/封面缩略图或视频元数据 URL），而非完整视频文件
2.4 WHEN 接口需要为列表展示返回图片 THEN 系统 SHALL 返回轻量资源（缩略图 URL 或受限尺寸的 base64），避免返回全尺寸原图 base64

### Unchanged Behavior (Regression Prevention)

修复不得破坏既有的资源访问与正确性。

3.1 WHEN 缩略图缓存已存在（非首次打开，热缓存） THEN 系统 SHALL CONTINUE TO 直接返回已缓存的缩略图并快速加载
3.2 WHEN 请求携带有效的 `?size=` 参数（如 `200x300` 或百分比） THEN 系统 SHALL CONTINUE TO 按该参数生成并返回对应尺寸的缩略图
3.3 WHEN 前端或接口请求原始全尺寸资源（不带 `size` 参数，或视频/音频原文件下载、生成视频所需的原图 base64） THEN 系统 SHALL CONTINUE TO 返回完整未缩放的原始文件内容
3.4 WHEN 缩略图生成失败或 `size` 参数无效 THEN 系统 SHALL CONTINUE TO 降级返回原图，保证资源可访问不报错
3.5 WHEN 路径校验发现请求路径不在 OSS 根目录内 THEN 系统 SHALL CONTINUE TO 拒绝访问并保持现有安全约束

## Bug Condition

> 以下使用结构化伪代码定义 Bug 条件与属性，用于后续的修复检查（Fix Checking）与保留检查（Preservation Checking）。
> - **F**：修复前的原始函数（首次列表加载/缩略图获取逻辑）
> - **F'**：修复后的函数

### Bug Condition Function

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type LoadRequest   // 一次列表/资源加载请求
  OUTPUT: boolean

  // 首次打开且缩略图缓存为空时的图片，或经缩略图通道加载的视频，或全尺寸 base64 返回
  RETURN (X.isFirstOpen AND X.thumbnailCacheMissing AND X.isImage)
      OR (X.isVideo AND X.viaSmallImageUrl)
      OR (X.returnsFullSizeBase64 AND X.forListDisplay)
END FUNCTION
```

### Property Specification (Fix Checking)

```pascal
// Property: 首次加载应快速且只传输轻量资源
FOR ALL X WHERE isBugCondition(X) DO
  result ← F'(X)
  ASSERT result.servesLightweightAsset = true        // 缩略图/预览，而非全尺寸原图或完整视频
  ASSERT result.firstScreenNotBlocked = true          // 首屏不被同步批量生成阻塞
END FOR
```

### Preservation Goal (Preservation Checking)

```pascal
// Property: 非 Bug 条件下行为保持不变
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR
```
