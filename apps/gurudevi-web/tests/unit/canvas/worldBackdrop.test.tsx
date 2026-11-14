import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

let pathname = '/profile';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

import { SanctuaryFloorCanvas } from '../../../app/(sanctuary)/components/SanctuaryFloorCanvas';
import { groundStageOf, WorldBackdrop } from '../../../app/(sanctuary)/components/WorldBackdrop';
import { worldLookStore } from '../../../lib/canvas/worldLookStore';

function floor(domain: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`article[data-domain="${domain}"]`);
  if (!el) throw new Error(`no ${domain} floor`);
  return el;
}

describe('every screen stands on the world ground, drawn once by the shell', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    worldLookStore.reset();
    pathname = '/profile';
  });

  it('a screen with no floor still gets the world ground', () => {
    pathname = '/notifications';
    render(<WorldBackdrop />);
    expect(screen.getByTestId('world-backdrop').dataset.groundStage).toBe('screen');
  });

  it('a floor inside the shell does not draw a second ground, until it keeps its own look', async () => {
    render(
      <>
        <WorldBackdrop />
        <SanctuaryFloorCanvas domain="self" titleId="t">
          <h1 id="t">Self</h1>
        </SanctuaryFloorCanvas>
      </>,
    );
    expect(floor('self').dataset.groundHost).toBe('shell');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /open self floor studio/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('radio', { name: /just self/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /quiet/i }));
    });
    expect(floor('self').dataset.groundHost).toBe('floor');
  });

  it('a change for every room reaches the shell ground at once', async () => {
    render(
      <>
        <WorldBackdrop />
        <SanctuaryFloorCanvas domain="self" titleId="t">
          <h1 id="t">Self</h1>
        </SanctuaryFloorCanvas>
      </>,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /open self floor studio/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /quiet/i }));
    });
    expect(screen.getByTestId('world-backdrop').dataset.groundDrawn).toBe('paper');
  });

  it('reading and work screens get the calm ground', () => {
    expect(groundStageOf('/library/reader/abc')).toBe('focus');
    expect(groundStageOf('/community/chat/g1')).toBe('focus');
    expect(groundStageOf('/workspace/kiosk')).toBe('focus');
    expect(groundStageOf('/profile')).toBe('screen');
    expect(groundStageOf('/settings')).toBe('screen');
    expect(groundStageOf('/self')).toBe('room');
    expect(groundStageOf('/library')).toBe('room');
    expect(groundStageOf('/library/map')).toBe('screen');
  });

  it('how strong the ground is comes from the policy, not the route', () => {
    pathname = '/self';
    window.localStorage.setItem('gurudevi_ground_liveliness', 'calm');
    render(<WorldBackdrop />);
    const backdrop = screen.getByTestId('world-backdrop');
    expect(backdrop.dataset.groundStage).toBe('room');
    expect(backdrop.dataset.groundLiveliness).toBe('calm');
    expect(backdrop.dataset.groundStrength).toBe('calm');
  });

  it('with no choice saved, the balanced row applies', () => {
    pathname = '/library/reader/abc';
    render(<WorldBackdrop />);
    const backdrop = screen.getByTestId('world-backdrop');
    expect(backdrop.dataset.groundLiveliness).toBe('balanced');
    expect(backdrop.dataset.groundStrength).toBe('calm');
  });

  it('presence follows the one shared rule: room full, screen band, reading quiet', () => {
    for (const [path, presence] of [
      ['/self', 'full'],
      ['/profile', 'band'],
      ['/library/reader/abc', 'quiet'],
    ] as const) {
      pathname = path;
      render(<WorldBackdrop />);
      const backdrop = screen.getByTestId('world-backdrop');
      expect(backdrop.dataset.groundPresence, path).toBe(presence);
      const veil = backdrop.querySelector<HTMLElement>('[data-layer="ground-veil"]');
      // Before verger is read the ground is the world's paper, which needs no veil.
      if (backdrop.dataset.groundDrawn === 'paper') expect(veil).toBeNull();
      cleanup();
    }
  });
});

