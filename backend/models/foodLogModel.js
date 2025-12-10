import mongoose from "mongoose";

/**
 * Food Log Model
 * Tracks daily food intake with calories and macros
 */
const foodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  meal_type: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  food_name: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein_g: {
    type: Number,
    default: 0,
    min: 0
  },
  carbs_g: {
    type: Number,
    default: 0,
    min: 0
  },
  fat_g: {
    type: Number,
    default: 0,
    min: 0
  },
  fiber_g: {
    type: Number,
    default: 0,
    min: 0
  },
  serving_size: {
    type: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index for efficient queries by user and date
foodLogSchema.index({ userId: 1, date: 1 });

const FoodLog = mongoose.models.FoodLog || mongoose.model('FoodLog', foodLogSchema);

export default FoodLog;
