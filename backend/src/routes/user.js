import express from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress
} from '../controllers/userController.js';
import { getOrders } from '../controllers/orderController.js';
import { sendMessage, getUserMessages, getMessageThread, markMessageAsRead, deleteMessage } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Cart endpoints
router.post('/cart', addToCart);
router.get('/cart', getCart);
router.delete('/cart/:productId', removeFromCart);
router.delete('/cart', clearCart);

// Wishlist endpoints
router.post('/wishlist', addToWishlist);
router.get('/wishlist', getWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

// Order endpoints
router.get('/orders', getOrders);

// Address endpoints
router.post('/addresses', addAddress);
router.get('/addresses', getAddresses);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

// Message endpoints
router.post('/messages', sendMessage);
router.get('/messages', getUserMessages);
router.get('/messages/:userId/thread', getMessageThread);
router.put('/messages/:id/read', markMessageAsRead);
router.delete('/messages/:id', deleteMessage);

export default router;
