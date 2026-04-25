/**
 * InvitationWelcomeScreen.tsx
 *
 * Thin wrapper for the Community Invitation Welcome UI.
 */

import { InvitationWelcomeScreen as PackageInvitationWelcome } from '@repo/community';
import { ErrorBoundary } from '@repo/ui';

const InvitationWelcomeWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary name="Invitation Welcome">
    <PackageInvitationWelcome {...props} />
  </ErrorBoundary>
);

export default InvitationWelcomeWrapper;
