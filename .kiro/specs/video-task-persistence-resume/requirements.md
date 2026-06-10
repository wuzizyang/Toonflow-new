# Requirements Document

## Introduction

Toonflow 应用通过 vm2 沙箱中的供应商适配脚本（agnesai、grsai、vidu、klingai、minimax、volcengine、toonflow 等）向远端 AI 平台提交异步视频生成任务。当前实现把"提交任务 + 内存轮询直到完成"耦合在供应商脚本的 `videoRequest` 内，提交后获得的 `taskId` 仅保存在轮询闭包中，从未写入 `o_video` 表；进程一旦重启（崩溃、部署、被杀），所有正在运行的轮询闭包丢失，启动期 `fixDB.ts` 会把所有 `state='生成中'` 的视频行强制改为"生成失败"，但远端供应商任务可能仍在执行，造成用户必须手动重新提交、重复消耗额度。

本特性（video-task-persistence-resume）的目标是：**让已成功提交到供应商的视频任务在 Node 进程重启后可以被自动续接轮询**，仅对从未拿到供应商 taskId 的行做失败兜底。具体范围包括：持久化提交身份（taskId、供应商、模型、提交参数）、改造适配器契约以分离"提交"与"查询"、改写启动期恢复逻辑、扩展 `o_video` 状态语义、调整启动后串行提交与新提交之间的并发策略，并提供可被属性测试覆盖的不变量。

## Glossary

- **Toonflow_App**：本仓库对应的 Node 进程整体，简称"系统"。
- **Vendor_Script**：`data/vendor/*.ts` 的供应商适配脚本，运行在 vm2 沙箱中，每次调用 `getVendorTemplateFn` 都会重新创建 VM，模块级状态不跨调用保留。
- **Vendor_Adapter**：经过 `runCode` 加载后暴露 `videoRequest` / `submitVideoRequest` / `queryVideoTask` 等函数的对象。
- **Video_Row**：`o_video` 表中的一行，键为 `id`。
- **Video_Task**：一条视频生成任务，与一行 `Video_Row` 一一对应。
- **Vendor_Task_Id**：供应商在收到提交后返回的远端任务标识，是恢复轮询所需的唯一键。
- **AiVideo_Runner**：`src/utils/ai.ts` 中 `AiVideo` 类与 `getVendorTemplateFn` 等宿主侧调用方，在本特性中承担"宿主侧轮询调度"职责。
- **Resume_Manager**：本特性新增的宿主侧模块，负责在启动时枚举可恢复的 `Video_Row` 并重新调度轮询。
- **Submit_Phase**：从构造请求到拿到 `Vendor_Task_Id` 并落库为止的阶段。
- **Poll_Phase**：从拥有 `Vendor_Task_Id` 到任务终态（成功 / 失败 / 取消 / 永久不可达）为止的阶段。
- **Terminal_State**：`Video_Row.state` 的终态集合 `{"生成成功", "生成失败"}`。
- **Submitted_State**：本特性引入的中间态，表示已成功向供应商提交并持久化 `Vendor_Task_Id`，但尚未达到终态。建议名为 `"已提交"`（向后兼容详见 Requirement 6）。
- **Submitting_State**：本特性引入或沿用的中间态，表示正在执行 `Submit_Phase`、尚未取得 `Vendor_Task_Id`。建议沿用 `"生成中"` 语义。
- **Resumable**：满足 `Vendor_Task_Id` 非空、`vendorId` 非空、`modelName` 非空且 `state` ∈ `{"已提交", "生成中"}` 的 `Video_Row`。
- **Submit_Lock_Key**：`withGlobalLock` 的命名键，用于跨任务串行提交（沿用现状如 `agnesai:video:submit`）。
- **Fail_Reason_Boot_No_Task_Id**：常量字符串 `"软件退出导致失败（任务未提交至供应商）"`，用于启动期对未持久化 `Vendor_Task_Id` 的行的失败原因。

## Requirements

