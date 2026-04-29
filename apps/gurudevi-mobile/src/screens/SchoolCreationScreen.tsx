/**
 * SchoolCreationScreen.tsx
 *
 * Thin wrapper for the Admin School Creation UI.
 */

import SchoolCreationScreen from '@repo/admin/screens/SchoolCreationScreen';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

const SchoolCreationWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary name="School Creation">
    <SchoolCreationScreen {...props} />
  </ErrorBoundary>
);

export default SchoolCreationWrapper;
