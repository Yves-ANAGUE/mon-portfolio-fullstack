import express from 'express';
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
} from '../controllers/skills.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllSkills);
router.get('/:id', getSkillById);

// Routes admin
router.post('/', authenticateToken, isAdmin, uploadFields, createSkill);
router.put('/:id', authenticateToken, isAdmin, uploadFields, updateSkill);
router.delete('/:id', authenticateToken, isAdmin, deleteSkill);

export default router;
