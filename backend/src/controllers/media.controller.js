import { db } from '../config/firebase.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

export const getAllMedia = async (req, res) => {
  try {
    const mediaRef = db.ref('media');
    const snapshot = await mediaRef.once('value');
    const media = snapshot.val();

    if (!media) {
      return res.json({
        success: true,
        data: []
      });
    }

    const mediaArray = Object.keys(media).map(key => ({
      id: key,
      ...media[key]
    }));

    res.json({
      success: true,
      data: mediaArray
    });
  } catch (error) {
    console.error('Erreur récupération médias:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des médias'
    });
  }
};

export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const mediaRef = db.ref(`media/${id}`);
    const snapshot = await mediaRef.once('value');
    const mediaItem = snapshot.val();

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Média non trouvé'
      });
    }

    res.json({
      success: true,
      data: { id, ...mediaItem }
    });
  } catch (error) {
    console.error('Erreur récupération média:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du média'
    });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    let mediaData = {
      title: title || '',
      description: description || '',
      category: category || 'other',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Upload image
    if (req.files && req.files.image) {
      const result = await uploadToCloudinary(req.files.image[0], 'portfolio/media');
      mediaData.url = result.secure_url;
      mediaData.publicId = result.public_id;
      mediaData.type = 'image';
      mediaData.format = result.format;
    }

    // Upload vidéo
    if (req.files && req.files.video) {
      const result = await uploadToCloudinary(req.files.video[0], 'portfolio/videos');
      mediaData.url = result.secure_url;
      mediaData.publicId = result.public_id;
      mediaData.type = 'video';
      mediaData.format = result.format;
      mediaData.duration = result.duration;
    }

    if (!mediaData.url) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier média fourni'
      });
    }

    const mediaRef = db.ref('media');
    const newMediaRef = mediaRef.push();
    await newMediaRef.set(mediaData);

    res.status(201).json({
      success: true,
      message: 'Média uploadé avec succès',
      data: {
        id: newMediaRef.key,
        ...mediaData
      }
    });
  } catch (error) {
    console.error('Erreur upload média:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du média'
    });
  }
};

export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;

    const mediaRef = db.ref(`media/${id}`);
    const snapshot = await mediaRef.once('value');
    const existingMedia = snapshot.val();

    if (!existingMedia) {
      return res.status(404).json({
        success: false,
        message: 'Média non trouvé'
      });
    }

    let mediaData = {
      title: title || existingMedia.title,
      description: description || existingMedia.description,
      category: category || existingMedia.category,
      updatedAt: new Date().toISOString()
    };

    // Si un nouveau fichier est uploadé
    if (req.files && (req.files.image || req.files.video)) {
      // Supprimer l'ancien média
      if (existingMedia.publicId) {
        const resourceType = existingMedia.type === 'video' ? 'video' : 'image';
        await deleteFromCloudinary(existingMedia.publicId, resourceType);
      }

      // Upload nouveau média
      if (req.files.image) {
        const result = await uploadToCloudinary(req.files.image[0], 'portfolio/media');
        mediaData.url = result.secure_url;
        mediaData.publicId = result.public_id;
        mediaData.type = 'image';
        mediaData.format = result.format;
      }

      if (req.files.video) {
        const result = await uploadToCloudinary(req.files.video[0], 'portfolio/videos');
        mediaData.url = result.secure_url;
        mediaData.publicId = result.public_id;
        mediaData.type = 'video';
        mediaData.format = result.format;
        mediaData.duration = result.duration;
      }
    }

    const updatedMedia = {
      ...existingMedia,
      ...mediaData
    };

    await mediaRef.set(updatedMedia);

    res.json({
      success: true,
      message: 'Média mis à jour avec succès',
      data: {
        id,
        ...updatedMedia
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour média:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du média'
    });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const mediaRef = db.ref(`media/${id}`);
    const snapshot = await mediaRef.once('value');
    const mediaItem = snapshot.val();

    if (!mediaItem) {
      return res.status(404).json({
        success: false,
        message: 'Média non trouvé'
      });
    }

    // Supprimer de Cloudinary
    if (mediaItem.publicId) {
      const resourceType = mediaItem.type === 'video' ? 'video' : 'image';
      await deleteFromCloudinary(mediaItem.publicId, resourceType);
    }

    await mediaRef.remove();

    res.json({
      success: true,
      message: 'Média supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression média:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du média'
    });
  }
};
