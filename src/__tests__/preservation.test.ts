/**
 * Property 2: Preservation —— 非 Bug 条件行为保持不变（保留属性测试）
 *
 * 方法论：观察优先（observation-first） + 保留检查（Preservation Checking）。
 * - 先在 **未修复代码** 上观察以下非 Bug 输入（`isBugCondition(X) = false`）的真实输出，
 *   再写测试断言这些被观察到的行为模式，作为修复后必须保持不变的基线（F(X) = F'(X)）。
 * - 本测试在 **未修复代码** 上 **必须通过**（EXPECTED OUTCOME: PASS）。
 * - 修复完成后（任务 3.6 Preservation Checking）重新运行，应仍然通过 —— 证明无回归。
 *
 * 覆盖的保留行为（仅针对 NON-bug-condition 输入）：
 * - 3.1 热缓存命中：缩略图已存在时直接返回缓存，不重新生成。
 * - 3.2 有效 `?size=`：维度模式语义不变（fit-inside、保持比例、不放大）；
 *        百分比模式在不触发封顶的范围内按比例缩小。
 * - 3.3 原图全尺寸：不带 `size` 的图片请求、`getImageBase64` 全尺寸 base64 返回完整未缩放内容。
 * - 3.4 失败/无效降级：`size` 无效时降级返回原图；原图不存在时 `ensureThumbnail` 返回 null。
 * - 3.5 路径安全：越权路径被 `resolveSafeLocalPath` / `normalizeUserPath` 拒绝。
 *
 * 基线观察记录（未修复代码，观察优先）：
 * - DIM 200x300 on 800x600 -> 200x150（等比 fit-inside，不放大）
 * - DIM 2000x2000 on 800x600 -> 800x600（withoutEnlargement，不放大）
 * - PCT 50 on 800x600 -> 400x300（按百分比等比缩小，当前无封顶）
 * - 热缓存：缩略图已存在 => 直接返回同一路径且内容不变
 * - 原图不存在 => ensureThumbnail 返回 null
 * - "../../etc/passwd" => 抛出「不在 OSS 根目录内」
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */
import fs from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import fc from "fast-check";
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

// /oss 中间件随 `@/app` 在非 Electron 环境自动启动，监听固定端口 10588。
// （各测试文件在独立 worker 中、默认不并发运行，复用 10588 不会冲突。）
const PORT = 10588;
const BASE = `http://localhost:${PORT}`;

// 普通图片尺寸（与 fixtures.ts 中 normalImage 一致：800x600）。
const NORMAL_W = 800;
const NORMAL_H = 600;

/** 等待自动启动的本地服务就绪。 */
async function waitForServer(timeoutMs = 20_000): Promise<void> {
  const url = `${BASE}/oss/${FIXTURES.normalImage}`;
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url);
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

