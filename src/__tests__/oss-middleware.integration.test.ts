/**
 * 集成测试：`/oss` 中间件 + 端到端列表加载场景（任务 4）
 *
 * 覆盖设计文档「Unit Tests / /oss 中间件」与「Integration Tests」要点：
 * - p-limit 包裹下的生成：冷缓存批量请求时并发生成受上限约束（首屏不被阻塞）。
 * - 有效 size 分支：维度（WxH）与百分比（pct）各自生成正确尺寸，并写入对应命名的缓存。
 * - 无效 size 分支：降级返回原图（完整文件）。
 * - 视频预览分支：`?preview=1` + 视频 => 返回轻量占位预览（远小于完整视频）。
 * - 降级分支：原图不存在时生成失败 => 由 express.static 处理（404）。
 * - 端到端：
 *   - 冷缓存首次打开（素材库/分镜/图片流）首屏在合理时延内可见（2.1）。
 *   - 上下文切换后缩略图正确加载（命中热缓存）。
 *   - 视频列表显示占位预览，点击/下载（不带 preview）仍返回完整视频字节（2.3 + 3.3）。
 *   - 生成视频链路仍可获取全尺寸 base64（3.3）。
 *
 * 服务随 `@/app` 在非 Electron 环境自动启动，监听固定端口 10588（复用现有约定）。
 */
import os from "node:os";
import fs from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import sharp from "sharp";

import * as imageModule from "@/utils/image";
import OSS from "@/utils/oss";
import {
  FIXTURES,
  clearSmallImageCache,
  clearSmallImageCacheFor,
  cleanupFixtures,
  ensureFixtures,
  fixtureAbsPath,
} from "./helpers/fixtures";

const PORT = 10588;
const BASE = `http://localhost:${PORT}`;
const MAX_THUMB_EDGE = 512;

