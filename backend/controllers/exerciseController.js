import ExerciseLog from '../models/exerciseLogModel.js';
import userModel from '../models/userModel.js';
import { getISTDate, getISTStartOfDay, getISTEndOfDay, toISTDate, getISTDateRange, formatISTDate } from '../utils/dateUtils.js';

/**
 * Calculate calories burned based on exercise type, duration, and user weight
 * Using MET (Metabolic Equivalent of Task) values
 */
const calculateCaloriesBurned = (exerciseType, durationMinutes, weightKg, intensity = 'moderate') => {
  // MET values for different exercises (moderate intensity)
  const metValues = {
    running: { light: 7, moderate: 9.8, intense: 12.3 },
    walking: { light: 3.5, moderate: 4.5, intense: 5.5 },
    cycling: { light: 5, moderate: 8, intense: 12 },
    swimming: { light: 5.8, moderate: 7, intense: 10 },
    gym_workout: { light: 3, moderate: 5, intense: 8 },
    yoga: { light: 2.3, moderate: 3, intense: 4 },
    pilates: { light: 2.5, moderate: 3.5, intense: 4.5 },
    dancing: { light: 3.5, moderate: 5.5, intense: 7.5 },
    sports: { light: 4, moderate: 6.5, intense: 9 },
    hiit: { light: 6, moderate: 9, intense: 12 },
    weightlifting: { light: 3, moderate: 5, intense: 6 },
    cardio: { light: 5, moderate: 7.5, intense: 10 },
    other: { light: 3, moderate: 5, intense: 7 }
  };
  
  // Get MET value for exercise
  const met = metValues[exerciseType]?.[intensity] || 5;
  
  // Default weight if not provided
  const weight = weightKg || 70;
  
  // Formula: Calories burned = MET × weight(kg) × duration(hours)
  const hours = durationMinutes / 60;
  return Math.round(met * weight * hours);
};

/**
 * Add exercise log entry
 */
export const addExerciseLog = async (req, res) => {
  try {
    const { exercise_type, duration_minutes, intensity, date, notes } = req.body;
    
    if (!exercise_type || !duration_minutes || duration_minutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Exercise type and duration are required'
      });
    }
    
    // Get user's weight for calorie calculation
    const user = await userModel.findById(req.userId);
    const weightKg = user?.weight_kg || 70;
    
    // Calculate calories burned
    const caloriesBurned = calculateCaloriesBurned(
      exercise_type,
      duration_minutes,
      weightKg,
      intensity || 'moderate'
    );
    
    // Use IST date
    const exerciseDate = date ? toISTDate(date) : getISTDate();
    
    const exerciseEntry = new ExerciseLog({
      userId: req.userId,
      date: exerciseDate,
      exercise_type,
      duration_minutes,
      intensity: intensity || 'moderate',
      calories_burned: caloriesBurned,
      notes
    });
    
    await exerciseEntry.save();
    
    res.status(201).json({
      success: true,
      message: 'Exercise logged successfully',
      exerciseEntry
    });
  } catch (error) {
    console.error('Error adding exercise log:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging exercise',
      error: error.message
    });
  }
};

/**
 * Get daily exercise log
 */
