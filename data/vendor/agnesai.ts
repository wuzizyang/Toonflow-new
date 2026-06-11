/**
 * Toonflow AI供应商模板 - AgnesAI
 * @version 2.0
 */

// ============================================================
// 类型定义
// ============================================================

type VideoMode =
  | "singleImage"
  | "startEndRequired"
  | "endFrameOptional"
  | "startFrameOptional"
  | "text"
  | (`videoReference:${number}` | `imageReference:${number}` | `audioReference:${number}`)[];

interface TextModel {
  name: string;
  modelName: string;
  type: "text";
  think: boolean;
}

interface ImageModel {
  name: string;
  modelName: string;
  type: "image";
  mode: ("text" | "singleImage" | "multiReference")[];
  associationSkills?: string;
}

interface VideoModel {
  name: string;
  modelName: string;
  type: "video";
  mode: VideoMode[];
  associationSkills?: string;
  audio: "optional" | false | true;
  durationResolutionMap: { duration: number[]; resolution: string[] }[];
}

interface TTSModel {
  name: string;
  modelName: string;
  type: "tts";
  voices: { title: string; voice: string }[];
}

interface VendorConfig {
  id: string;
  version: string;
  name: string;
  author: string;
  description?: string;
  icon?: string;
  inputs: { key: string; label: string; type: "text" | "password" | "url"; required: boolean; placeholder?: string }[];
  inputValues: Record<string, string>;
  models: (TextModel | ImageModel | VideoModel | TTSModel)[];
}

type ReferenceList =
  | { type: "image"; sourceType: "base64"; base64: string }
  | { type: "audio"; sourceType: "base64"; base64: string }
  | { type: "video"; sourceType: "base64"; base64: string };

interface ImageConfig {
  prompt: string;
  referenceList?: Extract<ReferenceList, { type: "image" }>[];
  size: "1K" | "2K" | "4K";
  aspectRatio: `${number}:${number}`;
}

interface VideoConfig {
  duration: number;
  resolution: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
  referenceList?: ReferenceList[];
  audio?: boolean;
  mode: VideoMode[];
}

interface TTSConfig {
  text: string;
  voice: string;
  speechRate: number;
  pitchRate: number;
  volume: number;
  referenceList?: Extract<ReferenceList, { type: "audio" }>[];
}

interface PollResult {
  completed: boolean;
  data?: string;
  error?: string;
}

// ============================================================
// 全局声明
// ============================================================

declare const axios: any;
declare const logger: (msg: string) => void;
declare const jsonwebtoken: any;
declare const zipImage: (base64: string, size: number) => Promise<string>;
declare const zipImageResolution: (base64: string, w: number, h: number) => Promise<string>;
declare const mergeImages: (base64Arr: string[], maxSize?: string) => Promise<string>;
declare const urlToBase64: (url: string) => Promise<string>;
declare const pollTask: (fn: () => Promise<PollResult>, interval?: number, timeout?: number) => Promise<PollResult>;
declare const withGlobalLock: <T>(key: string, fn: () => Promise<T>) => Promise<T>;
declare const createOpenAI: any;
declare const createDeepSeek: any;
declare const createZhipu: any;
declare const createQwen: any;
declare const createAnthropic: any;
declare const createOpenAICompatible: any;
declare const createXai: any;
declare const createMinimax: any;
declare const createGoogleGenerativeAI: any;
declare const exports: {
  vendor: VendorConfig;
  textRequest: (m: TextModel, t: boolean, tl: 0 | 1 | 2 | 3) => any;
  imageRequest: (c: ImageConfig, m: ImageModel) => Promise<string>;
  videoRequest: (c: VideoConfig, m: VideoModel) => Promise<string>;
  ttsRequest: (c: TTSConfig, m: TTSModel) => Promise<string>;
  checkForUpdates?: () => Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }>;
  updateVendor?: () => Promise<string>;
};

// ============================================================
// 供应商配置
// ============================================================

