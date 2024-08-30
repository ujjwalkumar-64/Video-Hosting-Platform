import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudnary} from "../utils/cloudnary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

// access and refresh token genrate method separate

// note - here not use async handler since we dont handle web request , ye bas internal method hai jo use kr rhe
const generateAcessAndRefreshToken =async (userId) =>{
    try {
       const user = await User.findById(userId);

      const accessToken = user.generateAcessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken= refreshToken;

      await user.save({validateBeforeSave:false});  // while save a modal moongose model kiken like password , to prevent it we use parameter" validateBeforeSave:false"

      return {accessToken,refreshToken};

    } catch (error) {
        throw new ApiError(500,"something went wrong while genrating access and refresh token")
    }
}

const registerUser = asyncHandler( async function (req,res) {


    /*  ** steps to register user ::
        1. get user details from frontend
        2. validation - not empty
        3. check if user already exits: username , email
        4. check for images, check for avatar
        5. upload them to cloudanary , avatar
        6. create user object - create entry in db
        7. remove password and refresh token field from response
        8. check for user creation
        9. return res

    */

       const {username, email, fullName, password} = req.body
       if (
            [username,email,fullName,password].some(
                (field) => field?.trim()==="" 
            )
       ) {
            throw new ApiError(400,"field is required")
       }

    //    console.log("req.body:",req.body);
       // to check user is register or not we have to import User , kyunki usko export kr rakha hai

      const existedUser =  await User.findOne(
            {
                $or:
                [
                    { username },
                    { email }
                ]
            }
       )

       if(existedUser){
        throw new ApiError(409,"user with same email or username is already exist")
       }

       // image

      const avatarLocalPath= req.files?.avatar[0]?.path;
    //   const coverImageLocalPath = req.files?.coverImage[0]?.path;      // it give error if we not upload coverimage

       let coverImageLocalPath;
       if( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath= req.files.coverImage[0].path

       }

       if(!avatarLocalPath){
        throw new ApiError(400, "avatar is required");
       }

       
      const avatar = await uploadOnCloudnary(avatarLocalPath);
      const coverImage = await uploadOnCloudnary(coverImageLocalPath);

      if(!avatar){
        throw new ApiError(400, "avatar is required");
      }

      // create in db

    const user = await  User.create({
                    fullName,
                    avatar:avatar.url ,
                    coverImage:coverImage?.url || "",
                    email,
                    password,
                    username:username.toLowerCase()
                 })

    const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
    )

    // console.log("user without password",createdUser);

    if(!createdUser){
        throw new ApiError(500,"something wrong while registring user")
    }

    return  res.status(201).json(
        new ApiResponse(200,createdUser, "user registered successfully")
    )
        
    
 

}  )

const loginUser = asyncHandler(async function (req,res){

    /* steps to login user
        1. req.body -> data 
        2. username or email
        3. find user
        4. password check
        5. access and refresh token generate 
        6. send cookies ke help se
        7. send res 
    */

        const {username,email,password} = req.body
        // console.log(username)
        // console.log(password)
        // console.log(email)

        if(!(username || email)){
            throw new ApiError(400,"username or email is required");
        }

       const user = await User.findOne({
            $or:[{username},{email}]
        })

        if(!user){
            throw new ApiError(404,"User doenot exist");
        }

        const isPasswordValid= await user.isPasswordCorrect(password)

        if(!isPasswordValid){
            throw new ApiError(404,"invalid user credentials ")
        }

        const {accessToken,refreshToken} =await generateAcessAndRefreshToken(user._id);

        // abhi user me refresh token nhi save hua refrens upar ka hai
        const loggedInUser= await User.findById(user._id).select("-password -refreshToken");

        //generate cookies

        const options= {
            httpOnly:true,  // ye karne se server se modify only hoga nhi to pehle koi bhi kr skta tha
            secure:true,
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken    // yaha phir se issi liye bhej rhe agr user khud se tore krna chah rha  like in mobile application
                },
                "User logged in successfully"
            )
        )

})


// logout 
const logoutUser = asyncHandler(async function (req,res)  {
    await User.findByIdAndUpdate(
        req.user._id,  // middleware me jo add kiya tha waha se 
        {
            $set: {
                refreshToken: undefined   // refresh token empty kr diye
            }
        },{
            new:true  // updated db
        }
     ) 
     const options= {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(
            200,
             {},
            "User logged out successfully"
        )
    )
})

const refreshAccessToken = asyncHandler(async function (req,res){

   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user= await User.findById(decodedToken?._id)
        
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken!== user?.refreshToken){
            throw new ApiError(401,"refresh tokenis expired or used")
        }
    
        // check complete now generate new
        const {accessToken,newRrefreshToken}= await generateAcessAndRefreshToken(user._id)
    
        const options= {
            httpOnly:true,
            secure:true
        }
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRrefreshToken},
                "Access token Refresh Successfully"
            )
        )

    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token");
    }
})
 
   

export {registerUser, loginUser,logoutUser,refreshAccessToken};