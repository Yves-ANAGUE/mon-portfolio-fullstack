import express from 'express';
import {
  getAllLinks,
  getLinkById,
  createLink,
  updateLink,
  deleteLink
} from '../controllers/links.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllLinks);
router.get('/:id', getLinkById);

// Routes admin
router.post('/', authenticateToken, isAdmin, createLink);
router.put('/:id', authenticateToken, isAdmin, updateLink);
router.delete('/:id', authenticateToken, isAdmin, deleteLink);

export default router;
