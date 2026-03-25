import dotenv from 'dotenv';
import { z } from 'zod';

console.log('[BOOT] Loading environment variables...');
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  AYRSHARE_API_KEY: z.string().min(1),
  AYRSHARE_BASE_URL: z.string().url().default('https://app.ayrshare.com/api'),
  AYRSHARE_PRIVATE_KEY: z.string().optional().default(''),
  AYRSHARE_DOMAIN: z.string().default('id-NacDD'),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  console.log('[BOOT] Validating environment variables...');

  // Log which required vars are present (without values)
  const requiredVars = ['DATABASE_URL', 'AYRSHARE_API_KEY'];
  const optionalVars = ['PORT', 'AYRSHARE_BASE_URL', 'AYRSHARE_PRIVATE_KEY', 'AYRSHARE_DOMAIN', 'NODE_ENV'];

  for (const key of requiredVars) {
    console.log(`[BOOT] ${key}=${process.env[key] ? '***set***' : 'MISSING'}`);
  }
  for (const key of optionalVars) {
    console.log(`[BOOT] ${key}=${process.env[key] || '(default)'}`);
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('[BOOT] FATAL: Invalid environment variables:', JSON.stringify(result.error.flatten().fieldErrors));
    process.exit(1);
  }

  console.log('[BOOT] Environment variables validated successfully');
  return result.data;
}

export const env = loadEnv();
