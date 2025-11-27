// lib/dbConnect.js or utils/dbConnect.js
const mongoose = require('mongoose');

if (!process.env.DATABASE) {
  throw new Error('Please add your MongoDB URI to .env as DATABASE');
}

const MONGODB_URI = process.env.DATABASE;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If we have a cached connection, return it
  if (cached.conn) {
    console.log('🔄 Using cached MongoDB connection');
    return cached.conn;
  }

  // If there's no promise yet, create one
  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // CRITICAL: This prevents Mongoose from buffering commands
      bufferCommands: false,
    };

    console.log('🔌 Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e.message);
    throw e;
  }

  return cached.conn;
}

module.exports = dbConnect;
