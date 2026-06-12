import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // 解析 tsconfig.json 中的 "@/*" 路径别名，使测试可以直接 import "@/utils/..."
  plugins: [tsconfigPaths()],
  test: {
    // Node 环境（本项目为 Electron/Node 后端逻辑，无需 DOM）
    environment: "node",
    // 测试文件匹配约定：*.test.ts / *.spec.ts（含 __tests__ 目录下的同名约定）。
    // 仅匹配 test/spec 文件，避免把 __tests__/helpers 下的工具模块误当作测试套件。
    include: ["src/**/*.{test,spec}.ts"],
    // 全局超时放宽，便于属性测试（PBT）与图片生成等较慢用例
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // 关闭测试文件并行：多个测试文件都会通过 `@/app` 自动启动本地服务并绑定固定端口
    // 10588，且共享 OSS 根目录下的 `__test_fixtures__` 夹具。并行执行会造成端口冲突与
    // 夹具读写竞争，导致偶发失败；串行执行可保证整套测试稳定通过。
    fileParallelism: false,
  },
});
