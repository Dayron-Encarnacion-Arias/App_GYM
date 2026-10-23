const mongoose = require('mongoose');
const config = require('./env');

module.exports = async function connectMongo() {
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB conectado');
};
