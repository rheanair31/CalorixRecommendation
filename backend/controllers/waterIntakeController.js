import WaterIntake from '../models/waterIntakeModel.js';
import { getISTDate, getISTStartOfDay, getISTEndOfDay, toISTDate, getISTDateRange, formatISTDate } from '../utils/dateUtils.js';

/**
 * Add water intake entry
 */
export const addWaterIntake = async (req, res) => {
  try {
    const { amount_ml, date } = req.body;
    
    if (!amount_ml || amount_ml <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid water amount'
      });
    }
    
    // Use IST date
    const waterDate = date ? toISTDate(date) : getISTDate();
    
    const waterEntry = new WaterIntake({
      userId: req.userId,
      date: waterDate,
      amount_ml
    });
    
    const savedEntry = await waterEntry.save();
    
    res.status(201).json({
      success: true,
      message: 'Water intake logged successfully',
      waterEntry: savedEntry,
      entry: {
        _id: savedEntry._id,
        amount_ml: savedEntry.amount_ml,
        date: savedEntry.date
      }
    });
  } catch (error) {
    console.error('Error adding water intake:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging water intake',
      error: error.message
    });
  }
};

/**
 * Get daily water intake total
 */
export const getDailyWaterIntake = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Use IST timezone for date boundaries
    const startOfDay = date ? getISTStartOfDay(new Date(date)) : getISTStartOfDay();
    const endOfDay = date ? getISTEndOfDay(new Date(date)) : getISTEndOfDay();
    
    console.log('📅 Fetching water intake for IST date range:', {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString(),
      queryDate: date || 'today'
    });
    
    const entries = await WaterIntake.find({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    console.log(`✅ Found ${entries.length} water entries for today (IST)`);
    
    const total = entries.reduce((sum, entry) => sum + entry.amount_ml, 0);
    
    res.json({
      success: true,
      date: startOfDay,
      total_ml: total,
      intakes: entries.sort((a, b) => new Date(b.date) - new Date(a.date)),
      data: {
        total_ml: total,
        intakes: entries.sort((a, b) => new Date(b.date) - new Date(a.date))
      }
    });
  } catch (error) {
    console.error('Error getting daily water intake:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching water intake',
      error: error.message
    });
  }
};

/**
 * Get water intake history (last N days)
 */
export const getWaterIntakeHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days);
    
    // Use IST date range
    const { startDate, endDate } = getISTDateRange(daysNum);
    
    const entries = await WaterIntake.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Group by date (IST)
    const dailyTotals = {};
    
    entries.forEach(entry => {
      const dateKey = formatISTDate(entry.date);
      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = 0;
      }
      dailyTotals[dateKey] += entry.amount_ml;
    });
    
    // Fill in missing dates with 0
    const history = [];
    for (let i = 0; i < daysNum; i++) {
      const date = getISTDate();
      date.setDate(date.getDate() - i);
      const dateKey = formatISTDate(date);
      
      history.unshift({
        date: dateKey,
        total_ml: dailyTotals[dateKey] || 0
      });
    }
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error getting water intake history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching water intake history',
      error: error.message
    });
  }
};

/**
 * Delete a water intake entry
 */
export const deleteWaterIntake = async (req, res) => {
  try {
    const entry = await WaterIntake.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Water intake entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Water intake entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting water intake:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting water intake',
      error: error.message
    });
  }
};
