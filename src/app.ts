// import "./logger";
import "./err";
import "./env";
import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import http from "node:http";
import expressWs from "express-ws";
import logger from "morgan";
import cors from "cors";
import buildRoute from "@/core";
import path from "path";
import fs from "fs";
import u from "@/utils";
import jwt from "jsonwebtoken";
import socketInit from "@/socket/index";
import { isEletron } from "@/utils/getPath";
import os from "node:os";
// 以命名空间方式导入，便于测试通过 `vi.spyOn(imageModule, "ensureThumbnail")` 拦截调用，
// 也方便复用 isVideoFile / ensureVideoThumbnail。
import * as image from "@/utils/image";

const app = express();
const server = http.createServer(app);

/**
 * 缩略图生成并发上限（与 CPU 核数相关的小值）。
 * 取 max(1, floor(核数/2))，恒 ≤ CPU 核数，避免冷缓存批量请求同步生成压垮 CPU/事件循环，
 * 从而首屏不被同步批量生成阻塞（缺陷 1.1）。
 */
const THUMB_CONCURRENCY = Math.max(1, Math.floor(os.cpus().length / 2));

/**
 * p-limit v7 为 ESM-only，而本工程以 CommonJS 编译，因此通过动态 import() 加载，
 * 并在模块级缓存「单例 limiter」Promise，保证全进程共享同一并发闸门。
 */
type Limiter = <T>(fn: () => Promise<T> | T) => Promise<T>;
let limiterPromise: Promise<Limiter> | null = null;
function getThumbLimiter(): Promise<Limiter> {
  if (!limiterPromise) {
    limiterPromise = import("p-limit").then((m) => m.default(THUMB_CONCURRENCY) as unknown as Limiter);
  }
  return limiterPromise;
}

async function checkPermissions() {
  if (!isEletron()) return true;
  const userDataPath = u.getPath();
  try {
    fs.mkdirSync(userDataPath, { recursive: true });
    const testFile = path.join(userDataPath, ".access_test");
    fs.writeFileSync(testFile, "test");
    fs.unlinkSync(testFile);
  } catch (e) {
    const { dialog, app } = require("electron");
    const { response } = await dialog.showMessageBox({
      type: "warning",
      title: "权限不足",
      message: "应用无法访问数据目录",
      detail: `无法读写以下目录：\n${userDataPath}\n\n请联系管理员授予权限，或以管理员身份运行本程序。`,
      buttons: ["确认退出"],
      defaultId: 0,
    });
    if (response === 0) {
      app.quit();
    }
  }
}

