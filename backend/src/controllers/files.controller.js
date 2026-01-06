import { db } from '../config/firebase.js';
import { fileToBase64 } from '../services/upload.service.js';

/**
 * Supprime accents et caractères non ASCII
 * (obligatoire pour Vercel dans Content-Disposition)
 */
const sanitizeFilename = (filename) => {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
};

export const getAllFiles = async (req, res) => {
  try {
    const filesRef = db.ref('files');
    const snapshot = await filesRef.once('value');
    const files = snapshot.val();

    if (!files) {
      return res.json({
        success: true,
        data: []
      });
    }

    const filesArray = Object.keys(files).map(key => ({
      id: key,
      ...files[key],
      // Ne pas retourner les données Base64 dans la liste (trop lourd)
      data: undefined
    }));

    res.json({
      success: true,
      data: filesArray
    });
  } catch (error) {
    console.error('Erreur récupération fichiers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers'
    });
  }
};

export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const fileRef = db.ref(`files/${id}`);
    const snapshot = await fileRef.once('value');
    const file = snapshot.val();

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    res.json({
      success: true,
      data: { id, ...file }
    });
  } catch (error) {
    console.error('Erreur récupération fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du fichier'
    });
  }
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const file = req.files.file[0];
    const { title, description, category } = req.body;

    // Vérifier la taille (max 10MB pour Base64)
    const maxSize = 1000000 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux. Maximum 10MB.'
      });
    }

    // Convertir en Base64
    const fileData = fileToBase64(file);

    const fileInfo = {
      title: title || file.originalname,
      description: description || '',
      category: category || 'other',
      originalName: fileData.originalName,
      mimeType: fileData.mimeType,
      size: fileData.size,
      data: fileData.data, // Données Base64
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const filesRef = db.ref('files');
    const newFileRef = filesRef.push();
    await newFileRef.set(fileInfo);

    res.status(201).json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: {
        id: newFileRef.key,
        ...fileInfo,
        data: undefined // Ne pas retourner les données Base64 dans la réponse
      }
    });
  } catch (error) {
    console.error('Erreur upload fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du fichier'
    });
  }
};

export const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;

    const fileRef = db.ref(`files/${id}`);
    const snapshot = await fileRef.once('value');
    const existingFile = snapshot.val();

    if (!existingFile) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    let updateData = {
      title: title || existingFile.title,
      description: description || existingFile.description,
      category: category || existingFile.category,
      updatedAt: new Date().toISOString()
    };

    // Si un nouveau fichier est uploadé
    if (req.files && req.files.file) {
      const file = req.files.file[0];

      // Vérifier la taille
      const maxSize = 1000000 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'Fichier trop volumineux. Maximum 10MB.'
        });
      }

      const fileData = fileToBase64(file);
      updateData = {
        ...updateData,
        originalName: fileData.originalName,
        mimeType: fileData.mimeType,
        size: fileData.size,
        data: fileData.data
      };
    }

    const updatedFile = {
      ...existingFile,
      ...updateData
    };

    await fileRef.set(updatedFile);

    res.json({
      success: true,
      message: 'Fichier mis à jour avec succès',
      data: {
        id,
        ...updatedFile,
        data: undefined
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du fichier'
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const fileRef = db.ref(`files/${id}`);
    const snapshot = await fileRef.once('value');
    const file = snapshot.val();

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    await fileRef.remove();

    res.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier'
    });
  }
};

// Endpoint pour télécharger un fichier
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.ref(`files/${id}`).once('value');
    const file = snapshot.val();

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    const buffer = Buffer.from(file.data, 'base64');
    const safeFilename = sanitizeFilename(file.originalName || 'download');

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFilename}"`
    );
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Erreur téléchargement fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du fichier'
    });
  }
};
