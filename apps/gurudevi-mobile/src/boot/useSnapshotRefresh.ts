import { useAuth } from '@repo/core/logic';
import { startPermissionSnapshotRefresh } from '@repo/core/logic/permissions/snapshotRefresh.coordinator';
import { useEffect } from 'react';
import { v1Client } from '@/lib/v1Client';

/** Keeps the signed-in person's offline permissions fresh. Guests have none to refresh. */
export function useSnapshotRefresh() {
  const { session } = useAuth();
  const signedIn = Boolean(session?.user);
  useEffect(() => {
    if (!signedIn) return;
    return startPermissionSnapshotRefresh(v1Client);
  }, [signedIn]);
}
