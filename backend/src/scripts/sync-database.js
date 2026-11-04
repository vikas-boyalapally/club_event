require('dotenv').config();
const sequelize = require('../config/database');
require('../models');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('club_event database tables are ready.');
  } finally {
    await sequelize.close();
  }
}

syncDatabase().catch((error) => {
  console.error('Database synchronization failed:', error);
  process.exitCode = 1;
});
