// backend/src/routes/experiences.routes.js
import express from 'express';
import { getAllExperiences, createExperience, updateExperience, deleteExperience } from '../controllers/experiences.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllExperiences);
router.post('/', authenticateToken, isAdmin, createExperience);
router.put('/:id', authenticateToken, isAdmin, updateExperience);
router.delete('/:id', authenticateToken, isAdmin, deleteExperience);

export default router;