require('dotenv').config();
const { connectDatabase, mongoose } = require('../config/database');
const models = require('../models');

async function initializeDatabase() {
  try {
    await connectDatabase();
    await Promise.all(Object.values(models).map((Model) => Model.init()));
    console.log('club_event MongoDB collections and indexes are ready.');
  } finally {
    await mongoose.disconnect();
  }
}

initializeDatabase().catch((error) => {
  console.error('MongoDB initialization failed:', error);
  process.exitCode = 1;
});
