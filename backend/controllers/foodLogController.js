import FoodLog from '../models/foodLogModel.js';
import { getISTDate, getISTStartOfDay, getISTEndOfDay, toISTDate, getISTDateRange, formatISTDate } from '../utils/dateUtils.js';

/**
 * Add food log entry
 */
export const addFoodLog = async (req, res) => {
  try {
    const {
      meal_type,
      food_name,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
      serving_size,
      date,
      notes
    } = req.body;
    
    if (!meal_type || !food_name || !calories || calories < 0) {
      return res.status(400).json({
        success: false,
        message: 'Meal type, food name, and calories are required'
      });
    }
    
    // Use IST date
    const foodDate = date ? toISTDate(date) : getISTDate();
    
    const foodEntry = new FoodLog({
      userId: req.userId,
      date: foodDate,
      meal_type,
      food_name,
      calories,
      protein_g: protein_g || 0,
      carbs_g: carbs_g || 0,
      fat_g: fat_g || 0,
      fiber_g: fiber_g || 0,
      serving_size,
      notes
    });
    
    await foodEntry.save();
    
    res.status(201).json({
      success: true,
      message: 'Food logged successfully',
      foodEntry
    });
  } catch (error) {
    console.error('Error adding food log:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging food',
      error: error.message
    });
  }
};

/**
 * Get daily food log
 */
export const getDailyFoodLog = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Use IST timezone for date boundaries
    const startOfDay = date ? getISTStartOfDay(new Date(date)) : getISTStartOfDay();
    const endOfDay = date ? getISTEndOfDay(new Date(date)) : getISTEndOfDay();
    
    console.log('📅 Fetching food logs for IST date range:', {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString(),
      queryDate: date || 'today'
    });
    
    const entries = await FoodLog.find({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${entries.length} food entries for today (IST)`);
    
    // Calculate totals
    const totals = entries.reduce((acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein_g: acc.protein_g + entry.protein_g,
      carbs_g: acc.carbs_g + entry.carbs_g,
      fat_g: acc.fat_g + entry.fat_g,
      fiber_g: acc.fiber_g + entry.fiber_g
    }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });
    
    // Group by meal type
    const byMealType = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
    
    entries.forEach(entry => {
      if (byMealType[entry.meal_type]) {
        byMealType[entry.meal_type].push(entry);
      }
    });
    
    res.json({
      success: true,
      date: startOfDay,
      totals,
      entries,
      by_meal_type: byMealType
    });
  } catch (error) {
    console.error('Error getting daily food log:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching food log',
      error: error.message
    });
  }
};

/**
 * Get food log history (last N days)
 */
export const getFoodLogHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days);
    
    // Use IST date range
    const { startDate, endDate } = getISTDateRange(daysNum);
    
    const entries = await FoodLog.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Group by date (IST)
    const dailyData = {};
    
    entries.forEach(entry => {
      const dateKey = formatISTDate(entry.date);
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          fiber_g: 0
        };
      }
      dailyData[dateKey].calories += entry.calories;
      dailyData[dateKey].protein_g += entry.protein_g;
      dailyData[dateKey].carbs_g += entry.carbs_g;
      dailyData[dateKey].fat_g += entry.fat_g;
      dailyData[dateKey].fiber_g += entry.fiber_g;
    });
    
    // Fill in missing dates with 0
    const history = [];
    for (let i = 0; i < daysNum; i++) {
      const date = getISTDate();
      date.setDate(date.getDate() - i);
      const dateKey = formatISTDate(date);
      
      history.unshift({
        date: dateKey,
        ...(dailyData[dateKey] || {
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          fiber_g: 0
        })
      });
    }
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error getting food log history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching food log history',
      error: error.message
    });
  }
};

/**
 * Update food log entry
 */
export const updateFoodLog = async (req, res) => {
  try {
    const entry = await FoodLog.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Food log entry not found'
      });
    }
    
    // Update fields if provided
    const updateFields = [
      'meal_type', 'food_name', 'calories', 'protein_g',
      'carbs_g', 'fat_g', 'fiber_g', 'serving_size', 'notes'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        entry[field] = req.body[field];
      }
    });
    
    await entry.save();
    
    res.json({
      success: true,
      message: 'Food log updated successfully',
      foodEntry: entry
    });
  } catch (error) {
    console.error('Error updating food log:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating food log',
      error: error.message
    });
  }
};

/**
 * Delete food log entry
 */
export const deleteFoodLog = async (req, res) => {
  try {
    const entry = await FoodLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Food log entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Food log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting food log:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting food log',
      error: error.message
    });
  }
};
