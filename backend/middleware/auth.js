import jwt from "jsonwebtoken";
import "dotenv/config";

/**
 * Authentication Middleware
 * Verifies JWT token and attaches userId to request
 */
const authMiddleware = async (req, res, next) => {
  // Get token from header
  const token = req.headers.authorization?.split(' ')[1] || req.headers.token;
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Not authorized. Please login." 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user ID to request
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token. Please login again." 
    });
  }
};

export default authMiddleware;
