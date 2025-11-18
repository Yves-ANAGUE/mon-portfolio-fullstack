import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projects.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Routes admin
router.post('/', authenticateToken, isAdmin, uploadFields, createProject);
router.put('/:id', authenticateToken, isAdmin, uploadFields, updateProject);
router.delete('/:id', authenticateToken, isAdmin, deleteProject);

export default router;
