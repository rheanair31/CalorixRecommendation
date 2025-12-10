import express from 'express';
import {
  getDashboard,
  getQuickStats
} from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All dashboard routes require authentication
router.get('/', authMiddleware, getDashboard);
router.get('/quick-stats', authMiddleware, getQuickStats);

export default router;
