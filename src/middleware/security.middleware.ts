import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

// Global API rate limiter (150 requests per 15 minutes per IP)
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RateLimitExceeded',
      message: 'Too many requests. Please try again later.',
    },
  },
});

// Chat & AI Rate Limiter (40 requests per minute per IP to protect OpenAI API limits)
export const chatRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'ChatRateLimitExceeded',
      message: 'Too many chat inquiries sent in a short window. Please wait a moment.',
    },
  },
});

/**
 * Validates Meta WhatsApp Webhook HMAC-SHA256 signature
 */
export const validateWhatsAppSignature = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // GET requests are Meta webhook subscription verification challenges
  if (req.method === 'GET') {
    return next();
  }

  const signature = req.headers['x-hub-signature-256'] as string;
  const appSecret = config.whatsapp.appSecret;

  // In production, appSecret and signature are strictly mandatory (fail closed)
  if (config.nodeEnv === 'production') {
    if (!appSecret || appSecret.startsWith('your_app_secret')) {
      console.error('❌ FATAL: WHATSAPP_APP_SECRET is not configured in production.');
      res.status(500).json({
        success: false,
        error: { code: 'ServerMisconfigured', message: 'Webhook security secret not configured.' },
      });
      return;
    }
    if (!signature) {
      res.status(401).json({
        success: false,
        error: { code: 'MissingSignature', message: 'Missing X-Hub-Signature-256 header.' },
      });
      return;
    }
  } else {
    // In dev: if no secret or signature provided, allow development simulation
    if (!appSecret || appSecret.startsWith('your_app_secret') || !signature) {
      return next();
    }
  }

  try {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex')}`;

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      console.warn('❌ Webhook signature verification failed.');
      res.status(403).json({
        success: false,
        error: { code: 'InvalidSignature', message: 'Webhook signature validation failed.' },
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(403).json({
      success: false,
      error: { code: 'SignatureError', message: 'Unable to verify webhook signature.' },
    });
  }
};
