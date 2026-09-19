import type { FeatureSurfaceStateSnapshot } from '@repo/core/logic/capabilityDecision';
import type { ReactNode } from 'react';

export type FeatureStateBoundaryProps = Readonly<{
  snapshot: FeatureSurfaceStateSnapshot;
  children: ReactNode;
  emptyTitle?: string;
  onRetry?: () => void;
}>;

/** Browser-safe feedback boundary. It deliberately avoids native-only visual
 * dependencies so a recovery state can never prevent a Next.js route loading. */
export function FeatureStateBoundary({
  snapshot,
  children,
  emptyTitle = 'Nothing is here yet',
  onRetry,
}: FeatureStateBoundaryProps) {
  if (snapshot.state === 'disposed') return null;

  if (snapshot.state === 'initializing' || snapshot.state === 'loading' || snapshot.state === 'saving') {
    return <p aria-live="polite">{snapshot.safeMessage}</p>;
  }

  if (snapshot.state === 'empty') {
    return (
      <section aria-live="polite">
        <h3>{emptyTitle}</h3>
        <p>{snapshot.safeMessage}</p>
      </section>
    );
  }

  if (snapshot.state === 'retryable_error') {
    return (
      <section aria-live="assertive" role="alert">
        <h3>Something interrupted this space</h3>
        <p>{snapshot.safeMessage}</p>
        {snapshot.canRetry && onRetry ? (
          <button onClick={onRetry} type="button">
            Try again
          </button>
        ) : null}
      </section>
    );
  }

  if (snapshot.state === 'permission_denied' || snapshot.state === 'unsupported') {
    return (
      <section aria-live="polite" role="status">
        <h3>
          {snapshot.state === 'permission_denied'
            ? 'This space is not available to you'
            : 'This is not available here'}
        </h3>
        <p>{snapshot.safeMessage}</p>
      </section>
    );
  }

  return (
    <>
      {snapshot.state === 'offline_stale' ? <p role="status">{snapshot.safeMessage}</p> : null}
      {children}
    </>
  );
}
