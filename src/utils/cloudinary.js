import { v2 as cloudinary } from 'cloudinary';
import {unlinkSync} from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadToCloudinary = async (localFilePath) => {
    if(!localFilePath) return null;

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(response)
    
        unlinkSync(localFilePath, (err) => {
            if(err) throw err;
            console.log(`Local file ${localFilePath} deleted`);
        })

        return response;
    } catch(error) {
        console.log(`Could not upload to Cloudinary. Err: ${error}`);
        return null;
    }
}

export {uploadToCloudinary};