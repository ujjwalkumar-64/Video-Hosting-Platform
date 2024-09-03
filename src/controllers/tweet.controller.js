import mongoose,{isValidObjectId} from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req,res) => {
    //todo- create tweet

    const {content} = req.body

    if(!content?.trim()){
        throw new ApiError(400,"content is required")
    }
    
    if(!req.user){
        throw new ApiError(400,"user is not authorized")
    }

    const tweet = await Tweet.create({
        owner:req.user?._id,
        content:content?.trim()
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        tweet,
        "tweet created successfully"
    ))

})

const getUserTweets = asyncHandler(async (req, res)=>{
    // todo : get user tweets
    

    const {page=1, limit=30,} = req.query
    const { userId } = req.params;
     
    if(!userId?.trim()){
            throw new ApiError(400,"user Id is required")
        }
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid userId")
    }
    
    const skip = (page - 1) * limit;
  
  
    const userTweets = await Tweet.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },{
        $sort: {
          createdAt: -1,
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "tweet",
          as: "likes",
        }
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          owner: 1,
          likesCount: { $size: "$likes" },
          username: { $arrayElemAt: ["$user.username", 0] },
          profilePicture: { $arrayElemAt: ["$user.avatar", 0] },
        }, 
      },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(limit),
      }
    ]);
  
    if (userTweets.length === 0) {
      return res.status(404).json(new ApiError("User tweets not found", 404));
    }
  
    const allTweetsCount = await Tweet.countDocuments({ owner: userId });
  
  
    return res.status(200).json(
      new ApiResponse(
         200,
        { userTweets, allTweetsCount, page, totalPages: Math.ceil(allTweetsCount / limit) },
         "User tweets fetch successfully",
      )
    );
  

})

const updateTweet = asyncHandler(async (req,res) => {
    const{tweetId} = req.params
    const {content} = req.body

    if(!(tweetId?.trim )){
        throw new ApiError(400,"tweetId is required")
    }

    if(!(content?.trim || typeof content !== "string")){
        throw new ApiError(400,"content is required")
    }
    
    
    const tweet = await Tweet.findById(tweetId);
     if(!tweet){
        throw new ApiError(400,"invalid tweet id or tweet is no longer available")
    } 

    if(! tweet?.owner.equals(req.user?._id) ) {
      throw new ApiError(400,"user is not autharized to do this operation")
    }

    tweet.content=content.trim();
    await tweet.save();

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        tweet,
        "tweet is updated succesfully"
    ))

})

const deleteTweet = asyncHandler(async (req, res)=>{
    const {tweetId} = req.params

    if(!tweetId?.trim()){
        throw new ApiError(400,"tweetId is required")
    }

    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400,"invalid tweet id");
    }

  const tweet = await Tweet.findOneAndDelete({ _id: tweetId, owner: req.user._id });
  if (!tweet) {
      throw new ApiError(404, "Tweet not found or user is not authorized to delete this tweet");
  }



    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "tweet is deleted successfully"
    ))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}