describe("Property 2: Preservation - 非 Bug 条件行为保持不变", () => {
  /**
   * 3.1 热缓存命中：缩略图已存在时，`ensureThumbnail` 直接返回已缓存路径，
   *     不因传入不同 size 而重新生成（内容保持为缓存内容）。
   */
  it("3.1 热缓存命中：已存在缩略图直接返回，不重新生成", async () => {
    await fc.assert(
      fc.asyncProperty(
        // 随机不同的目标 size：均不应触发对已存在缓存的覆盖。
        fc.record({
          w: fc.integer({ min: 16, max: 256 }),
          h: fc.integer({ min: 16, max: 256 }),
          tag: fc.integer({ min: 0, max: 1_000_000 }),
        }),
        async ({ w, h, tag }) => {
          const srcAbs = fixtureAbsPath(FIXTURES.normalImage);
          const cacheAbs = fixtureAbsPath(`${"__test_fixtures__"}/hotcache_${tag}.jpg`);
          await fs.rm(cacheAbs, { force: true });

          // 预置一张「已存在」的缩略图缓存（固定 100x75）。
          await sharp(srcAbs).resize(100, 75).toFile(cacheAbs);
          const before = await fs.readFile(cacheAbs);

          const result = await imageModule.ensureThumbnail(srcAbs, cacheAbs, {
            type: "dimensions",
            width: w,
            height: h,
          });

          // 命中缓存：返回同一路径。
          expect(result).toBe(cacheAbs);
          // 内容未被重新生成（与预置内容逐字节一致）。
          const after = await fs.readFile(cacheAbs);
          expect(after.equals(before)).toBe(true);

          await fs.rm(cacheAbs, { force: true });
        },
      ),
      { numRuns: 10 },
    );
  }, 60_000);

  /**
   * 3.2 有效 `?size=` —— 维度模式语义不变。
   * 经 `/oss` 中间件请求 `WxH`，缩略图须 fit-inside 到 W×H、保持原图宽高比、且不放大。
   * （观察基线：200x300 -> 200x150；2000x2000 -> 800x600。）
   */
  it("3.2 有效 ?size= 维度模式：fit-inside、保持比例、不放大", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          w: fc.integer({ min: 32, max: 1200 }),
          h: fc.integer({ min: 32, max: 1200 }),
        }),
        async ({ w, h }) => {
          await clearSmallImageCacheFor(FIXTURES.normalImage);
          const url = `${BASE}/oss/${FIXTURES.normalImage}?size=${w}x${h}`;
          const res = await fetch(url);
          expect(res.ok).toBe(true);
          const buf = Buffer.from(await res.arrayBuffer());
          const meta = await sharp(buf).metadata();
          const outW = meta.width ?? 0;
          const outH = meta.height ?? 0;

          // fit-inside：输出不超过请求边界（允许 1px 舍入容差）。
          expect(outW).toBeLessThanOrEqual(w + 1);
          expect(outH).toBeLessThanOrEqual(h + 1);
          // withoutEnlargement：不放大超过原图。
          expect(outW).toBeLessThanOrEqual(NORMAL_W + 1);
          expect(outH).toBeLessThanOrEqual(NORMAL_H + 1);
          // 保持原图宽高比（800/600 = 4/3），容差应对整数舍入。
          const srcRatio = NORMAL_W / NORMAL_H;
          const outRatio = outW / outH;
          expect(Math.abs(outRatio - srcRatio)).toBeLessThan(0.05);
        },
      ),
      { numRuns: 12 },
    );
  }, 90_000);

  /**
   * 3.2 有效 `?size=` —— 百分比模式（不触发封顶的范围内按比例缩小）。
   * 约束 pct，使 800*pct/100 ≤ 512，避免落入缺陷 1.2（超大缩略图）的封顶区间，
   * 从而该断言在修复前后都成立（属真正的「非 Bug 条件」保留行为）。
   * 观察基线：PCT 50 on 800x600 -> 400x300。
   */
  it("3.2 有效 ?size= 百分比模式：按比例等比缩小（未触发封顶区间）", async () => {
    await fc.assert(
      fc.asyncProperty(
        // 800 * 60% = 480 ≤ 512，保证不进入封顶区间。
        fc.integer({ min: 10, max: 60 }),
        async (pct) => {
          await clearSmallImageCacheFor(FIXTURES.normalImage);
          const url = `${BASE}/oss/${FIXTURES.normalImage}?size=${pct}`;
          const res = await fetch(url);
          expect(res.ok).toBe(true);
          const buf = Buffer.from(await res.arrayBuffer());
          const meta = await sharp(buf).metadata();
          const outW = meta.width ?? 0;
          const outH = meta.height ?? 0;

          const expW = Math.round((NORMAL_W * pct) / 100);
          const expH = Math.round((NORMAL_H * pct) / 100);
          // 按百分比等比缩小（允许 2px 舍入容差）。
          expect(Math.abs(outW - expW)).toBeLessThanOrEqual(2);
          expect(Math.abs(outH - expH)).toBeLessThanOrEqual(2);
        },
      ),
      { numRuns: 10 },
    );
  }, 90_000);

  /**
   * 3.3 原图全尺寸 —— 不带 `size` 的图片请求返回完整未缩放文件（逐字节一致）。
   */
  it("3.3 不带 size 的图片请求返回完整原文件", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(FIXTURES.normalImage, FIXTURES.oversizedImage),
        async (rel) => {
          const onDisk = await fs.readFile(fixtureAbsPath(rel));
          const res = await fetch(`${BASE}/oss/${rel}`);
          expect(res.ok).toBe(true);
          const served = Buffer.from(await res.arrayBuffer());
          expect(served.equals(onDisk)).toBe(true);
        },
      ),
      { numRuns: 4 },
    );
  }, 60_000);

  /**
   * 3.3 原图全尺寸 —— `getImageBase64` 返回完整未缩放原图的 base64（解码字节 == 原文件字节）。
   * 此为生成视频/图像链路所需的全尺寸语义，必须保留。
   */
  it("3.3 getImageBase64 返回全尺寸 base64（解码字节等于原文件）", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(FIXTURES.normalImage, FIXTURES.oversizedImage),
        async (rel) => {
          const onDisk = await fs.readFile(fixtureAbsPath(rel));
          const dataUrl = await OSS.getImageBase64(rel);
          expect(dataUrl.startsWith("data:image/jpeg;base64,")).toBe(true);
          const b64 = dataUrl.replace(/^data:[^;]+;base64,/, "");
          const decoded = Buffer.from(b64, "base64");
          // 全尺寸语义：解码内容与原文件逐字节一致。
          expect(decoded.equals(onDisk)).toBe(true);
        },
      ),
      { numRuns: 4 },
    );
  }, 60_000);

  /**
   * 3.4 失败/无效降级 —— `size` 参数无效时，`/oss` 中间件降级返回原图（完整文件）。
   * 生成随机「无效 size」字符串（既非 WxH，也非百分比格式）。
   */
  it("3.4 无效 size 降级返回原图（完整文件）", async () => {
    const dimensRe = /^(\d+)x(\d+)$/i;
    const percentRe = /^(\d+(?:\.\d+)?)\s*%?$/;
    const isInvalid = (s: string) => s.length > 0 && !dimensRe.test(s) && !percentRe.test(s);

    const onDisk = await fs.readFile(fixtureAbsPath(FIXTURES.normalImage));

    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 1, maxLength: 12 })
          .filter(isInvalid)
          // 仅保留 URL 查询里安全可用的字符，避免编码歧义干扰断言。
          .filter((s) => /^[A-Za-z0-9._-]+$/.test(s)),
        async (badSize) => {
          const url = `${BASE}/oss/${FIXTURES.normalImage}?size=${encodeURIComponent(badSize)}`;
          const res = await fetch(url);
          expect(res.ok).toBe(true);
          const served = Buffer.from(await res.arrayBuffer());
          // 降级：返回完整原图，与磁盘逐字节一致。
          expect(served.equals(onDisk)).toBe(true);
        },
      ),
      { numRuns: 15 },
    );
  }, 60_000);

  /**
   * 3.4 失败降级（函数级）—— 原图不存在时 `ensureThumbnail` 返回 null（对外契约不变）。
   */
  it("3.4 原图不存在时 ensureThumbnail 返回 null", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 0, max: 1_000_000 }), async (tag) => {
        const srcAbs = fixtureAbsPath(`${"__test_fixtures__"}/nonexistent_${tag}.jpg`);
        const dstAbs = fixtureAbsPath(`${"__test_fixtures__"}/nonexistent_out_${tag}.jpg`);
        // 确保源不存在、目标缓存也不存在。
        expect(fss.existsSync(srcAbs)).toBe(false);
        await fs.rm(dstAbs, { force: true });
        const result = await imageModule.ensureThumbnail(srcAbs, dstAbs, {
          type: "dimensions",
          width: 64,
          height: 64,
        });
        expect(result).toBeNull();
      }),
      { numRuns: 8 },
    );
  }, 60_000);

  /**
   * 3.5 路径安全 —— 越权路径（以 `../` 逃逸出 OSS 根目录）被拒绝。
   * 观察基线：`resolveSafeLocalPath` 对逃逸路径抛出「不在 OSS 根目录内」。
   */
  it("3.5 越权路径被 resolveSafeLocalPath / normalizeUserPath 拒绝", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // 足够多的 ../ 保证逃逸出根目录（即便有前导段）。
          depth: fc.integer({ min: 3, max: 8 }),
          target: fc.constantFrom("etc/passwd", "secret.txt", "a/b/c.json", "config"),
        }),
        async ({ depth, target }) => {
          const escapePath = "../".repeat(depth) + target;
          // getImageBase64 内部经 resolveSafeLocalPath 做根目录约束校验。
          await expect(OSS.getImageBase64(escapePath)).rejects.toThrow();
          // getFile 同样应拒绝越权访问。
          await expect(OSS.getFile(escapePath)).rejects.toThrow();
        },
      ),
      { numRuns: 12 },
    );
  }, 60_000);
});
