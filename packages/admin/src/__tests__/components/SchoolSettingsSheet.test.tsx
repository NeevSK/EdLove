import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SchoolSettingsSheet } from '../../components/school/SchoolSettingsSheet';
import { institutionsAPI } from '../../api';

// Mock haptics
vi.mock('@repo/ui/utils/haptics', () => ({
  hapticLight: vi.fn(),
  hapticSuccess: vi.fn(),
  hapticWarning: vi.fn(),
  hapticError: vi.fn(),
}));

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

describe('SchoolSettingsSheet', () => {
  const defaultProps = {
    schoolId: 'school-999',
    initialName: 'Richmond College',
    initialHandle: 'richmond-galle',
    initialType: 'k12' as const,
    initialAvatarUrl: 'https://cdn.gurudevi.app/crest/richmond.png',
    initialTimezone: 'Asia/Colombo',
    initialGuardianPolicy: 'open' as const,
    onClose: vi.fn(),
    onUpdated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders initial institution profile values', async () => {
    const { getByTestId, getByText } = await render(<SchoolSettingsSheet {...defaultProps} />);

    expect(getByTestId('school-name-input').props.value).toBe('Richmond College');
    expect(getByTestId('school-handle-input').props.value).toBe('richmond-galle');
    expect(getByTestId('school-avatar-input').props.value).toBe(
      'https://cdn.gurudevi.app/crest/richmond.png',
    );
    expect(getByTestId('school-timezone-input').props.value).toBe('Asia/Colombo');
    expect(getByText('Immutable Identity Guarantee')).toBeTruthy();
  });

  it('checks handle availability when handle changes', async () => {
    vi.mocked(institutionsAPI.checkHandleAvailable).mockResolvedValueOnce({
      handle: 'richmond-college-galle',
      available: true,
    });

    const { getByTestId, getByText } = await render(<SchoolSettingsSheet {...defaultProps} />);

    await act(async () => {
      fireEvent.changeText(getByTestId('school-handle-input'), 'richmond-college-galle');
    });

    await waitFor(() => {
      expect(institutionsAPI.checkHandleAvailable).toHaveBeenCalledWith({
        handle: 'richmond-college-galle',
        schoolId: 'school-999',
      });
      expect(getByText('✓ Handle is available')).toBeTruthy();
    });
  });

  it('submits updated profile and triggers onUpdated callback', async () => {
    vi.mocked(institutionsAPI.update).mockResolvedValueOnce({
      schoolId: 'school-999',
      name: 'Richmond College Galle',
      handle: 'richmond-galle',
      type: 'secondary',
      avatar_url: 'https://cdn.gurudevi.app/crest/richmond-v2.png',
      timezone: 'Asia/Colombo',
      guardian_verification_policy: 'manual_approval',
      custom_branding: null,
      updated_at: '2026-11-18T12:00:00Z',
    });

    const { getByTestId } = await render(<SchoolSettingsSheet {...defaultProps} />);

    // Change fields inside act
    await act(async () => {
      fireEvent.changeText(getByTestId('school-name-input'), 'Richmond College Galle');
      fireEvent.press(getByTestId('sector-option-secondary'));
      fireEvent.press(getByTestId('policy-option-manual_approval'));
      fireEvent.changeText(
        getByTestId('school-avatar-input'),
        'https://cdn.gurudevi.app/crest/richmond-v2.png',
      );
    });

    // Save
    await act(async () => {
      fireEvent.press(getByTestId('save-settings-button'));
    });

    await waitFor(() => {
      expect(institutionsAPI.update).toHaveBeenCalledWith({
        schoolId: 'school-999',
        name: 'Richmond College Galle',
        handle: 'richmond-galle',
        type: 'secondary',
        avatar_url: 'https://cdn.gurudevi.app/crest/richmond-v2.png',
        timezone: 'Asia/Colombo',
        guardian_verification_policy: 'manual_approval',
      });

      expect(defaultProps.onUpdated).toHaveBeenCalledWith({
        name: 'Richmond College Galle',
        handle: 'richmond-galle',
        type: 'secondary',
        avatarUrl: 'https://cdn.gurudevi.app/crest/richmond-v2.png',
        timezone: 'Asia/Colombo',
        guardianVerificationPolicy: 'manual_approval',
      });
    });
  });

  it('prevents saving when school name is empty', async () => {
    const { getByTestId, getByText } = await render(<SchoolSettingsSheet {...defaultProps} />);

    await act(async () => {
      fireEvent.changeText(getByTestId('school-name-input'), '');
    });

    await act(async () => {
      fireEvent.press(getByTestId('save-settings-button'));
    });

    await waitFor(() => {
      expect(getByText('School name is required')).toBeTruthy();
      expect(institutionsAPI.update).not.toHaveBeenCalled();
    });
  });
});
