import MealPlan from '../models/MealPlan.js';
import userModel from '../models/userModel.js';
import axios from 'axios';

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 */
const calculateBMR = (weight_kg, height_cm, age, sex) => {
  if (sex === 'male') {
    return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
  } else {
    return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
const calculateTDEE = (bmr, activity_level) => {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return Math.round(bmr * (activityMultipliers[activity_level] || 1.55));
};

/**
 * Adjust calories based on goal
 */
const adjustCaloriesForGoal = (tdee, goal) => {
  const adjustments = {
    lose_weight: -500,
    maintain: 0,
    gain_weight: 300
  };
  
  return Math.round(tdee + (adjustments[goal] || 0));
};

/**
 * Calculate macro distribution
 */
const calculateMacros = (dailyCalories, goal) => {
  let proteinPercentage, carbsPercentage, fatPercentage;
  
  if (goal === 'lose_weight') {
    proteinPercentage = 0.35;
    carbsPercentage = 0.30;
    fatPercentage = 0.35;
  } else if (goal === 'gain_weight') {
    proteinPercentage = 0.30;
    carbsPercentage = 0.40;
    fatPercentage = 0.30;
  } else {
    proteinPercentage = 0.30;
    carbsPercentage = 0.40;
    fatPercentage = 0.30;
  }
  
  return {
    protein_g: Math.round((dailyCalories * proteinPercentage) / 4),
    carbs_g: Math.round((dailyCalories * carbsPercentage) / 4),
    fat_g: Math.round((dailyCalories * fatPercentage) / 9)
  };
};

/**
 * Generate a new meal plan using Python ML model with database-driven seasonal recommendations
 */
export const generateMealPlan = async (req, res) => {
  try {
    const userProfile = req.body;
    
    // Validate required fields
    const required = ['age', 'sex', 'weight_kg', 'height_cm', 'activity_level', 'goal'];
    for (const field of required) {
      if (!userProfile[field]) {
        return res.status(400).json({ 
          success: false,
          message: `Missing required field: ${field}` 
        });
      }
    }
    
    // If user is authenticated, update their profile
    if (req.userId) {
      await userModel.findByIdAndUpdate(req.userId, {
        $set: userProfile
      });
    }
    
    console.log('🍽️ Generating meal plan for user profile:', {
      userId: req.userId,
      goal: userProfile.goal,
      dietType: userProfile.diet_type,
      allergies: userProfile.allergies
    });
    
    // Call Python ML API to generate meal plan with seasonal recommendations
    try {
      const pythonResponse = await axios.post('http://localhost:5000/profile', userProfile, {
        timeout: 10000 // 10 second timeout
      });
      const mealPlanData = pythonResponse.data;
      
      console.log('✅ Python API meal plan generated successfully');
      
      // Add user profile to the response
      mealPlanData.userProfile = userProfile;
      
      // Format the response to match frontend expectations
      const formattedMealPlan = {
        daily_targets: mealPlanData.daily_targets,
        meals: mealPlanData.meals,
        current_season: mealPlanData.current_season,
        seasonal_recommendations: {}
      };
      
      // Get seasonal recommendations from database for each meal type
      console.log('🌱 Fetching seasonal recommendations from database...');
      const seasonalRecs = {};
      
      for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack']) {
        const cuisines = userProfile.cuisines?.[mealType] || [];
        try {
          const seasonalResponse = await axios.get('http://localhost:5000/seasonal', {
            params: {
              diet_type: userProfile.diet_type || null,
              meal_type: mealType,
              cuisines: cuisines.length > 0 ? cuisines.join(',') : null
            },
            timeout: 5000
          });
          
          if (seasonalResponse.data && seasonalResponse.data.foods) {
            seasonalRecs[mealType] = {
              season: seasonalResponse.data.season,
              foods: seasonalResponse.data.foods.slice(0, 5).map(food => ({
                food_name: food.food_name,
                calories: Math.round(food.calories),
                protein_g: Math.round(food.protein_g * 10) / 10,
                cuisine_type: food.cuisine_type,
                region: food.region
              }))
            };
            console.log(`✅ Seasonal ${mealType} options: ${seasonalRecs[mealType].foods.length} items`);
          }
        } catch (seasonalError) {
          console.error(`❌ Error getting seasonal recommendations for ${mealType}:`, seasonalError.message);
          seasonalRecs[mealType] = { season: mealPlanData.current_season, foods: [] };
        }
      }
      
      formattedMealPlan.seasonal_recommendations = seasonalRecs;
      
      const responseData = {
        userProfile,
        mealPlan: formattedMealPlan
      };
      
      // Save to database if user is authenticated
      if (req.userId) {
        try {
          const savedPlan = new MealPlan({
            userId: req.userId,
            ...responseData
          });
          await savedPlan.save();
          responseData.savedPlanId = savedPlan._id;
          console.log('💾 Meal plan saved to database');
        } catch (saveError) {
          console.error('Warning: Could not save meal plan:', saveError.message);
          // Continue even if save fails
        }
      }
      
      res.status(200).json({
        success: true,
        userId: req.userId,
        ...responseData
      });
      
    } catch (pythonError) {
      console.error('❌ Python API error:', pythonError.message);
      console.log('🔄 Falling back to simple calculation...');
      
      // Fallback to simple calculation if Python API fails
      const bmr = calculateBMR(
        userProfile.weight_kg,
        userProfile.height_cm,
        userProfile.age,
        userProfile.sex
      );
      
      const tdee = calculateTDEE(bmr, userProfile.activity_level);
      const dailyCalories = adjustCaloriesForGoal(tdee, userProfile.goal);
      const macros = calculateMacros(dailyCalories, userProfile.goal);
      
      const mealDistribution = {
        breakfast: Math.round(dailyCalories * 0.25),
        lunch: Math.round(dailyCalories * 0.35),
        dinner: Math.round(dailyCalories * 0.30),
        snack: Math.round(dailyCalories * 0.10)
      };
      
      // For fallback, we'll return a simple structure
      const meals = {};
      for (const [mealType, targetCalories] of Object.entries(mealDistribution)) {
        meals[mealType] = {
          target_calories: targetCalories,
          options: [{
            food_name: `Custom ${mealType}`,
            calories: targetCalories,
            protein_g: Math.round(targetCalories * 0.3 / 4),
            carbs_g: Math.round(targetCalories * 0.4 / 4),
            fat_g: Math.round(targetCalories * 0.3 / 9)
          }]
        };
      }
      
      // Get current season
      const month = new Date().getMonth() + 1;
      let currentSeason = 'winter';
      if (month >= 3 && month <= 5) currentSeason = 'spring';
      else if (month >= 6 && month <= 8) currentSeason = 'summer';
      else if (month >= 9 && month <= 11) currentSeason = 'fall';
      
      const responseData = {
        userProfile,
        mealPlan: {
          daily_targets: {
            daily_calories: dailyCalories,
            ...macros,
            water_ml: Math.round(userProfile.weight_kg * 35),
            water_glasses: Math.round((userProfile.weight_kg * 35) / 250)
          },
          meals,
          current_season: currentSeason,
          seasonal_recommendations: {} // Empty in fallback mode
        }
      };
      
      console.log('⚠️ Fallback meal plan generated (Python API unavailable)');
      
      res.status(200).json({
        success: true,
        fallback: true,
        ...responseData
      });
    }
  } catch (error) {
    console.error('❌ Error generating meal plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating meal plan', 
      error: error.message 
    });
  }
};

/**
 * Save a meal plan (for authenticated users)
 */
export const saveMealPlan = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to save meal plans'
      });
    }
    
    const mealPlanData = {
      ...req.body,
      userId: req.userId
    };
    
    const mealPlan = new MealPlan(mealPlanData);
    await mealPlan.save();
    
    res.status(201).json({
      success: true,
      message: 'Meal plan saved successfully',
      mealPlan
    });
  } catch (error) {
    console.error('Error saving meal plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error saving meal plan', 
      error: error.message 
    });
  }
};

/**
 * Get all saved meal plans for authenticated user
 */
export const getSavedMealPlans = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const mealPlans = await MealPlan.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.status(200).json({
      success: true,
      mealPlans
    });
  } catch (error) {
    console.error('Error retrieving meal plans:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving meal plans', 
      error: error.message 
    });
  }
};

/**
 * Delete a saved meal plan
 */
export const deleteMealPlan = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const mealPlan = await MealPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!mealPlan) {
      return res.status(404).json({ 
        success: false,
        message: 'Meal plan not found or unauthorized' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Meal plan deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting meal plan', 
      error: error.message 
    });
  }
};
