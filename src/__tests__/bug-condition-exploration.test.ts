/**
 * Property 1: Bug Condition —— 首次加载提供轻量资源且不阻塞首屏（探索测试）
 *
 * 方法论：Bug 条件探索（在实施修复之前）。
 * - 本测试 **编码了期望（修复后）行为**：`servesLightweightAsset = true` 且
 *   `firstScreenNotBlocked = true`。
 * - 在 **未修复代码** 上本测试 **必须失败** —— 失败即证实 `design.md` 中四类缺陷确实存在。
 * - 修复完成后（任务 3.x），重新运行同一测试应转为通过（任务 3.5 Fix Checking）。
 *
 * 采用 Scoped PBT：对四类确定性缺陷，将属性收窄到具体可复现的失败用例。
 *
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 */
import os from "node:os";
import fs from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import fc from "fast-check";

import * as imageModule from "@/utils/image";
import OSS from "@/utils/oss";
import {
  FIXTURES,
  clearSmallImageCache,
  cleanupFixtures,
  ensureFixtures,
  fixtureAbsPath,
} from "./helpers/fixtures";

// /oss 中间件随 `@/app` 在非 Electron 环境自动启动，监听固定端口 10588。
const PORT = 10588;
const BASE = `http://localhost:${PORT}`;

/** 缩略图「轻量」上限：最长边 ≤ 512px（design.md MAX_THUMB_EDGE）。 */
const MAX_THUMB_EDGE = 512;