const vendor: VendorConfig = {
  id: "agnesai",
  version: "2.1",
  author: "Toonflow",
  name: "AgnesAI",
  description:
    "AgnesAI 官方平台，全球前十 AI Lab。\n\n覆盖文本、图片、视频三大模态，采用 OpenAI 兼容协议，一分钟快速接入。\n\n支持图片模型（Agnes Image 2.0 Flash 图生图/多图合成、Agnes Image 2.1 Flash 文生图）和视频模型（Agnes Video V2.0）。\n\n[前往平台获取 API Key](https://platform.agnes-ai.com)",
  inputs: [
    { key: "apiKey", label: "API密钥", type: "password", required: true, placeholder: "请输入AgnesAI的API Key" },
    { key: "baseUrl", label: "请求地址", type: "url", required: true, placeholder: "https://apihub.agnes-ai.com/v1" },
  ],
  inputValues: { apiKey: "", baseUrl: "https://apihub.agnes-ai.com/v1" },
  models: [
    // 图片模型
    {
      name: "Agnes Image 2.0 Flash",
      modelName: "agnes-image-2.0-flash",
      type: "image",
      mode: ["text", "singleImage", "multiReference"],
      associationSkills: "支持图生图和多图合成，适合图片编辑和风格转换场景",
    },
    {
      name: "Agnes Image 2.1 Flash",
      modelName: "agnes-image-2.1-flash",
      type: "image",
      mode: ["text"],
      associationSkills: "纯文生图模型，适合从文本描述直接生成高质量图片",
    },
    // 视频模型
    {
      name: "Agnes Video V2.0",
      modelName: "agnes-video-v2.0",
      type: "video",
      mode: ["text", "singleImage", "endFrameOptional"],
      audio: "optional",
      durationResolutionMap: [
        { duration: [5], resolution: ["720p", "1080p"] },
        { duration: [10], resolution: ["720p", "1080p"] },
      ],
      associationSkills: "支持文生视频和图生视频，可根据首帧图片和文本提示生成视频",
    },
  ],
};

// ============================================================
// 辅助工具
// ============================================================

/**
 * 获取认证请求头
 */
const getHeaders = (): Record<string, string> => {
  const apiKey = vendor.inputValues.apiKey.replace(/^Bearer\s+/i, "");
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
};

/**
 * 根据 size 和 aspectRatio 计算图片尺寸字符串
 */
const getImageSize = (size: string, aspectRatio: string): string => {
  const sizeMap: Record<string, Record<string, string>> = {
    "16:9": { "1K": "1920x1080", "2K": "2560x1440", "4K": "3840x2160" },
    "9:16": { "1K": "1080x1920", "2K": "1440x2560", "4K": "2160x3840" },
    "1:1": { "1K": "1024x1024", "2K": "2048x2048", "4K": "4096x4096" },
  };
  return (sizeMap as any)[aspectRatio]?.[size] || (sizeMap as any)[aspectRatio]?.["1K"] || "1024x1024";
};

/**
 * 根据 resolution 和 aspectRatio 计算视频分辨率（宽x高）
 */
const getVideoResolution = (resolution: string, aspectRatio: string): { width: number; height: number } => {
  const resMap: Record<string, { "16:9": { w: number; h: number }; "9:16": { w: number; h: number } }> = {
    "720p": { "16:9": { w: 1280, h: 720 }, "9:16": { w: 720, h: 1280 } },
    "1080p": { "16:9": { w: 1920, h: 1080 }, "9:16": { w: 1080, h: 1920 } },
  };
  const entry: { w: number; h: number } = (resMap as any)[resolution]?.[aspectRatio] || { w: 1152, h: 768 };
  return { width: entry.w, height: entry.h };
};

/**
 * 将 ReferenceList 中的 base64 转为带 Data URI 头的字符串。
 * Agnes Image API 文档显式支持 data:image/...;base64,... 形式（示例 5），
 * 不带头时部分网关会解码失败导致 PIL "cannot identify image file"。
 */
const toDataUri = (base64: string): string => {
  if (!base64) return base64;
  return base64.startsWith("data:") ? base64 : `data:image/jpeg;base64,${base64}`;
};

