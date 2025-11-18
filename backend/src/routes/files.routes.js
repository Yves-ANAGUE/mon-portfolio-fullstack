import express from 'express';
import {
  getAllFiles,
  getFileById,
  uploadFile,
  updateFile,
  deleteFile,
  downloadFile
} from '../controllers/files.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllFiles);
router.get('/:id', getFileById);
router.get('/:id/download', downloadFile); // ← NOUVEAU : Télécharger le fichier

// Routes admin
router.post('/', authenticateToken, isAdmin, uploadFields, uploadFile);
router.put('/:id', authenticateToken, isAdmin, uploadFields, updateFile);
router.delete('/:id', authenticateToken, isAdmin, deleteFile);

export default router;
