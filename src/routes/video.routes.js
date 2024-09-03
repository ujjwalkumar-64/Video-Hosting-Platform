import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import {publishAVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus,getAllVideos} from "../controllers/video.controller.js";

const router= Router();

router.route('/publishAVideo').post(varifyJWT,upload.fields(
    [
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1,
        }
    ]
),publishAVideo)

router.route('/c/:videoId').get(varifyJWT,getVideoById);

router.route('/updateVideo/:videoId').patch(varifyJWT,upload.single("thumbnail"),updateVideo)
router.route("/deleteVideo/:videoId").delete(varifyJWT,deleteVideo)
router.route("/togglePublishStatus/c/:videoId").patch(varifyJWT,togglePublishStatus)
router.route("/getAllVideos").get(varifyJWT,getAllVideos)


export default router;