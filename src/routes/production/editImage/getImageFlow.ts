import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

export default router.post(
  "/",
  validateFields({
    id: z.number(),
  }),
  async (req, res) => {
    const { id, type } = req.body;
    const imageFlowData = await u.db("o_imageFlow").where("id", id).first();
    if (imageFlowData?.flowData) {
      const parseFlow = JSON.parse(imageFlowData.flowData);
      // 兼容历史脏数据：曾经被错误写入的缩略图路径（带 smallImage/ 前缀或 _20p 尺寸后缀），
      // 还原为原图相对路径后再签名，避免左侧上传图无法加载。
      const toOriginalRelPath = (p: string) =>
        u.replaceUrl(p).replace(/^\/?smallImage\//, "").replace(/_(\d+(?:\.\d+)?p|\d+x\d+)(\.[^./]+)$/i, "$2");
      await Promise.all(
        parseFlow.nodes.map(async (node: any) => {
          if (node.type === "upload") {
            node.data.image = node.data.image ? await u.oss.getSmallImageUrl(toOriginalRelPath(node.data.image)) : "";
          } else if (node.type === "generated") {
            node.data.generatedImage = node.data.generatedImage ? await u.oss.getSmallImageUrl(toOriginalRelPath(node.data.generatedImage)) : "";

            node.data.references = await Promise.all(node.data.references.map(async (item: { image: string }) => {
              return {
                image: item.image ? await u.oss.getSmallImageUrl(toOriginalRelPath(item.image)) : ""
              }
            }));
          }
        }),
      );
      return res.status(200).send(success({ ...parseFlow, id: imageFlowData.id }));
    }

    return res.status(200).send(success(null));
  },
);
