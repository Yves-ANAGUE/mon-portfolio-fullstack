// backend/src/routes/languages.routes.js
import express from 'express';
import { getAllLanguages, createLanguage, updateLanguage, deleteLanguage } from '../controllers/languages.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllLanguages);
router.post('/', authenticateToken, isAdmin, createLanguage);
router.put('/:id', authenticateToken, isAdmin, updateLanguage);
router.delete('/:id', authenticateToken, isAdmin, deleteLanguage);

export default router;