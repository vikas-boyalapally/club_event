require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

const port = Number(process.env.PORT || 3000);

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(port, () => {
    console.log(`Club Event Management API listening on port ${port}.`);
  });
}

start().catch((error) => {
  console.error('Unable to start the API:', error);
  process.exitCode = 1;
});
