import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from './database/data-source';
import { Config } from './shared/config/config';
import { errorHandler } from './shared/middleware/errorHandler';
import logger from './shared/utils/logger';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './shared/config/swagger';

// Import routes
import chatRoutes from './modules/chat/routes';
import subscriptionRoutes from './modules/subscriptions/routes';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: Config.NODE_ENV,
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'GGI Backend Challenge API - Ahmed Murtaza',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      chat: 'POST /api/chat',
      chatHistory: 'GET /api/chat/history/:userId',
      createSubscription: 'POST /api/subscriptions',
      getSubscriptions: 'GET /api/subscriptions/:userId',
      cancelSubscription: 'PATCH /api/subscriptions/:id/cancel',
      toggleAutoRenew: 'PATCH /api/subscriptions/:id/toggle-autorenew',
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('✅ Database connection established');

    // Start server
    app.listen(Config.PORT, () => {
      logger.info(`🚀 Server running on port ${Config.PORT}`);
      logger.info(`📍 Environment: ${Config.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${Config.PORT}/health`);
      logger.info(`💬 Chat API: http://localhost:${Config.PORT}/api/chat`);
      logger.info(`💳 Subscriptions API: http://localhost:${Config.PORT}/api/subscriptions`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;