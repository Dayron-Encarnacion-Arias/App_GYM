const config = require('./config');
const createApp = require('./app');

const server = createApp(config).listen(config.port, () => {
  console.log(`[gateway] API Gateway escuchando en http://localhost:${config.port}`);
  for (const route of config.routes) {
    console.log(`[gateway]   ${route.prefix.padEnd(20)} -> ${route.service} (${config.services[route.service]})`);
  }
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
