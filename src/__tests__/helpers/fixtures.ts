/**
 * 测试夹具（fixtures）与缓存工具。
 *
 * 约定：
 * - 所有测试夹具放在 OSS 根目录下的独立子目录 `__test_fixtures__/` 中，
 *   与真实业务数据隔离，避免污染 `data/oss/1781056322566` 等真实资源。
 * - 缩略图缓存按现有约定位于 `<ossRoot>/smallImage/<原相对路径>`。
 *
 * 提供：
 * - 生成「超大原图」「普通图片」「.mp4 视频样本」三类夹具
 * - 清空 smallImage 缓存的工具函数，用于模拟「冷缓存」首次打开场景
 */
import fs from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";
import sharp from "sharp";
import getPath from "@/utils/getPath";

/** 测试夹具所在的 OSS 相对目录（位于 OSS 根目录下，便于经 OSS / `/oss` 中间件访问）。 */
export const FIXTURE_REL_DIR = "__test_fixtures__";

/** 夹具相对路径（相对 OSS 根目录，使用 / 分隔符，可直接喂给 OSS 方法）。 */
export const FIXTURES = {
  /** 超大原图：6000x4000，用于验证「百分比缩放仍偏大」缺陷与封顶修复。 */
  oversizedImage: `${FIXTURE_REL_DIR}/oversized.jpg`,
  /** 普通图片：800x600，用于常规缩略图/原图行为。 */
  normalImage: `${FIXTURE_REL_DIR}/normal.jpg`,
  /** .mp4 视频样本，用于验证「视频走缩略图通道降级为完整文件」缺陷。 */
  videoSample: `${FIXTURE_REL_DIR}/sample.mp4`,
} as const;

/** OSS 根目录绝对路径（非 Electron 环境为 `<cwd>/data/oss`）。 */
export function ossRoot(): string {
  return getPath("oss");
}

/** 由 OSS 相对路径得到绝对路径。 */
export function fixtureAbsPath(relPath: string): string {
  return path.join(ossRoot(), relPath.split("/").join(path.sep));
}

/** smallImage 缓存根目录绝对路径。 */
export function smallImageCacheRoot(): string {
  return path.join(ossRoot(), "smallImage");
}

/**
 * 清空 smallImage 缓存目录，模拟「冷缓存」首次打开场景。
 * 仅删除缓存内容，保留 OSS 根目录与真实业务资源不变。
 */
export async function clearSmallImageCache(): Promise<void> {
  const cacheDir = smallImageCacheRoot();
  await fs.rm(cacheDir, { recursive: true, force: true });
}

/**
 * 仅清空某个相对路径对应的 smallImage 缓存（更精细的冷缓存模拟）。
 * 例如 `__test_fixtures__/normal.jpg` => 删除 `smallImage/__test_fixtures__/normal.jpg`。
 */
export async function clearSmallImageCacheFor(relPath: string): Promise<void> {
  const cleaned = relPath.replace(/^[/\\]+/, "");
  const cachePath = path.join(smallImageCacheRoot(), cleaned.split("/").join(path.sep));
  await fs.rm(cachePath, { recursive: true, force: true });
}

/** 生成一张纯色 JPEG 图片到指定 OSS 相对路径。 */
async function writeJpegFixture(relPath: string, width: number, height: number): Promise<string> {
  const abs = fixtureAbsPath(relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 120, g: 160, b: 200 },
    },
  })
    .jpeg({ quality: 80 })
    .toFile(abs);
  return abs;
}

/**
 * 写入一份 .mp4 视频样本到夹具目录。
 * - 若仓库中存在真实视频样本（如 `data/assets/ending.mp4`），复制其字节，保证为合法 mp4。
 * - 否则写入带 ftyp box 头的最小占位字节（仍带 mp4 魔数，便于扩展名/类型识别测试）。
 */
async function writeVideoFixture(relPath: string): Promise<string> {
  const abs = fixtureAbsPath(relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });

  const candidateSources = [
    getPath(["assets", "ending.mp4"]),
  ];
  for (const src of candidateSources) {
    if (fss.existsSync(src)) {
      await fs.copyFile(src, abs);
      return abs;
    }
  }

  // 兜底：写入一个最小的 ftyp box（'ftyp' + 'isom'），足以体现 mp4 容器头。
  const ftyp = Buffer.from([
    0x00, 0x00, 0x00, 0x18, // box size = 24
    0x66, 0x74, 0x79, 0x70, // 'ftyp'
    0x69, 0x73, 0x6f, 0x6d, // 'isom'
    0x00, 0x00, 0x02, 0x00, // minor version
    0x69, 0x73, 0x6f, 0x6d, // 'isom'
    0x6d, 0x70, 0x34, 0x32, // 'mp42'
  ]);
  await fs.writeFile(abs, ftyp);
  return abs;
}

/**
 * 创建全部测试夹具（幂等：已存在则不重复生成）。
 * 返回各夹具的相对路径，便于测试直接使用。
 */
export async function ensureFixtures(): Promise<typeof FIXTURES> {
  if (!fss.existsSync(fixtureAbsPath(FIXTURES.oversizedImage))) {
    await writeJpegFixture(FIXTURES.oversizedImage, 6000, 4000);
  }
  if (!fss.existsSync(fixtureAbsPath(FIXTURES.normalImage))) {
    await writeJpegFixture(FIXTURES.normalImage, 800, 600);
  }
  if (!fss.existsSync(fixtureAbsPath(FIXTURES.videoSample))) {
    await writeVideoFixture(FIXTURES.videoSample);
  }
  return FIXTURES;
}

/**
 * 删除全部测试夹具与其缓存，用于测试收尾清理，保证不残留临时文件。
 */
export async function cleanupFixtures(): Promise<void> {
  await fs.rm(fixtureAbsPath(FIXTURE_REL_DIR), { recursive: true, force: true });
  await clearSmallImageCacheFor(FIXTURE_REL_DIR);
}
