import { readServerConfig } from './config';
import { startNodeServer } from './node-server';
import { createPlatform } from './platform';

function failureCode(error: unknown) {
  if (
    error instanceof Error &&
    'code' in error &&
    typeof error.code === 'string' &&
    ['EADDRINUSE', 'EACCES', 'EADDRNOTAVAIL', 'EMFILE', 'ENFILE'].includes(error.code)
  )
    return error.code;
  return 'UNCLASSIFIED';
}

let platform: ReturnType<typeof createPlatform>;
try {
  const config = readServerConfig(process.env);
  platform = createPlatform(config);
  const runtime = await startNodeServer(config, undefined, platform);
  platform?.startMaintenance();
  console.info({ event: 'api.server.listening' });
  const shutdown = () => {
    console.info({ event: 'api.shutdown.started' });
    void runtime
      .shutdown()
      .then(async ({ forced }) => {
        // Closing sockets cannot stop non-cooperative tasks holding the event loop.
        if (forced) process.exit(1);
        await platform?.close();
      })
      .catch(() => {
        console.error({ event: 'api.shutdown.failed' });
        process.exitCode = 1;
      });
  };
  runtime.server.on('error', (error) => {
    console.error({ event: 'api.server.failed', code: failureCode(error) });
    process.exitCode = 1;
    shutdown();
  });
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
} catch (error) {
  // Config/adapter errors can contain environment values; don't dump them.
  console.error({ event: 'api.server.startup_failed', code: failureCode(error) });
  process.exitCode = 1;
  await platform?.close();
}
