import type { AccountDeletion } from '@repo/core/api/v1/contract';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { sources as exploreSources } from '../../../spa/surface/explore';
import type { Commands, Sources } from '../../../spa/surface/sources';
import { createTestRouter, render } from '@/tests/support/render';
import { AccountDeletionControl } from './AccountDeletionControl';

const pending: AccountDeletion = {
  status: 'pending_verification',
  requestId: '123e4567-e89b-4123-8123-426614174009',
  requestedAt: '2026-11-13T10:00:00.000Z',
  scheduledFor: null,
  reason: 'fresh_authentication_required',
};

function setup(status: () => Promise<AccountDeletion | null>, commands: Partial<Commands> = {}) {
  const sources: Sources = {
    ...exploreSources,
    accountDeletion: () => ({ queryKey: ['account-deletion'], queryFn: status }),
  };
  const all: Commands = {
    requestAccountDeletion: vi.fn(async () => pending),
    cancelAccountDeletion: vi.fn(async () => ({ ...pending, status: 'cancelled' as const })),
    ...commands,
  };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const router = createTestRouter('/profile', { sources, commands: all });
  render(<AccountDeletionControl />, { router, wrapper });
  return all;
}

describe('AccountDeletionControl (G3 / jsdom; sources and commands substituted)', () => {
  it('requests deletion through the surface command and shows where it stands', async () => {
    const user = userEvent.setup();
    const commands = setup(async () => null);
    await user.click(await screen.findByRole('button', { name: 'Request account deletion' }));
    expect(commands.requestAccountDeletion).toHaveBeenCalledOnce();
    expect((await screen.findByRole('status')).textContent).toMatch(/pending verification/i);
    expect(screen.getByRole('button', { name: 'Cancel deletion request' })).toBeTruthy();
  });

  it('cancels an open request', async () => {
    const user = userEvent.setup();
    const commands = setup(async () => pending);
    await user.click(await screen.findByRole('button', { name: 'Cancel deletion request' }));
    expect(commands.cancelAccountDeletion).toHaveBeenCalledOnce();
    expect((await screen.findByRole('status')).textContent).toMatch(/was cancelled/i);
  });

  it('says so when the status cannot be read, and when a change fails', async () => {
    const user = userEvent.setup();
    setup(
      async () => {
        throw new Error('offline');
      },
      { requestAccountDeletion: async () => Promise.reject(new Error('503')) },
    );
    expect((await screen.findByRole('alert')).textContent).toMatch(/could not load/i);
    await user.click(screen.getByRole('button', { name: 'Request account deletion' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/could not update/i);
  });
});
