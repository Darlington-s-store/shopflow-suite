import express from 'express';
import {
  applyCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Customer endpoints
router.post('/apply', authMiddleware, applyCoupon);

// Admin endpoints
router.get('/', authMiddleware, adminMiddleware, getCoupons);
router.post('/', authMiddleware, adminMiddleware, createCoupon);
router.put('/:id', authMiddleware, adminMiddleware, updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCoupon);

export default router;
