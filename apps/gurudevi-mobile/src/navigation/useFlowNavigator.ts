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
import { type Href, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

type StepOptions = Pick<NavigationContext, 'params' | 'condition'>;

/**
 * Navigates by flow step, not by route (L9). The step decides where it is and how it appears
 * (`@repo/core/flows/navigator`, choices in `navigationPolicy`); this carries it out with the
 * expo-router 58 router bound to this screen's root (`useRouter`, which SDK 58 prefers over the
 * module-level `router`). A sheet, modal or panel is pushed: its route's layout presents it. A step
 * that can't be reached is reported for developers and returned, so the screen can tell the person.
 */
export function useFlowNavigator() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const sizeClass = sizeClassOf(width);

  return useMemo(() => {
    const go = (op: NavigationOp, href: string) => router[op](href as Href);

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
        if (resolved.kind === 'go') router.prefetch(resolved.href as Href);
      },
      /** Back, or dismiss a sheet or modal; a no-op at the root. */
      back() {
        if (router.canGoBack()) router.back();
      },
    };
  }, [router, sizeClass]);
}
