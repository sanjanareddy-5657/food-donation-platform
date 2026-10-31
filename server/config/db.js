const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    if (!uri) {
      // Local development: embedded MongoDB, no installation or Atlas account needed.
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = path.join(__dirname, '..', 'data');
      fs.mkdirSync(dbPath, { recursive: true });
      const mongod = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } });
      uri = mongod.getUri() + 'fooddonation';
      console.log('MONGO_URI not set -> using embedded local MongoDB (data saved in server/data)');
    }

    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
