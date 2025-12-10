import logging
from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
import json

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Paths for food data and models
food_data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seasonal_food_database.csv')
models_dir = os.path.dirname(os.path.abspath(__file__))

# Debug print to verify paths
logger.debug(f"Using food database at: {food_data_path}")
logger.debug(f"Using models directory: {models_dir}")

# Try to import the recommendation system, but have a fallback
try:
    from diet_recommendation_app import DietRecommendationApp
    recommender = DietRecommendationApp(food_data_path=food_data_path, models_dir=models_dir)
    logger.info("Diet Recommendation App initialized successfully")
except Exception as e:
    logger.error(f"Error initializing Diet Recommendation App: {e}")
    logger.info("Using fallback recommendation system")
    recommender = None

# ============= FALLBACK RECOMMENDATION SYSTEM =============

def calculate_bmr_fallback(age, sex, weight_kg, height_cm):
    """Calculate BMR using Mifflin-St Jeor Equation"""
    if sex == 'male':
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

def calculate_tdee_fallback(bmr, activity_level):
    """Calculate Total Daily Energy Expenditure"""
    activity_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    }
    return round(bmr * activity_multipliers.get(activity_level, 1.55))

def adjust_calories_for_goal(tdee, goal):
    """Adjust calories based on goal"""
    adjustments = {
        'lose_weight': -500,
        'maintain': 0,
        'gain_weight': 300
    }
    return round(tdee + adjustments.get(goal, 0))

def calculate_macros_fallback(daily_calories, goal):
    """Calculate macro distribution"""
    if goal == 'lose_weight':
        protein_pct, carbs_pct, fat_pct = 0.35, 0.30, 0.35
    elif goal == 'gain_weight':
        protein_pct, carbs_pct, fat_pct = 0.30, 0.40, 0.30
    else:
        protein_pct, carbs_pct, fat_pct = 0.30, 0.40, 0.30
    
    return {
        'protein_g': round((daily_calories * protein_pct) / 4),
        'carbs_g': round((daily_calories * carbs_pct) / 4),
        'fat_g': round((daily_calories * fat_pct) / 9)
    }

def generate_fallback_meal_plan(user_profile):
    """Generate a simple meal plan without ML model"""
    # Calculate calories
    bmr = calculate_bmr_fallback(
        user_profile['age'],
        user_profile['sex'],
        user_profile['weight_kg'],
        user_profile['height_cm']
    )
    tdee = calculate_tdee_fallback(bmr, user_profile['activity_level'])
    daily_calories = adjust_calories_for_goal(tdee, user_profile['goal'])
    macros = calculate_macros_fallback(daily_calories, user_profile['goal'])
    
    # Distribute calories across meals
    meal_distribution = {
        'breakfast': round(daily_calories * 0.25),
        'lunch': round(daily_calories * 0.35),
        'dinner': round(daily_calories * 0.30),
        'snack': round(daily_calories * 0.10)
    }
    
    # Simple meal database (fallback)
    meal_database = {
        'breakfast': [
            {
                'food_name': 'Oatmeal with Berries and Nuts',
                'calories': 350,
                'protein_g': 12,
                'carbs_g': 55,
                'fat_g': 10,
                'fiber_g': 8
            },
            {
                'food_name': 'Greek Yogurt Parfait',
                'calories': 300,
                'protein_g': 20,
                'carbs_g': 35,
                'fat_g': 8,
                'fiber_g': 4
            },
            {
                'food_name': 'Whole Wheat Toast with Avocado',
                'calories': 320,
                'protein_g': 10,
                'carbs_g': 38,
                'fat_g': 15,
                'fiber_g': 9
            }
        ],
        'lunch': [
            {
                'food_name': 'Quinoa Buddha Bowl',
                'calories': 500,
                'protein_g': 18,
                'carbs_g': 65,
                'fat_g': 18,
                'fiber_g': 10
            },
            {
                'food_name': 'Grilled Chicken Salad',
                'calories': 450,
                'protein_g': 35,
                'carbs_g': 20,
                'fat_g': 25,
                'fiber_g': 6
            },
            {
                'food_name': 'Vegetable Curry with Brown Rice',
                'calories': 480,
                'protein_g': 15,
                'carbs_g': 70,
                'fat_g': 15,
                'fiber_g': 8
            }
        ],
        'dinner': [
            {
                'food_name': 'Grilled Salmon with Vegetables',
                'calories': 550,
                'protein_g': 40,
                'carbs_g': 35,
                'fat_g': 28,
                'fiber_g': 7
            },
            {
                'food_name': 'Lentil Pasta with Marinara',
                'calories': 520,
                'protein_g': 22,
                'carbs_g': 75,
                'fat_g': 12,
                'fiber_g': 12
            },
            {
                'food_name': 'Tofu Stir-Fry with Quinoa',
                'calories': 480,
                'protein_g': 20,
                'carbs_g': 60,
                'fat_g': 18,
                'fiber_g': 9
            }
        ],
        'snack': [
            {
                'food_name': 'Apple with Almond Butter',
                'calories': 200,
                'protein_g': 6,
                'carbs_g': 25,
                'fat_g': 10,
                'fiber_g': 5
            },
            {
                'food_name': 'Hummus with Vegetables',
                'calories': 150,
                'protein_g': 5,
                'carbs_g': 18,
                'fat_g': 7,
                'fiber_g': 5
            },
            {
                'food_name': 'Trail Mix',
                'calories': 180,
                'protein_g': 5,
                'carbs_g': 15,
                'fat_g': 12,
                'fiber_g': 3
            }
        ]
    }
    
    # Filter meals based on diet type
    diet_type = user_profile.get('diet_type', 'Regular')
    
    # Build meal plan
    meals = {}
    for meal_type, target_calories in meal_distribution.items():
        meals[meal_type] = {
            'target_calories': target_calories,
            'options': meal_database[meal_type][:3]  # Top 3 options
        }
    
    # Calculate water recommendation (in ml)
    water_ml = round(user_profile['weight_kg'] * 35)  # 35ml per kg body weight
    
    return {
        'daily_targets': {
            'daily_calories': daily_calories,
            'protein_g': macros['protein_g'],
            'carbs_g': macros['carbs_g'],
            'fat_g': macros['fat_g'],
            'water_ml': water_ml,
            'water_glasses': round(water_ml / 250)  # 250ml per glass
        },
        'meals': meals,
        'current_season': get_current_season(),
        'bmr': round(bmr),
        'tdee': tdee
    }

