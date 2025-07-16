const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const workoutRoutes = require('./routes/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to Sanghamitra Billing App');
});

// Routes
app.use('/api', workoutRoutes);

// MongoDB connection
mongoose.connect(process.env.DATABASE)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Start server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});


