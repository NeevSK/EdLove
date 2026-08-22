/**
 * Decides when a session may influence routing without making first paint
 * network-bound. A cached capability snapshot is sufficient for an offline
 * return to the app; a fresh remote profile is required only when no such
 * local state exists.
 */
export function hasUsableOfflineCapabilitySnapshot({
  sessionUserId,
  snapshotUserId,
  manifestLoaded,
  readiness,
}: {
  sessionUserId: string | undefined;
  snapshotUserId: string | null;
  manifestLoaded: boolean;
  readiness: 'unknown' | 'loading' | 'verified' | 'cached' | 'stale' | 'error';
}): boolean {
  return Boolean(
    sessionUserId &&
      snapshotUserId === sessionUserId &&
      manifestLoaded &&
      (readiness === 'verified' || readiness === 'cached'),
  );
}

export function getSessionRouteReadiness({
  isSessionLoading,
  isProfileResolving,
  hasProfileError,
  hasSession,
  hasCachedCapabilities,
  hasLiveCapacity,
}: {
  isSessionLoading: boolean;
  isProfileResolving: boolean;
  hasProfileError: boolean;
  hasSession: boolean;
  hasCachedCapabilities: boolean;
  hasLiveCapacity: boolean;
}) {
  const needsCapabilityResolution = hasSession && !hasCachedCapabilities;
  const isCapabilityResolutionBlocked = needsCapabilityResolution && hasProfileError;
  const routeGuardReady =
    !isSessionLoading &&
    (!needsCapabilityResolution || (!isProfileResolving && !isCapabilityResolutionBlocked));

  return {
    routeGuardReady,
    hasActiveCapacity: hasLiveCapacity || hasCachedCapabilities,
    isCapabilityResolutionBlocked,
  };
}
