import './load-env';
import './telemetry';
import { serve } from '@hono/node-server';
import { startRetentionMaintenance } from './ai/maintenance/retention';
import { app } from './core/app';

const port = Number(process.env.PORT) || 3001;
console.info(`Sanctuary API standing guard on port ${port} (Node.js Adapter)`);

const retentionTimer = startRetentionMaintenance();

if (process.env.NODE_ENV !== 'test') {
  if (process.env.DEBUG) {
    console.debug(`[server] Binding serve() on port ${port}`);
  }
  const server = serve({
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0',
  });
  
  server.on('listening', () => {
    if (process.env.DEBUG) {
      console.debug(`[server] Listening on ${JSON.stringify(server.address())}`);
    }
  });
  
  server.on('error', (err) => {
    console.error(`[server] Server error:`, err);
  });

  let shuttingDown = false;
  const nodeServer = server as typeof server & {
    closeAllConnections?: () => void;
    closeIdleConnections?: () => void;
  };
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.info(`[shutdown] received ${signal}; draining HTTP server`);
    retentionTimer.close();

    const forceClose = setTimeout(() => {
      console.error('[shutdown] graceful drain exceeded 15 seconds; forcing close');
      nodeServer.closeAllConnections?.();
      process.exit(1);
    }, 15_000);
    forceClose.unref?.();

    server.close((error) => {
      clearTimeout(forceClose);
      if (error) {
        console.error('[shutdown] HTTP server close failed:', error);
        process.exitCode = 1;
      }
      console.info('[shutdown] HTTP server drained');
    });
    nodeServer.closeIdleConnections?.();
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

export default app;
