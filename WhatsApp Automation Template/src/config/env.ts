import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173,https://your-domain.vercel.app').split(','),
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
  whatsapp: {
    apiToken: process.env.WHATSAPP_API_TOKEN || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'whatsapp_sales_assistant_verify_token',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    appSecret: process.env.WHATSAPP_APP_SECRET || '',
  },
  ownerNotification: {
    email: process.env.OWNER_NOTIFICATION_EMAIL || '',
    phone: process.env.OWNER_NOTIFICATION_PHONE || '',
  },
};
