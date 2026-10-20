import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationsFloor } from '@/app/(sanctuary)/notifications/NotificationsFloor';

describe('NotificationsFloor Integration (G1 boundary / jsdom)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders within SanctuaryFloorCanvas with notifications title and Floor Studio trigger', () => {
    render(<NotificationsFloor displayName="Aria Star" />);

    // Check title and unread header text
    expect(screen.getByRole('heading', { level: 1, name: /notifications center/i })).toBeTruthy();
    expect(screen.getByText(/unread announcements/i)).toBeTruthy();

    // Check Floor Studio button is mounted
    const studioButton = screen.getByRole('button', { name: /customize this notifications floor/i });
    expect(studioButton).toBeTruthy();
  });

  it('filters notifications by category and allows marking all read', async () => {
    const user = userEvent.setup();
    render(<NotificationsFloor displayName="Aria Star" />);

    // Initially contains multiple notices
    expect(screen.getByText(/Attendance marked for Forest Learning Circle/i)).toBeTruthy();

    // Click Category filter: Mentors
    const mentorsTab = screen.getByRole('tab', { name: /mentors/i });
    await user.click(mentorsTab);

    // Shows mentors notice
    expect(screen.getByText(/Pedagogical feedback on Gradebook assessment/i)).toBeTruthy();

    // Switch to Achievements
    const achievementsTab = screen.getByRole('tab', { name: /achievements/i });
    await user.click(achievementsTab);
    expect(screen.getByText(/Mindfulness streak milestone reached/i)).toBeTruthy();

    // Mark all read
    const markAllBtn = screen.getByRole('button', { name: /mark all as read/i });
    await user.click(markAllBtn);

    // Header updates to up to date
    expect(screen.getByText(/You are up to date on all sanctuary communications/i)).toBeTruthy();
  });

  it('renders guest notifications when isExplore is true', () => {
    render(<NotificationsFloor displayName="Guest Explorer" isExplore={true} />);

    expect(screen.getByText(/Welcome to Gurudevi Guest House/i)).toBeTruthy();
    expect(screen.getByText(/Local-First PDPA Privacy Invariant/i)).toBeTruthy();
  });
});
