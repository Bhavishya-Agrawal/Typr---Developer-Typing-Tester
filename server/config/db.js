const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // If already connected, reuse connection (prevents connection exhaustion in serverless)
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/typr_db';

  try {
    cachedConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
