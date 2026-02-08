import express from 'express';
import {
    getDeals,
    createDeal,
    updateDeal,
    deleteDeal
} from '../controllers/dealsController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public (or filter by query)
router.get('/', getDeals);

// Admin
router.post('/', authMiddleware, adminMiddleware, createDeal);
router.put('/:id', authMiddleware, adminMiddleware, updateDeal);
router.delete('/:id', authMiddleware, adminMiddleware, deleteDeal);

export default router;
