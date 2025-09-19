const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const workoutRoutes = require('./routes/db');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/user');


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to Sanghamitra Billing App');
});

// Routes
app.use('/api', workoutRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);


// MongoDB connection
mongoose.connect(process.env.DATABASE)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
})

