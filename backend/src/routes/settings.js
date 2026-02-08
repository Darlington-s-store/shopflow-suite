import express from 'express';
import {
  getAdminSettings,
  getAdminSetting,
  updateAdminSettings,
  updateAdminSetting,
  deleteAdminSetting,
  resetAdminSettings,
} from '../controllers/settingsController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Admin Settings Routes
 * All routes require authentication and admin role
 */

// Get all settings (admin only)
router.get('/', authMiddleware, adminMiddleware, getAdminSettings);

// Get specific setting (admin only)
router.get('/:key', authMiddleware, adminMiddleware, getAdminSetting);

// Update multiple settings (admin only)
router.put('/', authMiddleware, adminMiddleware, updateAdminSettings);

// Update single setting (admin only)
router.put('/:key', authMiddleware, adminMiddleware, updateAdminSetting);

// Delete setting (admin only)
router.delete('/:key', authMiddleware, adminMiddleware, deleteAdminSetting);

// Reset all settings to defaults (admin only - super admin recommended)
router.post('/reset', authMiddleware, adminMiddleware, resetAdminSettings);

export default router;
