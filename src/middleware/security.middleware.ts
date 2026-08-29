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
  const signature = req.headers['x-hub-signature-256'] as string;
  const appSecret = config.whatsapp.appSecret;

  // If app secret is not configured or in development mode, allow
  if (!appSecret || appSecret.startsWith('your_app_secret') || config.nodeEnv === 'development') {
    return next();
  }

  if (!signature) {
    res.status(401).json({
      success: false,
      error: { code: 'MissingSignature', message: 'Missing X-Hub-Signature-256 header.' },
    });
    return;
  }

  try {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex')}`;

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
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
