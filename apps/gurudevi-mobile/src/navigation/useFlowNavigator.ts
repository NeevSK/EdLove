import type { FlowId } from '@repo/core/flows';
import { NAVIGATION_POLICY } from '@repo/core/flows/navigationPolicy';
import {
  type NavigationContext,
  type NavigationOp,
  nextStepOf,
  type ResolvedStep,
  resolveFlowCompletion,
  resolveFlowStep,
  sizeClassOf,
} from '@repo/core/flows/navigator';
import { captureException } from '@repo/core/monitoring';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useNavigator } from '@repo/ui/components/native/navigation';

type StepOptions = Pick<NavigationContext, 'params' | 'condition'>;

/**
 * Navigates by flow step, not by route (L9). The step decides where it is and how it appears
 * (`@repo/core/flows/navigator`, choices in `navigationPolicy`); this carries it out with the
 * checked navigator (`./navigator`, on expo-router 58's `useRouter`). A sheet, modal or panel is
 * pushed: its route's layout presents it. A step that can't be reached is reported for developers
 * and returned, so the screen can tell the person.
 */
export function useFlowNavigator() {
  const navigator = useNavigator();
  const { width } = useWindowDimensions();
  const sizeClass = sizeClassOf(width);

  return useMemo(() => {
    // Flow routes were checked against the catalogue by the resolver; the navigator checks again,
    // so no path reaches the router without passing the one guard.
    const go = (op: NavigationOp, href: string) => navigator.follow(href, 'flow', op);

    const resolve = (flowId: FlowId, stepId: string, options: StepOptions) =>
      resolveFlowStep(flowId, stepId, { platform: 'mobile', sizeClass, ...options });

    const open = (flowId: FlowId, stepId: string, options: StepOptions = {}): ResolvedStep => {
      const resolved = resolve(flowId, stepId, options);
      if (resolved.kind === 'unavailable') {
        captureException(new Error(`Flow step unavailable: ${flowId}/${stepId}`), {
          boundary: 'flow-navigator',
          reason: resolved.reason,
          detail: resolved.detail,
        });
        return resolved;
      }
      go(resolved.op, resolved.href);
      return resolved;
    };

    return {
      sizeClass,
      open,
      /** The step after `stepId`, or the flow's completion when it was the last. */
      next(flowId: FlowId, stepId: string, options?: StepOptions): ResolvedStep | null {
        const next = nextStepOf(flowId, stepId);
        if (next) return open(flowId, next, options);
        const done = resolveFlowCompletion(flowId, 'mobile');
        if (done) go(done.op, done.href);
        return null;
      },
      /**
       * Warms a step's screen before the person commits (press-in, focus), so it opens without a
       * blank frame. Silent when the step can't be reached: `open` reports that.
       */
      prefetch(flowId: FlowId, stepId: string, options: StepOptions = {}) {
        if (!NAVIGATION_POLICY.mobile.prefetchOnIntent) return;
        const resolved = resolve(flowId, stepId, options);
        if (resolved.kind === 'go') navigator.warm(resolved.href);
      },
      /** Back, or dismiss a sheet or modal; a no-op at the root. */
      back: () => navigator.back(),
    };
  }, [navigator, sizeClass]);
}
