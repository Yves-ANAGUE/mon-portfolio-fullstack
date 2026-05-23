// backend/src/controllers/media.controller.js
import { db } from '../config/firebase.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

export const getAllMedia = async (req, res) => {
  try {
    const mediaRef = db.ref('media');
    const snapshot = await mediaRef.once('value');
    const media = snapshot.val();
    if (!media) return res.json({ success: true, data: [] });
    const mediaArray = Object.keys(media).map(key => ({ id: key, ...media[key] }));
    res.json({ success: true, data: mediaArray });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération médias' });
  }
};

export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.ref(`media/${id}`).once('value');
    const mediaItem = snapshot.val();
    if (!mediaItem) return res.status(404).json({ success: false, message: 'Média non trouvé' });
    res.json({ success: true, data: { id, ...mediaItem } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération média' });
  }
};

// ✅ Route /media/register — reçoit JSON après upload Cloudinary direct
export const registerMedia = async (req, res) => {
  try {
    console.log('📡 registerMedia appelé');
    const { url, publicId, title, description, category, originalName, type, format, size, duration, width, height } = req.body;

    if (!url || !publicId) {
      return res.status(400).json({ success: false, message: 'url et publicId requis' });
    }

    const mediaData = {
      title: title || originalName || 'Média',
      description: description || '',
      category: category || 'portfolio',
      url, publicId, originalName: originalName || '',
      type: type || 'image',
      format: format || '',
      size: size || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (duration) mediaData.duration = duration;
    if (width) mediaData.width = width;
    if (height) mediaData.height = height;

    const newRef = db.ref('media').push();
    await newRef.set(mediaData);
    console.log('✅ registerMedia OK:', newRef.key);
    res.status(201).json({ success: true, data: { id: newRef.key, ...mediaData } });
  } catch (error) {
    console.error('❌ registerMedia error:', error);
    res.status(500).json({ success: false, message: 'Erreur enregistrement' });
  }
};

// ✅ POST /media — accepte fichiers OU JSON pur
export const uploadMedia = async (req, res) => {
  try {
    // ── CAS 1 : JSON pur (après upload Cloudinary direct depuis le frontend) ──
    const hasFiles = req.files && (
      req.files.image?.length > 0 ||
      req.files.video?.length > 0 ||
      req.files.images?.length > 0 ||
      req.files.mediaFiles?.length > 0
    );

    if (!hasFiles && req.body.url && req.body.publicId) {
      console.log('📡 uploadMedia — mode JSON (upload direct Cloudinary)');
      return registerMedia(req, res);
    }

    // ── CAS 2 : Fichiers via multer (upload classique) ──
    const { title, description, category } = req.body;
    const allFiles = [];
    if (req.files) {
      ['image', 'images', 'video', 'mediaFiles'].forEach(field => {
        if (req.files[field]) req.files[field].forEach(f => allFiles.push(f));
      });
    }

    if (allFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });
    }

    const mediaRef = db.ref('media');
    const uploadedItems = [];
    const errors = [];

    for (const file of allFiles) {
      try {
        const isVideo = file.mimetype.startsWith('video/');
        const folder = isVideo ? 'portfolio/videos' : 'portfolio/media';
        const result = await uploadToCloudinary(file, folder);
        const mediaData = {
          title: title || file.originalname.replace(/\.[^/.]+$/, ''),
          description: description || '',
          category: category || 'portfolio',
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          type: isVideo ? 'video' : 'image',
          format: result.format,
          size: file.size,
          ...(isVideo && result.duration ? { duration: result.duration } : {}),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const newRef = mediaRef.push();
        await newRef.set(mediaData);
        uploadedItems.push({ id: newRef.key, ...mediaData });
      } catch (err) {
        errors.push({ file: file.originalname, error: err.message });
      }
    }

    if (uploadedItems.length === 0) {
      return res.status(500).json({ success: false, message: 'Tous les uploads ont échoué', errors });
    }
    res.status(201).json({ success: true, message: `${uploadedItems.length} média(s) uploadé(s)`, data: uploadedItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur upload' });
  }
};

export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    const mediaRef = db.ref(`media/${id}`);
    const snapshot = await mediaRef.once('value');
    const existingMedia = snapshot.val();
    if (!existingMedia) return res.status(404).json({ success: false, message: 'Média non trouvé' });

    let mediaData = {
      title: title || existingMedia.title,
      description: description || existingMedia.description,
      category: category || existingMedia.category,
      updatedAt: new Date().toISOString()
    };

    const newFile = req.files?.image?.[0] || req.files?.video?.[0];
    if (newFile) {
      if (existingMedia.publicId) {
        await deleteFromCloudinary(existingMedia.publicId, existingMedia.type === 'video' ? 'video' : 'image');
      }
      const isVideo = newFile.mimetype.startsWith('video/');
      const result = await uploadToCloudinary(newFile, isVideo ? 'portfolio/videos' : 'portfolio/media');
      mediaData.url = result.secure_url;
      mediaData.publicId = result.public_id;
      mediaData.type = isVideo ? 'video' : 'image';
      mediaData.format = result.format;
      mediaData.originalName = newFile.originalname;
    }

    const updatedMedia = { ...existingMedia, ...mediaData };
    await mediaRef.set(updatedMedia);
    res.json({ success: true, data: { id, ...updatedMedia } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour' });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.ref(`media/${id}`).once('value');
    const mediaItem = snapshot.val();
    if (!mediaItem) return res.status(404).json({ success: false, message: 'Média non trouvé' });
    if (mediaItem.publicId) {
      await deleteFromCloudinary(mediaItem.publicId, mediaItem.type === 'video' ? 'video' : 'image');
    }
    await db.ref(`media/${id}`).remove();
    res.json({ success: true, message: 'Média supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression' });
  }
};

export const deleteMultipleMedia = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'IDs requis' });
    }
    let deletedCount = 0;
    for (const id of ids) {
      try {
        const snapshot = await db.ref(`media/${id}`).once('value');
        const item = snapshot.val();
        if (!item) continue;
        if (item.publicId) await deleteFromCloudinary(item.publicId, item.type === 'video' ? 'video' : 'image');
        await db.ref(`media/${id}`).remove();
        deletedCount++;
      } catch {}
    }
    res.json({ success: true, message: `${deletedCount} média(s) supprimé(s)` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur suppression multiple' });
  }
};
