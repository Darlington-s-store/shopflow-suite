import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  processPayment,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Customer endpoints
router.use(authMiddleware);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/:orderId/payment', processPayment);

// Admin endpoints
router.get('/', adminMiddleware, getAllOrders);
router.put('/:id/status', adminMiddleware, updateOrderStatus);

export default router;
