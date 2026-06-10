# Tasks

- [x] Task 1: 创建 Agnes-AI 供应商适配文件
  - 创建 `data/vendor/agnesai.ts` 文件
  - 配置供应商基本信息（id: agnesai, name: AgnesAI）
  - 配置输入项：API Key（必填）、Base URL（默认 `https://apihub.agnes-ai.com/v1`）
  - 配置图片模型：
    - Agnes Image 2.0 Flash（agnes-image-2.0-flash）：支持 text, singleImage, multiReference 模式
    - Agnes Image 2.1 Flash（agnes-image-2.1-flash）：支持 text 模式
  - 配置视频模型：
    - Agnes Video V2.0（agnes-video-v2.0）：支持 text, singleImage, endFrameOptional 模式
    - 时长分辨率映射：5s/1080p, 5s/720p, 10s/1080p, 10s/720p
    - 音频：optional（用户可选）
  - 实现 imageRequest 函数：
    - 使用 OpenAI 兼容的 `/v1/images/generations` 接口
    - 文生图：直接调用接口
    - 图生图：带上 `tags: ["img2img"]` 和参考图片
    - 多图合成：带上多张参考图片
  - 实现 videoRequest 函数：
    - 使用异步模式：提交任务 → 轮询结果
    - 提交接口：POST `/v1/videos`
    - 查询接口：GET `/v1/videos/{task_id}`
    - 根据 config.mode 处理不同的输入模式（文生视频、单图、首尾帧）
    - 使用 pollTask 进行轮询，超时时间 10 分钟

- [x] Task 2: 注册 Agnes-AI 供应商到数据库
  - 在 `src/lib/initDB.ts` 的 `o_vendorConfig` 表初始化数据中添加 Agnes-AI 记录
  - 设置默认 enable 为 0（默认不启用）

- [x] Task 3: 验证供应商配置
  - 验证供应商文件无语法错误
  - 验证模型配置格式正确（通过 Zod 校验）
  - 验证接口实现符合规范

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1 和 Task 2