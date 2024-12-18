import mongoose,{isValidObjectId} from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!channelId?.trim()){
        throw new ApiError(400,"channel id is required")
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"invalid channel id")
    }

    


})
