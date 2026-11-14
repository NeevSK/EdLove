import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceLayoutRecoveryControl } from '../../app/(sanctuary)/components/WorkspaceLayoutRecoveryControl';

describe('WorkspaceLayoutRecoveryControl (G3)', () => {
  it('offers explicit recovery for offline workspace changes', () => {
    const reapplyLocalChanges = vi.fn().mockResolvedValue(undefined);
    render(
      <WorkspaceLayoutRecoveryControl
        hasConflict={false}
        reapplyLocalChanges={reapplyLocalChanges}
        status="offline"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /retry floor sync/i }));
    expect(reapplyLocalChanges).toHaveBeenCalledOnce();
  });

  it('reports a failed user retry and enables another attempt', async () => {
    const reapplyLocalChanges = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce(undefined);
    render(
      <WorkspaceLayoutRecoveryControl
        hasConflict={false}
        reapplyLocalChanges={reapplyLocalChanges}
        status="conflict"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /retry floor sync/i }));
    expect(await screen.findByText(/still waiting to sync/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /retry floor sync/i }));
    await waitFor(() => expect(reapplyLocalChanges).toHaveBeenCalledTimes(2));
  });

  it('renders no recovery control while the sync state is healthy', () => {
    const { container } = render(
      <WorkspaceLayoutRecoveryControl
        hasConflict={false}
        reapplyLocalChanges={vi.fn().mockResolvedValue(undefined)}
        status="saved"
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
