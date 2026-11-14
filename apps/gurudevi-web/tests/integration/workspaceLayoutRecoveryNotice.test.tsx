import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceLayoutRecoveryNotice } from '../../app/(sanctuary)/components/WorkspaceLayoutRecoveryNotice';

describe('WorkspaceLayoutRecoveryNotice (G3)', () => {
  it('keeps conflict recovery explicit and invokes the user action', () => {
    const onRetry = vi.fn();
    render(
      <WorkspaceLayoutRecoveryNotice
        hasConflict
        isRetrying={false}
        isVisible
        onRetry={onRetry}
        retryError={null}
      />,
    );

    expect(screen.getByRole('alert').textContent).toMatch(/changed on another device/i);
    fireEvent.click(screen.getByRole('button', { name: /retry floor sync/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('does not render while there is no recovery state to show', () => {
    const { container } = render(
      <WorkspaceLayoutRecoveryNotice
        hasConflict={false}
        isRetrying={false}
        isVisible={false}
        onRetry={vi.fn()}
        retryError={null}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
