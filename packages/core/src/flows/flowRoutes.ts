import { type RoutePlatform, routeExists } from '@repo/core/routing/routeMatch';
import type { FeatureJTBDGraph } from '@repo/core/types/domainEntry';

/**
 * Do a flow's routes exist? Every step names a place on each platform, and every fallback and
 * the completion name where to go next; each must be a route in the generated catalogue. This is
 * the check `validateFlowDAG` (structure only) never made.
 */

export interface BrokenFlowRoute {
  readonly featureId: string;
  /** `step:<id>`, `fallback:<step>/<screen>`, or `completion`. */
  readonly at: string;
  readonly platform: RoutePlatform | 'either';
  readonly route: string;
}

/** Mobile routes start with a group (`/(tabs)/…`); a route that exists on either platform passes. */
const existsSomewhere = (route: string) =>
  routeExists(route, 'mobile') || routeExists(route, 'web');

export function checkFlowRoutes(flow: FeatureJTBDGraph): BrokenFlowRoute[] {
  const broken: BrokenFlowRoute[] = [];
  const add = (at: string, platform: BrokenFlowRoute['platform'], route: string) =>
    broken.push({ featureId: flow.featureId, at, platform, route });

  for (const node of flow.nodes) {
    if (!routeExists(node.mobileRoute, 'mobile'))
      add(`step:${node.stepId}`, 'mobile', node.mobileRoute);
    if (!routeExists(node.webRoute, 'web')) add(`step:${node.stepId}`, 'web', node.webRoute);
    for (const fallback of node.fallbacks) {
      if (!existsSomewhere(fallback.fallbackRoute)) {
        add(
          `fallback:${node.stepId}/${fallback.fallbackScreenId}`,
          'either',
          fallback.fallbackRoute,
        );
      }
    }
  }
  if (!existsSomewhere(flow.completion.nextCircadianRoute)) {
    add('completion', 'either', flow.completion.nextCircadianRoute);
  }
  return broken;
}

/** One line per broken reference, stable for diffs and for the known-broken list. */
export const brokenRouteKey = (b: BrokenFlowRoute) =>
  `${b.featureId} ${b.at} ${b.platform} ${b.route}`;
