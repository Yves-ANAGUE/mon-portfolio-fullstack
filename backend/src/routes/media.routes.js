import express from 'express';
import {
  getAllMedia,
  getMediaById,
  uploadMedia,
  updateMedia,
  deleteMedia
} from '../controllers/media.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllMedia);
router.get('/:id', getMediaById);

// Routes admin
router.post('/', authenticateToken, isAdmin, uploadFields, uploadMedia);
router.put('/:id', authenticateToken, isAdmin, uploadFields, updateMedia);
router.delete('/:id', authenticateToken, isAdmin, deleteMedia);

export default router;
