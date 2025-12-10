import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // User Profile Information for Diet Planning
    age: { type: Number },
    sex: { type: String, enum: ['male', 'female'] },
    weight_kg: { type: Number },
    height_cm: { type: Number },
    activity_level: { 
      type: String, 
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] 
    },
    goal: { 
      type: String, 
      enum: ['lose_weight', 'maintain', 'gain_weight'] 
    },
    diet_type: { 
      type: String, 
      enum: ['Regular', 'Vegetarian', 'Vegan'],
      default: 'Regular'
    },
    allergies: [{ type: String }],
    cuisines: {
      breakfast: [{ type: String }],
      lunch: [{ type: String }],
      dinner: [{ type: String }],
      snack: [{ type: String }]
    },
    
    // Health Tracking Preferences
    daily_water_goal_ml: { type: Number, default: 3000 }, // 3 liters default
    daily_calorie_target: { type: Number },
    
    // Legacy field - keeping for compatibility
    cartData: { type: Object, default: {} },
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
