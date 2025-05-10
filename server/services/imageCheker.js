import streamifier from 'streamifier';
import { cloudinary } from "../config/cloudinary.js";

export const imageCheck = async (file, err) => {
    if (!file)
        return err('Image is required');
    if (file.size > 10 * 1024 * 1024)
        return err('Image size at least 10MB');

    const IMAGE_EXTENSIONS = [
        'jpg', 'jpeg', 'png', 'gif', 'bmp',
        'webp', 'tiff', 'tif', 'svg', 'ico',
        'heic', 'heif', 'raw', 'psd', 'ai',
        'eps', 'indd'
    ];

    const ext = file.originalname.split('.').pop().toLowerCase();
    if (!IMAGE_EXTENSIONS.includes(ext))
        return err('Only image files are allowed');

    const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            streamifier.createReadStream(fileBuffer).pipe(stream);
        });
    };

    const cloudinaryResponse = await uploadToCloudinary(file.buffer);
    return cloudinaryResponse;
};