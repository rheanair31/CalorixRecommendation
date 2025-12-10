import express from 'express';
import {
  addWaterIntake,
  getDailyWaterIntake,
  getWaterIntakeHistory,
  deleteWaterIntake
} from '../controllers/waterIntakeController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All water intake routes require authentication
router.post('/', authMiddleware, addWaterIntake);
router.get('/daily', authMiddleware, getDailyWaterIntake);
router.get('/history', authMiddleware, getWaterIntakeHistory);
router.delete('/:id', authMiddleware, deleteWaterIntake);

export default router;
