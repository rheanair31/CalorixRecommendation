import mongoose from "mongoose";

/**
 * Water Intake Model
 * Tracks daily water consumption for users
 */
const waterIntakeSchema = new mongoose.Schema({
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
  amount_ml: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index for efficient queries by user and date
waterIntakeSchema.index({ userId: 1, date: 1 });

const WaterIntake = mongoose.models.WaterIntake || mongoose.model('WaterIntake', waterIntakeSchema);

export default WaterIntake;
