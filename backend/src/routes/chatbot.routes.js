import express from 'express';
import { sendMessage, getChatHistory } from '../controllers/chatbot.controller.js';

const router = express.Router();

router.post('/message', sendMessage);
router.get('/history/:conversationId', getChatHistory);

export default router;
