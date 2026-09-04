import * as Layer from 'effect/Layer';

/**
 * Dependency Injection Layer composition for @repo/core.
 *
 * All application layers and context tags connect here.
 *
 * Rules:
 * - Tag the *infrastructure port* (e.g. IGrowthPort), not the 700-line domain manager.
 * - Test layers swap the port; domain managers consume the port from context.
 * - v4 note: Context.Tag maps to Context.Service with inverted argument order.
 */

export {
  GrowthPort,
  GrowthManagerTag,
  GrowthPortLive,
  GrowthManagerLive,
  GrowthLayer,
} from '@repo/core/logic/ports/growth.tags';
