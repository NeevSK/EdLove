import './load-env';
import './telemetry';
import { startRetentionMaintenance } from './ai/maintenance/retention';
import { app } from './core/app';

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');

const port = Number(process.env.PORT) || 3000;
console.log(`Sanctuary API standing guard on port ${port} (Bun/Edge Native)`);

startRetentionMaintenance();

export default {
  fetch: app.fetch,
  port,
};

export { app } from './core/app';
export type AppType = typeof app;
