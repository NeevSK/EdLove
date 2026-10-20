import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExamLockdownBanner } from '@/app/(sanctuary)/components/ExamLockdownBanner';

describe('Unit/Integration: ExamLockdownBanner HUD Overlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial lockdown state with zero strikes', () => {
    render(<ExamLockdownBanner maxWarnings={3} />);
    expect(screen.getByText('Exam Lockdown Active')).toBeDefined();
    expect(screen.getByText('0 / 3 Strikes')).toBeDefined();
    expect(screen.getByText('Enter Fullscreen Mode')).toBeDefined();
  });

  it('updates strikes counter when window blur event occurs', () => {
    render(<ExamLockdownBanner maxWarnings={3} />);
    expect(screen.getByText('0 / 3 Strikes')).toBeDefined();

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(screen.getByText('1 / 3 Strikes')).toBeDefined();
  });

  it('triggers onWarningThresholdReached when limit is met', () => {
    const onThreshold = vi.fn();
    render(<ExamLockdownBanner maxWarnings={2} onWarningThresholdReached={onThreshold} />);

    act(() => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('blur'));
    });

    expect(screen.getByText('2 / 2 Strikes')).toBeDefined();
    expect(onThreshold).toHaveBeenCalledTimes(1);
  });
});
