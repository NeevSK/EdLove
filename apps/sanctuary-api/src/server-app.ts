import type { Router } from '@orpc/server';
import type { ServerConfig } from './config';
import { createApp, createRuntimeState } from './core/app';
import type { APIContext } from './core/context';
import { router } from './core/router';
import type { Platform } from './platform';

/**
 * The one place a runtime adapter (Node or Bun) builds the Hono app from config, so both
 * runtimes admit, bound and drain requests with the same rules.
 */
export function createServerApp(
  config: ServerConfig,
  procedures: Router<APIContext> = router,
  platform?: Platform,
) {
  const state = createRuntimeState();
  const app = createApp(procedures, {
    runtimeState: state,
    timeoutMs: config.API_REQUEST_TIMEOUT_MS,
    streamingTimeoutMs: config.API_STREAM_TIMEOUT_MS,
    maxUnknownLengthRequests: config.API_MAX_UNKNOWN_LENGTH_REQUESTS,
    maxAuthenticationRequests: config.API_MAX_AUTHENTICATION_REQUESTS,
    maxInFlightRequests: config.API_MAX_IN_FLIGHT_REQUESTS,
    platform,
    browserOrigins: config.API_BROWSER_ORIGINS,
  });
  return { app, state };
}
