import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import "dotenv/config";

// Function to create JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Register a new user
 */
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  
  try {
    // Check if the user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Validate the email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Check if the password is strong (minimum 8 characters)
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password (minimum 8 characters)",
      });
    }

    // Hashing the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user and generate a token
    const user = await newUser.save();
    const token = createToken(user._id);

    // Return the token and user info
    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.json({
      success: false,
      message: "Error during registration. Please try again.",
    });
  }
};

/**
 * Login user
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    const token = createToken(user._id);
    
    return res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.json({ success: false, message: "Error during login" });
  }
};

/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching profile" 
    });
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      sex,
      weight_kg,
      height_cm,
      activity_level,
      goal,
      diet_type,
      allergies,
      cuisines,
      daily_water_goal_ml
    } = req.body;

    const updateData = {};
    
    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (sex !== undefined) updateData.sex = sex;
    if (weight_kg !== undefined) updateData.weight_kg = weight_kg;
    if (height_cm !== undefined) updateData.height_cm = height_cm;
    if (activity_level !== undefined) updateData.activity_level = activity_level;
    if (goal !== undefined) updateData.goal = goal;
    if (diet_type !== undefined) updateData.diet_type = diet_type;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (cuisines !== undefined) updateData.cuisines = cuisines;
    if (daily_water_goal_ml !== undefined) updateData.daily_water_goal_ml = daily_water_goal_ml;

    const user = await userModel.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Profile updated successfully",
      user 
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error updating profile" 
    });
  }
};

export { 
  loginUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile 
};
