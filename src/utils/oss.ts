import isPathInside from "is-path-inside";
import getPath, { isEletron } from "@/utils/getPath";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { MAX_THUMB_EDGE, isVideoFile } from "@/utils/image";

/**
 * 列表缩略图默认百分比（保留历史 `?size=20` 语义：原图 20% 等比缩放，并受
 * image.ts 的 MAX_THUMB_EDGE 封顶约束）。
 */
const DEFAULT_THUMB_PERCENT = 20;

/**
 * URL / 标记约定（与 `src/app.ts` 的 `/oss` 中间件、任务 3.4 共享，务必保持一致）：
 *
 * - 图片缩略图：沿用 `?size=<pct>`（百分比，如 `?size=20`）或 `?size=<W>x<H>`（维度，如
 *   `?size=200x300`）。中间件解析该参数并调用 `ensureThumbnail` 生成/返回受封顶约束的缩略图。
 * - 视频轻量预览：使用 `?preview=1` 预览标记。中间件识别到视频路径 + 该标记时，路由到
 *   `ensureVideoThumbnail`（任务 3.2 的入口）返回首帧/封面占位预览，而非让视频走 `?size=`
 *   图片缩略图通道（缺陷 1.3）。**不带 `?preview=1` 的视频 URL 仍由 `express.static` 返回
 *   完整原文件（保留 3.3 的视频下载链路）。**
 * - 缩略图缓存命名：`smallImage/<dir>/<base>_<pct>p<ext>`（百分比模式 sizeSubDir = `<pct>p`），
 *   与中间件写入缓存的路径完全一致，从而 `getSmallImageUrl` 命中热缓存时可直接返回缓存 URL。
 */
const VIDEO_PREVIEW_QUERY = "preview=1";

// 规范化路径：去除前导斜杠，并将路径分隔符统一转换为系统分隔符
function normalizeUserPath(userPath: string): string {
  // 去除前导的 / 或 \
  const trimmedPath = userPath.replace(/^[/\\]+/, "");
  // 将所有 / 替换为系统路径分隔符（path.sep）
  // 这样在 Windows 上会转为 \，在 Unix 上保持 /
  return trimmedPath.split("/").join(path.sep);
}

// 校验路径
function resolveSafeLocalPath(userPath: string, rootDir: string): string {
  const safePath = normalizeUserPath(userPath);
  const absPath = path.join(rootDir, safePath);
  if (!isPathInside(absPath, rootDir)) {
    throw new Error(`${userPath} 不在 OSS 根目录内`);
  }
  return absPath;
}

class OSS {
  private rootDir: string;
  private initPromise: Promise<void>;

  constructor() {
    this.rootDir = getPath("oss");
    // 初始化时自动创建根目录
    this.initPromise = fs.mkdir(this.rootDir, { recursive: true }).then(() => {});
  }

  /**
   * 等待根目录初始化完成。用于保证所有文件操作在目录已创建后执行。
   * @private
   */
  private async ensureInit() {
    await this.initPromise;
  }

  /**
   * 获取指定相对路径文件的访问 URL。
   * @param userRelPath 用户传入的相对文件路径（使用 / 作为分隔符）
   * @returns 文件的 http 链接（本地服务地址）
   */
  async getFileUrl(userRelPath: string, prefix?: string): Promise<string> {
    if (!prefix) prefix = "oss";
    await this.ensureInit();
    const safePath = normalizeUserPath(userRelPath);
    // URL 始终使用 /，所以这里需要将系统分隔符转回 /
    let url = `/${prefix}/`;
    if (process.env.ossURL && process.env.ossURL !== "") url = process.env.ossURL + `/${prefix}/`;
    if (isEletron()) url = `http://localhost:${process.env.PORT}/${prefix}/`;
    return `${url}${safePath.split(path.sep).join("/")}`;
  }

  /**
   * 读取指定路径的文件内容为 Buffer。
   * @param userRelPath 用户传入的相对文件路径（使用 / 作为分隔符）
   * @returns 文件内容的 Buffer
   * @throws 路径不在 OSS 根目录内、文件不存在等错误
   */
  async getFile(userRelPath: string): Promise<Buffer> {
    await this.ensureInit();
    return fs.readFile(resolveSafeLocalPath(userRelPath, this.rootDir));
  }

