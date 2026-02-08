import express from 'express';
import { 
  getAdminPages, getUserDashboard, updateUserDashboard, getAllCustomers, getDeliveryAgents,
  getCategories, createCategory, updateCategory, deleteCategory,
  getBrands, createBrand, updateBrand, deleteBrand,
  getAdminMessages, markMessageAsRead, replyToMessage, deleteMessage
} from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public admin pages (menu)
router.get('/pages', getAdminPages);

// Admin only endpoints
router.get('/customers', authMiddleware, adminMiddleware, getAllCustomers);
router.get('/delivery-agents', authMiddleware, adminMiddleware, getDeliveryAgents);

// Categories endpoints
router.get('/categories', getCategories);
router.post('/categories', authMiddleware, adminMiddleware, createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, deleteCategory);

// Brands endpoints
router.get('/brands', getBrands);
router.post('/brands', authMiddleware, adminMiddleware, createBrand);
router.put('/brands/:id', authMiddleware, adminMiddleware, updateBrand);
router.delete('/brands/:id', authMiddleware, adminMiddleware, deleteBrand);

// Messages endpoints
router.get('/messages', authMiddleware, adminMiddleware, getAdminMessages);
router.put('/messages/:id/read', authMiddleware, adminMiddleware, markMessageAsRead);
router.post('/messages/:id/reply', authMiddleware, adminMiddleware, replyToMessage);
router.delete('/messages/:id', authMiddleware, adminMiddleware, deleteMessage);

// User dashboard (requires auth)
router.get('/dashboard/:userId?', authMiddleware, getUserDashboard);
router.put('/dashboard/:userId?', authMiddleware, updateUserDashboard);

export default router;
