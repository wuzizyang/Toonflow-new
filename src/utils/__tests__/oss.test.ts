/**
 * 单元测试：`src/utils/oss.ts`（任务 4）
 *
 * 覆盖设计文档「Unit Tests / oss.ts」要点：
 * - getSmallImageUrl 对图片/视频分别返回正确 URL 类型：
 *   - 视频 => `<url>?preview=1`（轻量预览标记，缺陷 1.3）
 *   - 图片热缓存命中 => 缓存缩略图 URL（保留 3.1）
 *   - 图片冷缓存 => `<url>?size=20`（受封顶约束的生成入口，缺陷 1.1/1.2）
 * - 视频识别分支（.mp4/.mov/.webm 等）
 * - 列表用途轻量 base64 变体 getImageThumbBase64：受 maxEdge 约束、体积远小于全尺寸
 * - getImageBase64 全尺寸语义不变（保留 3.3）
 * - 路径安全校验：越权路径被拒绝（保留 3.5）
 *
 * 本文件不启动本地服务（仅测试 oss.ts 方法），避免端口占用。
 */
import fs from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import sharp from "sharp";

import OSS from "@/utils/oss";
import { MAX_THUMB_EDGE } from "@/utils/image";
import {
  FIXTURES,
  cleanupFixtures,
  clearSmallImageCacheFor,
  ensureFixtures,
  fixtureAbsPath,
} from "@/__tests__/helpers/fixtures";

beforeAll(async () => {
  await ensureFixtures();
});

afterAll(async () => {
  await cleanupFixtures();
});

describe("oss.ts - getSmallImageUrl 视频分支", () => {
  it("视频（.mp4）返回带 ?preview=1 预览标记的 URL，而非 ?size=", async () => {
    const url = await OSS.getSmallImageUrl(FIXTURES.videoSample);
    expect(url).toContain("preview=1");
    expect(url).not.toContain("size=");
    expect(url).toContain(FIXTURES.videoSample);
  });
});

describe("oss.ts - getSmallImageUrl 图片冷/热缓存分支", () => {
  it("冷缓存：缓存不存在时返回 <url>?size=20", async () => {
    await clearSmallImageCacheFor(FIXTURES.normalImage);
    const url = await OSS.getSmallImageUrl(FIXTURES.normalImage);
    expect(url).toContain("size=20");
    expect(url).toContain(FIXTURES.normalImage);
  });

  it("热缓存：缓存缩略图已存在时返回缓存 URL（不再追加 ?size=）", async () => {
    // 缓存命名规则：smallImage/<dir>/<base>_20p<ext>（与中间件一致）。
    const cacheRel = "smallImage/__test_fixtures__/normal_20p.jpg";
    const cacheAbs = fixtureAbsPath(cacheRel);
    await fs.mkdir(fixtureAbsPath("smallImage/__test_fixtures__"), { recursive: true });
    await sharp(fixtureAbsPath(FIXTURES.normalImage)).resize(160, 120).toFile(cacheAbs);

    const url = await OSS.getSmallImageUrl(FIXTURES.normalImage);
    expect(url).toContain("smallImage/__test_fixtures__/normal_20p.jpg");
    expect(url).not.toContain("size=");

    await clearSmallImageCacheFor(FIXTURES.normalImage);
  });
});

describe("oss.ts - getSmallImageUrl 路径安全", () => {
  it("越权路径被 resolveSafeLocalPath 拒绝", async () => {
    await expect(OSS.getSmallImageUrl("../../etc/passwd")).rejects.toThrow();
  });
});

describe("oss.ts - getImageThumbBase64 轻量 base64 变体", () => {
  it("返回受 maxEdge 约束的 JPEG base64，最长边 ≤ maxEdge", async () => {
    const dataUrl = await OSS.getImageThumbBase64(FIXTURES.oversizedImage, 128);
    expect(dataUrl.startsWith("data:image/jpeg;base64,")).toBe(true);
    const b64 = dataUrl.replace(/^data:[^;]+;base64,/, "");
    const buf = Buffer.from(b64, "base64");
    const meta = await sharp(buf).metadata();
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBeLessThanOrEqual(128);
  });

  it("默认 maxEdge 为 MAX_THUMB_EDGE，体积远小于全尺寸 base64", async () => {
    const thumb = await OSS.getImageThumbBase64(FIXTURES.oversizedImage);
    const full = await OSS.getImageBase64(FIXTURES.oversizedImage);
    const thumbBytes = Buffer.from(thumb.replace(/^data:[^;]+;base64,/, ""), "base64").byteLength;
    const fullBytes = Buffer.from(full.replace(/^data:[^;]+;base64,/, ""), "base64").byteLength;
    expect(thumbBytes).toBeLessThan(fullBytes);

    const meta = await sharp(Buffer.from(thumb.replace(/^data:[^;]+;base64,/, ""), "base64")).metadata();
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBeLessThanOrEqual(MAX_THUMB_EDGE);
  });

  it("越权路径被拒绝", async () => {
    await expect(OSS.getImageThumbBase64("../../etc/passwd")).rejects.toThrow();
  });
});

describe("oss.ts - getImageBase64 全尺寸语义不变（保留 3.3）", () => {
  it("返回的 base64 解码后逐字节等于原文件", async () => {
    const onDisk = await fs.readFile(fixtureAbsPath(FIXTURES.normalImage));
    const dataUrl = await OSS.getImageBase64(FIXTURES.normalImage);
    expect(dataUrl.startsWith("data:image/jpeg;base64,")).toBe(true);
    const decoded = Buffer.from(dataUrl.replace(/^data:[^;]+;base64,/, ""), "base64");
    expect(decoded.equals(onDisk)).toBe(true);
  });

  it("越权路径被拒绝", async () => {
    await expect(OSS.getImageBase64("../../etc/passwd")).rejects.toThrow();
  });
});
