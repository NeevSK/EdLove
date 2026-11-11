import { logBreadcrumb } from '@repo/core/monitoring';
import { Cause, Layer, Logger, ManagedRuntime } from 'effect';

/**
 * The one Effect runtime for client code in @repo/core (mobile and web share it).
 *
 * Every program that the app runs goes through `appRuntime`, so each gets the same services and
 * the same logging, and new ports are added in one place: `AppLayer`. Run through the helpers in
 * ./Runtime.ts (`runToPromise`, `runForkBestEffort`) rather than `Effect.runPromise`, which skips
 * this layer; the ratchet counts direct runs and only lets the number go down.
 * See docs/architecture/2026-11-11-product-shape-and-tool-ownership.md, sections 3 and 7.
 */

const REPORTED_LEVELS = new Set(['Warn', 'Error', 'Fatal']);

/** Warnings and errors logged inside Effect programs become telemetry breadcrumbs. */
export const telemetryLogger = Logger.make<unknown, void>(({ logLevel, message, cause }) => {
  if (!REPORTED_LEVELS.has(logLevel)) return;
  const text = Array.isArray(message) ? message.map(String).join(' ') : String(message);
  logBreadcrumb(text, 'effect', {
    level: logLevel,
    ...(cause.reasons.length === 0 ? {} : { cause: Cause.pretty(cause) }),
  });
});

/** Keeps the default console logger and adds telemetry. */
export const TelemetryLoggerLayer = Logger.layer([telemetryLogger], { mergeWithExisting: true });

// Ports join this layer when something consumes them. GrowthLayer is defined in ./Layers but has
// no consumer yet, and it would load the Supabase adapter into every program.
export const AppLayer = TelemetryLoggerLayer;

export const appRuntime = ManagedRuntime.make(AppLayer);

/** Services every app program may require. */
export type AppServices = Layer.Success<typeof AppLayer>;
