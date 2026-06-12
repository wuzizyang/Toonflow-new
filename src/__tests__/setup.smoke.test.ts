/**
 * 测试环境冒烟测试（前置任务 0）。
 *
 * 目的：验证 Vitest + fast-check 已正确配置、`@/` 路径别名可用、
 * 夹具生成与 smallImage 冷缓存清理工具可正常工作。
 *
 * 注意：本文件不验证业务正确性，仅验证测试基础设施。
 */
import { afterAll, describe, expect, it } from "vitest";
import fc from "fast-check";
import fss from "node:fs";
import {
  FIXTURES,
  cleanupFixtures,
  clearSmallImageCache,
  ensureFixtures,
  fixtureAbsPath,
  smallImageCacheRoot,
} from "./helpers/fixtures";
import sharp from "sharp";

afterAll(async () => {
  await cleanupFixtures();
});

describe("测试环境冒烟测试", () => {
  it("Vitest 运行正常（基础断言）", () => {
    expect(1 + 1).toBe(2);
  });

  it("fast-check 属性测试可运行", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a;
      }),
    );
  });

  it("@/ 路径别名解析正常（可导入 src 模块）", async () => {
    const getPath = (await import("@/utils/getPath")).default;
    expect(typeof getPath()).toBe("string");
  });

  it("可生成夹具：超大原图 / 普通图片 / mp4 视频", async () => {
    await ensureFixtures();

    const oversized = fixtureAbsPath(FIXTURES.oversizedImage);
    const normal = fixtureAbsPath(FIXTURES.normalImage);
    const video = fixtureAbsPath(FIXTURES.videoSample);

    expect(fss.existsSync(oversized)).toBe(true);
    expect(fss.existsSync(normal)).toBe(true);
    expect(fss.existsSync(video)).toBe(true);

    // 验证超大原图确为 6000x4000
    const meta = await sharp(oversized).metadata();
    expect(meta.width).toBe(6000);
    expect(meta.height).toBe(4000);

    // 视频样本非空
    expect(fss.statSync(video).size).toBeGreaterThan(0);
  });

  it("清空 smallImage 缓存工具可模拟冷缓存", async () => {
    await ensureFixtures();
    // 写入一个假缓存文件
    const cacheRoot = smallImageCacheRoot();
    fss.mkdirSync(cacheRoot, { recursive: true });
    const dummy = `${cacheRoot}/__smoke_dummy.txt`;
    fss.writeFileSync(dummy, "x");
    expect(fss.existsSync(dummy)).toBe(true);

    await clearSmallImageCache();
    expect(fss.existsSync(dummy)).toBe(false);
  });
});
