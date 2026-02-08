import express from 'express';
import { register, login, adminLogin, getProfile, updateProfile, changePassword, requestPasswordReset, resetPassword } from '../controllers/authController.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { logout } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
// Apply rate limiter to login endpoints to prevent brute-force
router.post('/login', rateLimiter({ maxAttempts: 6, windowMs: 60 * 1000 }), login);
router.post('/admin-login', rateLimiter({ maxAttempts: 6, windowMs: 60 * 1000 }), adminLogin);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

// Password reset endpoints
router.post('/request-password-reset', rateLimiter({ maxAttempts: 6, windowMs: 60 * 1000 }), requestPasswordReset);
router.post('/reset-password', rateLimiter({ maxAttempts: 6, windowMs: 60 * 1000 }), resetPassword);

router.post('/logout', logout);

export default router;
