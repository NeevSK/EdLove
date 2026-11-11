import { logBreadcrumb } from '@repo/core/monitoring';
import { Cause, type Context, Effect, Layer, Logger, ManagedRuntime } from 'effect';
import { EntitlementLive, PermissionSnapshotLive } from './Layers';

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

// Ports join this layer when something consumes them. GrowthLayer (./Layers) has no consumer yet.
export const AppLayer = Layer.mergeAll(
  TelemetryLoggerLayer,
  EntitlementLive,
  PermissionSnapshotLive,
);

export const appRuntime = ManagedRuntime.make(AppLayer);

/** Services every app program may require. */
export type AppServices = Layer.Success<typeof AppLayer>;

/**
 * Calls a port bound in AppLayer and returns a Promise, for state (Tier 4) that isn't written as
 * Effect yet. A rejection keeps the adapter's original error.
 */
export function callPort<I extends AppServices, S, A>(
  port: Context.Key<I, S>,
  use: (service: S) => PromiseLike<A>,
): Promise<A> {
  return appRuntime.runPromise(
    Effect.flatMap(port, (service) =>
      Effect.tryPromise({ try: () => use(service), catch: (e) => e }),
    ),
  );
}
