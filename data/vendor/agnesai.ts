/**
 * Toonflow AI供应商模板 - AgnesAI
 * @version 1.0
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
  version: "1.0",
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
  };
  return (sizeMap as any)[aspectRatio]?.[size] || "1024x768";
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
  };

  // 图生图模式（单图或多图参考），tags 和 image 需要放在顶层而非 extra_body
  if (imageRefs.length > 0) {
    requestBody.tags = ["img2img"];
    requestBody.image = imageRefs.map((ref) => ref.base64);
    logger(`图生图模式，参考图片数: ${imageRefs.length}`);
  }

  logger(`开始生成图片，模型: ${model.modelName}`);
  logger(`请求体: ${JSON.stringify({ ...requestBody, image: requestBody.image ? `[${requestBody.image.length}张图片]` : undefined })}`);

  const response = await axios.post(`${baseUrl}/images/generations`, requestBody, {
    headers: getHeaders(),
  });

  // 解析响应，提取图片数据
  const responseData = response.data;
  if (responseData.data && responseData.data.length > 0) {
    const imageData = responseData.data[0];
    // 返回 URL 或 base64
    if (imageData.url) {
      logger("图片生成完成，正在转换URL为Base64...");
      return await urlToBase64(imageData.url);
    }
    if (imageData.b64_json) {
      logger("图片生成完成");
      return `data:image/png;base64,${imageData.b64_json}`;
    }
    throw new Error("图片生成响应中未找到有效数据");
  }

  throw new Error(`图片生成失败: ${JSON.stringify(responseData)}`);
};

const videoRequest = async (config: VideoConfig, model: VideoModel): Promise<string> => {
  if (!vendor.inputValues.apiKey) throw new Error("缺少API Key");

  const baseUrl = vendor.inputValues.baseUrl.replace(/\/$/, "");
  const { width, height } = getVideoResolution(config.resolution, config.aspectRatio);
  const imageRefs = (config.referenceList || []).filter((r) => r.type === "image");

  const currentMode = config.mode;
  const isText = currentMode.includes("text");
  const isSingleImage = currentMode.includes("singleImage");
  const isEndFrameOptional = currentMode.includes("endFrameOptional");
  const isStartEndRequired = currentMode.includes("startEndRequired");

  // 计算帧数（基于时长和帧率 24fps）
  const frameRate = 24;
  const numFrames = config.duration * frameRate;

  const requestBody: any = {
    model: model.modelName,
    prompt: config.prompt || "根据参考图片生成视频",
    width: width,
    height: height,
    num_frames: numFrames,
    frame_rate: frameRate,
  };

  // 处理图生视频模式（单图 / 首尾帧）
  if (isSingleImage && imageRefs.length > 0) {
    requestBody.image = imageRefs[0].base64;
    logger("单图参考模式");
  } else if (isStartEndRequired && imageRefs.length >= 2) {
    requestBody.image = imageRefs[0].base64;
    requestBody.last_frame = imageRefs[1].base64;
    logger("首尾帧模式");
  } else if (isEndFrameOptional && imageRefs.length >= 1) {
    requestBody.image = imageRefs[0].base64;
    if (imageRefs.length >= 2) {
      requestBody.last_frame = imageRefs[1].base64;
    }
    logger(`首帧参考模式（尾帧${imageRefs.length >= 2 ? "已" : "未"}提供）`);
  }

  // 音频配置
  if (config.audio === true) {
    requestBody.audio = true;
  }

  logger(`开始提交视频生成任务，模型: ${model.modelName}, 时长: ${config.duration}s, 分辨率: ${config.resolution}`);

  // 提交任务
  const submitResp = await axios.post(`${baseUrl}/videos`, requestBody, {
    headers: getHeaders(),
  });

  const taskId = submitResp.data.id;
  if (!taskId) {
    throw new Error(`提交视频任务失败: ${JSON.stringify(submitResp.data)}`);
  }
  logger(`任务已提交，任务ID: ${taskId}`);

  // 轮询等待结果
  const result = await pollTask(
    async () => {
      const queryResp = await axios.get(`${baseUrl}/videos/${taskId}`, {
        headers: getHeaders(),
      });

      const taskData = queryResp.data;
      const status = taskData.status;
      logger(`轮询中... 任务状态: ${status}`);

      if (status === "SUCCESS" || status === "completed") {
        const videoUrl = taskData.url || taskData.data?.url || taskData.result?.url;
        if (!videoUrl) {
          return { completed: true, error: "任务完成但未获取到视频URL" };
        }
        return { completed: true, data: videoUrl };
      }

      if (status === "FAILED" || status === "failed") {
        const errorMsg = taskData.message || taskData.error || "视频生成失败";
        return { completed: true, error: errorMsg };
      }

      return { completed: false };
    },
    5000,
    600000,
  );

  if (result.error) throw new Error(result.error);
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