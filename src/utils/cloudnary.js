import dotenv from "dotenv"
import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
 
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudnary = async (localFilePath) =>{
    try {
        console.log(localFilePath);
        if(!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath);
        //file has been uploaded successfully
        console.log("file is uploaded on cloudinary", response.url)
        return response;

    } catch (error) {
        console.error("error while uploading ",error);
        fs.unlinkSync(localFilePath) // remove the local save temp file as upload failed
        return null;
    }
}

export {uploadOnCloudnary}