### Requirement 1: 持久化供应商任务身份

**User Story:** 作为 Toonflow 用户，我希望系统在每次成功向供应商提交视频任务后立刻把 `Vendor_Task_Id` 等恢复所需信息写入数据库，以便进程重启后系统能够找回任务并继续轮询。

#### Acceptance Criteria

1. THE Toonflow_App SHALL 为 `o_video` 表新增以下列：`vendorId TEXT`、`modelName TEXT`、`vendorTaskId TEXT`、`submitParams TEXT`、`submitTime INTEGER`、`lastPollTime INTEGER`、`pollAttempt INTEGER DEFAULT 0`、`resumeCount INTEGER DEFAULT 0`。
2. THE Toonflow_App SHALL 通过 `src/lib/fixDB.ts` 中现有的 `addColumn` 模式执行新列迁移，且对已存在的列保持幂等。
3. WHEN AiVideo_Runner 进入 `Video_Row` 的 `Submit_Phase`，THE AiVideo_Runner SHALL 在调用供应商提交接口之前把 `vendorId`、`modelName`、`submitParams`（序列化为 JSON 字符串）、`submitTime` 写入对应 `Video_Row`。
4. WHEN Vendor_Adapter 在 `Submit_Phase` 返回 `Vendor_Task_Id`，THE AiVideo_Runner SHALL 在 `await` 任何后续轮询操作之前把 `vendorTaskId` 写入对应 `Video_Row`，并把 `state` 由 Submitting_State 更新为 Submitted_State。
5. IF `submitParams` 序列化后超过 1 MiB，THEN THE AiVideo_Runner SHALL 仅持久化恢复轮询所必需的最小子集（不含 `referenceList` 中的 base64 大字段），并在 `submitParams` JSON 中以字段 `truncated: true` 标记。
6. WHERE `submitParams` 含 `referenceList` 的 base64 数据，THE AiVideo_Runner SHALL 默认把 base64 字段以原文落库以便重提交。
7. IF Vendor_Adapter 已返回有效的 `vendorTaskId` 但 AiVideo_Runner 写入数据库的操作失败，THEN THE AiVideo_Runner SHALL 把 `Video_Row.state` 置为 Submitted_State 并继续在当前进程内存中执行 Poll_Phase，且 SHALL 输出 `event = "video_persist_taskid_failed"` 错误日志（包含 `videoId`、原始数据库错误信息），并接受进程重启会丢失该 `vendorTaskId` 的风险（即重启后该行将按 Requirement 2.1 兜底为失败）。
8. IF AiVideo_Runner 写入数据库失败的字段不是 `vendorTaskId` 而是 Submit_Phase 中的其他字段（`vendorId` / `modelName` / `submitParams` / `submitTime`），THEN THE AiVideo_Runner SHALL 把 `Video_Row.state` 置为 `"生成失败"`，把 `errorReason` 置为持久化失败的具体原因，并放弃后续轮询。

### Requirement 2: 启动期恢复与失败兜底

**User Story:** 作为 Toonflow 用户，我希望系统重启后能够自动接管之前已提交的视频任务，而仅对真正未提交成功的任务做失败兜底，从而避免重复消耗供应商额度。

#### Acceptance Criteria

1. WHEN Toonflow_App 启动期执行 `fixDB.ts`，THE Resume_Manager SHALL 把所有 `o_video.state = "生成中"` 且 `vendorTaskId IS NULL` 的行更新为 `state = "生成失败"`、`errorReason = Fail_Reason_Boot_No_Task_Id`。
2. WHEN Toonflow_App 启动期执行 `fixDB.ts`，THE Resume_Manager SHALL 保留所有 `vendorTaskId` 非空且 `state ∈ {"生成中", "已提交"}` 的行不变，作为 Resumable 行交给后续恢复流程。
3. WHEN `fixDB.ts` 完成数据库迁移与状态修正后，THE Resume_Manager SHALL 枚举全部 Resumable 行，并按 `submitTime` 升序逐条调度 Poll_Phase。
4. WHEN Resume_Manager 调度一条 Resumable 行的 Poll_Phase，THE Resume_Manager SHALL 把 `Video_Row.resumeCount` 自增 1。
5. IF Resume_Manager 在调度某条 Resumable 行时找不到对应 `vendorId` 的供应商配置或 `modelName` 对应的模型，THEN THE Resume_Manager SHALL 把该行更新为 `state = "生成失败"`、`errorReason = "供应商或模型已不存在，无法恢复"`。
6. WHILE Toonflow_App 处于启动恢复阶段，THE Resume_Manager SHALL 不阻塞 HTTP 服务进入可服务状态，恢复任务以异步后台方式调度。

