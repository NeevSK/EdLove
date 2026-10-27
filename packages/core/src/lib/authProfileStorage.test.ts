import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  records: new Map<string, string>(),
  set: vi.fn(),
  rehydrate: vi.fn(),
}));
vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: {
    getItem: async (key: string) => fixture.records.get(key) ?? null,
    setItem: (key: string, value: string) => fixture.set(key, value),
    removeItem: vi.fn(),
  },
}));
vi.mock('@repo/core/lib/experienceState', () => ({
  useExperienceState: { persist: { rehydrate: fixture.rehydrate } },
}));

import { authProfileStorage, restoreIdentityProfile } from './authProfileStorage';

const name = 'gurudevi-auth-storage';
const user = { id: 'account-a', display_name: '', created_at: '2026-10-26T00:00:00Z' };
function legacy(extra: Record<string, unknown> = {}) {
  return JSON.stringify({
    state: {
      user,
      userName: 'Retained name',
      onboardingCompleted: true,
      isExplorerMode: false,
      ...extra,
    },
    version: 0,
  });
}
beforeEach(() => {
  fixture.records.clear();
  fixture.rehydrate.mockReset().mockResolvedValue(undefined);
  fixture.set.mockReset().mockImplementation(async (key: string, value: string) => {
    fixture.records.set(key, value);
  });
});
describe('auth field ownership migration', () => {
  it('does not downgrade a future profile record', async () => {
    const raw = JSON.stringify({ state: { user }, version: 3 });
    fixture.records.set(name, raw);
    await expect(authProfileStorage.getItem(name)).rejects.toThrow('newer reader');
    expect(fixture.records.get(name)).toBe(raw);
    expect(fixture.set).not.toHaveBeenCalled();
  });
  it('does not let an older hydration reopen writes after a newer ownership read fails', async () => {
    let finish!: () => void;
    const older = new Promise<void>((resolve) => {
      finish = resolve;
    });
    fixture.rehydrate
      .mockImplementationOnce(() => older)
      .mockRejectedValueOnce(new Error('new owner unavailable'));
    fixture.records.set(name, legacy());
    const first = authProfileStorage.getItem(name);
    await vi.waitFor(() => expect(fixture.rehydrate).toHaveBeenCalledOnce());
    fixture.records.set(
      name,
      JSON.stringify({ state: { user: { ...user, id: 'account-b' } }, version: 2 }),
    );
    await expect(authProfileStorage.getItem(name)).rejects.toThrow('new owner unavailable');
    finish();
    await first;
    const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(authProfileStorage.setItem(name, 'old owner')).rejects.toThrow('blocked');
    diagnostic.mockRestore();
  });
  it('retains original bytes and adopts explorer preference under the proven profile account', async () => {
    const raw = legacy();
    fixture.records.set(name, raw);
    await expect(authProfileStorage.getItem(name)).resolves.toBe(raw);
    expect(fixture.records.get(`${name}:legacy-retained-v1`)).toBe(raw);
    expect(fixture.records.get(name)).toBe(raw);
    expect(
      JSON.parse(fixture.records.get('gurudevi:account-a:gurudevi-experience-state')!),
    ).toEqual({ state: { isExplorerMode: false }, version: 1 });
    expect(restoreIdentityProfile(JSON.parse(raw).state).user).toMatchObject({
      display_name: 'Retained name',
      onboarding_completed: true,
    });
  });
  it('keeps profile completion and existing experience preference authoritative over legacy mirrors', async () => {
    const raw = legacy({
      user: { ...user, display_name: 'Profile name', onboarding_completed: false },
    });
    fixture.records.set(name, raw);
    fixture.records.set('gurudevi:account-a:gurudevi-experience-state', 'existing');
    await authProfileStorage.getItem(name);
    expect(fixture.records.get('gurudevi:account-a:gurudevi-experience-state')).toBe('existing');
    expect(restoreIdentityProfile(JSON.parse(raw).state).user).toMatchObject({
      display_name: 'Profile name',
      onboarding_completed: false,
    });
  });
  it('qualifies anonymous preferences by guest identity and leaves unowned records unassigned', async () => {
    fixture.records.set(name, legacy({ user: { ...user, id: 'guest-a', is_anonymous: true } }));
    await authProfileStorage.getItem(name);
    expect(fixture.records.has('guest:guest-a:gurudevi-experience-state')).toBe(true);
    fixture.records.clear();
    fixture.records.set(name, legacy({ user: null }));
    await authProfileStorage.getItem(name);
    expect([...fixture.records.keys()]).toEqual([name, `${name}:legacy-retained-v1`]);
  });
  it('rejects a failed backup acknowledgement without overwriting the original or adopting preference', async () => {
    const raw = legacy();
    fixture.records.set(name, raw);
    fixture.set.mockRejectedValue(new Error('disk full'));
    await expect(authProfileStorage.getItem(name)).rejects.toThrow('disk full');
    expect(fixture.records.get(name)).toBe(raw);
    expect(fixture.records.has('gurudevi:account-a:gurudevi-experience-state')).toBe(false);
    const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(authProfileStorage.setItem(name, 'replacement')).rejects.toThrow('blocked');
    expect(fixture.records.get(name)).toBe(raw);
    diagnostic.mockRestore();
  });
  it('rejects readback mismatch and malformed profile instead of silently claiming migration', async () => {
    fixture.records.set(name, legacy());
    fixture.set.mockResolvedValue(undefined);
    await expect(authProfileStorage.getItem(name)).rejects.toThrow('backup verification failed');
    expect(() => restoreIdentityProfile({ user: { id: 42 } })).toThrow('invalid');
  });
  it('restores the actual bootstrap profile shape without fabricating a creation timestamp', () => {
    const restored = restoreIdentityProfile({
      user: { id: 'account-a', display_name: 'Nila', onboarding_completed: true },
    });
    expect(restored.user).toEqual({
      id: 'account-a',
      display_name: 'Nila',
      onboarding_completed: true,
    });
    expect(restored.user).not.toHaveProperty('created_at');
  });
});
