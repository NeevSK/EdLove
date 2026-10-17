import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Doppler is the default source of truth. A dotenv file is only read when a
// developer explicitly opts into the local fallback, preventing silent secret
// source drift between local development and CI.
if (process.env.ALLOW_DOTENV_FALLBACK === 'true') {
  config({ path: join(__dirname, '../.env') });
}

export function assertEnv(): void {
  const env = process.env.NODE_ENV || 'development';
  const isProdOrStaging = env === 'production' || process.env.EDLOVE_ENV === 'staging';

  const byok = process.env.BYOK_ENCRYPTION_SECRET;
  if (!byok || byok.length < 32) {
    if (isProdOrStaging) {
      throw new Error(
        '[FATAL] BYOK_ENCRYPTION_SECRET must be provided and be at least 32 characters in staging/production.',
      );
    }
    if (env !== 'test') {
      console.warn(
        '[WARN] BYOK_ENCRYPTION_SECRET is unset or shorter than 32 characters. AI key encryption will fail.',
      );
    }
  }
}

// Enforce environment checks at boot outside test suites
if (process.env.NODE_ENV !== 'test') {
  assertEnv();
}
