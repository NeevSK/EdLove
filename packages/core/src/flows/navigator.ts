import { FLOW_REGISTRY, type FlowId } from '@repo/core/flows';
import { WORKSPACE_COMPACT_BREAKPOINT } from '@repo/core/logic/workspace/layoutSync';
import { fillRoute, findRoute, type RoutePlatform } from '@repo/core/routing/routeMatch';
import type {
  FeatureJTBDGraph,
  FlowFallbackCondition,
  FlowNodeStep,
  FlowPresentation,
} from '@repo/core/types/domainEntry';

/**
 * The navigator's decision (L9): a screen asks for a step of a flow, not a route, and this says
 * where that is on this platform, how it appears and how to get there. Pure: the platform hooks
 * (`useFlowNavigator` on mobile and web) carry the result out with their router.
 *
 * "Is this the next screen, a side panel, a bottom sheet or a modal?" is answered here, from the
 * step's purpose, unless the step says otherwise.
 */

/** Phones are compact; tablets and desktop are regular. */
export type SizeClass = 'compact' | 'regular';

/** The size class for a window width, at the workspace's one breakpoint. */
export const sizeClassOf = (width: number): SizeClass =>
  width >= WORKSPACE_COMPACT_BREAKPOINT ? 'regular' : 'compact';

/** The presentation a step gets by its purpose, per size class. A step's `presentation` overrides. */
export const DEFAULT_PRESENTATION: Record<
  FlowNodeStep['purpose'],
  Record<SizeClass, FlowPresentation>
> = {
  on_ramp: { compact: 'push', regular: 'push' },
  input_form: { compact: 'push', regular: 'push' },
  // Confirming happens over what is being confirmed.
  preview_confirm: { compact: 'sheet', regular: 'modal' },
  // Detail opens beside the list where there is room.
  sub_detail: { compact: 'push', regular: 'panel' },
  // A finished flow is not somewhere to go back to.
  terminal_success: { compact: 'replace', regular: 'replace' },
};

/** How the router gets there. `sheet`, `modal` and `panel` push a route whose layout presents it. */
export type NavigationOp = 'push' | 'replace';

const OP: Record<FlowPresentation, NavigationOp> = {
  push: 'push',
  sheet: 'push',
  modal: 'push',
  panel: 'push',
  replace: 'replace',
};

export interface NavigationContext {
  readonly platform: RoutePlatform;
  readonly sizeClass: SizeClass;
  /** Values for the route's `[param]` segments. */
  readonly params?: Readonly<Record<string, string>>;
  /** Why the step can't be reached as asked (offline, no permission…): take its fallback. */
  readonly condition?: FlowFallbackCondition;
}

export type ResolvedStep =
  | {
      readonly kind: 'go';
      readonly flowId: FlowId;
      readonly stepId: string;
      readonly href: string;
      /** The catalogue route it lands on. */
      readonly route: string;
      readonly op: NavigationOp;
      readonly presentation: FlowPresentation;
    }
  | {
      readonly kind: 'fallback';
      readonly flowId: FlowId;
      readonly stepId: string;
      readonly condition: FlowFallbackCondition;
      readonly href: string;
      readonly op: NavigationOp;
      /** What the person is told, and what they can do about it. */
      readonly guidance: string;
      readonly recovery: FlowNodeStep['fallbacks'][number]['recoveryAction'];
    }
  | {
      readonly kind: 'unavailable';
      readonly flowId: FlowId;
      readonly stepId: string;
      readonly reason: 'unknown_step' | 'route_missing' | 'params_missing' | 'no_fallback';
      /** For developers: the route, the missing params or the condition. */
      readonly detail: string;
    };

const routeOf = (step: FlowNodeStep, platform: RoutePlatform) =>
  platform === 'mobile' ? step.mobileRoute : step.webRoute;

export function presentationOf(step: FlowNodeStep, sizeClass: SizeClass): FlowPresentation {
  return step.presentation?.[sizeClass] ?? DEFAULT_PRESENTATION[step.purpose][sizeClass];
}

function flowOf(flowId: FlowId): FeatureJTBDGraph {
  return FLOW_REGISTRY[flowId];
}

/** Where a step is, how it appears and how to get there; or why it can't be reached. */
export function resolveFlowStep(
  flowId: FlowId,
  stepId: string,
  context: NavigationContext,
): ResolvedStep {
  const step = flowOf(flowId).nodes.find((node) => node.stepId === stepId);
  if (!step) return { kind: 'unavailable', flowId, stepId, reason: 'unknown_step', detail: stepId };

  if (context.condition) {
    const fallback = step.fallbacks.find((edge) => edge.condition === context.condition);
    if (!fallback) {
      return {
        kind: 'unavailable',
        flowId,
        stepId,
        reason: 'no_fallback',
        detail: context.condition,
      };
    }
    const filled = fillRoute(fallback.fallbackRoute, context.params);
    if (!filled.ok) {
      return {
        kind: 'unavailable',
        flowId,
        stepId,
        reason: 'params_missing',
        detail: filled.missing.join(','),
      };
    }
    if (!findRoute(filled.href, context.platform)) {
      return {
        kind: 'unavailable',
        flowId,
        stepId,
        reason: 'route_missing',
        detail: fallback.fallbackRoute,
      };
    }
    return {
      kind: 'fallback',
      flowId,
      stepId,
      condition: context.condition,
      href: filled.href,
      // A fallback stands in for the step: the person goes back past it, not into it.
      op: 'replace',
      guidance: fallback.guidancePrompt,
      recovery: fallback.recoveryAction,
    };
  }

  const pattern = routeOf(step, context.platform);
  const filled = fillRoute(pattern, context.params);
  if (!filled.ok) {
    return {
      kind: 'unavailable',
      flowId,
      stepId,
      reason: 'params_missing',
      detail: filled.missing.join(','),
    };
  }
  const route = findRoute(filled.href, context.platform);
  if (!route)
    return { kind: 'unavailable', flowId, stepId, reason: 'route_missing', detail: pattern };

  const presentation = presentationOf(step, context.sizeClass);
  return {
    kind: 'go',
    flowId,
    stepId,
    href: filled.href,
    route,
    op: OP[presentation],
    presentation,
  };
}

/** The step after `stepId` in the flow's order, or `null` at the end. */
export function nextStepOf(flowId: FlowId, stepId: string): string | null {
  const nodes = flowOf(flowId).nodes;
  const index = nodes.findIndex((node) => node.stepId === stepId);
  return index >= 0 ? (nodes[index + 1]?.stepId ?? null) : null;
}

/** Where a finished flow lands. Replaces, so back doesn't return into the flow. */
export function resolveFlowCompletion(
  flowId: FlowId,
  platform: RoutePlatform,
): { readonly href: string; readonly op: 'replace' } | null {
  const href = flowOf(flowId).completion.nextCircadianRoute;
  return findRoute(href, platform) ? { href, op: 'replace' } : null;
}
