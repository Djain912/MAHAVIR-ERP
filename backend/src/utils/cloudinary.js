/**
 * Cloudinary Configuration and Upload Utility
 * Handles image uploads to Cloudinary for cheque photos
 */

import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

console.log('Cloudinary Environment Variables Check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary configured with:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? 'Set' : 'Not set',
  api_secret: cloudinary.config().api_secret ? 'Set' : 'Not set'
});

/**
 * Configure Multer for memory storage
 * Files are stored in memory buffer before uploading to Cloudinary
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<String>} Cloudinary secure URL
 */
export const uploadToCloudinary = (fileBuffer, folder = 'cheques') => {
  return new Promise((resolve, reject) => {
    console.log('Starting Cloudinary upload...');
    console.log('Buffer type:', typeof fileBuffer);
    console.log('Buffer is Buffer?:', Buffer.isBuffer(fileBuffer));
    console.log('Buffer size:', fileBuffer?.length);
    console.log('Folder:', folder);
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing'
    });
    
    if (!fileBuffer || fileBuffer.length === 0) {
      reject(new Error('File buffer is empty or invalid'));
      return;
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `coca-cola-erp/${folder}`,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          console.error('Error details:', {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
            error: error.error
          });
          reject(new Error(`Image upload failed: ${error.message || error.error?.message || JSON.stringify(error)}`));
        } else {
          console.log('Cloudinary upload success');
          console.log('Result:', {
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format
          });
          resolve(result.secure_url);
        }
      }
    );
    
    try {
      uploadStream.end(fileBuffer);
      console.log('Buffer written to upload stream');
    } catch (streamError) {
      console.error('Stream error:', streamError);
      reject(new Error('Failed to write to upload stream: ' + streamError.message));
    }
  });
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error('Image deletion failed');
  }
};

export default cloudinary;
