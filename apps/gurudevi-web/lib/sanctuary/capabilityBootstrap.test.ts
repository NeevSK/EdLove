import { describe, expect, it, vi } from 'vitest';
import { capabilityIsAvailable, loadAccountCapabilities } from './capabilityBootstrap';

vi.mock('../supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) },
  }),
}));

describe('capability bootstrap browser boundary', () => {
  it('does not grant an account capability without a verified session', async () => {
    await expect(loadAccountCapabilities('self')).resolves.toEqual([]);
  });

  it('only treats an explicitly available server feature as launchable', () => {
    expect(
      capabilityIsAvailable(
        [{ id: 'fire_journal', status: 'available', allowedOperations: ['read'] }],
        'fire_journal',
      ),
    ).toBe(true);
    expect(
      capabilityIsAvailable(
        [{ id: 'fire_journal', status: 'locked', allowedOperations: [] }],
        'fire_journal',
      ),
    ).toBe(false);
  });
});
