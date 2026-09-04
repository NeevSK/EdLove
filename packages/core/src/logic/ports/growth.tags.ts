import { SupabaseGrowthAdapter } from '@repo/core/adapters/supabase/growth.adapter';
import { GrowthManager } from '@repo/core/logic/managers/GrowthManager';
import type { IGrowthPort } from '@repo/core/logic/ports/growth.port';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';

/**
 * GrowthPort — Effect Context.Tag for the growth data port.
 *
 * Gives Effect workflows access to IGrowthPort without manual wiring.
 * Inject a test double by providing:
 * ```ts
 * Layer.succeed(GrowthPort, mockPort)
 * ```
 *
 * Tradeoffs:
 *  + Effect code can yield* the port without manual construction
 *  + Test layers swap the port without touching production code
 *  - Not needed if the caller already has a GrowthManager instance
 *    (GrowthManager wraps all port operations with domain logic)
 *  - The port methods return Promise<T>, not Effect<T> — this is an
 *    intentional boundary. The port is infrastructure (I/O), not domain.
 *    Wrap with Effect.tryPromise for typed error handling at the call site.
 */
export class GrowthPort extends Context.Tag('app/GrowthPort')<GrowthPort, IGrowthPort>() {}

/**
 * GrowthManagerTag — Effect Context.Tag for the GrowthManager.
 *
 * Provides a fully-wired GrowthManager in Effect workflows.
 * Created with the GrowthPort from context.
 *
 * Tradeoffs over direct singleton import:
 *  + Test layers provide a manager wired to any port
 *  + Effect code uses yield* instead of import { growth }
 *  - GrowthManager is a large class (698 lines); Tag only makes sense
 *    when the caller is already in Effect context
 *  - For simple reads, prefer `yield* GrowthPort` instead (lighter)
 *  - The class methods return Promise<T> — callers in Effect context
 *    should wrap with Effect.tryPromise({ try: () => gm.method(), catch })
 *    so rejected Promises remain visible in the typed failure channel.
 */
export class GrowthManagerTag extends Context.Tag('app/GrowthManager')<
  GrowthManagerTag,
  GrowthManager
>() {}

/**
 * Live implementation of GrowthPort backed by Supabase.
 */
export const GrowthPortLive: Layer.Layer<GrowthPort, never, never> = Layer.succeed(
  GrowthPort,
  new SupabaseGrowthAdapter(),
);

/**
 * Live implementation of GrowthManager.
 * Requires GrowthPort in context; satisfied by GrowthPortLive.
 */
export const GrowthManagerLive: Layer.Layer<GrowthManagerTag, never, GrowthPort> = Layer.effect(
  GrowthManagerTag,
  Effect.map(GrowthPort, (port) => new GrowthManager(port)),
);

/**
 * Fully-wired GrowthLayer providing both GrowthPort and GrowthManager.
 *
 * Usage at composition root:
 * ```ts
 * Effect.runPromise(
 *   myEffect.pipe(Effect.provide(GrowthLayer)),
 * );
 * ```
 *
 * Usage in tests:
 * ```ts
 * const testLayer = Layer.merge(
 *   Layer.succeed(GrowthPort, fakePort),
 *   GrowthManagerLive,
 * );
 * ```
 */
export const GrowthLayer: Layer.Layer<GrowthPort | GrowthManagerTag, never, never> = Layer.merge(
  GrowthPortLive,
  GrowthManagerLive.pipe(Layer.provide(GrowthPortLive)),
);
