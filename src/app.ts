import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { requestIdMiddleware } from './middleware/request-id';
import { errorHandler } from './middleware/error-handler';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import booksRoutes from './routes/books.routes';
import aiRoutes from './routes/ai.routes';
import { buildOpenApiSpec } from './swagger';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // Compression
  app.use(compression());

  // CORS
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    }),
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request ID
  app.use(requestIdMiddleware);

  // Swagger UI
  const swaggerSpec = buildOpenApiSpec();
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'Mini Library API Docs',
    }),
  );

  // Serve raw OpenAPI JSON
  app.get('/api/docs/json', (_req, res) => {
    res.json(swaggerSpec);
  });

  // API routes
  app.use('/api/v1', healthRoutes);
  app.use('/api/v1', authRoutes);
  app.use('/api/v1/books', booksRoutes);
  app.use('/api/v1/ai', aiRoutes);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
