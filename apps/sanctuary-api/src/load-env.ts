import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file for local development
// When using 'doppler run --', secrets are already injected as environment variables
// This .env loading is only for fallback when not using doppler run
config({ path: join(__dirname, '../.env') });