/**
 * InvitationWelcomeScreen.tsx
 *
 * Thin wrapper for the Community Invitation Welcome UI.
 */

import { InvitationWelcomeScreen as PackageInvitationWelcome } from '@repo/community/onboarding';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

const InvitationWelcomeWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary name="Invitation Welcome">
    <PackageInvitationWelcome {...props} />
  </ErrorBoundary>
);

export default InvitationWelcomeWrapper;
