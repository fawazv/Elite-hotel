import express from 'express';
import {
  getAdminDashboard,
  getReceptionistDashboard,
  getHousekeeperDashboard,
  clearDashboardCache,
} from '../controllers/dashboard.controller';
import { authMiddleware, authorizeRole } from '../middleware/auth.middleware';

const router = express.Router();

// Admin dashboard - requires admin role
router.get('/admin', authMiddleware, authorizeRole('admin'), getAdminDashboard);

// Receptionist dashboard - requires receptionist or admin role
router.get('/receptionist', authMiddleware, authorizeRole('receptionist', 'admin'), getReceptionistDashboard);

// Housekeeper dashboard - requires housekeeper role
router.get('/housekeeper', authMiddleware, authorizeRole('housekeeper', 'admin'), getHousekeeperDashboard);

// Clear cache - admin only
router.post('/cache/clear', authMiddleware, authorizeRole('admin'), clearDashboardCache);

export default router;