export const getDailyExercise = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Use IST timezone for date boundaries
    const startOfDay = date ? getISTStartOfDay(new Date(date)) : getISTStartOfDay();
    const endOfDay = date ? getISTEndOfDay(new Date(date)) : getISTEndOfDay();
    
    console.log('📅 Fetching exercises for IST date range:', {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString(),
      queryDate: date || 'today'
    });
    
    const entries = await ExerciseLog.find({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${entries.length} exercise entries for today (IST)`);
    
    const totalCaloriesBurned = entries.reduce((sum, entry) => sum + entry.calories_burned, 0);
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
    
    res.json({
      success: true,
      date: startOfDay,
      total_calories_burned: totalCaloriesBurned,
      total_duration_minutes: totalDuration,
      entries
    });
  } catch (error) {
    console.error('Error getting daily exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercise log',
      error: error.message
    });
  }
};

/**
 * Get exercise history (last N days)
 */
export const getExerciseHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days);
    
    // Use IST date range
    const { startDate, endDate } = getISTDateRange(daysNum);
    
    const entries = await ExerciseLog.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    // Group by date (IST)
    const dailyData = {};
    
    entries.forEach(entry => {
      const dateKey = formatISTDate(entry.date);
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          calories_burned: 0,
          duration_minutes: 0,
          workouts: 0
        };
      }
      dailyData[dateKey].calories_burned += entry.calories_burned;
      dailyData[dateKey].duration_minutes += entry.duration_minutes;
      dailyData[dateKey].workouts += 1;
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
          calories_burned: 0,
          duration_minutes: 0,
          workouts: 0
        })
      });
    }
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error getting exercise history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercise history',
      error: error.message
    });
  }
};

/**
 * Update exercise log entry
 */
export const updateExerciseLog = async (req, res) => {
  try {
    const { exercise_type, duration_minutes, intensity, notes } = req.body;
    
    const entry = await ExerciseLog.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Exercise log entry not found'
      });
    }
    
    // Update fields if provided
    if (exercise_type) entry.exercise_type = exercise_type;
    if (duration_minutes) entry.duration_minutes = duration_minutes;
    if (intensity) entry.intensity = intensity;
    if (notes !== undefined) entry.notes = notes;
    
    // Recalculate calories if exercise type, duration, or intensity changed
    if (exercise_type || duration_minutes || intensity) {
      const user = await userModel.findById(req.userId);
      const weightKg = user?.weight_kg || 70;
      
      entry.calories_burned = calculateCaloriesBurned(
        entry.exercise_type,
        entry.duration_minutes,
        weightKg,
        entry.intensity
      );
    }
    
    await entry.save();
    
    res.json({
      success: true,
      message: 'Exercise log updated successfully',
      exerciseEntry: entry
    });
  } catch (error) {
    console.error('Error updating exercise log:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating exercise log',
      error: error.message
    });
  }
};

/**
 * Delete exercise log entry
 */
export const deleteExerciseLog = async (req, res) => {
  try {
    const entry = await ExerciseLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Exercise log entry not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Exercise log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exercise log:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting exercise log',
      error: error.message
    });
  }
};

/**
 * Get exercise statistics
 */
export const getExerciseStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);
    
    // Use IST date range
    const { startDate, endDate } = getISTDateRange(daysNum);
    
    const entries = await ExerciseLog.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate stats
    const totalWorkouts = entries.length;
    const totalCaloriesBurned = entries.reduce((sum, e) => sum + e.calories_burned, 0);
    const totalDuration = entries.reduce((sum, e) => sum + e.duration_minutes, 0);
    
    // Exercise type breakdown
    const exerciseTypes = {};
    entries.forEach(entry => {
      if (!exerciseTypes[entry.exercise_type]) {
        exerciseTypes[entry.exercise_type] = {
          count: 0,
          total_duration: 0,
          total_calories: 0
        };
      }
      exerciseTypes[entry.exercise_type].count += 1;
      exerciseTypes[entry.exercise_type].total_duration += entry.duration_minutes;
      exerciseTypes[entry.exercise_type].total_calories += entry.calories_burned;
    });
    
    res.json({
      success: true,
      period_days: daysNum,
      stats: {
        total_workouts: totalWorkouts,
        total_calories_burned: totalCaloriesBurned,
        total_duration_minutes: totalDuration,
        avg_calories_per_workout: totalWorkouts > 0 ? Math.round(totalCaloriesBurned / totalWorkouts) : 0,
        avg_duration_per_workout: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
        workouts_per_week: Math.round((totalWorkouts / daysNum) * 7)
      },
      exercise_types: exerciseTypes
    });
  } catch (error) {
    console.error('Error getting exercise stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercise statistics',
      error: error.message
    });
  }
};
