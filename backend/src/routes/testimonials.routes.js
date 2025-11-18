import express from 'express';
import {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonials.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllTestimonials);
router.get('/:id', getTestimonialById);

// Routes admin
router.post('/', authenticateToken, isAdmin, uploadFields, createTestimonial);
router.put('/:id', authenticateToken, isAdmin, uploadFields, updateTestimonial);
router.delete('/:id', authenticateToken, isAdmin, deleteTestimonial);

export default router;