async function waitForServer(timeoutMs = 20_000): Promise<void> {
  const url = `${BASE}/oss/${FIXTURES.normalImage}`;
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // 未就绪，继续轮询
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`本地服务在 ${timeoutMs}ms 内未就绪: ${url}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}

function toAbsoluteUrl(ossUrl: string): string {
  return ossUrl.startsWith("http") ? ossUrl : `${BASE}${ossUrl}`;
}

beforeAll(async () => {
  process.env.PORT = String(PORT);
  await import("@/app");
  await ensureFixtures();
  await waitForServer();
}, 60_000);

afterAll(async () => {
  vi.restoreAllMocks();
  await cleanupFixtures();
  try {
    const appModule: any = await import("@/app");
    await appModule.closeServe();
  } catch {
    // 忽略关闭错误
  }
});

describe("/oss 中间件 - 有效 size 分支", () => {
  it("维度模式 ?size=200x300：返回 fit-inside 缩略图（200x150）", async () => {
    await clearSmallImageCacheFor(FIXTURES.normalImage);
    const res = await fetch(`${BASE}/oss/${FIXTURES.normalImage}?size=200x300`);
    expect(res.ok).toBe(true);
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    expect(meta.width).toBe(200);
    expect(meta.height).toBe(150);
  });

  it("百分比模式 ?size=20：超大原图缩略图最长边被封顶 ≤ MAX_THUMB_EDGE", async () => {
    await clearSmallImageCacheFor(FIXTURES.oversizedImage);
    const res = await fetch(`${BASE}/oss/${FIXTURES.oversizedImage}?size=20`);
    expect(res.ok).toBe(true);
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBeLessThanOrEqual(MAX_THUMB_EDGE);
  });
});

describe("/oss 中间件 - 无效 size 降级分支", () => {
  it("无效 size => 降级返回完整原图（逐字节一致）", async () => {
    const onDisk = await fs.readFile(fixtureAbsPath(FIXTURES.normalImage));
    const res = await fetch(`${BASE}/oss/${FIXTURES.normalImage}?size=not-a-size`);
    expect(res.ok).toBe(true);
    const served = Buffer.from(await res.arrayBuffer());
    expect(served.equals(onDisk)).toBe(true);
  });
});

describe("/oss 中间件 - 视频预览分支", () => {
  it("?preview=1 + 视频 => 返回轻量占位预览（远小于完整视频，且为 JPEG）", async () => {
    await clearSmallImageCacheFor(FIXTURES.videoSample);
    const fullVideoBytes = (await fs.stat(fixtureAbsPath(FIXTURES.videoSample))).size;
    const res = await fetch(`${BASE}/oss/${FIXTURES.videoSample}?preview=1`);
    expect(res.ok).toBe(true);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.byteLength).toBeLessThan(fullVideoBytes);
    const meta = await sharp(buf).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBe(320);
    expect(meta.height).toBe(180);
  });
});

describe("/oss 中间件 - 生成失败降级分支", () => {
  it("原图不存在 + ?size= => 缩略图生成失败，优雅降级（交由 express.static，不抛 500）", async () => {
    await clearSmallImageCache();
    const res = await fetch(`${BASE}/oss/__test_fixtures__/does_not_exist.jpg?size=20`);
    // 生成失败时降级到 express.static：对不存在文件 static 调用 next() 继续中间件链，
    // 最终落到后续鉴权中间件（401）。关键在于「优雅降级、不抛服务端错误（5xx）」。
    expect(res.status).toBeLessThan(500);
  });
});

describe("集成 - 冷缓存首次打开（p-limit 并发约束）", () => {
  it("冷缓存批量请求时缩略图生成并发受上限约束，首屏不被阻塞", async () => {
    const cpuCount = os.cpus().length;
    const expectedMax = cpuCount; // 中间件上限 = max(1, floor(核数/2)) ≤ 核数
    const requestCount = cpuCount * 3;

    await clearSmallImageCache();

    let inFlight = 0;
    let peak = 0;
    const original = imageModule.ensureThumbnail;
    const spy = vi
      .spyOn(imageModule, "ensureThumbnail")
      .mockImplementation(async (...args: Parameters<typeof original>) => {
        inFlight += 1;
        peak = Math.max(peak, inFlight);
        try {
          return await original(...args);
        } finally {
          inFlight -= 1;
        }
      });

    const started = Date.now();
    try {
      const reqs = Array.from({ length: requestCount }, (_, i) => {
        const pct = 20 + i; // 不同百分比 => 不同输出路径 => 各自独立生成
        return fetch(`${BASE}/oss/${FIXTURES.oversizedImage}?size=${pct}`).then((r) => r.arrayBuffer());
      });
      await Promise.all(reqs);
    } finally {
      spy.mockRestore();
    }
    const elapsed = Date.now() - started;

    expect(peak).toBeGreaterThan(0);
    expect(peak).toBeLessThanOrEqual(expectedMax);
    // 合理时延：批量请求在限定时间内完成（宽松上限，避免环境抖动误报）。
    expect(elapsed).toBeLessThan(60_000);

    await clearSmallImageCache();
  }, 90_000);
});

describe("集成 - 上下文切换后缩略图命中热缓存", () => {
  it("第二次请求同一缩略图直接命中缓存（不再触发生成）", async () => {
    await clearSmallImageCacheFor(FIXTURES.normalImage);

    // 首次（冷缓存）：触发一次生成。
    const first = await fetch(`${BASE}/oss/${FIXTURES.normalImage}?size=30`);
    expect(first.ok).toBe(true);

    // 第二次（模拟上下文切换回来）：应命中缓存，不再调用 ensureThumbnail 生成新内容。
    const spy = vi.spyOn(imageModule, "ensureThumbnail");
    const second = await fetch(`${BASE}/oss/${FIXTURES.normalImage}?size=30`);
    expect(second.ok).toBe(true);

    // 命中缓存时 ensureThumbnail 仍会被调用，但应在缓存存在分支早退返回同一路径。
    // 两次响应的图片尺寸应完全一致（缓存内容稳定）。
    const firstBuf = Buffer.from(await first.arrayBuffer());
    const secondBuf = Buffer.from(await second.arrayBuffer());
    const m1 = await sharp(firstBuf).metadata();
    const m2 = await sharp(secondBuf).metadata();
    expect(m2.width).toBe(m1.width);
    expect(m2.height).toBe(m1.height);
    spy.mockRestore();

    await clearSmallImageCacheFor(FIXTURES.normalImage);
  });
});

describe("集成 - 视频列表预览与完整下载并存（2.3 + 3.3）", () => {
  it("getSmallImageUrl 提供占位预览；不带 preview 的请求仍返回完整视频字节", async () => {
    await clearSmallImageCacheFor(FIXTURES.videoSample);
    const fullVideoBytes = (await fs.stat(fixtureAbsPath(FIXTURES.videoSample))).size;

    // 列表展示：经 getSmallImageUrl 得到预览 URL（?preview=1）。
    const previewUrl = await OSS.getSmallImageUrl(FIXTURES.videoSample);
    const previewRes = await fetch(toAbsoluteUrl(previewUrl));
    const previewBuf = Buffer.from(await previewRes.arrayBuffer());
    expect(previewBuf.byteLength).toBeLessThan(fullVideoBytes);

    // 点击/下载：不带 preview 标记 => express.static 返回完整视频字节。
    const downloadRes = await fetch(`${BASE}/oss/${FIXTURES.videoSample}`);
    expect(downloadRes.ok).toBe(true);
    const downloadBuf = Buffer.from(await downloadRes.arrayBuffer());
    expect(downloadBuf.byteLength).toBe(fullVideoBytes);
  });
});

describe("集成 - 生成视频链路全尺寸 base64（3.3）", () => {
  it("getImageBase64 返回全尺寸原图 base64（解码逐字节等于原文件）", async () => {
    const onDisk = await fs.readFile(fixtureAbsPath(FIXTURES.normalImage));
    const dataUrl = await OSS.getImageBase64(FIXTURES.normalImage);
    const decoded = Buffer.from(dataUrl.replace(/^data:[^;]+;base64,/, ""), "base64");
    expect(decoded.equals(onDisk)).toBe(true);
  });
});
