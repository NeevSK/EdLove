/**
 * InviteCodeEntry.tsx
 *
 * Thin wrapper for the Invite Code entry UI.
 */

import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { InviteCodeEntry as PackageInviteCodeEntry } from '@repo/community';

const InviteCodeWrapper = (props: any) => (
  <ErrorBoundary name="Enter Invitation Code">
    <PackageInviteCodeEntry {...props} />
  </ErrorBoundary>
);

export default InviteCodeWrapper;
