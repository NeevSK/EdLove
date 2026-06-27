import './load-env';
import { app } from './core/app';

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');

// --- Launch ---
const port = Number(process.env.PORT) || 3000;
console.log(`Sanctuary API standing guard on port ${port} (Bun/Edge Native)`);

export default {
  fetch: app.fetch,
  port,
};

export { app } from './core/app';
export type AppType = typeof app;