### Requirement 3: 供应商适配器契约拆分（提交 / 查询）

**User Story:** 作为 Toonflow 适配器维护者，我需要供应商脚本把"提交任务"与"查询任务"拆成独立函数，让宿主能够掌握 `Vendor_Task_Id` 并在重启后只调用查询函数继续轮询。

#### Acceptance Criteria

1. THE Vendor_Adapter SHALL 暴露 `submitVideoRequest(config, model)` 函数，返回类型为 `{ vendorTaskId: string; vendorMeta?: Record<string, any> }`，其中 `vendorMeta` 用于该供应商查询接口所需的、`vendorTaskId` 之外的少量上下文（例如签名所需 region），并且 `vendorMeta` 可被 JSON 序列化。
2. THE Vendor_Adapter SHALL 暴露 `queryVideoTask(args, model)` 函数，参数类型为 `{ vendorTaskId: string; vendorMeta?: Record<string, any> }`，返回类型为 `{ status: "pending" | "succeeded" | "failed"; data?: string; error?: string; progress?: number }`。
3. WHERE Vendor_Adapter 同时暴露旧版 `videoRequest` 与新版 `submitVideoRequest`/`queryVideoTask`，THE AiVideo_Runner SHALL 优先调用新版函数。
4. WHERE Vendor_Adapter 仅暴露旧版 `videoRequest`，THE AiVideo_Runner SHALL 沿用当前"提交+轮询合一"的执行路径，并在 `Video_Row.errorReason` 中以 `"供应商不支持重启恢复"` 提示用户该任务在进程重启后会被标记为失败（即沿用 Requirement 2.1 的兜底）。
5. WHEN AiVideo_Runner 调用新版 `queryVideoTask` 返回 `status = "failed"` 且 `error` 非空，THE AiVideo_Runner SHALL 把 `Video_Row.state` 置为 `"生成失败"` 且 `errorReason` 置为该 `error` 字符串。
6. WHEN AiVideo_Runner 调用新版 `queryVideoTask` 返回 `status = "succeeded"` 且 `data` 是有效视频 URL 或 base64，THE AiVideo_Runner SHALL 完成下载/转换并把 `Video_Row.state` 置为 `"生成成功"`。
7. WHERE 供应商需要在恢复时知道签名所需的提交参数（如 minimax 的 region、volcengine 的 endpoint），THE AiVideo_Runner SHALL 在恢复 Poll_Phase 时把持久化的 `vendorMeta` 一并传入 `queryVideoTask`。
8. THE Vendor_Adapter SHALL 同时为每一种新版视频模型保留旧版 `videoRequest` 实现作为本地兼容层，旧版实现可内部调用 `submitVideoRequest` + `queryVideoTask` 完成一次完整生命周期。

### Requirement 4: 宿主侧轮询调度

**User Story:** 作为 Toonflow 系统设计者，我希望把轮询循环从供应商沙箱迁出到宿主侧统一调度，以便在进程重启后能够无感续接，并对每条任务实施统一的超时、退避与失败次数控制。

#### Acceptance Criteria

