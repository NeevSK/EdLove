import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { SyncStatusPill } from '@/app/(sanctuary)/components/SyncStatusPill';

describe('Unit/Integration: SyncStatusPill Ambient Network Telemetry', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
      writable: true,
    });
  });

  it('renders "Synced" when online', () => {
    render(<SyncStatusPill />);
    expect(screen.getByText('Synced')).toBeDefined();
    expect(screen.getByTitle(/Connected to Gurudevi Sovereign Gateway/i)).toBeDefined();
  });

  it('transitions to "Offline Mode" when offline event fires', () => {
    render(<SyncStatusPill />);
    expect(screen.getByText('Synced')).toBeDefined();

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: false,
        writable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText('Offline Mode')).toBeDefined();
    expect(screen.getByTitle(/Working offline/i)).toBeDefined();
  });

  it('restores "Synced" state when online event fires again', () => {
    render(<SyncStatusPill />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText('Offline Mode')).toBeDefined();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.getByText('Synced')).toBeDefined();
  });
});