export default async function startServe(randomPort: Boolean = false) {
  await checkPermissions();

  await u.writeVersion();
  const io = new Server(server, { cors: { origin: "*" } });
  socketInit(io);

  if (process.env.NODE_ENV == "dev") await buildRoute();

  expressWs(app);

  app.use(logger("dev"));
  app.use(cors({ origin: "*" }));
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));

  // oss 静态资源
  const ossDir = u.getPath("oss");
  if (!fs.existsSync(ossDir)) {
    fs.mkdirSync(ossDir, { recursive: true });
  }
  console.log("文件目录:", ossDir);
  app.use(
    "/oss",
    (req, res, next) => {
      // 视频预览分支：视频路径 + 预览标记（?preview=1）时，返回轻量首帧/封面占位预览，
      // 而非让视频走 ?size= 图片缩略图通道（缺陷 1.3）。
      // 不带预览标记的视频请求继续由后续 express.static 返回完整原文件（保留 3.3）。
      if (req.query.preview && image.isVideoFile(req.path)) {
        const smallImageBaseDir = path.join(ossDir, "smallImage");
        const originalPath = path.join(ossDir, req.path);
        const ext = path.extname(req.path);
        const base = path.basename(req.path, ext);
        const dir = path.dirname(req.path);
        // 视频占位预览统一以 .jpg 缓存，命名与图片缩略图保持同一 smallImage 根下的目录结构。
        const previewPath = path.join(smallImageBaseDir, dir, `${base}_preview.jpg`);

        getThumbLimiter()
          .then((limit) => limit(() => image.ensureVideoThumbnail(originalPath, previewPath)))
          .then((thumbnailPath) => {
            if (thumbnailPath) {
              res.sendFile(thumbnailPath);
            } else {
              // 预览生成失败，降级返回原文件（仍由 express.static 处理）。
              express.static(ossDir, { acceptRanges: false })(req, res, next);
            }
          })
          .catch(() => {
            express.static(ossDir, { acceptRanges: false })(req, res, next);
          });
        return;
      }

      // 如果传参 type=small，则返回小图
      if (req.query.size) {
        const size = req.query.size as string;
        const smallImageBaseDir = path.join(ossDir, "smallImage");
        const originalPath = path.join(ossDir, req.path);

        // 解析 size 参数
        let sizeSubDir: string;
        let sizeOpts: image.ThumbnailSize | undefined;

        // 判断是否为 WIDTHxHEIGHT 格式，如 "200x300"：等比压缩到指定宽高边界
        const dimensMatch = size.match(/^(\d+)x(\d+)$/i);
        // 判断是否为百分比格式，如 "30"、"30%"：等比压缩到原图的指定百分比
        const percentMatch = size.match(/^(\d+(?:\.\d+)?)\s*%?$/);

        if (dimensMatch) {
          const w = parseInt(dimensMatch[1], 10);
          const h = parseInt(dimensMatch[2], 10);
          sizeSubDir = `${w}x${h}`;
          sizeOpts = { type: "dimensions", width: w, height: h };
        } else if (percentMatch) {
          const pct = parseFloat(percentMatch[1]);
          sizeSubDir = `${percentMatch[1]}p`;
          sizeOpts = { type: "percentage", value: pct };
        } else {
          // 无效的 size 参数，降级返回原图
          express.static(ossDir, { acceptRanges: false })(req, res, next);
          return;
        }

        const ext = path.extname(req.path);
        const base = path.basename(req.path, ext);
        const dir = path.dirname(req.path);
        const smallImagePath = path.join(smallImageBaseDir, dir, `${base}_${sizeSubDir}${ext}`);

        // 通过模块级并发闸门限制同时进行的缩略图生成数量（缺陷 1.1：冷缓存批量请求
        // 不再同步压垮 CPU/事件循环，首屏不被阻塞）。
        getThumbLimiter()
          .then((limit) => limit(() => image.ensureThumbnail(originalPath, smallImagePath, sizeOpts)))
          .then((thumbnailPath) => {
            if (thumbnailPath) {
              res.sendFile(thumbnailPath);
            } else {
              // 缩略图生成失败，降级返回原图
              express.static(ossDir, { acceptRanges: false })(req, res, next);
            }
          })
          .catch(() => {
            // 生成过程异常，降级返回原图
            express.static(ossDir, { acceptRanges: false })(req, res, next);
          });
        return;
      }
      next();
    },
    express.static(ossDir, { acceptRanges: false }),
  );
  // skills 静态资源
  const skillsDir = u.getPath("skills");
  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
  }
  console.log("文件目录:", skillsDir);
  // 只允许图片文件访问
  app.use(
    "/skills",
    (req, res, next) => {
      /\.(jpe?g|png|gif|webp|svg|ico|bmp)$/i.test(req.path) ? next() : res.status(403).end();
    },
    express.static(skillsDir, { acceptRanges: false }),
  );

  // assets 静态资源
  const assetsDir = u.getPath("assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  console.log("文件目录:", assetsDir);
  app.use("/assets", express.static(assetsDir, { acceptRanges: false }));

  // data/web 静态网站
  const webDir = u.getPath("web");
  if (fs.existsSync(webDir)) {
    console.log("静态网站目录:", webDir);
    app.use(express.static(webDir, { acceptRanges: false }));
  } else {
    console.warn("静态网站目录不存在:", webDir);
  }

  app.use(async (req, res, next) => {
    const setting = await u.db("o_setting").where("key", "tokenKey").select("value").first();
    if (!setting) return res.status(444).send({ message: "服务器秘钥未配置，请联系管理员" });
    const { value: tokenKey } = setting;
    // 从 header 或 query 参数获取 token
    const rawToken = req.headers.authorization || (req.query.token as string) || "";
    const token = rawToken.replace("Bearer ", "");
    // 白名单路径
    if (req.path === "/api/login/login") return next();

    if (!token) return res.status(401).send({ message: "未提供token" });
    try {
      const decoded = jwt.verify(token, tokenKey as string);
      (req as any).user = decoded;
      next();
    } catch (err) {
      return res.status(401).send({ message: "无效的token" });
    }
  });

  const router = await import("@/router");
  await router.default(app);

  // 404 处理
  app.use((_, res, next: NextFunction) => {
    return res.status(404).send({ message: "API 404 Not Found" });
  });

  // 错误处理
  app.use((err: any, _: Request, res: Response, __: NextFunction) => {
    res.locals.message = err.message;
    res.locals.error = err;
    console.error(err);
    res.status(err.status || 500).send(err);
  });

  const port = randomPort ? 0 : 10588;
  return await new Promise((resolve) => {
    server.listen(port, async () => {
      const address = server.address();
      const realPort = typeof address === "string" ? address : address?.port;
      console.log(`[服务启动成功]: http://localhost:${realPort}`);
      resolve(realPort);
    });
  });
}

// 支持await关闭
export function closeServe(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((err?: Error) => {
        if (err) return reject(err);
        console.log("[服务已关闭]");
        resolve();
      });
    } else {
      resolve();
    }
  });
}

const isElectron = typeof process.versions?.electron !== "undefined";
if (!isElectron) startServe();
