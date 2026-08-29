import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { 
  globalRateLimiter, 
  chatRateLimiter, 
  validateWhatsAppSignature 
} from './middleware/security.middleware.js';
import healthRoutes from './routes/health.routes.js';
import aiRoutes from './routes/ai.routes.js';
import knowledgeRoutes from './routes/knowledge.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import crmRoutes from './routes/crm.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

export const createApp = (): Express => {
  const app = express();

  // 1. Core Security & Performance Middleware
  app.use(helmet({
    contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(compression());
  
  // 2. CORS Policy
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || config.cors.allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  }));

  // 3. Body Parsers with Raw Body preservation for HMAC verification
  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
    limit: '10mb',
  }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Global Rate Limiter
  app.use('/api/', globalRateLimiter);

  // 5. API Routes
  app.use('/health', healthRoutes);
  app.use('/api/v1/chat', chatRateLimiter, aiRoutes);
  app.use('/api/v1/knowledge', knowledgeRoutes);
  app.use('/api/v1/calendar', calendarRoutes);
  app.use('/api/v1/crm', crmRoutes);
  app.use('/api/v1/webhook', validateWhatsAppSignature, webhookRoutes);

  // 6. 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NotFound',
        message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`,
      },
    });
  });

  // 7. Global Error Handler
  app.use(errorHandler);

  return app;
};
