import { MemoryStorageAdapter } from '@repo/core/adapters/MemoryStorageAdapter';
import { storage } from '@repo/core/lib/storage';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEVICE_THEME_MODE_KEY, ensureDeviceThemePreference } from './devicePreferences';

describe('device appearance migration', () => {
  beforeEach(() => storage.registerAdapter(new MemoryStorageAdapter()));

  it('preserves auto mode before the mixed UI record is hydrated or rewritten', async () => {
    const legacy = JSON.stringify({ state: { theme: 'dark', themeMode: 'auto', deskItems: [] } });
    storage.set('gurudevi-ui-storage', legacy);
    expect(await SafeZustandStorage.getItem('gurudevi-ui-storage')).toBe(legacy);
    expect(storage.getString(DEVICE_THEME_MODE_KEY)).toBe('auto');
    expect(storage.getString('gurudevi-ui-storage')).toBe(legacy);
  });

  it('keeps an explicit device choice instead of overwriting it with an older hint', async () => {
    storage.set(DEVICE_THEME_MODE_KEY, 'light');
    storage.set('gurudevi-ui-storage', JSON.stringify({ state: { themeMode: 'dark' } }));
    await ensureDeviceThemePreference();
    expect(storage.getString(DEVICE_THEME_MODE_KEY)).toBe('light');
  });

  it('does not manufacture a choice from a malformed legacy record', async () => {
    storage.set('gurudevi-ui-storage', '{broken');
    await ensureDeviceThemePreference();
    expect(storage.contains(DEVICE_THEME_MODE_KEY)).toBe(false);
    expect(storage.getString('gurudevi-ui-storage')).toBe('{broken');
  });

  it('preserves the legacy record when migration persistence fails and permits retry', async () => {
    class FailingAdapter extends MemoryStorageAdapter {
      override async setAsync() {
        throw new Error('disk unavailable');
      }
    }
    const adapter = new FailingAdapter();
    const legacy = JSON.stringify({ state: { themeMode: 'auto' } });
    adapter.set('gurudevi-ui-storage', legacy);
    storage.registerAdapter(adapter);
    await expect(ensureDeviceThemePreference()).rejects.toThrow('disk unavailable');
    expect(storage.getString('gurudevi-ui-storage')).toBe(legacy);
    expect(storage.contains(DEVICE_THEME_MODE_KEY)).toBe(false);

    const recovered = new MemoryStorageAdapter();
    recovered.set('gurudevi-ui-storage', legacy);
    storage.registerAdapter(recovered);
    await ensureDeviceThemePreference();
    expect(storage.getString(DEVICE_THEME_MODE_KEY)).toBe('auto');
  });
});
