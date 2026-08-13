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
