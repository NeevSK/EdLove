import type { FlowId } from '@repo/core/flows';
import {
  type NavigationContext,
  nextStepOf,
  type ResolvedStep,
  resolveFlowCompletion,
  resolveFlowStep,
  sizeClassOf,
} from '@repo/core/flows/navigator';
import { captureException } from '@repo/core/monitoring';
import { type Href, router } from 'expo-router';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

type StepOptions = Pick<NavigationContext, 'params' | 'condition'>;

/**
 * Navigates by flow step, not by route (L9). The step decides where it is and how it appears
 * (`@repo/core/flows/navigator`); this carries it out with expo-router. A sheet, modal or panel is
 * pushed: its route's layout presents it. A step that can't be reached is reported for developers
 * and returned, so the screen can tell the person.
 */
export function useFlowNavigator() {
  const { width } = useWindowDimensions();
  const sizeClass = sizeClassOf(width);

  return useMemo(() => {
    const open = (flowId: FlowId, stepId: string, options: StepOptions = {}): ResolvedStep => {
      const resolved = resolveFlowStep(flowId, stepId, {
        platform: 'mobile',
        sizeClass,
        ...options,
      });
      if (resolved.kind === 'unavailable') {
        captureException(new Error(`Flow step unavailable: ${flowId}/${stepId}`), {
          boundary: 'flow-navigator',
          reason: resolved.reason,
          detail: resolved.detail,
        });
        return resolved;
      }
      router[resolved.op](resolved.href as Href);
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
        if (done) router.replace(done.href as Href);
        return null;
      },
      /** Back, or dismiss a sheet or modal; a no-op at the root. */
      back() {
        if (router.canGoBack()) router.back();
      },
    };
  }, [sizeClass]);
}
