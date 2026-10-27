import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getGuestDataSummary: vi.fn(),
  getTransferAvailability: vi.fn(),
}));

vi.mock('@repo/core/native/guestDataSync', () => ({
  GuestDataSync: {
    getGuestDataSummary: mocks.getGuestDataSummary,
    getTransferAvailability: mocks.getTransferAvailability,
  },
}));
vi.mock('../SanctuaryModal', () => ({
  default: ({ children, footer }: { children: ReactNode; footer: ReactNode }) => (
    <>
      {children}
      {footer}
    </>
  ),
}));
vi.mock('../SanctuaryButton', () => ({
  SanctuaryButton: ({ children, onPress }: { children: ReactNode; onPress?: () => void }) => (
    <Pressable onPress={onPress}>
      <Text>{children}</Text>
    </Pressable>
  ),
}));
vi.mock('../BrandPulse', () => ({ BrandPulse: () => null }));
vi.mock('@repo/ui/icons', () => ({
  Check: () => null,
  CircleAlert: () => null,
  TriangleAlert: () => null,
}));

import GuestDataSyncModal from '../GuestDataSyncModal';

describe('GuestDataSyncModal transfer guard', () => {
  it('keeps nonempty guest data recoverable while remote transfer is unavailable', async () => {
    mocks.getTransferAvailability.mockReturnValue({
      isAvailable: false,
      reason: 'Server policy required.',
    });
    mocks.getGuestDataSummary.mockResolvedValue({
      timetablePeriods: 1,
      moodLogs: 0,
      journalEntries: 0,
      students: 0,
      total: 1,
    });
    const onClose = vi.fn();
    const onDiscard = vi.fn().mockResolvedValue(undefined);

    const screen = await render(
      <GuestDataSyncModal
        isOpen
        userId="durable-account"
        onClose={onClose}
        onDiscard={onDiscard}
        onSyncComplete={vi.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText('Keep on device')).toBeTruthy());
    expect(
      screen.getByText(
        'Server policy required. Your work will remain safely on this device until transfer is available.',
      ),
    ).toBeTruthy();
    expect(screen.queryByText('Transfer data')).toBeNull();

    fireEvent.press(screen.getByText('Keep on device'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDiscard).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Discard'));
    await waitFor(() => expect(screen.getByText('sync.skipWarningTitle')).toBeTruthy());
    fireEvent.press(screen.getByText('sync.discardButton'));
    await waitFor(() => expect(onDiscard).toHaveBeenCalledTimes(1));
  });
});
