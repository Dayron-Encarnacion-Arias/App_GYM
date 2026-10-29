const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { randomUUID } = require('crypto');
const { createProxyMiddleware } = require('http-proxy-middleware');
const defaultConfig = require('./config');

/**
 * El gateway no conoce la lógica de negocio ni valida tokens: solo es la puerta
 * de entrada única. Aplica CORS, agrega un id de petición, registra el tráfico y
 * reenvía cada ruta al servicio dueño. La validación del JWT la hace cada servicio.
 */
function createApp(config = defaultConfig) {
  const app = express();
  app.disable('x-powered-by');

  app.use(cors({ origin: config.corsOrigins, credentials: false }));
  app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', req.headers['x-request-id']);
    next();
  });
  if (config.nodeEnv !== 'test') app.use(morgan(':method :url :status - :response-time ms'));

  // Estado del gateway y de cada servicio (consulta /health de cada uno).
  app.get('/api/health', async (req, res) => {
    const entries = await Promise.all(
      Object.entries(config.services).map(async ([name, url]) => {
        try {
          const response = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
          const body = await response.json().catch(() => ({}));
          return [name, { status: response.ok ? 'up' : 'down', ...(body.dependencies ? { dependencies: body.dependencies } : {}) }];
        } catch {
          return [name, { status: 'down' }];
        }
      })
    );
    const services = Object.fromEntries(entries);
    const allUp = Object.values(services).every((service) => service.status === 'up');
    res.status(allUp ? 200 : 503).json({ success: allUp, gateway: 'up', services });
  });

  // Un proxy por servicio. Se usa pathFilter para conservar la ruta completa (/api/...).
  for (const [service, target] of Object.entries(config.services)) {
    const prefixes = config.routes.filter((route) => route.service === service).map((route) => route.prefix);
    if (prefixes.length === 0) continue;

    app.use(
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathFilter: prefixes,
        proxyTimeout: 15000,
        on: {
          error: (error, req, res) => {
            console.error(`[gateway] ${service} no responde (${req.method} ${req.url}): ${error.code || error.message}`);
            if (res.headersSent) return;
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: `El servicio de ${service} no está disponible` }));
          },
        },
      })
    );
  }

  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Ruta ${req.method} ${req.originalUrl} no encontrada en el gateway` });
  });

  return app;
}

module.exports = createApp;
