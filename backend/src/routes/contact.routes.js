import express from 'express';
import { sendContact, getAllContacts, deleteContact } from '../controllers/contact.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Route publique
router.post('/', sendContact);

// Routes admin
router.get('/', authenticateToken, isAdmin, getAllContacts);
router.delete('/:id', authenticateToken, isAdmin, deleteContact);

export default router;
