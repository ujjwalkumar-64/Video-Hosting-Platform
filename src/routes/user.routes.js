import  {Router} from "express"
import { registerUser ,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory} from "../controllers/user.controller.js";
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
router.route('/change-password').post(varifyJWT,changeCurrentPassword);
router.route('/current-user').get(varifyJWT,getCurrentUser);
router.route('/update-account').patch(varifyJWT,updateAccountDetails);
router.route('/avatar').patch(varifyJWT,upload.single("avatar"),updateUserAvatar);
router.route('/coverImage').patch(varifyJWT,upload.single("coverImage"),updateUserCoverImage);

router.route('/c/:username').get(varifyJWT,getUserChannelProfile);
router.route('/history').get(varifyJWT,getWatchHistory)


export default router;