import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileFloor } from '@/app/(sanctuary)/profile/ProfileFloor';

vi.mock('@/lib/storage/wallpaperIndexedDb', () => ({
  loadCustomWallpapers: vi.fn().mockResolvedValue([]),
  saveCustomWallpaper: vi.fn().mockResolvedValue({
    id: 'wp-mock-1',
    name: 'Custom Mock',
    url: 'data:image/webp;base64,mock',
    source: 'custom',
  }),
  deleteCustomWallpaper: vi.fn().mockResolvedValue(undefined),
}));

describe('ProfileFloor Integration (G1 boundary / jsdom)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders persona header, dynamic calibration progress, and exploration pass', () => {
    render(
      <ProfileFloor
        accountId="acc-uuid-1234"
        displayName="Deva Bodhi"
        primaryScopeRole="Educator"
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: /your sanctuary persona/i })).toBeTruthy();
    expect(screen.getAllByText(/Deva Bodhi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Educator/i).length).toBeGreaterThan(0);

    // Check dynamic calibration
    expect(screen.getByText(/Profile Calibration Progress/i)).toBeTruthy();
    // Default score with name filled should be >= 45%
    expect(screen.getByText(/45%/i)).toBeTruthy();

    // Check Living Pass QR section
    expect(screen.getByRole('heading', { level: 4, name: /living sanctuary exploration pass/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /copy pass link/i })).toBeTruthy();
  });

  it('toggles edit profile mode, updates bio and display name, and saves changes', async () => {
    const user = userEvent.setup();
    render(
      <ProfileFloor
        accountId="acc-uuid-1234"
        displayName="Deva Bodhi"
        primaryScopeRole="Educator"
        isExplore={true}
      />,
    );

    // Click Edit Profile button
    const editBtn = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editBtn);

    // Form inputs should be visible
    const nameInput = screen.getByLabelText(/display name/i);
    const bioInput = screen.getByLabelText(/pedagogical bio/i);
    expect(nameInput).toBeTruthy();
    expect(bioInput).toBeTruthy();

    // Update bio
    await user.clear(bioInput);
    await user.type(bioInput, 'Guiding contemplative mathematics and mindfulness.');

    // Save changes
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveBtn);

    // Verify feedback notice and updated bio
    expect(screen.getByText(/Guest sandbox profile saved successfully/i)).toBeTruthy();
    expect(screen.getByText(/Guiding contemplative mathematics and mindfulness/i)).toBeTruthy();

    // Verification that calibration increased
    expect(screen.getByText(/65%/i)).toBeTruthy();
  });

  it('allows adding and removing social linktree entries in explore mode', async () => {
    const user = userEvent.setup();
    render(
      <ProfileFloor
        accountId="acc-uuid-1234"
        displayName="Deva Bodhi"
        primaryScopeRole="Educator"
        isExplore={true}
      />,
    );

    // Type in URL and add link
    const urlInput = screen.getByPlaceholderText(/https:\/\/\.\.\./i);
    await user.type(urlInput, 'https://github.com/gurudevi');

    const addLinkBtn = screen.getByRole('button', { name: /\+ add link/i });
    await user.click(addLinkBtn);

    expect(screen.getByText(/Website: https:\/\/github.com\/gurudevi/i)).toBeTruthy();

    // Remove the link
    const removeBtn = screen.getByRole('button', { name: /×/i });
    await user.click(removeBtn);

    expect(screen.getByText(/no collaborative social links added yet/i)).toBeTruthy();
  });

  it('renders Guest Explorer Sandbox with CapacityPerspectiveSwitcher when isExplore is true', () => {
    render(
      <ProfileFloor
        accountId="guest-session"
        displayName="Guest Explorer"
        primaryScopeRole="Guest Explorer"
        isExplore={true}
      />,
    );

    expect(screen.getByText(/Guest Explorer Sandbox/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /go to sanctuary ↗/i })).toBeTruthy();
  });

  it('supports 3-way sandbox reversibility: populate sample persona, revert to neutral, and reset persona', async () => {
    const user = userEvent.setup();
    render(
      <ProfileFloor
        accountId="acc-uuid-1234"
        displayName="Deva Bodhi"
        primaryScopeRole="Educator"
        isExplore={true}
      />,
    );

    // Initial state: neutral (only displayName set, score 45%)
    expect(screen.getByText(/45%/i)).toBeTruthy();
    expect(window.localStorage.getItem('gurudevi_guest_profile_v1')).toBeNull();

    // 1. Populate Sample Persona
    const populateBtn = screen.getByRole('button', { name: /✨ populate sample persona/i });
    await user.click(populateBtn);

    expect(screen.getByText(/Loaded sample persona for Teacher & Educator/i)).toBeTruthy();
    expect(window.localStorage.getItem('gurudevi_guest_profile_v1')).not.toBeNull();
    // Calibration score increases with sample bio, phone, handle, social links
    expect(screen.queryByText(/45%/i)).toBeNull();

    // 2. Revert to Neutral
    const revertBtn = screen.getByRole('button', { name: /🔄 revert to neutral/i });
    await user.click(revertBtn);

    expect(screen.getByText(/Reverted to clean neutral sanctuary profile/i)).toBeTruthy();
    expect(window.localStorage.getItem('gurudevi_guest_profile_v1')).toBeNull();
    // Calibration returns to baseline 45%
    expect(screen.getByText(/45%/i)).toBeTruthy();

    // 3. Populate and Reset Sample Persona
    await user.click(populateBtn);
    const resetBtn = screen.getByRole('button', { name: /🔄 reset sample persona/i });
    await user.click(resetBtn);
    expect(screen.getByText(/Loaded sample persona for Teacher & Educator/i)).toBeTruthy();
  });

  it('opens CreateAccountGuidanceModal when clicking step into sanctuary trigger in explore mode', async () => {
    const user = userEvent.setup();
    render(
      <ProfileFloor
        accountId="guest-session"
        displayName="Guest Explorer"
        primaryScopeRole="Guest Explorer"
        isExplore={true}
      />,
    );

    const guidanceTrigger = screen.getByRole('button', { name: /step into sanctuary \(create account\) ↗/i });
    await user.click(guidanceTrigger);

    // Guidance modal dialog should now be visible
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /step into your sovereign sanctuary/i })).toBeTruthy();
    expect(screen.getByText(/Zero cloud telemetry/i)).toBeTruthy();
    expect(screen.getByText(/Immutable UUIDv8 account/i)).toBeTruthy();
  });
});

