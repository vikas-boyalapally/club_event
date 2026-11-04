require('dotenv').config();
const app = require('./app');
const { connectDatabase, mongoose } = require('./config/database');
const models = require('./models');

const port = Number(process.env.PORT || 3000);

async function start() {
  await connectDatabase();
  await Promise.all(Object.values(models).map((Model) => Model.init()));
  app.listen(port, () => {
    console.log(`Club Event Management API listening on port ${port}.`);
  });
}

start().catch((error) => {
  console.error('Unable to start the API:', error);
  mongoose.disconnect().catch((disconnectError) => {
    console.error('Unable to disconnect from MongoDB:', disconnectError);
  });
  process.exitCode = 1;
});
