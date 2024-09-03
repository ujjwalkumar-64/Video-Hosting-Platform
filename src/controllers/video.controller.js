import mongoose,{isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import{Video} from "../models/video.model.js";
import {uploadOnCloudnary} from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// const getAllVideos = asyncHandler(async (req,res)=>{
//     const {page =1 ,limit=10, query,sortBy, sortType, userId} = req.query
//     // todo: get all videos based on query, sort, pagination

//     const video = await Video.aggregate([
//         {
//             $match:{
//                 owner:mongoose.Types.ObjectId(userId)
//             }
//         },
         
//     ])

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             video,
//             "all videos fetch successfully"
//         )
//     )

// })

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc', userId } = req.query;
     // todo: get all videos based on query, sort, pagination

    // Create a filter object for querying the videos
    const filter = {};
    if (query) {
        // Assuming you want to search by title or description
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }
    if (userId) {
        // Filter by specific user if userId is provided
        filter.owner = userId;
    }

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Convert sortType to 1 or -1 for ascending or descending order
    const sortOrder = sortType.toLowerCase() === 'asc' ? 1 : -1;

    // Fetch videos from the database
    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

    // Get the total count for pagination
    const totalVideos = await Video.countDocuments(filter);

    // Prepare pagination metadata
    const totalPages = Math.ceil(totalVideos / limit);

    return res.status(200).json(new ApiResponse(
        200,
        {
            videos,
            pagination: {
                totalVideos,
                totalPages,
                currentPage: parseInt(page),
                limit: parseInt(limit),
            },
        },
        "Videos fetched successfully"
    ));
});


const publishAVideo = asyncHandler(async (req,res)=>{
    const {title, description} = req.body
    // todo: get video , upload on cloudanary, create video

    const videoLocalPath = req.files?.videoFile[0]?.path

    if(!videoLocalPath){
        throw new ApiError(400,"video file is required");
    }

    const videoFile = await uploadOnCloudnary(videoLocalPath);

    if(!videoFile){
        throw new ApiError(400,"video file is required");
    }

    const duration = videoFile?.duration;

    const thumbnailLocalPath= req.files?.thumbnail[0]?.path

    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is required");
    }

    const thumbnail = await uploadOnCloudnary(thumbnailLocalPath);

    if(!thumbnail){
        throw new ApiError(400," thumbnail is required")
    }

    if(!req.user){
        throw new ApiError(400,"user is not found")
    }

    const video = await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        owner:req.user?._id,
        title,
        description,
        duration,
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        video,
        "video  is uploaded"
    ))




})

const getVideoById= asyncHandler(async (req,res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!videoId?.trim()){
        throw new ApiError(400, "video id is missing")
    }

    const video = await Video.findById(videoId);

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        video,
        "video is successfully fetch"
    ))


})

const updateVideo = asyncHandler(async (req,res)=>{
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId?.trim()){
        throw new ApiError(400,"videoId is missing")
    }

    if (!isValidObjectId(videoId)){
        throw new  ApiError(400,"video id is not valid")
    };

    const {title, description}= req.body
     
    const thumbnailLocalPath= req.file?.path;

    const thumbnail = await uploadOnCloudnary(thumbnailLocalPath);

    if(!(title || description || thumbnail)){
        throw new ApiError(400,"title or description or thumbnail is required")
    }

    const video = await Video.findOneAndUpdate(
        {_id:videoId,owner:req.user._id},
        {
            $set:{
                title:title?.trim(),
                description:description?.trim(),
                thumbnail:thumbnail?.url,
            }
        },
        {
            new:true,
        }
    );
    if(!video){
        throw new ApiError(400,"video is not found or user is not autharized to update video")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        video,
        "video file is updated "
    ))

     





})

const deleteVideo = asyncHandler(async (req,res) =>{
    const {videoId} = req.params
    // todo: delete video

    if(!videoId?.trim()){
        throw new ApiError(400,"videoId id required")
    }

    const video = await Video.findOneAndDelete({ _id: videoId, owner: req.user._id });
    if (!video) {
        throw new ApiError(404, "Video not found or user is not authorized to delete this video");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req,res) => {
    const { videoId } = req.params

    if(!videoId?.trim()){
        throw new ApiError(400,"videoId id required")
    }

    if (!isValidObjectId(videoId)){
        throw new  ApiError(400,"video id is not valid")
    };

     const oldVideo = await Video.findById(videoId)

    if(!oldVideo){
        throw new ApiError(400,"toggle status not found")
    }

    const video = await Video.findOneAndUpdate(
        {_id:videoId,owner:req.user._id},
        {
            $set:{
                isPublished:!(oldVideo?.isPublished),
            }
        },
        {
            new:true,
        }
    )

    if(!video){
        throw new ApiError(400,"video is not found or user is not autharized to change publish status")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        video,
        "toggle status change"
    ))
})

export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos,

}