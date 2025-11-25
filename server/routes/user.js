// routes/userRoutes.js - Modified sections
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const Bill = require('../model/bill_schema');
const { auth } = require("../middleware/auth");
const crypto = require('crypto');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mysecret',
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role, tenantCode, organizationName } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    let tenantId;
    let orgName = null;

    if (role === 'admin') {
      if (!organizationName) {
        return res.status(400).json({ message: 'Organization name is required for admin registration' });
      }
      tenantId = crypto.randomBytes(4).toString('hex');
      orgName = organizationName;
    } else {
      if (!tenantCode) {
        return res.status(400).json({ message: 'Tenant code is required for user registration' });
      }
      
      const adminUser = await User.findOne({ tenantId: tenantCode, role: 'admin' });
      if (!adminUser) {
        return res.status(400).json({ message: 'Invalid tenant code' });
      }
      
      tenantId = tenantCode;
      orgName = adminUser.organizationName;
    }

    const user = new User({ 
      name, 
      email, 
      password, 
      role: role || "user",
      tenantId,
      organizationName: orgName
    });
    
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// routes/userRoutes.js - Add endpoint to get user details with role
router.get("/users", auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const users = await User.find({ tenantId: currentUser.tenantId }).select("name email role createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:userId", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { userId } = req.params;
    const currentUser = await User.findById(req.user.id);
    const bills = await Bill.find({ user: userId }).populate("user", "name email role");
    
    const filteredBills = bills.filter(bill => bill.user && bill.user.tenantId === currentUser.tenantId);
    
    res.json(filteredBills);
  } catch (err) {
    console.error("Error fetching user bills:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'mysecret', { expiresIn: '15m' });

    res.json({ 
      message: 'Email verified successfully', 
      token,
      userId: user._id 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret');
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Session expired. Please try again.' });
    }
    res.status(400).json({ message: 'Invalid session. Please try again.' });
  }
});

module.exports = router;