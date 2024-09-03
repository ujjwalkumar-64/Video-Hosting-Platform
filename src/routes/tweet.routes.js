import { Router } from "express";
import {createTweet,getUserTweets,updateTweet,deleteTweet} from "../controllers/tweet.controller.js"
import {varifyJWT} from "../middlewares/auth.middleware.js";

const router=  Router();
router.use(varifyJWT);

router.route("/createTweet").post(createTweet);
router.route("/getUserTweets/:userId").get(getUserTweets);

router.route("/updateTweet/:tweetId").patch(updateTweet);

router.route("/deleteTweet/:tweetId").delete(deleteTweet);


export default router;