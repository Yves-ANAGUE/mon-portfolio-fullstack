// backend/src/routes/auth.routes.js
import express from 'express';
import { login, verifyToken, changePassword, changeEmail } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', authenticateToken, verifyToken);
router.put('/change-password', authenticateToken, changePassword);
router.put('/change-email', authenticateToken, changeEmail); // ✅ AJOUT

export default router;
