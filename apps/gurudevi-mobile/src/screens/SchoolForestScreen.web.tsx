/**
 * SchoolForestScreen.web.tsx
 *
 * Thin wrapper for the Classroom School Forest (Vibes) UI.
 */

import { SchoolForestScreenWeb } from '@repo/admin';
import { ErrorBoundary } from '@repo/ui';

const SchoolForestWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary name="School Forest">
    <SchoolForestScreenWeb {...props} />
  </ErrorBoundary>
);

export default SchoolForestWrapper;