/** 等待自动启动的本地服务就绪。 */
async function waitForServer(timeoutMs = 20_000): Promise<void> {
  const url = `${BASE}/oss/${FIXTURES.normalImage}`;
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url);
      // 命中 /oss 静态分支即视为就绪（200 或任意非连接错误响应都说明已监听）
      if (res.ok || res.status < 500) return;
    } catch {
      // 连接未就绪，继续轮询
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`本地服务在 ${timeoutMs}ms 内未就绪: ${url}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}

/** 将 OSS 相对 URL（形如 `/oss/...`）补全为带 host 的可请求地址。 */
function toAbsoluteUrl(ossUrl: string): string {
  return ossUrl.startsWith("http") ? ossUrl : `${BASE}${ossUrl}`;
}

beforeAll(async () => {
  process.env.PORT = String(PORT);
  // 触发 @/app 的自动启动（模块级 `if (!isElectron) startServe()`）。
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
    // 忽略关闭错误，保证测试进程可退出
  }
});

describe("Property 1: Bug Condition - 首次加载提供轻量资源且不阻塞首屏", () => {
  /**
   * 缺陷 1.1（冷缓存批量同步生成阻塞首屏）
   *
   * 冷缓存下并发请求 N 张缩略图，统计经 `/oss` 中间件触发的 `ensureThumbnail`
   * 并发峰值。期望（修复后）：受并发上限约束，峰值 ≤ CPU 核数，首屏不被阻塞。
   * 未修复：中间件无 `p-limit`，峰值 == 并发请求数（无上限）→ FAIL。
   */
  it("缺陷1.1：冷缓存批量生成应受并发上限约束（firstScreenNotBlocked）", async () => {
    const cpuCount = os.cpus().length;
    // 期望的并发上限：与 CPU 核数相关的小值（design.md）。
    const EXPECTED_MAX_CONCURRENT = cpuCount;
    // 并发请求数显著大于期望上限，使「无上限」与「有上限」可区分。
    const requestCount = cpuCount * 3;

    await fc.assert(
      fc.asyncProperty(
        // 收窄到确定性失败用例：固定请求规模、用不同百分比制造不同缩略图输出路径。
        fc.constant(requestCount),
        async (n) => {
          await clearSmallImageCache();

          let inFlight = 0;
          let peakConcurrent = 0;
          const original = imageModule.ensureThumbnail;
          const spy = vi
            .spyOn(imageModule, "ensureThumbnail")
            .mockImplementation(async (...args: Parameters<typeof original>) => {
              inFlight += 1;
              peakConcurrent = Math.max(peakConcurrent, inFlight);
              try {
                return await original(...args);
              } finally {
                inFlight -= 1;
              }
            });

          try {
            // 同一超大原图、不同百分比 => 不同缩略图输出路径 => 各自独立生成。
            const reqs = Array.from({ length: n }, (_, i) => {
              const pct = 20 + i; // 20,21,22... 保证输出路径互异
              const url = `${BASE}/oss/${FIXTURES.oversizedImage}?size=${pct}`;
              return fetch(url).then((r) => r.arrayBuffer());
            });
            await Promise.all(reqs);
          } finally {
            spy.mockRestore();
          }

          // 守卫：确认 spy 确实拦截到中间件调用（否则统计无意义）。
          expect(peakConcurrent).toBeGreaterThan(0);

          const firstScreenNotBlocked = peakConcurrent <= EXPECTED_MAX_CONCURRENT;
          // 期望行为：受并发上限约束 => 首屏不被同步批量生成阻塞。
          expect(
            firstScreenNotBlocked,
            `冷缓存并发生成峰值=${peakConcurrent}，期望 ≤ ${EXPECTED_MAX_CONCURRENT}（请求数=${n}）`,
          ).toBe(true);
        },
      ),
      { numRuns: 1 },
    );
  }, 60_000);

  /**
   * 缺陷 1.2（超大原图百分比缩略图偏大）
   *
   * 对超大原图按百分比生成缩略图，期望（修复后）最长边封顶 ≤ MAX_THUMB_EDGE。
   * 未修复：`image.ts` 百分比分支无封顶 => 最长边 = 原图边 * 百分比，超大原图远超上限 → FAIL。
   */
  it("缺陷1.2：超大原图缩略图最长边应被封顶（servesLightweightAsset）", async () => {
    const sharp = (await import("sharp")).default;

    await fc.assert(
      fc.asyncProperty(
        // 收窄到确定性失败用例：超大尺寸 + 小百分比，乘积仍 > 512。
        fc.record({
          width: fc.integer({ min: 4000, max: 8000 }),
          height: fc.integer({ min: 3000, max: 6000 }),
          pct: fc.integer({ min: 10, max: 25 }),
        }),
        async ({ width, height, pct }) => {
          // 直接驱动被修复函数所在的 image.ts 入口（中间件即调用该函数）。
          const srcRel = `__test_fixtures__/oversized_${width}x${height}.jpg`;
          const srcAbs = fixtureAbsPath(srcRel);
          await sharp({
            create: { width, height, channels: 3, background: { r: 10, g: 20, b: 30 } },
          })
            .jpeg({ quality: 80 })
            .toFile(srcAbs);

          const dstAbs = fixtureAbsPath(`__test_fixtures__/out_${width}x${height}_${pct}.jpg`);
          await fs.rm(dstAbs, { force: true });

          const result = await imageModule.ensureThumbnail(srcAbs, dstAbs, {
            type: "percentage",
            value: pct,
          });
          expect(result).not.toBeNull();

          const meta = await sharp(result as string).metadata();
          const longestEdge = Math.max(meta.width ?? 0, meta.height ?? 0);

          const servesLightweightAsset = longestEdge <= MAX_THUMB_EDGE;
          expect(
            servesLightweightAsset,
            `原图 ${width}x${height} @ ${pct}% => 缩略图最长边=${longestEdge}px，期望 ≤ ${MAX_THUMB_EDGE}px`,
          ).toBe(true);
        },
      ),
      { numRuns: 5 },
    );
  }, 60_000);

  /**
   * 缺陷 1.3（视频走缩略图通道降级为完整文件）
   *
   * 对 .mp4 调用 `getSmallImageUrl` 并请求结果 URL。期望（修复后）：返回轻量预览
   * （首帧/封面），响应体 < 完整视频字节数。
   * 未修复：URL 追加 `?size=20`，中间件对 mp4 调 `sharp` 失败 => 降级 `express.static`
   * 返回整段视频 => 响应体 == 完整视频字节数 → FAIL。
   */
  it("缺陷1.3：视频经 getSmallImageUrl 应返回轻量预览而非整段视频（servesLightweightAsset）", async () => {
    const fullVideoBytes = (await fs.stat(fixtureAbsPath(FIXTURES.videoSample))).size;

    const smallUrl = await OSS.getSmallImageUrl(FIXTURES.videoSample);
    const res = await fetch(toAbsoluteUrl(smallUrl));
    const body = await res.arrayBuffer();
    const servedBytes = body.byteLength;

    const servesLightweightAsset = servedBytes < fullVideoBytes;
    expect(
      servesLightweightAsset,
      `视频预览返回 ${servedBytes} 字节，完整视频 ${fullVideoBytes} 字节；期望预览体积 < 完整视频`,
    ).toBe(true);
  }, 60_000);

  /**
   * 缺陷 1.4（列表展示返回全尺寸 base64）
   *
   * 以「列表展示」用途获取图片 base64。期望（修复后）：存在轻量变体
   * （如 getImageThumbBase64），返回受限尺寸 base64，其解码字节数 < 全尺寸原图字节数。
   * 未修复：仅有 `getImageBase64`，返回全尺寸原图 base64，解码字节数 == 原图字节数 → FAIL。
   */
  it("缺陷1.4：列表展示 base64 应为轻量变体而非全尺寸原图（servesLightweightAsset）", async () => {
    const originalBytes = (await fs.stat(fixtureAbsPath(FIXTURES.oversizedImage))).size;

    // 列表展示用途：优先使用轻量变体（修复后存在）；否则回退到全尺寸 getImageBase64（未修复）。
    const oss = OSS as any;
    const listDisplayBase64: string =
      typeof oss.getImageThumbBase64 === "function"
        ? await oss.getImageThumbBase64(FIXTURES.oversizedImage, MAX_THUMB_EDGE)
        : await oss.getImageBase64(FIXTURES.oversizedImage);

    const b64 = listDisplayBase64.replace(/^data:[^;]+;base64,/, "");
    const decodedBytes = Buffer.from(b64, "base64").byteLength;

    const servesLightweightAsset = decodedBytes < originalBytes;
    expect(
      servesLightweightAsset,
      `列表展示 base64 解码=${decodedBytes} 字节，全尺寸原图=${originalBytes} 字节；期望轻量变体 < 全尺寸`,
    ).toBe(true);
  }, 60_000);
});
