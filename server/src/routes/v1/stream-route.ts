import express, { Request, Response } from "express";
import { db } from "../../db";
import { JsonArray } from "../../../prisma/client/runtime/library";
const router = express.Router();


// Rendering the embed html
// http://localhost:8000/stream/embed?id=VIDEO_ID&token=ACCESS_TOKEN
router.get("/embed", async (req: Request, res: Response) => {
    const { id, token } = req.query;
    if (!id) {
        return res.send("Video ID not provided")
    }
    const videoData = await db.video.findFirst({
        where: {
            id: String(id)
        }
    })
    // The referer lock logic
    if (!videoData) {
        return res.status(404).send("Video Not Found");
    }
    if(videoData.referer){
        res.setHeader("Content-Security-Policy", `frame-ancestors 'self' ${(videoData.referer as JsonArray).join(' ')}`);
    }
    if (videoData.protected && !token) {
        return res.status(403).send("Access denied");
    }
    if (videoData.protected && token) {
        // Token Validation
        const tokenData = await db.accessToken.findFirst({
            where: {
                id: String(token),
            }
        })
        if (!tokenData) {
            return res.status(403).send("Access Denied")
        }
        if (tokenData.type === "ONE_TIME") {
            console.log("Deleting the token");
            await db.accessToken.delete({
                where: {
                    id: String(token)
                }
            })
        } else if (tokenData.type === "TIME_BOUND") {
            if (tokenData.expires_on) {
                if (new Date() > tokenData.expires_on) {
                    await db.accessToken.delete({
                        where: {
                            id: String(token)
                        }
                    })
                    return res.status(400).send("Token Expired");
                }
            }
        }
    }
    return res.status(200).render("iframe", { videoId: id });
})

export default router;