1. THE AiVideo_Runner SHALL 在宿主侧实现 Poll_Phase 循环，循环体每次调用 Vendor_Adapter 的 `queryVideoTask`，循环间隔默认 30 秒，并允许供应商通过其模型配置覆盖此值至 [3, 300] 秒区间。
2. WHEN AiVideo_Runner 完成一次 `queryVideoTask` 调用，THE AiVideo_Runner SHALL 把 `Video_Row.lastPollTime = Date.now()`、`pollAttempt = pollAttempt + 1`。
3. THE AiVideo_Runner SHALL 为每条任务设置最大轮询时长上限 24 小时（86400000 毫秒），上限以 `submitTime` 为起点（不因恢复重置），到期后把 `Video_Row.state` 置为 `"生成失败"` 且 `errorReason = "轮询超时"`。
4. IF 单次 `queryVideoTask` 抛出异常或返回 `status = "pending"` 但携带 `error`，THEN THE AiVideo_Runner SHALL 把异常计入失败计数。该任务最多累计 10 次连续查询失败。
5. WHEN 同一任务连续查询失败计数达到 10，THE AiVideo_Runner SHALL 把 `Video_Row.state` 置为 `"生成失败"` 且 `errorReason` 置为最近一次错误信息。
6. WHEN `queryVideoTask` 返回的 HTTP/业务错误形如 4xx 客户端错误（包含 `404`、`403`、`410`），THE AiVideo_Runner SHALL 立即把 `Video_Row.state` 置为 `"生成失败"`，无需累计到 10 次。
7. WHILE Poll_Phase 处于运行中，THE AiVideo_Runner SHALL 不持有 `Submit_Lock_Key` 锁。
8. THE AiVideo_Runner SHALL 对每条 `Vendor_Task_Id` 在全局任意时刻保证最多存在一个并发的 `queryVideoTask` 调用，无论调用方来自新提交、恢复轮询还是重复触发。

### Requirement 5: 状态机与状态转移

**User Story:** 作为前端 / API 调用方，我希望 `o_video.state` 的可能取值与转移路径是明确的，以便正确展示进度和处理终态。

#### Acceptance Criteria

1. THE Toonflow_App SHALL 把 `o_video.state` 限定在以下取值之一：`"生成中"`、`"已提交"`、`"生成成功"`、`"生成失败"`。
2. WHEN AiVideo_Runner 创建一条新的 Video_Row，THE AiVideo_Runner SHALL 初始化 `state = "生成中"`。
3. WHEN AiVideo_Runner 完成 Submit_Phase 并写入 `vendorTaskId`，THE AiVideo_Runner SHALL 把 `state` 由 `"生成中"` 转移到 `"已提交"`。
4. WHEN AiVideo_Runner 在 Poll_Phase 收到供应商终态，THE AiVideo_Runner SHALL 把 `state` 转移到 Terminal_State 之一。
5. THE AiVideo_Runner SHALL 不允许从 Terminal_State 转出。
6. IF AiVideo_Runner 接收到一次试图把 Terminal_State 行重新置为非终态的写入请求，THEN THE AiVideo_Runner SHALL 拒绝该写入并保留原状态。
7. WHERE Vendor_Adapter 仅支持旧版 `videoRequest`，THE AiVideo_Runner SHALL 允许 `state` 在 Submit_Phase 至 Terminal_State 之间停留为 `"生成中"`，以保持与现有 UI 兼容。

### Requirement 6: 现存数据与 UI / API 向后兼容

**User Story:** 作为升级前已经有未完成视频任务的用户，我希望首次部署本特性后旧数据不会出现异常状态，前端列表与轮询接口仍能正常工作。

#### Acceptance Criteria

