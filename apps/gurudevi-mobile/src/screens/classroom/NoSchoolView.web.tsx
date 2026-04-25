/**
 * NoSchoolView.web.tsx
 */
import { NoSchoolView as PackageNoSchoolView } from '@repo/classroom';
import { ErrorBoundary } from '@repo/ui';

const NoSchoolView = (props: Record<string, unknown>) => (
  <ErrorBoundary name="Onboarding Wizard">
    <PackageNoSchoolView {...props} />
  </ErrorBoundary>
);

export default NoSchoolView;
