const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || 'club_event',
    serverSelectionTimeoutMS: 10000
  });
  console.log(`Connected to MongoDB database "${mongoose.connection.name}".`);
}

module.exports = { mongoose, connectDatabase };
