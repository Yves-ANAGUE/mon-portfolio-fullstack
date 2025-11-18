import cloudinary from '../config/cloudinary.js';

// Upload vers Cloudinary (Images et Vidéos uniquement)
export const uploadToCloudinary = async (file, folder = 'portfolio') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          use_filename: true,
          unique_filename: false,
          // Ne PAS transformer ou convertir le format
          transformation: []
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    throw error;
  }
};

// Convertir fichier en Base64 pour stockage dans Realtime Database
export const fileToBase64 = (file) => {
  return {
    data: file.buffer.toString('base64'),
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size
  };
};

// Supprimer de Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType 
    });
    return result;
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error);
    throw error;
  }
};

// Extraire le public_id depuis une URL Cloudinary
export const extractPublicId = (url) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  const folder = parts[parts.length - 2];
  return `${folder}/${publicId}`;
};
