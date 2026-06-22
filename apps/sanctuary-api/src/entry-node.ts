import './load-env';
import { serve } from '@hono/node-server';
import { app } from './core/app';

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');

// --- Launch ---
const port = Number(process.env.PORT) || 3000;
console.log(`Sanctuary API standing guard on port ${port} (Node.js Adapter)`);

if (process.env.NODE_ENV !== 'test') {
  serve({
    fetch: app.fetch,
    port,
  });
}

export default app;
