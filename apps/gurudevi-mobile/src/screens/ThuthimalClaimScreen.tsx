/**
 * ThuthimalClaimScreen.tsx
 */
import { ThuthimalClaimScreen as PackageThuthimalClaimScreen } from '@repo/profile';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

const ThuthimalWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary name="Thuthimal Claim">
    <PackageThuthimalClaimScreen {...props} />
  </ErrorBoundary>
);

export default ThuthimalWrapper;
