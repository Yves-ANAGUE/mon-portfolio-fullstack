// backend/src/routes/formations.routes.js
import express from 'express';
import { getAllFormations, createFormation, updateFormation, deleteFormation } from '../controllers/formations.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllFormations);
router.post('/', authenticateToken, isAdmin, createFormation);
router.put('/:id', authenticateToken, isAdmin, updateFormation);
router.delete('/:id', authenticateToken, isAdmin, deleteFormation);

export default router;