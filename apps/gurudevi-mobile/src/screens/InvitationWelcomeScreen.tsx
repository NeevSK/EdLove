/**
 * InvitationWelcomeScreen.tsx
 *
 * Thin wrapper for the Community Invitation Welcome UI.
 */

import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { InvitationWelcomeScreen as PackageInvitationWelcome } from '@repo/community';

const InvitationWelcomeWrapper = (props: any) => (
  <ErrorBoundary name="Invitation Welcome">
    <PackageInvitationWelcome {...props} />
  </ErrorBoundary>
);

export default InvitationWelcomeWrapper;
