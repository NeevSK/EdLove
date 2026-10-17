import './load-env';
import './telemetry';
import { constants } from 'node:crypto';
import { startRetentionMaintenance } from './ai/maintenance/retention';
import { app } from './core/app';
import { loadProductionTlsOptions } from './core/nodeTransport';
import { requiresHttps } from './core/transportSecurity';

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');

const port = Number(process.env.PORT) || 3000;
const productionTls = requiresHttps(process.env.NODE_ENV)
  ? loadProductionTlsOptions(process.env.SANCTUARY_TLS_KEY, process.env.SANCTUARY_TLS_CERT)
  : undefined;
console.log(`Sanctuary API standing guard on port ${port} (Bun/Edge Native)`);

startRetentionMaintenance();

export default {
  fetch: app.fetch,
  port,
  ...(productionTls
    ? {
        tls: {
          ...productionTls,
          // Bun.serve exposes protocol restrictions through secureOptions, not minVersion.
          secureOptions: constants.SSL_OP_NO_TLSv1 | constants.SSL_OP_NO_TLSv1_1,
        },
      }
    : {}),
};

export { app } from './core/app';
export type AppType = typeof app;
