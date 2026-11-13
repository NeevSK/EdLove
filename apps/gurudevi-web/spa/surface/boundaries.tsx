import { EmptyState, ErrorState } from '@repo/ui/components/web';
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { isStaleBuildError, reloadForNewBuild } from '../../lib/runtime/staleBuild';

/**
 * What a route shows when it fails. A tab still on the previous release reloads into the new one;
 * anything else says so plainly and offers to try again, reloading the route's data.
 */
export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const stale = isStaleBuildError(error);
  useEffect(() => {
    if (stale && reloadForNewBuild()) return;
    console.error('[Gurudevi] A page failed to open:', error);
  }, [error, stale]);

  return (
    <main id="main-content" className="sanctuary-container">
      <ErrorState
        title={stale ? 'Gurudevi has been updated' : 'This page could not open'}
        message={
          stale
            ? 'Load the page again to continue with the new version.'
            : 'Your work is safe. Try again, or go back to where you were.'
        }
        retry={{
          label: 'Try again',
          onPress: () => {
            reset();
            void router.invalidate();
          },
        }}
      />
    </main>
  );
}

/** An address that leads nowhere: said kindly, with the way home. */
export function PageNotFound() {
  const router = useRouter();
  return (
    <main id="main-content" className="sanctuary-container">
      <EmptyState
        title="This page doesn't exist"
        message="The link may be old or mistyped. Gurudevi's places are still here."
        action={{ label: 'Go to Gurudevi', onPress: () => void router.navigate({ to: '/' }) }}
      />
    </main>
  );
}
