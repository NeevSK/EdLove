import { SupabaseGrowthAdapter } from '@repo/core/adapters/supabase/growth.adapter';
import type { IGrowthPort } from '@repo/core/logic/ports/growth.port';
import { Context, Layer } from 'effect';

/**
 * GrowthPort — Effect Context.Tag for the growth data port.
 */
export class GrowthPort extends Context.Service<GrowthPort, IGrowthPort>()('app/GrowthPort') {}

/**
 * Live implementation of GrowthPort backed by Supabase.
 */
export const GrowthPortLive: Layer.Layer<GrowthPort, never, never> = Layer.succeed(
  GrowthPort,
  new SupabaseGrowthAdapter(),
);

export const GrowthLayer: Layer.Layer<GrowthPort, never, never> = GrowthPortLive;
