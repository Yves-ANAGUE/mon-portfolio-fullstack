// backend/src/routes/media.routes.js
import express from 'express';
import {
  getAllMedia,
  getMediaById,
  uploadMedia,
  updateMedia,
  deleteMedia,
  deleteMultipleMedia,
  registerMedia
} from '../controllers/media.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';

const router = express.Router();

// ── GET publiques ─────────────────────────────────────────────
router.get('/', getAllMedia);

// ✅ Routes spécifiques AVANT /:id (sinon Express les traite comme des IDs)
// POST /media/register — reçoit JSON après upload Cloudinary direct
router.post('/register', authenticateToken, isAdmin, registerMedia);

// DELETE /media/bulk — suppression multiple
router.delete('/bulk', authenticateToken, isAdmin, deleteMultipleMedia);

// ── Routes avec paramètre ─────────────────────────────────────
router.get('/:id', getMediaById);
router.put('/:id', authenticateToken, isAdmin, uploadFields, updateMedia);
router.delete('/:id', authenticateToken, isAdmin, deleteMedia);

// ── POST /media — upload classique (multer) ───────────────────
router.post('/', authenticateToken, isAdmin, uploadFields, uploadMedia);

export default router;
