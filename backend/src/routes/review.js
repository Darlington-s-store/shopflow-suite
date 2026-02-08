import express from 'express';
import {
  submitReview,
  getProductReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview
} from '../controllers/reviewController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Customer endpoints
router.post('/', authMiddleware, submitReview);
router.get('/product/:productId', getProductReviews);

// Admin endpoints
router.get('/', authMiddleware, adminMiddleware, getAllReviews);
router.put('/:id/status', authMiddleware, adminMiddleware, updateReviewStatus);
router.delete('/:id', authMiddleware, adminMiddleware, deleteReview);

export default router;
