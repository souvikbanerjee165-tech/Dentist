import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`🚀 Production AI WhatsApp Sales Assistant API is running on http://localhost:${config.port}`);
  console.log(`🩺 Health check available at: http://localhost:${config.port}/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown handling for production deployments (Vercel / Docker / PM2)
const shutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log('✅ HTTP server closed. Process exiting cleanly.');
    process.exit(0);
  });

  // Force close after 10 seconds if lingering connections exist
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating server due to lingering connections.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
