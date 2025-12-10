import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb://localhost:27017/food-del",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    console.log("✅ Local MongoDB Connected: localhost:27017/food-del");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