  /**
   * 读取图片文件并转换为 base64 编码的 Data URL。
   * @param userRelPath 用户传入的相对文件路径（使用 / 作为分隔符）
   * @returns base64 编码的 Data URL (例如: data:image/png;base64,iVBORw0KGgo...)
   * @throws 路径不在 OSS 根目录内、文件不存在、不是图片文件等错误
   */
  async getImageBase64(userRelPath: string): Promise<string> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);

    // 检查文件是否存在且为文件
    const stat = await fs.stat(absPath);
    if (!stat.isFile()) {
      throw new Error(`${userRelPath} 不是文件`);
    }

    // 获取文件扩展名并确定 MIME 类型
    const ext = path.extname(userRelPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".bmp": "image/bmp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".tiff": "image/tiff",
      ".tif": "image/tiff",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
    };

    const mimeType = mimeTypes[ext];
    if (!mimeType) {
      throw new Error(`不支持的图片格式: ${ext}。支持的格式: ${Object.keys(mimeTypes).join(", ")}`);
    }

    // 读取文件并转换为 base64
    const data = await fs.readFile(absPath);
    const base64 = data.toString("base64");
    // 返回完整的 Data URL
    return `data:${mimeType};base64,${base64}`;
  }
  /**
   * 删除指定路径的文件。
   * @param userRelPath 用户传入的相对文件路径（使用 / 作为分隔符）
   * @throws 路径不在 OSS 根目录内、文件不存在等错误
   */
  async deleteFile(userRelPath: string): Promise<void> {
    await this.ensureInit();
    await fs.unlink(resolveSafeLocalPath(userRelPath, this.rootDir));
  }

  /**
   * 删除指定路径的文件夹及其所有内容。
   * @param userRelPath 用户传入的相对文件夹路径（使用 / 作为分隔符）
   * @throws 路径不在 OSS 根目录内、文件夹不存在、目标是文件而非文件夹等错误
   */
  async deleteDirectory(userRelPath: string): Promise<void> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);
    const stat = await fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`${userRelPath} 不是文件夹`);
    }
    await fs.rm(absPath, { recursive: true, force: true });
  }

  /**
   * 将数据写入指定路径的新文件或覆盖已有文件。
   * 写入前自动创建所需的父文件夹。
   * @param userRelPath 用户传入的相对文件路径（使用 / 作为分隔符）
   * @param data 要写入的数据，可以为 Buffer 或字符串
   * @throws 路径不在 OSS 根目录内等错误
   */
  async writeFile(userRelPath: string, data: Buffer | string): Promise<void> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    // 如果 data 是 string，则视为 base64 编码，先解码再写入
    // 自动去除可能存在的 Data URL 前缀（如 "data:image/png;base64,"）
    const buffer = typeof data === "string" ? Buffer.from(data.replace(/^data:[^;]+;base64,/, ""), "base64") : data;
    await fs.writeFile(absPath, buffer);
  }

  /**
   * 检查指定路径文件是否存在。
   * @param userRelPath 用户传入的相对文件路径（使用 / 作为分隔符）
   * @returns 文件存在返回 true，否则 false
   */
  async fileExists(userRelPath: string): Promise<boolean> {
    await this.ensureInit();
    try {
      const stat = await fs.stat(resolveSafeLocalPath(userRelPath, this.rootDir));
      return stat.isFile();
    } catch {
      return false;
    }
  }

  /**
   * 计算某个相对路径在指定百分比缩略图模式下的 smallImage 缓存相对路径。
   * 命名规则与 `/oss` 中间件写入缓存的规则完全一致：
   *   `smallImage/<dir>/<base>_<pct>p<ext>`
   * @param userRelPath 原图相对路径
   * @param pct 百分比（如 20）
   * @returns smallImage 缓存相对路径（使用 / 分隔符）
   */
  private buildThumbCacheRelPath(userRelPath: string, pct: number): string {
    const cleaned = userRelPath.replace(/^[/\\]+/, "");
    const ext = path.extname(cleaned);
    const base = path.basename(cleaned, ext);
    const dir = path.dirname(cleaned);
    // 与中间件保持一致：百分比模式 sizeSubDir = `${pct}p`
    const fileName = `${base}_${pct}p${ext}`;
    // dir 为 "." 时（原图在根目录）不拼接目录段
    const dirSegment = dir === "." ? "" : `${dir}/`;
    return `smallImage/${dirSegment}${fileName}`;
  }

  /**
   * 获取列表展示用的轻量资源 URL。
   *
   * 行为分支（约定见文件顶部 URL / 标记约定注释）：
   * - **视频**（`.mp4` 等，经 {@link isVideoFile} 识别）：返回带 `?preview=1` 预览标记的 URL，
   *   由 `/oss` 中间件路由到 `ensureVideoThumbnail` 返回轻量首帧/封面占位预览，而非追加
   *   `?size=20` 让视频走图片缩略图通道（缺陷 1.3）。不带预览标记的视频下载链路仍返回完整
   *   原文件（保留 3.3）。
   * - **图片热缓存命中**：若对应的 smallImage 缩略图已存在（默认 20% 模式），直接返回该缓存
   *   缩略图的 URL，强化热缓存快速路径（保留 3.1）。
   * - **图片冷缓存**：缓存不存在时，返回带 `?size=20` 的原图 URL，由中间件走受 MAX_THUMB_EDGE
   *   封顶约束的同步生成（缺陷 1.1 / 1.2 的 URL 入口）。
   *
   * 所有路径计算均经 {@link normalizeUserPath} / {@link resolveSafeLocalPath} 做 OSS 根目录
   * 安全约束（保留 3.5）。
   *
   * @param userRelPath 用户传入的相对文件路径（使用 / 作为分隔符）
   * @returns 列表展示用的轻量资源 URL
   */
  async getSmallImageUrl(userRelPath: string): Promise<string> {
    await this.ensureInit();
    // 路径安全校验（保留 3.5）：越权路径在此抛出，与原图访问链路一致。
    resolveSafeLocalPath(userRelPath, this.rootDir);

    // 视频分支：返回带预览标记的轻量预览 URL（缺陷 1.3）。
    if (isVideoFile(userRelPath)) {
      const baseUrl = await this.getFileUrl(userRelPath);
      return `${baseUrl}?${VIDEO_PREVIEW_QUERY}`;
    }

    // 图片热缓存命中：缩略图已存在则直接返回缓存 URL（保留 / 强化 3.1）。
    const thumbRelPath = this.buildThumbCacheRelPath(userRelPath, DEFAULT_THUMB_PERCENT);
    if (await this.fileExists(thumbRelPath)) {
      return this.getFileUrl(thumbRelPath);
    }

    // 图片冷缓存：返回带 ?size= 的原图 URL，驱动中间件走受封顶约束的生成（缺陷 1.1 / 1.2）。
    return (await this.getFileUrl(userRelPath)) + `?size=${DEFAULT_THUMB_PERCENT}`;
  }

  /**
   * 获取列表展示用的「轻量」base64 Data URL（受最大边界约束）。
   *
   * 与 {@link getImageBase64} 的区别：
   * - {@link getImageBase64} 返回**全尺寸**原图 base64，逐字节等于原文件（供生成视频/图像等
   *   确需原图的链路使用，语义保持不变，保留 3.3）。
   * - 本方法用 `sharp` 将图片等比缩放到最长边 ≤ `maxEdge` 后再编码为 base64，体积远小于全尺寸，
   *   适合列表展示（缺陷 1.4）。
   *
   * 路径经 {@link resolveSafeLocalPath} 做 OSS 根目录安全约束（保留 3.5）。
   *
   * @param userRelPath 用户传入的相对文件路径（使用 / 作为分隔符）
   * @param maxEdge 缩略图最长边上限（像素），默认 {@link MAX_THUMB_EDGE}
   * @returns 受限尺寸的 base64 Data URL（JPEG 编码）
   * @throws 路径不在 OSS 根目录内、文件不存在等错误
   */
  async getImageThumbBase64(userRelPath: string, maxEdge: number = MAX_THUMB_EDGE): Promise<string> {
    await this.ensureInit();
    const absPath = resolveSafeLocalPath(userRelPath, this.rootDir);

    const stat = await fs.stat(absPath);
    if (!stat.isFile()) {
      throw new Error(`${userRelPath} 不是文件`);
    }

    // 等比缩放到最长边 ≤ maxEdge（不放大），统一编码为 JPEG 以保证轻量。
    const buffer = await sharp(absPath)
      .resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();
    const base64 = buffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  }
}

export default new OSS();
