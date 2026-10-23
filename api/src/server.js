const app = require('./app');
const config = require('./config/env');
const connectMongo = require('./config/mongo');
const { connectSqlServer, pool } = require('./config/sqlserver');

async function start() {
  try {
    await connectMongo();
    await connectSqlServer();
    const server = app.listen(config.port, () => console.log(`API disponible en http://localhost:${config.port}`));
    const shutdown = async () => {
      server.close();
      await pool.close();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('No se pudo iniciar la API:', error.message);
    process.exit(1);
  }
}

start();
