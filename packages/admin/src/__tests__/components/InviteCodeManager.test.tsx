import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InviteCodeManager } from '../../components/school/InviteCodeManager';
import { institutionsAPI } from '../../api';

// Mock haptics
vi.mock('@repo/ui/utils/haptics', () => ({
  hapticLight: vi.fn(),
  hapticSuccess: vi.fn(),
  hapticWarning: vi.fn(),
  hapticError: vi.fn(),
}));

// Mock QRCodeGenerator
vi.mock('@repo/ui/qr/QRCodeGenerator', () => ({
  default: (props: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { testID: 'mock-qr-code' },
      React.createElement(Text, undefined, props.value),
    );
  },
}));

// Mock Clipboard
vi.mock('expo-clipboard', () => ({
  setStringAsync: vi.fn().mockResolvedValue(true),
}));

// Mock Share
vi.spyOn(Share, 'share').mockImplementation(vi.fn().mockResolvedValue({ action: 'sharedAction' }));

// Mock institutionsAPI
vi.mock('../../api', () => ({
  institutionsAPI: {
    listInviteCodes: vi.fn(),
    createInviteCode: vi.fn(),
    revokeInviteCode: vi.fn(),
    update: vi.fn(),
    checkHandleAvailable: vi.fn(),
    provision: vi.fn(),
  },
}));

describe('InviteCodeManager', () => {
  const defaultProps = {
    schoolId: 'school-123',
    groupId: 'group-123',
    schoolName: 'Mahanama College',
    schoolHandle: 'mahanama',
  };

  const mockInvites = [
    {
      id: 'inv-1',
      code: 'GURU-AB12CD-TEACH',
      role: 'TEACH',
      maxUses: 50,
      usedCount: 12,
      expiresAt: '2027-01-01T00:00:00Z',
      isRevoked: false,
      createdAt: '2026-11-01T00:00:00Z',
    },
    {
      id: 'inv-2',
      code: 'GURU-EF34GH-STUDY',
      role: 'STUDY',
      maxUses: null,
      usedCount: 45,
      expiresAt: null,
      isRevoked: false,
      createdAt: '2026-11-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(institutionsAPI.listInviteCodes).mockResolvedValue({
      schoolId: 'school-123',
      invites: mockInvites,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders school title, handle, and loads active invite codes', async () => {
    const { getByText } = await render(<InviteCodeManager {...defaultProps} />);

    expect(getByText('Mahanama College')).toBeTruthy();
    expect(getByText(/mahanama/)).toBeTruthy();

    await waitFor(() => {
      expect(institutionsAPI.listInviteCodes).toHaveBeenCalledWith({
        schoolId: 'school-123',
        includeExpired: false,
      });
      expect(getByText('GURU-AB12CD-TEACH')).toBeTruthy();
      expect(getByText('GURU-EF34GH-STUDY')).toBeTruthy();
      expect(getByText(/12 \/ 50 used/)).toBeTruthy();
      expect(getByText(/45 used/)).toBeTruthy();
    });
  });

  it('toggles and displays universal school flyer with QR code and sharing options', async () => {
    const { getByTestId, queryByTestId } = await render(
      <InviteCodeManager {...defaultProps} />,
    );

    expect(queryByTestId('universal-flyer-panel')).toBeNull();

    await act(async () => {
      fireEvent.press(getByTestId('toggle-universal-flyer'));
    });

    expect(getByTestId('universal-flyer-panel')).toBeTruthy();
    expect(getByTestId('copy-universal-link')).toBeTruthy();
    expect(getByTestId('share-universal-flyer')).toBeTruthy();

    // Copy flyer link
    await act(async () => {
      fireEvent.press(getByTestId('copy-universal-link'));
    });
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(
      expect.stringContaining('action=join_school'),
    );

    // Share flyer
    await act(async () => {
      fireEvent.press(getByTestId('share-universal-flyer'));
    });
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Join Mahanama College',
        message: expect.stringContaining('https://gurudevi.app/qr'),
      }),
    );
  });

  it('generates role-specific invite code and updates view', async () => {
    vi.mocked(institutionsAPI.createInviteCode).mockResolvedValueOnce({
      code: 'GURU-ZZ99YY-TEACH',
      role: 'TEACH',
      expiresAt: '2026-12-18T00:00:00Z',
      inviteUrl: 'https://gurudevi.app/qr?action=claim_invite&invite_code=GURU-ZZ99YY-TEACH',
      qrPayload: 'https://gurudevi.app/qr?v=1&action=claim_invite&invite_code=GURU-ZZ99YY-TEACH',
    });

    const { getByTestId, getByText } = await render(<InviteCodeManager {...defaultProps} />);

    // Select role option & max uses
    await act(async () => {
      fireEvent.press(getByTestId('role-option-TEACH'));
      fireEvent.changeText(getByTestId('max-uses-input'), '100');
    });

    // Generate code
    await act(async () => {
      fireEvent.press(getByTestId('generate-code-button'));
    });

    await waitFor(() => {
      expect(institutionsAPI.createInviteCode).toHaveBeenCalledWith({
        schoolId: 'school-123',
        role: 'TEACH',
        validityDays: 30,
        maxUses: 100,
      });

      expect(getByTestId('generated-code-result')).toBeTruthy();
      expect(getByText('GURU-ZZ99YY-TEACH')).toBeTruthy();
    });

    // Copy newly generated code
    await act(async () => {
      fireEvent.press(getByTestId('copy-generated-code'));
    });
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('GURU-ZZ99YY-TEACH');
  });

  it('allows revoking an existing invite code', async () => {
    vi.mocked(institutionsAPI.revokeInviteCode).mockResolvedValueOnce({
      success: true,
      code: 'GURU-AB12CD-TEACH',
      revokedAt: '2026-11-18T12:00:00Z',
    });

    const { getByTestId, queryByText } = await render(<InviteCodeManager {...defaultProps} />);

    await waitFor(() => {
      expect(getByTestId('revoke-key-GURU-AB12CD-TEACH')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('revoke-key-GURU-AB12CD-TEACH'));
    });

    await waitFor(() => {
      expect(institutionsAPI.revokeInviteCode).toHaveBeenCalledWith({
        schoolId: 'school-123',
        code: 'GURU-AB12CD-TEACH',
      });
      // Code should be removed from view
      expect(queryByText('GURU-AB12CD-TEACH')).toBeNull();
    });
  });
});
