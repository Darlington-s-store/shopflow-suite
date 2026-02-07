import express from 'express';
import {
  sendChatMessage,
  getConversation,
  uploadChatImage,
  getAdminChatbots,
  getAdminConversation,
  sendAdminChatbotMessage
} from '../controllers/chatbotController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// User endpoints
router.post('/message', authMiddleware, sendChatMessage);
router.get('/conversation', authMiddleware, getConversation);
router.post('/upload-image', authMiddleware, uploadChatImage);

// Admin endpoints
router.get('/admin/conversations', authMiddleware, adminMiddleware, getAdminChatbots);
router.get('/admin/conversations/:userId', authMiddleware, adminMiddleware, getAdminConversation);
router.post('/admin/conversations/:userId/message', authMiddleware, adminMiddleware, sendAdminChatbotMessage);

export default router;
