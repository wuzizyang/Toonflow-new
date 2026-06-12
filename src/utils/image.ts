import fs from "node:fs/promises";
import fss from "fs";
import path from "node:path";
import sharp from "sharp";

/**
 * 图片缩放选项
 */
export interface ResizeOptions {
  /** 最大宽度（默认 256 */
  width?: number;
  /** 最大高度（默认 256 */
  height?: number;
  /** 缩放策略，默认等比缩放不超出边界 */
  fit?: keyof sharp.FitEnum;
  /** 是否禁止放大（默认 true） */
  withoutEnlargement?: boolean;
}

const defaultResizeOptions: Required<ResizeOptions> = {
  width: 256,
  height: 256,
  fit: "inside",
  withoutEnlargement: true,
};

/**
 * 缩略图最长边封顶（像素）。
 * 百分比缩放模式下，即使原图超大，缩略图最长边也不会超过该上限，
 * 保证缩略图体积处于轻量范围而不随原图无限增大。
 * 注意：仅作用于 percentage 模式；dimensions 模式由调用方显式指定，不受此封顶影响。
 */
export const MAX_THUMB_EDGE = 512;

/**
 * 视频文件扩展名集合（小写，含前导点）。
 * 供 oss.ts / app.ts 在「视频识别分支」中复用，避免在多处硬编码扩展名列表。
 */
export const VIDEO_EXTENSIONS = new Set<string>([
  ".mp4",
  ".mov",
  ".webm",
  ".mkv",
  ".avi",
  ".m4v",
]);

/**
 * 判断给定路径是否为视频文件（按扩展名）。
 * @param filePath 文件路径（绝对或相对均可）
 * @returns 是视频扩展名返回 true，否则 false
 */
