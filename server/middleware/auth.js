const jwt = require("jsonwebtoken");
const User = require("../model/User");
const dbConnect = require("../lib/dbConnect"); 

const auth = async (req, res, next) => {
  await dbConnect(); // Ensure DB connection
  
  // Try to get token from Authorization header OR from cookie
  const token = 
    req.header("Authorization")?.replace("Bearer ", "") || 
    req.cookies?.token;
  
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecret");
    
    // Fetch user from database
    req.user = await User.findById(decoded.id).select("-password");
    
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Attach additional decoded info for convenience
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.tenantId = decoded.tenantId;
    
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    
    // More specific error messages
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired, please login again" });
    }
    
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { auth };