/**
 * 视频接口仅文档化了 URL 输入；当传入 base64 时，多数兼容实现会
 * 将整段字符串（含 data:image/...;base64, 前缀）作为 base64 解码，
 * 解码后字节并非有效图片，导致服务端 PIL 报 "cannot identify image file"。
 * 因此对视频接口去掉 Data URI 前缀，只发送纯 base64。
 */
const toRawBase64 = (base64: string): string => {
  if (!base64) return base64;
  return base64.replace(/^data:[^;]+;base64,/, "");
};

/**
 * 将 duration（秒）和帧率换算为满足约束（≤441 且 8n+1）的 num_frames。
 * 文档：num_frames ≤ 441 且 num_frames = 8n + 1（如 81, 121, 161, 241, 441）。
 */
const calcNumFrames = (durationSec: number, frameRate: number): number => {
  const target = Math.max(1, Math.round(durationSec * frameRate));
  // 向上对齐到 8n+1
  const n = Math.ceil((target - 1) / 8);
  let frames = 8 * n + 1;
  if (frames < 9) frames = 9; // 最小 8*1+1 = 9
  if (frames > 441) frames = 441;
  return frames;
};

// ============================================================
// 适配器函数
// ============================================================

const textRequest = (model: TextModel, think: boolean, thinkLevel: 0 | 1 | 2 | 3) => {
  throw new Error("AgnesAI暂不支持文本模型");
};

const imageRequest = async (config: ImageConfig, model: ImageModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("缺少API Key");

  const baseUrl = vendor.inputValues.baseUrl.replace(/\/$/, "");
  const imageRefs = config.referenceList || [];

  const requestBody: any = {
    model: model.modelName,
    prompt: config.prompt,
    size: getImageSize(config.size, config.aspectRatio),
  };

  // 文档约定（agnes-image-2.0-flash / agnes-image-2.1-flash 共用）：
  // - 文生图返回 Base64：使用顶层 return_base64: true；
  //   将 response_format=b64_json 放进 extra_body 在文生图场景会触发网关 InternalServerError。
  // - 图生图返回 Base64：将 image 数组与 response_format=b64_json 同时放在 extra_body 内；
  //   image 支持公网 URL 或 Data URI Base64（data:image/...;base64,...），无需传 tags。
  if (imageRefs.length > 0) {
    requestBody.extra_body = {
      image: imageRefs.map((ref) => toDataUri(ref.base64)),
      response_format: "b64_json",
    };
    logger(`图生图模式，参考图片数: ${imageRefs.length}`);
  } else {
    requestBody.return_base64 = true;
    logger("文生图模式");
  }

  logger(`开始生成图片，模型: ${model.modelName}`);
  logger(
    `请求体: ${JSON.stringify({
      ...requestBody,
      extra_body: requestBody.extra_body
        ? {
            ...requestBody.extra_body,
            image: requestBody.extra_body.image
              ? `[${requestBody.extra_body.image.length}张图片]`
              : undefined,
          }
        : undefined,
    })}`,
  );

  const response = await axios.post(`${baseUrl}/images/generations`, requestBody, {
    headers: getHeaders(),
  });

  // 解析响应，提取图片数据
  const responseData = response.data;
  if (responseData.data && responseData.data.length > 0) {
    const imageData = responseData.data[0];
    if (imageData.b64_json) {
      logger("图片生成完成");
      return `data:image/png;base64,${imageData.b64_json}`;
    }
    if (imageData.url) {
      logger("图片生成完成，正在转换URL为Base64...");
      return await urlToBase64(imageData.url);
    }
    throw new Error("图片生成响应中未找到有效数据");
  }

  throw new Error(`图片生成失败: ${JSON.stringify(responseData)}`);
};

// 轮询队列：确保多任务时单线程遍历轮询，避免并发轮询造成资源浪费
let pollQueue: Promise<any> = Promise.resolve();