1. WHEN `fixDB.ts` 在新版本首次启动时执行迁移，THE Toonflow_App SHALL 把所有迁移前已存在但缺少 `vendorTaskId` 的 `state = "生成中"` 行标记为 `"生成失败"`，`errorReason = "升级前任务未持久化任务ID"`。
2. THE checkVideoStateList 接口 SHALL 把 `"已提交"` 视为非终态，不返回到响应列表中（保持现有 `whereIn("state", ["生成成功", "生成失败"])` 语义）。
3. THE batchGenerateVideo 接口 SHALL 在响应中保持现有字段 `videoId`、`trackId` 不变。
4. THE getVideoList 接口 SHALL 保持向调用方暴露的 `state` 字段集合稳定；`"已提交"` 与 `"生成中"` 在前端语义上视为同一类"进行中"。
5. WHERE 调用方需要区分 `"已提交"` 与 `"生成中"`，THE Toonflow_App SHALL 在 checkVideoStateList 响应中可选返回 `state` 原值字段（不破坏现有字段）。

### Requirement 7: 供应商任务异常分支处理

**User Story:** 作为 Toonflow 用户，我希望系统对供应商侧任务被清理、长期未完成、查询接口波动等异常情况给出明确处理而不是无限挂起。

#### Acceptance Criteria

1. IF `queryVideoTask` 返回供应商侧错误指明任务已不存在（例如 HTTP 404 或业务码表示 `task_not_found`），THEN THE AiVideo_Runner SHALL 把 `Video_Row.state` 置为 `"生成失败"`、`errorReason = "供应商任务已不存在或已过期"`。
2. IF `queryVideoTask` 在 `Date.now() - submitTime > 24h` 后仍持续返回 `status = "pending"`，THEN THE AiVideo_Runner SHALL 按 Requirement 4.3 触发超时失败。
3. IF 进程在恢复期对同一 `vendorTaskId` 的查询接口连续返回 5xx 服务器错误，THEN THE AiVideo_Runner SHALL 按 Requirement 4.4 累计到 10 次后失败，且每次重试遵循 2s、4s、8s、16s、30s 上限的指数退避。
4. WHEN `urlToBase64` 在终态下载阶段失败，THE AiVideo_Runner SHALL 把 `Video_Row.state` 置为 `"生成失败"` 且 `errorReason` 携带 `"下载视频失败"` 前缀与原始错误信息。
5. IF AiVideo_Runner 在 Poll_Phase 中发现 `Video_Row` 已经被外部置为 Terminal_State（例如用户调用 delVideo 删除了行），THEN THE AiVideo_Runner SHALL 立即停止该任务的轮询循环。

### Requirement 8: 提交与恢复的并发与串行约束

**User Story:** 作为 Toonflow 系统设计者，我希望恢复后的并发轮询与新提交不会破坏现有"按供应商串行提交、最大失败重试 10 次"的语义。

#### Acceptance Criteria

1. THE AiVideo_Runner SHALL 在 Submit_Phase 调用 `withGlobalLock(vendorId + ":video:submit", fn)`，使同一供应商的提交在全局串行执行。
2. THE AiVideo_Runner SHALL 不在 Poll_Phase 内持有 `Submit_Lock_Key` 锁。
3. WHEN Resume_Manager 在启动恢复阶段调度多条 Resumable 行，THE Resume_Manager SHALL 直接进入 Poll_Phase，无需经过 Submit_Phase 锁。
4. WHERE 启动恢复阶段后立刻有新的 batchGenerateVideo 请求到达，THE AiVideo_Runner SHALL 让新请求按 Requirement 8.1 排入 Submit_Lock_Key 队列，与恢复任务的 Poll_Phase 互不阻塞。
5. THE AiVideo_Runner SHALL 对单条 `Vendor_Task_Id` 全局保证最多一个 Poll_Phase 在运行（参见 Requirement 4.8）。

### Requirement 9: 日志与可观测性

**User Story:** 作为运维人员，我需要在日志里清晰区分新提交、被恢复的任务、已经达到终态的任务，以便排查问题。

#### Acceptance Criteria

