import express from 'express';
import {
  addExerciseLog,
  getDailyExercise,
  getExerciseHistory,
  updateExerciseLog,
  deleteExerciseLog,
  getExerciseStats
} from '../controllers/exerciseController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All exercise routes require authentication
router.post('/', authMiddleware, addExerciseLog);
router.get('/daily', authMiddleware, getDailyExercise);
router.get('/history', authMiddleware, getExerciseHistory);
router.get('/stats', authMiddleware, getExerciseStats);
router.put('/:id', authMiddleware, updateExerciseLog);
router.delete('/:id', authMiddleware, deleteExerciseLog);

export default router;
