/**
 * AnnouncementsScreen.tsx
 *
 * Thin wrapper for the Community Announcements UI.
 */

import React from 'react';
import { ErrorBoundary } from '@repo/ui';
import { AnnouncementsScreen as PackageAnnouncementsScreen } from '@repo/community';

const AnnouncementsWrapper = (props: any) => (
  <ErrorBoundary name="Announcements">
    <PackageAnnouncementsScreen {...props} />
  </ErrorBoundary>
);

export default AnnouncementsWrapper;
