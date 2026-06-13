import express from "express";
import u from "@/utils";
import { success } from "@/lib/responseFormat";
import { z } from "zod";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

// 获取生成图片
export default router.post(
  "/",
  validateFields({
    url: z.string(),
  }),
  async (req, res) => {
    let { url } = req.body;
    if (url.startsWith("/oss/")) {
      // 还原为原图相对路径：剥除 /smallImage 前缀与缩略图尺寸后缀（_20p / _200x300）
      url = u
        .replaceUrl(url)
        .replace(/^smallImage\//, "")
        .replace(/_(\d+(?:\.\d+)?p|\d+x\d+)(\.[^./]+)$/i, "$2");
    }
    const bigImageUrl = await u.oss.getFileUrl(u.replaceUrl(url));
    res.status(200).send(success(bigImageUrl));
  },
);
