import { CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
import { getLocalGuestIdentity, type LocalGuestIdentity } from '@repo/core/native/guestIdentity';
import {
  type LocalGuestSession,
  restoreLocalGuestSession,
} from '@repo/core/native/localGuestSession';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { commitIdentityScopeSession } from '@repo/core/store/scopeSessionCoordinator';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import type { Bond } from '@repo/core/types/Identity';
import type { User } from '@repo/core/types/User';

const activations = new Map<string, Promise<LocalGuestActivation | null>>();
type LocalGuestActivation = { session: LocalGuestSession; identity: LocalGuestIdentity };

/** Projects the explicitly device-local principal into the app's existing identity and scope stores. */
export function activateLocalGuestSession(
  session?: LocalGuestSession | null,
): Promise<LocalGuestActivation | null> {
  if (session === undefined) return restoreLocalGuestSession().then(activateLocalGuestSession);
  if (!session) return Promise.resolve(null);
  const pendingActivation = activations.get(session.id);
  if (pendingActivation) return pendingActivation;

  let activation: Promise<LocalGuestActivation | null>;
  activation = activateResolvedLocalGuestSession(session).finally(() => {
    if (activations.get(session.id) === activation) activations.delete(session.id);
  });
  activations.set(session.id, activation);
  return activation;
}

async function activateResolvedLocalGuestSession(
  localSession: LocalGuestSession,
): Promise<LocalGuestActivation> {
  const identity = await getLocalGuestIdentity(localSession.id);
  const bonds: Bond[] = identity.availableBonds.flatMap((bond) => {
    const capacity = CapacitySchema.safeParse(bond.capacity);
    return capacity.success ? [{ ...bond, capacity: capacity.data }] : [];
  });
  const activeBond = bonds.find((bond) => bond.id === identity.activeBond?.id) ?? null;

  const user: User = {
    id: localSession.id,
    email: null,
    display_name: identity.display_name,
    bonds,
    capacity: activeBond?.capacity ?? null,
    citizenship: 'THIRD_CLASS',
    pricing_tier: 'FREE',
    tier: 'free',
    is_anonymous: true,
    identity_state: 'anonymous',
    onboarding_completed: identity.onboarding_completed,
    profile_completed: identity.onboarding_completed,
  };
  useAuthStore.getState().setUser(user);
  const scope = useScopeSessionStore.getState().snapshot;
  const activeScopeAlreadyMatches =
    scope?.principalId === localSession.id &&
    scope.activeBond?.id === activeBond?.id &&
    scope.activeBond?.capacity === activeBond?.capacity;
  if (!activeScopeAlreadyMatches) {
    await commitIdentityScopeSession({
      principalId: localSession.id,
      availableBonds: bonds,
      selectedBond: activeBond,
    });
  }

  return { session: localSession, identity };
}
