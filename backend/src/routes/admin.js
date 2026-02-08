import express from 'express';
import { getAdminPages, getUserDashboard, updateUserDashboard, getAllCustomers, getDeliveryAgents } from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public admin pages (menu)
router.get('/pages', getAdminPages);

// Admin only endpoints
router.get('/customers', authMiddleware, adminMiddleware, getAllCustomers);
router.get('/delivery-agents', authMiddleware, adminMiddleware, getDeliveryAgents);

// User dashboard (requires auth)
router.get('/dashboard/:userId?', authMiddleware, getUserDashboard);
router.put('/dashboard/:userId?', authMiddleware, updateUserDashboard);

export default router;
