const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');

const routes = require('./routes');
const { logger } = require('./utils/logger');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const { env } = require('./config/env');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());

  app.use(pinoHttp({ logger }));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use(routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };