import express from 'express';
import {
  getDeliveryByOrder,
  getDeliveries,
  assignDelivery,
  updateDeliveryStatus,
  getAgentDeliveries
} from '../controllers/deliveryController.js';
import { authMiddleware, adminMiddleware, deliveryAgentMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Customer endpoints
router.get('/order/:orderId', authMiddleware, getDeliveryByOrder);

// Admin endpoints
router.get('/', authMiddleware, adminMiddleware, getDeliveries);
router.post('/:deliveryId/assign', authMiddleware, adminMiddleware, assignDelivery);

// Delivery agent endpoints
router.get('/agent/active', authMiddleware, deliveryAgentMiddleware, getAgentDeliveries);
router.put('/:deliveryId/status', authMiddleware, deliveryAgentMiddleware, updateDeliveryStatus);

export default router;
