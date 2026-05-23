import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Bloquer les extensions dangereuses uniquement
  const dangerousExtensions = /\.(exe|bat|cmd|sh|dll|msi|scr|vbs|jar)$/i;
  if (dangerousExtensions.test(file.originalname)) {
    return cb(new Error('Type de fichier non autorisé pour des raisons de sécurité.'));
  }
  // Accepter tout le reste
  cb(null, true);
};

// ✅ 500MB pour supporter les vidéos lourdes
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024,  // 500MB
    files: 50                      // max 50 fichiers par requête
  }
});

export const uploadFields = upload.fields([
  { name: 'image',      maxCount: 1  },
  { name: 'images',     maxCount: 50 },
  { name: 'video',      maxCount: 1  },
  { name: 'file',       maxCount: 1  },
  { name: 'coverImage', maxCount: 1  },
  { name: 'mediaFiles', maxCount: 50 }
]);
