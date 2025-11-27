const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dbConnect = require('./lib/dbConnect'); 
const workoutRoutes = require('./routes/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/user');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Sanghamitra Billing App - Multi-Tenant Edition');
});

// API Routes - connection will be handled per-route now
app.use('/api', workoutRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);

// REMOVE the mongoose.connect() from here!
// Each route will call dbConnect() when needed

// For Vercel serverless - wrap app in handler that ensures DB connection
if (process.env.VERCEL) {
  module.exports = async (req, res) => {
    // Connect to database before handling request
    await dbConnect();
    return app(req, res);
  };
} else {
  // For local development
  const PORT = process.env.PORT || 6000;
  
  dbConnect().then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
}

module.exports = app;
