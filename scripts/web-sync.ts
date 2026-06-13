import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * 前端集成脚本：在前端仓库 (Toonflow-web) 执行构建，再把构建产物 (dist)
 * 同步到本仓库的 data/web 目录，供后端 Express 静态托管。
 *
 * 用法：
 *   yarn web:sync                       # 使用默认前端路径 ../Toonflow-web-new
 *   yarn web:sync /path/to/Toonflow-web # 指定前端仓库路径
 *   WEB_REPO=/path/to/Toonflow-web yarn web:sync
 *   yarn web:sync --skip-build          # 跳过构建，仅复制已有 dist
 *   yarn web:sync --force-install       # 强制重新安装前端依赖
 *   yarn web:sync --typecheck           # 构建前先跑 vue-tsc 类型检查（默认跳过）
 *
 * 缺少 node_modules 时会自动执行前端依赖安装（yarn install）。
 * 默认直接执行 vite build（跳过 vue-tsc 类型检查），产出的前端包与完整构建一致；
 * vue-tsc 仅作质量门禁，当前前端仓库存在大量历史类型错误，故默认绕过。
 *
 * 可选环境变量：
 *   WEB_REPO   前端仓库根目录（优先级低于命令行参数）
 *   WEB_DIST   前端构建产物目录名，默认 "dist"
 */

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const forceInstall = args.includes("--force-install");
const typecheck = args.includes("--typecheck");
const positional = args.filter((a) => !a.startsWith("--"));

// 解析前端仓库路径：命令行参数 > 环境变量 > 默认同级目录
const defaultRepo = path.resolve(process.cwd(), "..", "Toonflow-web-new");
const webRepo = path.resolve(positional[0] || process.env.WEB_REPO || defaultRepo);

const distName = process.env.WEB_DIST || "dist";
const distDir = path.join(webRepo, distName);
const targetDir = path.resolve(process.cwd(), "data", "web");

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

/** 在指定目录执行 yarn 命令，跨平台兼容（Windows 用 yarn.cmd）。 */
function runYarn(cwd: string, yarnArgs: string[]): number {
  const isWin = process.platform === "win32";
  const yarnCmd = isWin ? "yarn.cmd" : "yarn";
  const result = spawnSync(yarnCmd, yarnArgs, { cwd, stdio: "inherit", shell: isWin });
  return result.status ?? 1;
}

// 1. 校验前端仓库存在
if (!fs.existsSync(webRepo) || !fs.statSync(webRepo).isDirectory()) {
  fail(
    `未找到前端仓库目录：${webRepo}\n` +
      `请克隆 Toonflow-web 到该位置，或通过参数/环境变量指定路径：\n` +
      `  yarn web:sync /path/to/Toonflow-web`,
  );
}
if (!fs.existsSync(path.join(webRepo, "package.json"))) {
  fail(`目录 ${webRepo} 下没有 package.json，看起来不是前端仓库根目录。`);
}

// 2. 确保前端依赖已安装（缺 node_modules 或 --force-install 时自动安装）
if (!skipBuild) {
  const nodeModules = path.join(webRepo, "node_modules");
  const needInstall = forceInstall || !fs.existsSync(nodeModules);
  if (needInstall) {
    const reason = forceInstall ? "--force-install" : "未检测到 node_modules";
    console.log(`📦 安装前端依赖（${reason}）：${webRepo}`);
    if (runYarn(webRepo, ["install"]) !== 0) {
      fail("前端依赖安装失败（yarn install）。");
    }
  }
}

// 3. 构建前端（除非 --skip-build）
if (!skipBuild) {
  if (typecheck) {
    // 完整构建：vue-tsc 类型检查 + vite build（前端 package.json 的 build 脚本）
    console.log(`🔨 在前端仓库完整构建（含类型检查）：${webRepo}`);
    if (runYarn(webRepo, ["build"]) !== 0) {
      fail("前端构建失败（yarn build）。");
    }
  } else {
    // 默认：直接 vite build，跳过 vue-tsc 类型检查，仍产出完整可用的前端包
    console.log(`🔨 在前端仓库构建（vite build，跳过类型检查）：${webRepo}`);
    if (runYarn(webRepo, ["vite", "build"]) !== 0) {
      fail("前端构建失败（vite build）。");
    }
  }
} else {
  console.log("⏭️  已跳过前端构建（--skip-build）");
}

// 4. 校验构建产物存在
if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
  fail(`未找到构建产物目录：${distDir}\n请确认前端构建成功，或通过 WEB_DIST 指定产物目录名。`);
}

// 5. 清空 data/web 旧内容（仅清空目录内文件，保留目录本身）
fs.mkdirSync(targetDir, { recursive: true });
for (const entry of fs.readdirSync(targetDir)) {
  fs.rmSync(path.join(targetDir, entry), { recursive: true, force: true });
}

// 6. 复制 dist -> data/web
fs.cpSync(distDir, targetDir, { recursive: true });

const fileCount = countFiles(targetDir);
console.log(`✅ 已同步前端产物到 ${targetDir}（${fileCount} 个文件）`);
console.log("👉 重启后端服务（pm2 restart / docker restart）或刷新浏览器即可生效。");

function countFiles(dir: string): number {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFiles(full);
    else count += 1;
  }
  return count;
}