1. WHEN AiVideo_Runner 进入 Submit_Phase，THE AiVideo_Runner SHALL 输出包含 `videoId`、`vendorId`、`modelName` 的结构化日志，`event = "video_submit_start"`。
2. WHEN AiVideo_Runner 完成 Submit_Phase 并写入 `vendorTaskId`，THE AiVideo_Runner SHALL 输出 `event = "video_submit_done"`，含 `videoId`、`vendorTaskId`。
3. WHEN Resume_Manager 调度一条 Resumable 行，THE Resume_Manager SHALL 输出 `event = "video_resume_scheduled"`，含 `videoId`、`vendorTaskId`、`resumeCount`。
4. WHEN AiVideo_Runner 在 Poll_Phase 收到终态，THE AiVideo_Runner SHALL 输出 `event ∈ {"video_poll_succeeded", "video_poll_failed"}`，含 `videoId`、`pollAttempt`、`durationMs = Date.now() - submitTime`。
5. THE AiVideo_Runner SHALL 不在日志中输出 `submitParams.referenceList` 的 base64 内容。

### Requirement 10: 可被属性测试覆盖的不变量

**User Story:** 作为 Toonflow 维护者，我希望关键正确性以属性方式被测试覆盖，从而在沙箱重构时不会回归。

#### Acceptance Criteria

1. THE Toonflow_App SHALL 满足不变量 INV-1：对任意 `Video_Row`，若 `state ∈ Terminal_State`，则 `state` 在该行后续生命周期内不会再次改变（终态吸收性）。
2. THE Toonflow_App SHALL 满足不变量 INV-2：对任意一次 Submit_Phase 调用序列，`vendorTaskId` 一旦写入数据库则在持有它的 `Video_Row` 上仅会被覆盖为相同值或不被覆盖（taskId 单调写一次）。
3. THE Toonflow_App SHALL 满足不变量 INV-3：对任意 Resumable 行，模拟一个会在有限轮内返回终态的 `queryVideoTask` 序列，Poll_Phase 必在有限步内把行转移到 Terminal_State（终态可达性）。
4. THE Toonflow_App SHALL 满足不变量 INV-4：对一次 `withGlobalLock(key, fn)` 在同一 `key` 下并发触发 N 次的随机交错，所有 `fn` 的开始时间序两两不重叠（提交串行性）。
5. THE Toonflow_App SHALL 满足不变量 INV-5：对任意 `submitParams` 对象，`JSON.parse(JSON.stringify(submitParams))` 经持久化与读取后产生的对象在结构上等价（持久化往返性）；当且仅当原始对象触发 Requirement 1.5 的截断分支，等价定义放宽为去除被标记 `truncated: true` 的字段后的子结构等价。
6. THE Toonflow_App SHALL 满足不变量 INV-6：对任意启动恢复输入集合 R，`Resume_Manager` 调度后所有 `Video_Row.state` ∈ {"已提交", "生成成功", "生成失败"} 中的至少一个，且不存在最终停留在 `"生成中"` 的行（启动后无遗留中间态）。

### Requirement 11: 解析 / 序列化与往返特性

**User Story:** 作为 Toonflow 维护者，我希望 `submitParams` 与 `vendorMeta` 的序列化格式有显式的解析器与打印器，并以往返属性保证持久化稳定性。

#### Acceptance Criteria

1. THE Toonflow_App SHALL 提供 `serializeSubmitParams(params: VideoConfig & { vendorMeta?: any }): string` 序列化器，输出为合法 JSON 字符串。
2. THE Toonflow_App SHALL 提供 `parseSubmitParams(s: string): VideoConfig & { vendorMeta?: any; truncated?: boolean }` 解析器。
3. WHEN `parseSubmitParams` 收到非法 JSON，THE Toonflow_App SHALL 抛出包含原始字符串前 200 字符的错误，且不静默回退。
4. THE Toonflow_App SHALL 满足往返性：对所有未触发截断的 `params`，`parseSubmitParams(serializeSubmitParams(params))` 在结构上等价于 `params`。
5. THE Toonflow_App SHALL 满足幂等性：对所有合法序列化字符串 `s`，`serializeSubmitParams(parseSubmitParams(s))` 在去除键顺序差异后与 `s` 等价。
