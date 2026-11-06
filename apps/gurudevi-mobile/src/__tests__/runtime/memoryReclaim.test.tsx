import { cleanup, render } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  snapshot: null as null | { memory: string; optionalConcurrency: number },
  reclaim: vi.fn(),
}));

vi.mock('@repo/verger-react', () => ({ useVergerSnapshot: () => fixture.snapshot }));
vi.mock('@repo/core/efficiency', () => ({ reclaimHermesMemory: fixture.reclaim }));
vi.mock('@/boot/optionalStartupWork', () => ({ scheduleOptionalStartupWork: () => () => {} }));
vi.mock('react-native', () => ({
  AppState: { currentState: 'active', addEventListener: () => ({ remove: () => {} }) },
}));

import { OptionalStartupServices } from '@/boot/OptionalStartupServices';

// Admitted warm-ups name the idle scheduler; the schedule itself is substituted above.
vi.stubGlobal('requestIdleCallback', () => 0);
vi.stubGlobal('cancelIdleCallback', () => {});

const at = (memory: string) => ({ memory, optionalConcurrency: 0 });

describe('Hermes reclaim on verger memory pressure / substituted verger and Hermes', () => {
  afterEach(() => {
    cleanup();
    fixture.reclaim.mockReset();
    fixture.snapshot = null;
  });

  it('reclaims nothing without verger, or while memory is normal or unknown', () => {
    const view = render(createElement(OptionalStartupServices, { phase: 'public-ready' }));
    for (const memory of ['unknown', 'normal']) {
      fixture.snapshot = at(memory);
      view.rerender(createElement(OptionalStartupServices, { phase: 'public-ready' }));
    }
    expect(fixture.reclaim).not.toHaveBeenCalled();
  });

  it('compacts once per entry into trimmed (constrained) and low (severe), never touching queries', () => {
    fixture.snapshot = at('trimmed');
    const view = render(createElement(OptionalStartupServices, { phase: 'public-ready' }));
    view.rerender(createElement(OptionalStartupServices, { phase: 'public-ready' }));
    fixture.snapshot = at('low');
    view.rerender(createElement(OptionalStartupServices, { phase: 'public-ready' }));

    expect(fixture.reclaim.mock.calls).toEqual([
      [{ severity: 'constrained', reason: 'verger-memory-trimmed', forceGC: true }],
      [{ severity: 'severe', reason: 'verger-memory-low', forceGC: true }],
    ]);
  });
});
