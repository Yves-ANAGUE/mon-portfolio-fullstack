// backend/src/routes/interests.routes.js
import express from 'express';
import { getAllInterests, createInterest, updateInterest, deleteInterest } from '../controllers/interests.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllInterests);
router.post('/', authenticateToken, isAdmin, createInterest);
router.put('/:id', authenticateToken, isAdmin, updateInterest);
router.delete('/:id', authenticateToken, isAdmin, deleteInterest);

export default router;