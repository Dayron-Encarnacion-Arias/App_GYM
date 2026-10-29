const mongoose = require('mongoose');
const config = require('./env');

module.exports = async function connectMongo() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`[entrenamiento] MongoDB conectado (${mongoose.connection.host}/${mongoose.connection.name})`);
};
