import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({ load: vi.fn(), select: vi.fn() }));
vi.mock('../../../lib/supabase/browser', () => ({ createBrowserSupabaseClient: () => ({}) }));
vi.mock('../../../lib/sanctuary/workspaceScopes', () => ({ loadWorkspaceScopes: mock.load, selectWorkspaceScope: mock.select }));
import { WorkspaceScopeSwitcher } from './WorkspaceScopeSwitcher';

describe('workspace selector', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mock.load.mockResolvedValue({
      session: { accessToken: 'token', subject: 'subject' },
      identity: {
        id: 'account', activeBond: { id: 'personal' },
        availableBonds: [
          { id: 'personal', entity_type: 'PERSONAL_CLASSROOM', entity_id: 'personal-id', capacity: 'teacher' },
          { id: 'class', entity_type: 'CLASSROOM', entity_id: 'classroom-id', capacity: 'teacher' },
        ],
      },
    });
  });
  it('shows owned bonds and keeps the selection unchanged if the switch fails', async () => {
    mock.select.mockRejectedValue(new Error('offline'));
    render(<WorkspaceScopeSwitcher />);
    const select = await screen.findByRole('combobox', { name: 'Workspace' }) as HTMLSelectElement;
    expect(select.value).toBe('personal');
    expect(screen.getByRole('option', { name: /personal sanctuary — teacher/i })).toBeTruthy();
    fireEvent.change(select, { target: { value: 'class' } });
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/could not be confirmed/i));
    expect(select.value).toBe('personal');
    expect(select.disabled).toBe(false);
  });
  it('does not show an account selector for a guest preview', async () => {
    mock.load.mockResolvedValue(null);
    render(<WorkspaceScopeSwitcher />);
    await waitFor(() => expect(mock.load).toHaveBeenCalled());
    expect(screen.queryByRole('combobox')).toBeNull();
  });
});