function enqueuePoll(fn: () => Promise<PollResult>, interval?: number, timeout?: number): Promise<PollResult> {
  const p = pollQueue.then(() => pollTask(fn, interval, timeout));
  pollQueue = p.catch(() => {});
  return p;
}

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("缺少API Key");

  const baseUrl = vendor.inputValues.baseUrl.replace(/\/$/, "");
  const { width, height } = getVideoResolution(config.resolution, config.aspectRatio);
  const imageRefs = (config.referenceList || []).filter((r) => r.type === "image");

  const currentMode = config.mode || [];
  const isSingleImage = currentMode.includes("singleImage");
  const isEndFrameOptional = currentMode.includes("endFrameOptional");
  const isStartEndRequired = currentMode.includes("startEndRequired");

  // 文档约束：num_frames ≤ 441 且为 8n + 1（如 81, 121, 161, 241, 441），frame_rate 1-60
  const frameRate = 24;
  const numFrames = calcNumFrames(config.duration, frameRate);

  const requestBody: any = {
    model: model.modelName,
    prompt: config.prompt || "根据参考图片生成视频",
    width,
    height,
    num_frames: numFrames,
    frame_rate: frameRate,
  };

  // 处理图生视频 / 多图模式
  // 文档说明：
  // - 单图：顶层 image 为单个 URL/Data URI 字符串（示例 2）
  // - 多图 / 首尾帧：extra_body.image 为数组（示例 3）
  // - 关键帧动画：extra_body.image + extra_body.mode = "keyframes"（示例 4）
  // 注意：服务端只接受公网 URL 或纯 base64 字节流；带 data: 前缀的 Data URI
  // 在视频接口上会被作为 base64 整体解码导致服务端 PIL 解析失败。
  if (isSingleImage && imageRefs.length > 0) {
    requestBody.image = toRawBase64(imageRefs[0].base64);
    logger("单图参考模式");
  } else if (isStartEndRequired && imageRefs.length >= 2) {
    requestBody.extra_body = {
      ...(requestBody.extra_body || {}),
      image: imageRefs.slice(0, 2).map((r) => toRawBase64(r.base64)),
      mode: "keyframes",
    };
    logger("首尾帧（关键帧）模式");
  } else if (isEndFrameOptional && imageRefs.length >= 1) {
    if (imageRefs.length >= 2) {
      requestBody.extra_body = {
        ...(requestBody.extra_body || {}),
        image: imageRefs.slice(0, 2).map((r) => toRawBase64(r.base64)),
        mode: "keyframes",
      };
      logger("首尾帧（关键帧）模式（尾帧已提供）");
    } else {
      requestBody.image = toRawBase64(imageRefs[0].base64);
      logger("首帧参考模式（尾帧未提供）");
    }
  }

  logger(`开始提交视频生成任务，模型: ${model.modelName}, 时长: ${config.duration}s, 帧数: ${numFrames}, 分辨率: ${width}x${height}`);

  // 提交任务：跨任务串行 + 最多重试 10 次
  const MAX_SUBMIT_ATTEMPTS = 10;
  const taskInfo: { id: string; videoId?: string } = await withGlobalLock<{ id: string; videoId?: string }>(
    "agnesai:video:submit",
    async () => {
      let lastError: any = null;
      for (let attempt = 1; attempt <= MAX_SUBMIT_ATTEMPTS; attempt++) {
        try {
          const submitResp = await axios.post(`${baseUrl}/videos`, requestBody, {
            headers: getHeaders(),
          });
          const data = submitResp.data || {};
          const id = data.id || data.task_id;
          const videoId = data.video_id;
          if (!id && !videoId) {
            throw new Error(`提交视频任务失败: ${JSON.stringify(data)}`);
          }
          if (attempt > 1) logger(`第${attempt}次重试提交成功`);
          return { id: id || videoId, videoId };
        } catch (e: any) {
          lastError = e;
          const msg = e?.response?.data ? JSON.stringify(e.response.data) : e?.message || String(e);
          logger(`提交视频任务失败（第${attempt}/${MAX_SUBMIT_ATTEMPTS}次）：${msg}`);
          if (attempt < MAX_SUBMIT_ATTEMPTS) {
            // 指数退避：2s, 4s, 8s, ... 上限 30s
            const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }
      throw new Error(
        `提交视频任务失败，已重试${MAX_SUBMIT_ATTEMPTS}次：${lastError?.response?.data ? JSON.stringify(lastError.response.data) : lastError?.message || String(lastError)}`,
      );
    },
  );

  const taskId = taskInfo.id;
  const videoId = taskInfo.videoId;
  logger(`任务已提交，task_id: ${taskId}${videoId ? `, video_id: ${videoId}` : ""}`);

  // 轮询等待结果（通过队列串行执行，多任务时不并发轮询）
  // 优先使用 video_id 走推荐查询路径，回退到旧版 /v1/videos/{task_id}
  const result = await enqueuePoll(
    async () => {
      try {
        const queryResp = videoId
          ? await axios.get(`${baseUrl.replace(/\/v1$/, "")}/agnesapi`, {
              params: { video_id: videoId, model_name: model.modelName },
              headers: getHeaders(),
            })
          : await axios.get(`${baseUrl}/videos/${taskId}`, {
              headers: getHeaders(),
            });

        const taskData = queryResp.data || {};
        const status = String(taskData.status || "").toLowerCase();
        logger(`轮询中... 任务状态: ${status}, 进度: ${taskData.progress ?? 0}%`);

        if (status === "completed" || status === "success" || status === "succeeded") {
          // 文档：completed 时最终视频 URL 放在 remixed_from_video_id 字段
          const videoUrl =
            taskData.remixed_from_video_id ||
            taskData.video_url ||
            taskData.url ||
            taskData.data?.url ||
            taskData.result?.url;
          if (!videoUrl || typeof videoUrl !== "string" || !/^https?:\/\//i.test(videoUrl)) {
            return { completed: true, error: `任务完成但未获取到视频URL: ${JSON.stringify(taskData)}` };
          }
          return { completed: true, data: videoUrl };
        }

        if (status === "failed") {
          // taskData.error 可能是对象，需拍平为字符串避免 [object Object]
          const raw = taskData.error ?? taskData.message ?? taskData.failure_reason;
          let errorMsg: string;
          if (raw == null) {
            errorMsg = `视频生成失败: ${JSON.stringify(taskData)}`;
          } else if (typeof raw === "string") {
            errorMsg = raw;
          } else if (typeof raw === "object") {
            errorMsg = (raw as any).message || (raw as any).msg || (raw as any).reason || JSON.stringify(raw);
          } else {
            errorMsg = String(raw);
          }
          return { completed: true, error: errorMsg };
        }

        // queued / in_progress 等中间状态继续轮询
        return { completed: false };
      } catch (e: any) {
        // 4xx 应当终止轮询，避免一直耗时间后才暴露真实错误
        const httpStatus = e?.response?.status;
        const detail = e?.response?.data
          ? typeof e.response.data === "string"
            ? e.response.data
            : JSON.stringify(e.response.data)
          : "";
        const msg = e?.message || String(e);
        if (httpStatus && httpStatus >= 400 && httpStatus < 500 && httpStatus !== 429) {
          return { completed: true, error: detail ? `${msg} | ${detail}` : msg };
        }
        return { completed: false, error: detail ? `${msg} | ${detail}` : msg };
      }
    },
    60000,
    172800000,
  );

  if (result.error) throw new Error(typeof result.error === "string" ? result.error : JSON.stringify(result.error));
  logger("视频生成完成，正在转换为Base64...");
  return await urlToBase64(result.data!);
};

const ttsRequest = async (config: TTSConfig, model: TTSModel): Promise<string> => {
  return "";
};

const checkForUpdates = async (): Promise<{ hasUpdate: boolean; latestVersion: string; notice: string }> => {
  return { hasUpdate: false, latestVersion: "1.0", notice: "## 新版本更新公告" };
};

const updateVendor = async (): Promise<string> => {
  return "";
};

// ============================================================
// 导出
// ============================================================

exports.vendor = vendor;
exports.textRequest = textRequest;
exports.imageRequest = imageRequest;
exports.videoRequest = videoRequest;
exports.ttsRequest = ttsRequest;
exports.checkForUpdates = checkForUpdates;
exports.updateVendor = updateVendor;

// 这行代码用于确保当前文件被识别为模块，避免全局变量冲突
export {};