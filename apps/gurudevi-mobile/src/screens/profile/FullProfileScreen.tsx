/**
 * FullProfileScreen.tsx
 *
 * Thin wrapper for the detailed Profile View.
 */

import { FullProfileScreen as PackageFullProfileScreen } from '@repo/profile';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

const FullProfileWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary name="Detailed Profile">
    <PackageFullProfileScreen {...props} />
  </ErrorBoundary>
);

export default FullProfileWrapper;
