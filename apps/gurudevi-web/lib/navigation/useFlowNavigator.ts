'use client';

import type { FlowId } from '@repo/core/flows';
import {
  type NavigationContext,
  nextStepOf,
  type ResolvedStep,
  resolveFlowCompletion,
  resolveFlowStep,
  type SizeClass,
} from '@repo/core/flows/navigator';
import { WORKSPACE_COMPACT_BREAKPOINT } from '@repo/core/logic/workspace/layoutSync';
import { captureException } from '@repo/core/monitoring';
import { useRouter } from 'next/navigation';
import { useMemo, useSyncExternalStore } from 'react';

type StepOptions = Pick<NavigationContext, 'params' | 'condition'>;

const QUERY = `(min-width: ${WORKSPACE_COMPACT_BREAKPOINT}px)`;
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
const readSizeClass = (): SizeClass => (window.matchMedia(QUERY).matches ? 'regular' : 'compact');
// The server renders for desktop; the browser corrects it on hydration.
const serverSizeClass = (): SizeClass => 'regular';

/**
 * Navigates by flow step, not by route (L9). The step decides where it is and how it appears
 * (`@repo/core/flows/navigator`); this carries it out with the Next router. A step that can't be
 * reached is reported for developers and returned, so the screen can tell the person.
 */
export function useFlowNavigator() {
  const router = useRouter();
  const sizeClass = useSyncExternalStore(subscribe, readSizeClass, serverSizeClass);

  return useMemo(() => {
    const open = (flowId: FlowId, stepId: string, options: StepOptions = {}): ResolvedStep => {
      const resolved = resolveFlowStep(flowId, stepId, { platform: 'web', sizeClass, ...options });
      if (resolved.kind === 'unavailable') {
        captureException(new Error(`Flow step unavailable: ${flowId}/${stepId}`), {
          boundary: 'flow-navigator',
          reason: resolved.reason,
          detail: resolved.detail,
        });
        return resolved;
      }
      router[resolved.op](resolved.href);
      return resolved;
    };

    return {
      sizeClass,
      open,
      /** The step after `stepId`, or the flow's completion when it was the last. */
      next(flowId: FlowId, stepId: string, options?: StepOptions): ResolvedStep | null {
        const next = nextStepOf(flowId, stepId);
        if (next) return open(flowId, next, options);
        const done = resolveFlowCompletion(flowId, 'web');
        if (done) router.replace(done.href);
        return null;
      },
      back: () => router.back(),
    };
  }, [router, sizeClass]);
}
