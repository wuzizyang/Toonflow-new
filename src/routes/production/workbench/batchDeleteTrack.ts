import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
const router = express.Router();

export default router.post(
  "/",
  validateFields({
    ids: z.array(z.number()).nonempty(),
  }),
  async (req, res) => {
    const { ids } = req.body;
    await u.db("o_videoTrack").whereIn("id", ids).delete();
    await u.db("o_storyboard").whereIn("trackId", ids).update({
      trackId: null,
    });
    res.status(200).send(success({ message: "视频段批量删除成功" }));
  },
);