export function isVideoFile(filePath: string): boolean {
  return VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

/**
 * 视频占位预览缩略图的尺寸（16:9，最长边远小于 MAX_THUMB_EDGE，保证轻量）。
 * 占位方案不引入 ffmpeg 等依赖，亦不对视频文件调用 sharp，
 * 仅用 sharp 的 `create` API 合成一张统一的小占位图作为列表预览。
 */
const VIDEO_PLACEHOLDER_WIDTH = 320;
const VIDEO_PLACEHOLDER_HEIGHT = 180;

/**
 * 将图片缩放后写入目标路径（自动创建父目录）。
 * @param srcPath 源图片绝对路径
 * @param dstPath 目标图片绝对路径
 * @param opts 缩放选项
 */
export async function resizeImage(srcPath: string, dstPath: string, opts?: ResizeOptions): Promise<void> {
  const { width, height, fit, withoutEnlargement } = { ...defaultResizeOptions, ...opts };
  await fs.mkdir(path.dirname(dstPath), { recursive: true });
  await sharp(srcPath).resize(width, height, { fit, withoutEnlargement }).toFile(dstPath);
}

/**
 * 缩略图自定义尺寸选项
 */
export type ThumbnailSize =
  | { type: "dimensions"; width: number; height: number }
  | { type: "percentage"; value: number };

/**
 * 生成缩略图。
 * - 若缩略图已存在，直接返回其路径。
 * - 若不存在，生成后返回目标路径；生成失败返回 null。
 *
 * @param originalPath 原图绝对路径
 * @param thumbnailPath 缩略图绝对路径
 * @param size 可选的自定义尺寸：固定宽高 或 百分比（默认 256x256 inside）
 * @returns 缩略图路径，失败返回 null
 */
export async function ensureThumbnail(
  originalPath: string,
  thumbnailPath: string,
  size?: ThumbnailSize,
): Promise<string | null> {
  // 小图已存在，直接返回
  if (fss.existsSync(thumbnailPath)) {
    return thumbnailPath;
  }
  // 原图不存在，无法生成
  if (!fss.existsSync(originalPath)) {
    return null;
  }
  try {
    if (size?.type === "percentage") {
      // 百分比缩放：先获取原图尺寸，再等比计算目标尺寸
      const meta = await sharp(originalPath).metadata();
      if (!meta.width || !meta.height) {
        console.warn("[image] 无法获取原图尺寸:", originalPath);
        return null;
      }
      const pct = size.value / 100;
      let w = Math.round(meta.width * pct);
      let h = Math.round(meta.height * pct);
      // 最大边界封顶：保证缩略图最长边 ≤ MAX_THUMB_EDGE。
      // 当百分比缩放后的最长边超过上限时，按比例同步收缩 w/h，维持原图宽高比。
      const longestEdge = Math.max(w, h);
      if (longestEdge > MAX_THUMB_EDGE) {
        const capScale = MAX_THUMB_EDGE / longestEdge;
        w = Math.max(1, Math.round(w * capScale));
        h = Math.max(1, Math.round(h * capScale));
      }
      await resizeImage(originalPath, thumbnailPath, { width: w, height: h });
    } else if (size?.type === "dimensions") {
      // 固定宽高：等比缩放适配到指定边界
      await resizeImage(originalPath, thumbnailPath, {
        width: size.width,
        height: size.height,
      });
    } else {
      // 默认 256x256 inside
      await resizeImage(originalPath, thumbnailPath);
    }
    console.info(`[${thumbnailPath}] 小图生成成功`);
    return thumbnailPath;
  } catch (e) {
    console.warn("[image] 生成缩略图失败:", e);
    return null;
  }
}

/**
 * 生成（并缓存）视频的轻量预览缩略图。
 *
 * 决策说明（任务 3.2 决策点）：仓库当前无 ffmpeg 依赖，采用「占位预览（placeholder
 * preview）」最小可行方案 —— **不引入任何新依赖、不对视频文件调用 sharp**。
 * 本函数仅用 sharp 的 `create` API 合成一张统一的小占位图（合成纯色图属于生成新图像，
 * 不会读取/解码视频字节），作为列表展示用的轻量资源。这样 `/oss` 中间件（任务 3.4）与
 * `oss.ts`（任务 3.3）即可通过该缩略图提供轻量预览，而非降级返回整段视频文件。
 *
 * 行为契约（与 {@link ensureThumbnail} 保持一致）：
 * - 若占位缩略图已存在（热缓存），直接返回其路径，不重新生成。
 * - 生成成功返回缩略图路径；失败返回 `null`（null-on-failure）。
 * - 不带预览标记的视频原文件下载链路由 app.ts/oss.ts 维护，本函数不触碰原视频文件，
 *   因此不会破坏视频原文件下载（保留 3.3）。
 *
 * @param videoPath 原视频绝对路径（仅用于校验存在性与扩展名，不会被 sharp 处理）
 * @param thumbnailPath 占位预览缩略图的输出绝对路径
 * @returns 缩略图路径，失败返回 null
 */
export async function ensureVideoThumbnail(videoPath: string, thumbnailPath: string): Promise<string | null> {
  // 占位预览已存在，直接返回（热缓存命中）
  if (fss.existsSync(thumbnailPath)) {
    return thumbnailPath;
  }
  // 原视频不存在，无法为其生成预览
  if (!fss.existsSync(videoPath)) {
    return null;
  }
  try {
    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
    // 注意：此处 **不对视频调用 sharp**，仅用 sharp.create 合成一张统一的小占位图。
    // 最长边（320）远小于 MAX_THUMB_EDGE，保证预览资源轻量。
    await sharp({
      create: {
        width: VIDEO_PLACEHOLDER_WIDTH,
        height: VIDEO_PLACEHOLDER_HEIGHT,
        channels: 3,
        background: { r: 32, g: 32, b: 40 },
      },
    })
      .jpeg({ quality: 70 })
      .toFile(thumbnailPath);
    console.info(`[${thumbnailPath}] 视频占位预览生成成功`);
    return thumbnailPath;
  } catch (e) {
    console.warn("[image] 生成视频占位预览失败:", e);
    return null;
  }
}
