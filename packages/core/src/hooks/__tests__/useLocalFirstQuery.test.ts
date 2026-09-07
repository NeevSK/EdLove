import { describe, expect, it, vi } from 'vitest';
import { SafeZustandStorage } from '../../lib/storageWrapper';

describe('useLocalFirstQuery storage contract & isolation', () => {
  it('SafeZustandStorage persists and retrieves serialized items cross-platform', async () => {
    const key = 'test_local_first_storage_key';
    const payload = { id: 'guest_1', notes: ['test entry'] };

    await SafeZustandStorage.setItem(key, JSON.stringify(payload));
    const retrieved = await SafeZustandStorage.getItem(key);

    expect(retrieved).not.toBeNull();
    expect(JSON.parse(retrieved!)).toEqual(payload);
  });

  it('SafeZustandStorage handles non-existent keys gracefully without throwing', async () => {
    const nonExistent = await SafeZustandStorage.getItem('non_existent_key_123');
    expect(nonExistent).toBeNull();
  });

  it('SafeZustandStorage removeItem cleans up items properly', async () => {
    const key = 'test_remove_key';
    await SafeZustandStorage.setItem(key, 'value');
    await SafeZustandStorage.removeItem(key);
    const result = await SafeZustandStorage.getItem(key);
    expect(result).toBeNull();
  });
});
