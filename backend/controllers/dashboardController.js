import FoodLog from '../models/foodLogModel.js';
import ExerciseLog from '../models/exerciseLogModel.js';
import WaterIntake from '../models/waterIntakeModel.js';
import userModel from '../models/userModel.js';
import { getISTDate, getISTStartOfDay, getISTEndOfDay, getISTDateRange, formatISTDate } from '../utils/dateUtils.js';

/**
 * Get comprehensive dashboard data for user
 */
export const getDashboard = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days);
    
    // Get user data
    const user = await userModel.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Use IST date range
    const { startDate, endDate } = getISTDateRange(daysNum);
    
    console.log('📊 Dashboard query IST range:', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days: daysNum
    });
    
    // Fetch all data for the period
    const [foodLogs, exerciseLogs, waterIntakes] = await Promise.all([
      FoodLog.find({
        userId: req.userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 }),
      
      ExerciseLog.find({
        userId: req.userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 }),
      
      WaterIntake.find({
        userId: req.userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 })
    ]);
    
    console.log('📈 Dashboard data counts:', {
      foodLogs: foodLogs.length,
      exerciseLogs: exerciseLogs.length,
      waterIntakes: waterIntakes.length
    });
    
    // Process data by date
    const dailyData = {};
    const targetCalories = user.daily_calorie_target || 2000;
    const waterGoal = user.daily_water_goal_ml || 3000;
    
    // Initialize all dates with IST
    for (let i = 0; i < daysNum; i++) {
      const date = getISTDate();
      date.setDate(date.getDate() - i);
      const dateKey = formatISTDate(date);
      
      dailyData[dateKey] = {
        date: dateKey,
        calories_consumed: 0,
        calories_burned: 0,
        net_calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        water_ml: 0,
        exercise_duration: 0,
        workouts: 0,
        target_calories: targetCalories,
        water_goal_ml: waterGoal
      };
    }
    
    // Process food logs
    foodLogs.forEach(log => {
      const dateKey = formatISTDate(log.date);
      if (dailyData[dateKey]) {
        dailyData[dateKey].calories_consumed += log.calories;
        dailyData[dateKey].protein_g += log.protein_g;
        dailyData[dateKey].carbs_g += log.carbs_g;
        dailyData[dateKey].fat_g += log.fat_g;
      }
    });
    
    // Process exercise logs
    exerciseLogs.forEach(log => {
      const dateKey = formatISTDate(log.date);
      if (dailyData[dateKey]) {
        dailyData[dateKey].calories_burned += log.calories_burned;
        dailyData[dateKey].exercise_duration += log.duration_minutes;
        dailyData[dateKey].workouts += 1;
      }
    });
    
    // Process water intake
    waterIntakes.forEach(intake => {
      const dateKey = formatISTDate(intake.date);
      if (dailyData[dateKey]) {
        dailyData[dateKey].water_ml += intake.amount_ml;
      }
    });
    
    // Calculate net calories and adherence
    const adherenceMargin = 0.1; // 10% margin
    let daysOnTarget = 0;
    let daysOver = 0;
    let daysUnder = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let daysWithWaterGoal = 0;
    let totalWorkoutDays = 0;
    
    const sortedDates = Object.keys(dailyData).sort();
    
    sortedDates.forEach(dateKey => {
      const day = dailyData[dateKey];
      day.net_calories = day.calories_consumed - day.calories_burned;
      
      const lowerBound = targetCalories * (1 - adherenceMargin);
      const upperBound = targetCalories * (1 + adherenceMargin);
      
      // Calorie adherence
      if (day.net_calories >= lowerBound && day.net_calories <= upperBound) {
        day.adherence = 'on_target';
        daysOnTarget++;
        tempStreak++;
        
        // Check if this is part of current streak (most recent days)
        const today = formatISTDate(getISTDate());
        const dayIndex = sortedDates.indexOf(dateKey);
        const todayIndex = sortedDates.indexOf(today);
        
        if (todayIndex - dayIndex === (sortedDates.length - 1 - dayIndex)) {
          currentStreak = tempStreak;
        }
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 0;
        
        if (day.net_calories > upperBound) {
          day.adherence = 'over_target';
          daysOver++;
        } else {
          day.adherence = 'under_target';
          daysUnder++;
        }
      }
      
      // Water goal achievement
      if (day.water_ml >= waterGoal) {
        daysWithWaterGoal++;
      }
      
      // Workout days
      if (day.workouts > 0) {
        totalWorkoutDays++;
      }
    });
    
    maxStreak = Math.max(maxStreak, tempStreak);
    
    // Calculate averages
    const totalDays = sortedDates.length;
    const avgCaloriesConsumed = Math.round(
      sortedDates.reduce((sum, key) => sum + dailyData[key].calories_consumed, 0) / totalDays
    );
    const avgCaloriesBurned = Math.round(
      sortedDates.reduce((sum, key) => sum + dailyData[key].calories_burned, 0) / totalDays
    );
    const avgWaterIntake = Math.round(
      sortedDates.reduce((sum, key) => sum + dailyData[key].water_ml, 0) / totalDays
    );
    
    // Build response
    const dashboard = {
      user: {
        name: user.name,
        email: user.email,
        daily_calorie_target: targetCalories,
        daily_water_goal_ml: waterGoal,
        goal: user.goal,
        current_weight_kg: user.weight_kg
      },
      period: {
        days: daysNum,
        start_date: formatISTDate(startDate),
        end_date: formatISTDate(endDate)
      },
      summary: {
        // Calorie adherence
        days_on_target: daysOnTarget,
        days_over_target: daysOver,
        days_under_target: daysUnder,
        adherence_percentage: Math.round((daysOnTarget / totalDays) * 100),
        current_streak: currentStreak,
        max_streak: maxStreak,
        
        // Averages
        avg_calories_consumed: avgCaloriesConsumed,
        avg_calories_burned: avgCaloriesBurned,
        avg_net_calories: avgCaloriesConsumed - avgCaloriesBurned,
        avg_water_intake_ml: avgWaterIntake,
        
        // Water
        days_water_goal_met: daysWithWaterGoal,
        water_goal_percentage: Math.round((daysWithWaterGoal / totalDays) * 100),
        
        // Exercise
        total_workout_days: totalWorkoutDays,
        workout_frequency_percentage: Math.round((totalWorkoutDays / totalDays) * 100),
        avg_workouts_per_week: Math.round((totalWorkoutDays / daysNum) * 7 * 10) / 10
      },
      daily_data: sortedDates.map(key => dailyData[key])
    };
    
    res.json({
      success: true,
      dashboard
    });
    
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

