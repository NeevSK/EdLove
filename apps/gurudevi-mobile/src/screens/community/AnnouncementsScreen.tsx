/**
 * AnnouncementsScreen.tsx
 *
 * Thin wrapper for the Community Announcements UI.
 */

import { AnnouncementsScreen as PackageAnnouncementsScreen } from '@repo/community';
import ErrorBoundary from '@repo/ui/components/ErrorBoundary';

const AnnouncementsWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary name="Announcements">
    {/* biome-ignore lint/suspicious/noExplicitAny: props are passed through to package component */}
    <PackageAnnouncementsScreen {...(props as any)} />
  </ErrorBoundary>
);

export default AnnouncementsWrapper;
