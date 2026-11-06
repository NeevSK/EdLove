import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsFloor } from '@/app/(sanctuary)/settings/SettingsFloor';

// Mock wallpaper IndexedDB methods
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

describe('SettingsFloor Integration (G1 boundary / jsdom)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders within SanctuaryFloorCanvas with settings title and Floor Studio trigger', () => {
    render(<SettingsFloor displayName="Aria Star" capacity="Educator" />);

    // Check title and description
    expect(screen.getByRole('heading', { level: 1, name: /sanctuary settings/i })).toBeTruthy();
    expect(screen.getByText(/Personalize your atmosphere/i)).toBeTruthy();

    // Check Navigation layout options
    expect(screen.getByRole('button', { name: /horizontal row/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /side rail/i })).toBeTruthy();
  });

  it('allows switching appearance modes and toggling high contrast', async () => {
    const user = userEvent.setup();
    render(<SettingsFloor displayName="Aria Star" />);

    // Switch to Night mode
    const nightBtn = screen.getByRole('button', { name: /night/i });
    await user.click(nightBtn);
    expect(window.localStorage.getItem('gurudevi_mode')).toBe('dark');

    // Switch to Day mode
    const dayBtn = screen.getByRole('button', { name: /day/i });
    await user.click(dayBtn);
    expect(window.localStorage.getItem('gurudevi_mode')).toBe('light');

    // Toggle High Contrast
    const highContrastBtn = screen.getByRole('button', { name: /^standard$/i });
    await user.click(highContrastBtn);
    expect(screen.getByRole('button', { name: /active/i })).toBeTruthy();
  });

  it('renders guest mode notice when isExplore is true', () => {
    render(<SettingsFloor displayName="Guest Explorer" isExplore={true} />);

    expect(screen.getByText(/Guest Preferences Active/i)).toBeTruthy();
    expect(screen.getByText(/Enter Sanctuary to Sync ↗/i)).toBeTruthy();
  });
});
