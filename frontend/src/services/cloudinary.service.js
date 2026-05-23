// frontend/src/services/cloudinary.service.js
// Upload DIRECT vers Cloudinary depuis le frontend (pas de limite de taille)

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

class CloudinaryService {
  async uploadFile(file, folder = 'portfolio/media', onProgress = null) {
    if (!CLOUD_NAME) throw new Error('VITE_CLOUDINARY_CLOUD_NAME manquant dans .env');
    if (!UPLOAD_PRESET) throw new Error('VITE_CLOUDINARY_UPLOAD_PRESET manquant dans .env');

    const isVideo = file.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    // ✅ public_id 100% unique
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 25);
    const publicId = `${safeName}_${timestamp}_${random}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('public_id', publicId);

    console.log(`⬆️ Cloudinary upload: "${file.name}" → public_id: "${publicId}"`);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          console.log(`✅ Cloudinary OK: ${result.public_id}`);
          console.log(`   URL: ${result.secure_url}`);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            type: isVideo ? 'video' : 'image',
            format: result.format,
            duration: result.duration || null,
            width: result.width || null,
            height: result.height || null,
          });
        } else {
          let errorMsg = `Erreur Cloudinary HTTP ${xhr.status}`;
          try {
            const errData = JSON.parse(xhr.responseText);
            errorMsg = errData.error?.message || errorMsg;
          } catch {}
          console.error(`❌ Cloudinary erreur: ${errorMsg}`);
          reject(new Error(errorMsg));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Erreur réseau vers Cloudinary'));
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  }
}

export default new CloudinaryService();
