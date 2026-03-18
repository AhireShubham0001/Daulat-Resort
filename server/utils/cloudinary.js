import { v2 as cloudinary } from 'cloudinary';
import stream from 'stream';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadFile = async (fileObject, folder = 'daulat_resort/general') => {
    return new Promise((resolve, reject) => {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: folder,          // ← dynamic folder per upload type
                timeout: 300000,         // 5 minutes (was 2 min) for large files
                chunk_size: 6000000,     // 6 MB chunks — helps with large image uploads
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    return reject(error);
                }
                resolve({
                    id: result.public_id,
                    webViewLink: result.secure_url,
                    webContentLink: result.secure_url,
                });
            }
        );

        bufferStream.pipe(uploadStream);
    });
};

export const deleteFile = async (fileId) => {
    try {
        const result = await cloudinary.uploader.destroy(fileId);
        console.log(`Deleted file ${fileId} from Cloudinary:`, result);
        return result;
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw error;
    }
};
