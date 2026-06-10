# 添加 Agnes-AI 模型服务 Spec

## Why
用户需要在模型服务中添加 Agnes-AI 供应商，以使用其图片模型（Agnes Image 2.0 Flash、Agnes Image 2.1 Flash）和视频模型（Agnes Video V2.0）。Agnes AI 是一个全球前十的 AI Lab，提供文本、图片、视频三大模态的模型 API，目前 API 免费开放，支持 OpenAI 兼容协议。

## What Changes
- 新增 Agnes-AI 供应商适配文件 `agnesai.ts`
- 在 `initDB.ts` 中注册 Agnes-AI 供应商配置到数据库
- 支持图片模型：agnes-image-2.0-flash（图生图/多图合成）、agnes-image-2.1-flash（文生图）
- 支持视频模型：agnes-video-v2.0（异步轮询模式，支持文生视频和图生视频）

## Impact
- 受影响的能力：模型服务供应商列表
- 受影响的代码：
  - `data/vendor/agnesai.ts`（新建）
  - `src/lib/initDB.ts`（添加供应商初始化记录）
  - `src/lib/vendor.json`（可能需要重新生成）

## ADDED Requirements

### Requirement: Agnes-AI 供应商配置
系统 SHALL 在模型服务设置中提供 Agnes-AI 供应商选项，用户可配置 API 密钥和启用/禁用该供应商。

#### Scenario: 用户添加 Agnes-AI 供应商
- **WHEN** 用户在模型服务页面选择添加 Agnes-AI 供应商
- **THEN** 用户需要填写 API Key 和 Base URL（默认为 `https://apihub.agnes-ai.com/v1`）

### Requirement: 图片模型支持
系统 SHALL 支持 Agnes-AI 的两个图片模型：

| 模型名称 | API 模型名 | 类型 | 生图模式 | 说明 |
|---------|-----------|------|---------|------|
| Agnes Image 2.0 Flash | agnes-image-2.0-flash | image | text, singleImage, multiReference | 支持图生图和多图合成 |
| Agnes Image 2.1 Flash | agnes-image-2.1-flash | image | text | 纯文生图模型 |

#### Scenario: 使用 Agnes Image 2.1 Flash 文生图
- **WHEN** 用户选择 Agnes Image 2.1 Flash 模型并输入提示词
- **THEN** 系统调用 `/v1/images/generations` 接口生成图片并返回

#### Scenario: 使用 Agnes Image 2.0 Flash 图生图
- **WHEN** 用户选择 Agnes Image 2.0 Flash 模型并提供参考图片和提示词
- **THEN** 系统调用 `/v1/images/generations` 接口，带上 `tags: ["img2img"]` 和参考图片生成新图片

### Requirement: 视频模型支持
系统 SHALL 支持 Agnes-AI 的视频模型：

| 模型名称 | API 模型名 | 类型 | 视频模式 | 时长/分辨率 | 音频 |
|---------|-----------|------|---------|------------|------|
| Agnes Video V2.0 | agnes-video-v2.0 | video | text, singleImage, endFrameOptional | 5s/1080p, 5s/720p, 10s/1080p, 10s/720p | optional |

#### Scenario: 使用 Agnes Video V2.0 生成视频
- **WHEN** 用户选择 Agnes Video V2.0 模型并提交视频生成任务
- **THEN** 系统调用 `/v1/videos` 接口提交任务，然后轮询 `/v1/videos/{task_id}` 获取结果
- **THEN** 视频生成完成后，系统将视频 URL 转换为 base64 返回
