import  {Router} from "express"
import { registerUser , loginUser, logoutUser, refreshAccessToken} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {varifyJWT} from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",  // same both in frontend and backend
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
            
        }
    ]),
    registerUser
)   // api/v1/users/register pe registerUser pe jayega

router.route('/login').post(loginUser)


// secured routes -- jab user login hoga ---auth middleware se pta karenege

router.route('/logout').post(varifyJWT,  logoutUser)
router.route('/refresh-token').post(refreshAccessToken);



export default router;