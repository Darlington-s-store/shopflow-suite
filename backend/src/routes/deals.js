import express from 'express';
import {
  getActiveDeals,
  getFeaturedDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  getAllDeals
} from '../controllers/dealsController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public endpoints
router.get('/', getActiveDeals);
router.get('/featured', getFeaturedDeals);

// Admin endpoints
router.get('/admin/all', authMiddleware, adminMiddleware, getAllDeals);
router.post('/', authMiddleware, adminMiddleware, createDeal);
router.put('/:id', authMiddleware, adminMiddleware, updateDeal);
router.delete('/:id', authMiddleware, adminMiddleware, deleteDeal);

export default router;
