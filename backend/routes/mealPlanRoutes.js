import express from 'express';
import {
  generateMealPlan,
  saveMealPlan,
  getSavedMealPlans,
  deleteMealPlan
} from '../controllers/mealPlanController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Generate meal plan (can be used without auth for demo, but better with auth)
router.post('/generate', (req, res, next) => {
  // Check if user is authenticated
  const token = req.headers.authorization?.split(' ')[1] || req.headers.token;
  if (token) {
    // If authenticated, use auth middleware
    authMiddleware(req, res, next);
  } else {
    // Allow generation without auth (for demo purposes)
    next();
  }
}, generateMealPlan);

// Protected routes (require authentication)
router.post('/save', authMiddleware, saveMealPlan);
router.get('/saved', authMiddleware, getSavedMealPlans);
router.delete('/saved/:id', authMiddleware, deleteMealPlan);

export default router;
