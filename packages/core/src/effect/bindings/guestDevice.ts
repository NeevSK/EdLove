import { getLocalGuestIdentity, type LocalGuestIdentity } from '@repo/core/native/guestIdentity';
import {
  type LocalGuestSession,
  restoreLocalGuestSession,
} from '@repo/core/native/localGuestSession';

/** The guest who lives only on this device: their session and identity records. */
export const guestDevice = {
  restoreSession: (): Promise<LocalGuestSession | null> => restoreLocalGuestSession(),
  identity: (sessionId: string): Promise<LocalGuestIdentity> => getLocalGuestIdentity(sessionId),
};
