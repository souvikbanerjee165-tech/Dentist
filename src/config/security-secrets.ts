import crypto from 'node:crypto';

const isProduction = process.env.NODE_ENV === 'production';

function getOrGenerateSecret(envVarName: string, description: string): string {
  const value = process.env[envVarName]?.trim();
  if (value && value.length > 0) {
    return value;
  }

  if (isProduction) {
    throw new Error(
      `[FATAL CONFIGURATION ERROR] Missing required secret: ${envVarName} (${description}). ` +
      `In production, hardcoded fallbacks are strictly prohibited. Configure ${envVarName} in your environment variables.`
    );
  }

  // In development, generate an ephemeral random 256-bit key per process run
  const ephemeral = crypto.randomBytes(32).toString('hex');
  console.warn(
    `⚠️ [SECURITY NOTICE] Environment variable ${envVarName} is not set. ` +
    `Generated ephemeral in-memory secret for development session: ${ephemeral.slice(0, 8)}...`
  );
  return ephemeral;
}

export const ADMIN_SECRET = getOrGenerateSecret(
  'ADMIN_API_KEY',
  'Clinic Super-Admin master authentication key'
);

export const STAFF_SECRET = getOrGenerateSecret(
  'STAFF_API_KEY',
  'Doctor and clinical staff operational bearer key'
);

export const PATIENT_JWT_SECRET = getOrGenerateSecret(
  'PATIENT_JWT_SECRET',
  'Patient session JWT signature secret'
);
