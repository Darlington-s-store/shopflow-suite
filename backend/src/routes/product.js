import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand
} from '../controllers/productController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public endpoints
router.get('/categories', getAllCategories);
router.get('/brands', getAllBrands);
router.get('/:id', getProductById);
router.get('/', getAllProducts);

// Admin endpoints
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);
router.post('/categories', authMiddleware, adminMiddleware, createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, deleteCategory);
router.post('/brands', authMiddleware, adminMiddleware, createBrand);
router.put('/brands/:id', authMiddleware, adminMiddleware, updateBrand);
router.delete('/brands/:id', authMiddleware, adminMiddleware, deleteBrand);

export default router;
