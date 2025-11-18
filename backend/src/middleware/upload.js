import multer from 'multer';
import path from 'path';

// On utilise le stockage en mémoire (Cloudinary ou autre service fera l'upload réel)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const maxSize = 50 * 1024 * 1024; // 50MB

  // 🚫 Extensions dangereuses à bloquer pour la sécurité
  const dangerousExtensions = /\.(exe|bat|cmd|sh|dll|msi|scr|vbs|js|jar)$/i;
  if (dangerousExtensions.test(file.originalname)) {
    return cb(new Error('Type de fichier non autorisé pour des raisons de sécurité.'));
  }

  // ✅ Accepter tous les autres types de fichiers (pas de filtrage strict)
  cb(null, true);
};

// Configuration de multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

// Champs possibles (image, vidéo, document, etc.)
export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]);
