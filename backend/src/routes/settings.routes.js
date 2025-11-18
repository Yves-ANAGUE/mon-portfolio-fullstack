import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';

const router = express.Router();

// Route publique
router.get('/', getSettings);

// Route admin
router.put('/', authenticateToken, isAdmin, uploadFields, updateSettings);

export default router;
