/**
 * 单元测试：`src/utils/image.ts`（任务 4）
 *
 * 覆盖设计文档「Unit Tests / image.ts」要点：
 * - 百分比封顶：超大原图按百分比缩放后，缩略图最长边 ≤ MAX_THUMB_EDGE。
 * - dimensions 模式语义不变：fit-inside、保持比例、不放大；不受封顶逻辑影响。
 * - 缓存命中直接返回：缩略图已存在时直接返回路径，不重新生成。
 * - 生成失败返回 null：原图不存在时返回 null。
 * - 视频相关：isVideoFile / VIDEO_EXTENSIONS；ensureVideoThumbnail 生成 320x180 占位、
 *   不对视频调用 sharp、缓存命中早退、失败返回 null。
 *
 * 这些为基于具体样例与边界的单元测试，与 Property 1/2 的属性测试互补。
 */
import fs from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import sharp from "sharp";

import {
  MAX_THUMB_EDGE,
  VIDEO_EXTENSIONS,
  ensureThumbnail,
  ensureVideoThumbnail,
  isVideoFile,
} from "@/utils/image";
import {
  FIXTURES,
  cleanupFixtures,
  ensureFixtures,
  fixtureAbsPath,
} from "@/__tests__/helpers/fixtures";

// 本单元测试在 OSS 根目录下的临时子目录中工作，结束后统一清理。
const UNIT_DIR = "__image_unit__";
const unitAbs = (name: string) => fixtureAbsPath(`${UNIT_DIR}/${name}`);

beforeAll(async () => {
  await ensureFixtures();
  await fs.mkdir(fixtureAbsPath(UNIT_DIR), { recursive: true });
});

afterAll(async () => {
  await fs.rm(fixtureAbsPath(UNIT_DIR), { recursive: true, force: true });
  await cleanupFixtures();
});

describe("image.ts - ensureThumbnail 百分比封顶", () => {
  it("超大原图按百分比缩放后最长边 ≤ MAX_THUMB_EDGE", async () => {
    // 6000x4000 原图（夹具），20% => 1200x800，未封顶时远超 512。
    const src = fixtureAbsPath(FIXTURES.oversizedImage);
    const dst = unitAbs("cap_20pct.jpg");
    await fs.rm(dst, { force: true });

    const result = await ensureThumbnail(src, dst, { type: "percentage", value: 20 });
    expect(result).toBe(dst);

    const meta = await sharp(dst).metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
    expect(longest).toBeLessThanOrEqual(MAX_THUMB_EDGE);
  });

  it("封顶后保持原图宽高比（6000x4000 = 3:2）", async () => {
    const src = fixtureAbsPath(FIXTURES.oversizedImage);
    const dst = unitAbs("cap_ratio.jpg");
    await fs.rm(dst, { force: true });

    await ensureThumbnail(src, dst, { type: "percentage", value: 25 });
    const meta = await sharp(dst).metadata();
    const ratio = (meta.width ?? 0) / (meta.height ?? 1);
    expect(Math.abs(ratio - 6000 / 4000)).toBeLessThan(0.05);
  });

  it("小百分比未触及封顶时按比例缩小（普通图 800x600 @ 50% => 400x300）", async () => {
    const src = fixtureAbsPath(FIXTURES.normalImage);
    const dst = unitAbs("pct_50.jpg");
    await fs.rm(dst, { force: true });

    await ensureThumbnail(src, dst, { type: "percentage", value: 50 });
    const meta = await sharp(dst).metadata();
    expect(Math.abs((meta.width ?? 0) - 400)).toBeLessThanOrEqual(2);
    expect(Math.abs((meta.height ?? 0) - 300)).toBeLessThanOrEqual(2);
  });
});

describe("image.ts - ensureThumbnail dimensions 模式语义不变", () => {
  it("fit-inside、保持比例、不放大（200x300 on 800x600 => 200x150）", async () => {
    const src = fixtureAbsPath(FIXTURES.normalImage);
    const dst = unitAbs("dim_200x300.jpg");
    await fs.rm(dst, { force: true });

    await ensureThumbnail(src, dst, { type: "dimensions", width: 200, height: 300 });
    const meta = await sharp(dst).metadata();
    // 等比 fit-inside：宽受 200 限制 => 200x150。
    expect(meta.width).toBe(200);
    expect(meta.height).toBe(150);
  });

  it("withoutEnlargement：请求大于原图时不放大（2000x2000 on 800x600 => 800x600）", async () => {
    const src = fixtureAbsPath(FIXTURES.normalImage);
    const dst = unitAbs("dim_2000.jpg");
    await fs.rm(dst, { force: true });

    await ensureThumbnail(src, dst, { type: "dimensions", width: 2000, height: 2000 });
    const meta = await sharp(dst).metadata();
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(600);
  });

  it("dimensions 模式不受 MAX_THUMB_EDGE 封顶影响（超大原图请求 1024x1024 => 1024x683）", async () => {
    // 显式维度由调用方指定，即便超过 MAX_THUMB_EDGE 也应被尊重（属 ?size= 路径语义）。
    const src = fixtureAbsPath(FIXTURES.oversizedImage);
    const dst = unitAbs("dim_1024.jpg");
    await fs.rm(dst, { force: true });

    await ensureThumbnail(src, dst, { type: "dimensions", width: 1024, height: 1024 });
    const meta = await sharp(dst).metadata();
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0);
    // 6000x4000 fit-inside 1024x1024 => 1024x683，最长边 1024 > 512，证明未被封顶。
    expect(longest).toBeGreaterThan(MAX_THUMB_EDGE);
    expect(meta.width).toBe(1024);
  });
});

