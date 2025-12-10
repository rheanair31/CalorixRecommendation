import mongoose from "mongoose";

/**
 * Exercise Log Model
 * Tracks workouts and calculates calories burned
 */
const exerciseLogSchema = new mongoose.Schema({
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
  exercise_type: {
    type: String,
    required: true,
    enum: [
      'running',
      'walking',
      'cycling',
      'swimming',
      'gym_workout',
      'yoga',
      'pilates',
      'dancing',
      'sports',
      'hiit',
      'weightlifting',
      'cardio',
      'other'
    ]
  },
  duration_minutes: {
    type: Number,
    required: true,
    min: 1
  },
  intensity: {
    type: String,
    enum: ['light', 'moderate', 'intense'],
    default: 'moderate'
  },
  calories_burned: {
    type: Number,
    required: true,
    min: 0
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
exerciseLogSchema.index({ userId: 1, date: 1 });

const ExerciseLog = mongoose.models.ExerciseLog || mongoose.model('ExerciseLog', exerciseLogSchema);

export default ExerciseLog;