def get_current_season():
    """Get current season based on month"""
    month = datetime.now().month
    if month >= 3 and month <= 5:
        return 'spring'
    elif month >= 6 and month <= 8:
        return 'summer'
    elif month >= 9 and month <= 11:
        return 'autumn'
    return 'winter'

# ============= END FALLBACK SYSTEM =============

@app.route('/')
def index():
    """Home page"""
    return jsonify({
        "message": "Calorix Diet Planner API",
        "status": "running",
        "ml_model_available": recommender is not None
    })

@app.route('/profile', methods=['POST'])
def profile():
    """Handle profile submission and generate meal plan"""
    try:
        data = request.json
        logger.debug(f"JSON data received: {data}")
        
        # Extract and validate user profile data
        user_profile = {
            'age': int(data.get('age', 0)),
            'sex': data.get('sex', '').strip().lower(),
            'weight_kg': float(data.get('weight_kg', 0)),
            'height_cm': float(data.get('height_cm', 0)),
            'activity_level': data.get('activity_level', '').strip(),
            'goal': data.get('goal', '').strip(),
            'diet_type': data.get('diet_type', '').strip(),
            'allergies': data.get('allergies', []),
            'cuisines': data.get('cuisines', {})
        }
        
        logger.debug(f"Constructed User Profile: {user_profile}")
        
        # Save profile
        with open('user_profile.json', 'w') as f:
            json.dump(user_profile, f, indent=4)
        logger.info("User profile saved successfully.")
        
        # Generate meal plan (use ML model if available, otherwise fallback)
        if recommender:
            try:
                daily_plan = recommender.recommend_daily_meals(user_profile)
                logger.info("Meal plan generated using ML model")
            except Exception as e:
                logger.error(f"ML model failed: {e}. Using fallback.")
                daily_plan = generate_fallback_meal_plan(user_profile)
        else:
            logger.info("Using fallback meal plan generation")
            daily_plan = generate_fallback_meal_plan(user_profile)
        
        # Add user profile to response
        daily_plan['user_profile'] = user_profile
        
        return jsonify(daily_plan), 200
        
    except Exception as e:
        logger.exception("Error in /profile route")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/seasonal', methods=['GET'])
def seasonal():
    """Get seasonal recommendations"""
    try:
        diet_type = request.args.get('diet_type', None)
        meal_type = request.args.get('meal_type', None)
        cuisines_str = request.args.get('cuisines', '')
        cuisines = [c.strip() for c in cuisines_str.split(',') if c.strip()] if cuisines_str else None
        
        if recommender:
            try:
                seasonal_data = recommender.get_seasonal_recommendations(
                    diet_type=diet_type,
                    meal_type=meal_type,
                    cuisines=cuisines
                )
                return jsonify(seasonal_data), 200
            except Exception as e:
                logger.error(f"ML model seasonal recommendations failed: {e}")
                # Fall through to fallback
        
        # Fallback seasonal recommendations
        season = get_current_season()
        return jsonify({
            'season': season,
            'foods': [
                {'food_name': f'Seasonal {meal_type or ""} Option 1', 'calories': 300, 'protein_g': 15},
                {'food_name': f'Seasonal {meal_type or ""} Option 2', 'calories': 350, 'protein_g': 20},
                {'food_name': f'Seasonal {meal_type or ""} Option 3', 'calories': 280, 'protein_g': 12}
            ]
        }), 200
    except Exception as e:
        logger.exception("Error in /seasonal route")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "ml_model": "available" if recommender else "using_fallback",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
