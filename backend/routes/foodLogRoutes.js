import express from 'express';
import {
  addFoodLog,
  getDailyFoodLog,
  getFoodLogHistory,
  updateFoodLog,
  deleteFoodLog
} from '../controllers/foodLogController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All food log routes require authentication
router.post('/', authMiddleware, addFoodLog);
router.get('/daily', authMiddleware, getDailyFoodLog);
router.get('/history', authMiddleware, getFoodLogHistory);
router.put('/:id', authMiddleware, updateFoodLog);
router.delete('/:id', authMiddleware, deleteFoodLog);

export default router;
