import { scopeStorageKey } from '@repo/core/lib/accountScope';
import { useExperienceState } from '@repo/core/lib/experienceState';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { guestStorageKey, isGuestUserId } from '@repo/core/native/guestScope';
import type { User } from '@repo/core/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isProfile(value: unknown): value is User {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.display_name === 'string' &&
    (value.created_at === undefined ||
      typeof value.created_at === 'string' ||
      value.created_at instanceof Date)
  );
}
let profileWritesReady = false;
let profileReadGeneration = 0;
export function restoreIdentityProfile(value: unknown): { user: User | null } {
  if (!isRecord(value) || !isRecord(value.user)) return { user: null };
  const candidate = {
    ...value.user,
    display_name:
      typeof value.user.display_name === 'string' && value.user.display_name
        ? value.user.display_name
        : typeof value.userName === 'string'
          ? value.userName
          : 'Gurudevi',
    onboarding_completed:
      typeof value.user.onboarding_completed === 'boolean'
        ? value.user.onboarding_completed
        : typeof value.onboardingCompleted === 'boolean'
          ? value.onboardingCompleted
          : false,
  };
  if (!isProfile(candidate))
    throw new Error('Stored identity profile is invalid; original record retained.');
  return { user: candidate };
}

async function retainLegacyProfile(name: string, raw: string): Promise<void> {
  const backup = `${name}:legacy-retained-v1`;
  const retained = await SafeZustandStorage.getItem(backup);
  if (retained && retained !== raw)
    throw new Error(
      'Different legacy profile bytes already retained; migration requires reconciliation.',
    );
  if (!retained) {
    await SafeZustandStorage.setItem(backup, raw);
    if ((await SafeZustandStorage.getItem(backup)) !== raw)
      throw new Error('Identity migration backup verification failed.');
  }
}

async function migrateLegacyExplorer(legacy: unknown): Promise<void> {
  if (
    !isRecord(legacy) ||
    !isRecord(legacy.user) ||
    typeof legacy.user.id !== 'string' ||
    typeof legacy.isExplorerMode !== 'boolean'
  )
    return;
  const key =
    legacy.user.is_anonymous === true || isGuestUserId(legacy.user.id)
      ? guestStorageKey('gurudevi-experience-state', legacy.user.id)
      : scopeStorageKey('gurudevi-experience-state', legacy.user.id);
  if (await SafeZustandStorage.getItem(key)) return;
  const migrated = JSON.stringify({
    state: { isExplorerMode: legacy.isExplorerMode },
    version: 1,
  });
  await SafeZustandStorage.setItem(key, migrated);
  if ((await SafeZustandStorage.getItem(key)) !== migrated)
    throw new Error('Experience migration verification failed.');
}

/** Retain old bytes before narrowing the persisted profile and moving explorer preference. */
export const authProfileStorage = {
  async getItem(name: string): Promise<string | null> {
    const generation = ++profileReadGeneration;
    profileWritesReady = false;
    const raw = await SafeZustandStorage.getItem(name);
    if (raw) {
      const decoded: unknown = JSON.parse(raw);
      if (!isRecord(decoded)) throw new Error('Stored identity envelope is invalid.');
      if (typeof decoded.version === 'number' && decoded.version > 2)
        throw new Error(
          'Stored identity profile requires a newer reader; original record retained.',
        );
      restoreIdentityProfile(decoded.state);
      if (decoded.version !== 2) {
        await retainLegacyProfile(name, raw);
        await migrateLegacyExplorer(decoded.state);
      }
    }
    await useExperienceState.persist.rehydrate();
    if (generation === profileReadGeneration) profileWritesReady = true;
    return raw;
  },
  setItem(name: string, value: string): Promise<void> {
    const pending = profileWritesReady
      ? Promise.resolve(SafeZustandStorage.setItem(name, value)).then(() => undefined)
      : Promise.reject(
          new Error('Profile persistence blocked until ownership migration succeeds.'),
        );
    void pending.catch((error) => console.error('[Identity persistence]', error));
    return pending;
  },
  removeItem: SafeZustandStorage.removeItem,
};
