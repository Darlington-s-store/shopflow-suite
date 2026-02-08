import express from 'express';
import {
    getMessages,
    createMessage,
    updateMessageStatus,
    deleteMessage
} from '../controllers/messagesController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public (Contact form)
router.post('/', createMessage);

// Admin
router.get('/', authMiddleware, adminMiddleware, getMessages);
router.put('/:id/status', authMiddleware, adminMiddleware, updateMessageStatus); // Fixed path to match usage convention or just updateMessageStatus handles body
router.put('/:id', authMiddleware, adminMiddleware, updateMessageStatus); // Alternative direct PUT
router.delete('/:id', authMiddleware, adminMiddleware, deleteMessage);

export default router;
