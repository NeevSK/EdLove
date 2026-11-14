import { readServerConfig } from './config';
import { createApp } from './core/app';

const config = readServerConfig(process.env);
if (config.API_AUTHENTICATION === 'required')
  throw new Error('Authenticated foundation requires the Node entry point');
const app = createApp(undefined, {
  timeoutMs: config.API_REQUEST_TIMEOUT_MS,
  streamingTimeoutMs: config.API_STREAM_TIMEOUT_MS,
  maxInFlightRequests: config.API_MAX_IN_FLIGHT_REQUESTS,
  browserOrigins: config.API_BROWSER_ORIGINS,
});
export default { fetch: app.fetch, port: config.PORT };
export { app };