/**
 * Get quick stats (for widget/summary views)
 */
export const getQuickStats = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get today's data using IST
    const startOfDay = getISTStartOfDay();
    const endOfDay = getISTEndOfDay();
    
    console.log('⚡ Quick stats IST range:', {
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString()
    });
    
    const [foodLogs, exerciseLogs, waterIntakes] = await Promise.all([
      FoodLog.find({
        userId: req.userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      }),
      
      ExerciseLog.find({
        userId: req.userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      }),
      
      WaterIntake.find({
        userId: req.userId,
        date: { $gte: startOfDay, $lte: endOfDay }
      })
    ]);
    
    console.log('⚡ Quick stats counts:', {
      food: foodLogs.length,
      exercise: exerciseLogs.length,
      water: waterIntakes.length
    });
    
    const caloriesConsumed = foodLogs.reduce((sum, log) => sum + log.calories, 0);
    const caloriesBurned = exerciseLogs.reduce((sum, log) => sum + log.calories_burned, 0);
    const waterIntake = waterIntakes.reduce((sum, intake) => sum + intake.amount_ml, 0);
    
    const targetCalories = user.daily_calorie_target || 2000;
    const waterGoal = user.daily_water_goal_ml || 3000;
    
    res.json({
      success: true,
      today: {
        date: formatISTDate(getISTDate()),
        calories_consumed: caloriesConsumed,
        calories_burned: caloriesBurned,
        net_calories: caloriesConsumed - caloriesBurned,
        target_calories: targetCalories,
        calories_remaining: targetCalories - (caloriesConsumed - caloriesBurned),
        water_ml: waterIntake,
        water_goal_ml: waterGoal,
        water_percentage: Math.round((waterIntake / waterGoal) * 100),
        workouts: exerciseLogs.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quick stats',
      error: error.message
    });
  }
};
