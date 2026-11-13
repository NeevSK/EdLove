import type { FlowId } from '@repo/core/flows';
import { NAVIGATION_POLICY } from '@repo/core/flows/navigationPolicy';
import {
  type NavigationContext,
  type NavigationOp,
  nextStepOf,
  type ResolvedStep,
  resolveFlowCompletion,
  resolveFlowStep,
  type SizeClass,
} from '@repo/core/flows/navigator';
import { captureException } from '@repo/core/monitoring';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useMemo, useSyncExternalStore } from 'react';

type StepOptions = Pick<NavigationContext, 'params' | 'condition'>;

const REGULAR = `(min-width: ${NAVIGATION_POLICY.compactBreakpoint}px)`;

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REGULAR);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
const sizeClassNow = (): SizeClass => (window.matchMedia(REGULAR).matches ? 'regular' : 'compact');
const regularOnServer = (): SizeClass => 'regular';

/**
 * Navigates by flow step, not by route (L9): the web half. The step is resolved in core
 * (`@repo/core/flows/navigator`, choices in `navigationPolicy`) and TanStack Router carries it out.
 * Flow routes are strings resolved at runtime, so they go by `href` rather than the typed `to`; the
 * route catalogue checks them instead of the compiler. The web has no stack to dismiss, so
 * `dismissTo` is a replace. A step that can't be reached never navigates; it is reported and
 * returned, so the screen can tell the person.
 */
export function useFlowNavigator() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const sizeClass = useSyncExternalStore(subscribe, sizeClassNow, regularOnServer);

  return useMemo(() => {
    const go = (op: NavigationOp, href: string) =>
      void router.navigate({
        href,
        replace: op !== 'push',
        viewTransition: NAVIGATION_POLICY.web.viewTransitions,
      });

    const resolve = (flowId: FlowId, stepId: string, options: StepOptions) =>
      resolveFlowStep(flowId, stepId, { platform: 'web', sizeClass, ...options });

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
        const done = resolveFlowCompletion(flowId, 'web');
        if (done) go(done.op, done.href);
        return null;
      },
      /** Loads a step's code and data before the person commits, as a link does on hover. */
      prefetch(flowId: FlowId, stepId: string, options: StepOptions = {}) {
        const resolved = resolve(flowId, stepId, options);
        if (resolved.kind === 'go') void router.preloadRoute({ to: resolved.href });
      },
      /** Back within the app; a no-op on the first page of the tab. */
      back() {
        if (canGoBack) router.history.back();
      },
    };
  }, [router, canGoBack, sizeClass]);
}
