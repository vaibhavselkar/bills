const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const workoutRoutes = require('./routes/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/user');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Sanghamitra Billing App - Multi-Tenant Edition');
});

// API Routes
app.use('/api', workoutRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);

// MongoDB connection with optimizations
mongoose.connect(process.env.DATABASE, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

const PORT = process.env.PORT || 6000;

// For Vercel serverless
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // For local development
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
}

module.exports = app;
