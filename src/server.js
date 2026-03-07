const http = require('http');
const { createApp } = require('./app');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socket.service');
const { logger } = require('./utils/logger');

async function bootstrap() {
  await connectDB(env.MONGO_URI);

  const app = createApp();
  const server = http.createServer(app);

  // initSocket ska returnera io-instansen
  const io = initSocket(server, { corsOrigin: env.CLIENT_ORIGIN });

  // gör io åtkomlig i controllers via req.app.get('io')
  app.set('io', io);

  server.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});