describe("image.ts - ensureThumbnail 缓存命中与失败契约", () => {
  it("缓存命中：缩略图已存在时直接返回且不重新生成", async () => {
    const src = fixtureAbsPath(FIXTURES.normalImage);
    const dst = unitAbs("hit_cache.jpg");
    await fs.rm(dst, { force: true });

    // 预置一张已存在缓存（100x75），内容与传入 size 不一致。
    await sharp(src).resize(100, 75).toFile(dst);
    const before = await fs.readFile(dst);

    const result = await ensureThumbnail(src, dst, { type: "dimensions", width: 64, height: 64 });
    expect(result).toBe(dst);
    const after = await fs.readFile(dst);
    // 命中缓存：内容逐字节不变（未重新生成为 64x64）。
    expect(after.equals(before)).toBe(true);
  });

  it("生成失败：原图不存在时返回 null", async () => {
    const src = unitAbs("does_not_exist.jpg");
    const dst = unitAbs("null_out.jpg");
    await fs.rm(dst, { force: true });
    expect(fss.existsSync(src)).toBe(false);

    const result = await ensureThumbnail(src, dst, { type: "dimensions", width: 64, height: 64 });
    expect(result).toBeNull();
    // 不应产生输出文件。
    expect(fss.existsSync(dst)).toBe(false);
  });

  it("默认模式（无 size）等比缩放到 256 边界内", async () => {
    const src = fixtureAbsPath(FIXTURES.normalImage);
    const dst = unitAbs("default_256.jpg");
    await fs.rm(dst, { force: true });

    await ensureThumbnail(src, dst);
    const meta = await sharp(dst).metadata();
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBeLessThanOrEqual(256);
  });
});

describe("image.ts - 视频识别 isVideoFile / VIDEO_EXTENSIONS", () => {
  it("识别常见视频扩展名（大小写不敏感）", () => {
    expect(isVideoFile("a/b/c.mp4")).toBe(true);
    expect(isVideoFile("X.MP4")).toBe(true);
    expect(isVideoFile("clip.mov")).toBe(true);
    expect(isVideoFile("v.webm")).toBe(true);
    expect(isVideoFile("v.mkv")).toBe(true);
  });

  it("非视频扩展名返回 false", () => {
    expect(isVideoFile("photo.jpg")).toBe(false);
    expect(isVideoFile("photo.png")).toBe(false);
    expect(isVideoFile("noext")).toBe(false);
    expect(isVideoFile("audio.mp3")).toBe(false);
  });

  it("VIDEO_EXTENSIONS 含点号且为小写", () => {
    for (const ext of VIDEO_EXTENSIONS) {
      expect(ext.startsWith(".")).toBe(true);
      expect(ext).toBe(ext.toLowerCase());
    }
    expect(VIDEO_EXTENSIONS.has(".mp4")).toBe(true);
  });
});

describe("image.ts - ensureVideoThumbnail 占位预览", () => {
  it("为视频生成 320x180 占位 JPEG，不读取视频字节（不调用 sharp 处理视频）", async () => {
    const video = fixtureAbsPath(FIXTURES.videoSample);
    const dst = unitAbs("video_preview.jpg");
    await fs.rm(dst, { force: true });

    const result = await ensureVideoThumbnail(video, dst);
    expect(result).toBe(dst);

    const meta = await sharp(dst).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBe(320);
    expect(meta.height).toBe(180);
    // 占位预览最长边远小于 MAX_THUMB_EDGE，保证轻量。
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBeLessThanOrEqual(MAX_THUMB_EDGE);
  });

  it("缓存命中：占位预览已存在时直接返回且不重新生成", async () => {
    const video = fixtureAbsPath(FIXTURES.videoSample);
    const dst = unitAbs("video_preview_hit.jpg");
    await fs.rm(dst, { force: true });

    // 预置一张已存在的「预览」（用合成图占位，内容不同于默认占位）。
    await fs.mkdir(path.dirname(dst), { recursive: true });
    await sharp({ create: { width: 64, height: 64, channels: 3, background: { r: 200, g: 0, b: 0 } } })
      .jpeg()
      .toFile(dst);
    const before = await fs.readFile(dst);

    const result = await ensureVideoThumbnail(video, dst);
    expect(result).toBe(dst);
    const after = await fs.readFile(dst);
    // 命中缓存：内容逐字节不变（未被覆盖为 320x180 占位）。
    expect(after.equals(before)).toBe(true);
  });

  it("失败返回 null：源视频不存在时不生成且返回 null", async () => {
    const video = unitAbs("missing_video.mp4");
    const dst = unitAbs("missing_video_preview.jpg");
    await fs.rm(dst, { force: true });
    expect(fss.existsSync(video)).toBe(false);

    const result = await ensureVideoThumbnail(video, dst);
    expect(result).toBeNull();
    expect(fss.existsSync(dst)).toBe(false);
  });
});
