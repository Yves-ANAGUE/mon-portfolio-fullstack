// backend/src/services/upload.service.js
import cloudinary from '../config/cloudinary.js';
import crypto from 'crypto';
import path from 'path';

const generatePublicId = (originalname, folder) => {
  const timestamp = Date.now();
  const randomHex = crypto.randomBytes(6).toString('hex');
  const safeName = (originalname || 'file')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 25);
  // ✅ public_id SANS le folder car Cloudinary l'ajoute via l'option folder
  return `${safeName}_${timestamp}_${randomHex}`;
};

export const uploadToCloudinary = async (file, folder = 'portfolio') => {
  try {
    // ✅ Copie du buffer AVANT d'ouvrir le stream
    const bufferCopy = Buffer.from(file.buffer);
    const publicId = generatePublicId(file.originalname, folder);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: publicId,
          resource_type: 'auto',
          use_filename: false,
          unique_filename: false,
          overwrite: false,
          invalidate: true,
          transformation: []
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log(`✅ Cloudinary OK: ${result.public_id}`);
            console.log(`   URL: ${result.secure_url}`);
            resolve(result);
          }
        }
      );
      // ✅ Utilise la copie du buffer
      uploadStream.end(bufferCopy);
    });
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    throw error;
  }
};

export const fileToBase64 = (file) => {
  return {
    data: file.buffer.toString('base64'),
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
  };
};

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });
    return result;
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error);
    throw error;
  }
};

export const extractPublicId = (url) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  const folder = parts[parts.length - 2];
  return `${folder}/${publicId}`;
};
