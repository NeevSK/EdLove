import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Radar } from '@repo/ui/components/web/Radar/Radar';
import type { RadarObservation, RadarState } from '@repo/ui/theme/contracts';
import { RadarGalleryClient } from '../../../app/(sanctuary)/kit/radar/RadarGalleryClient';
import RadarGalleryPage from '../../../app/(sanctuary)/kit/radar/page';

const observation: RadarObservation = {
  subject: { id: 'p', label: 'Private person' },
  measure: { id: 'm', label: 'Distinct measure', version: 'v2' },
  perspective: { id: 'o', label: 'Teacher observation', kind: 'observer' },
  sourceLabel: 'Attributed record',
  observedAt: '2026-11-11',
  synthetic: true,
  stale: true,
  plotPolicy: 'declared-comparable',
  axes: [
    { id: 'a', label: 'Zero axis', min: 0, max: 100, value: 0 },
    { id: 'b', label: 'Missing axis', min: 0, max: 100, value: null },
    { id: 'c', label: 'Known axis', min: 0, max: 100, value: 75 },
  ],
};

describe('Radar DOM behavior (G1 jsdom; no browser layout evidence)', () => {
  it('preserves attribution, raw values, missing values and historical/example labels', () => {
    render(<Radar label="Observation" state={{ kind: 'ready', observation }} />);
    expect(screen.getByText(/Private person.*Distinct measure.*v2/)).toBeTruthy();
    expect(screen.getByText(/Teacher observation.*Attributed record/)).toBeTruthy();
    expect(screen.getByText('Example data')).toBeTruthy();
    expect(screen.getByText(/Historical observation/)).toBeTruthy();
    expect(
      within(screen.getByRole('row', { name: /Zero axis/ })).getByRole('cell', { name: '0' }),
    ).toBeTruthy();
    expect(screen.getByText('Not recorded')).toBeTruthy();
    expect(screen.getByRole('table')).toBeTruthy();
  });
  it.each(['loading', 'empty', 'denied', 'unavailable', 'error'] as const)(
    'does not leak ready data in %s state',
    (kind) => {
      const state = { kind, message: 'Safe message', observation } as RadarState;
      render(<Radar label="Observation" state={state} />);
      expect(screen.queryByText(/Private person/)).toBeNull();
      expect(screen.queryByRole('table')).toBeNull();
      expect(screen.getByText('Safe message')).toBeTruthy();
    },
  );
  it('rejects invalid values without revealing the record and offers explicit retry on errors', () => {
    const retry = vi.fn();
    const { rerender } = render(
      <Radar
        label="Observation"
        state={{
          kind: 'ready',
          observation: { ...observation, axes: [{ ...observation.axes[0]!, value: 101 }] },
        }}
      />,
    );
    expect(screen.queryByText(/Private person/)).toBeNull();
    expect(screen.getByText('This observation cannot be displayed.')).toBeTruthy();
    rerender(
      <Radar
        label="Observation"
        state={{ kind: 'error', message: 'Unavailable' }}
        onRetry={retry}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledOnce();
  });
  it('keeps measures and perspectives separate while switching states and retrying', () => {
    render(<RadarGalleryClient />);
    fireEvent.click(screen.getByRole('button', { name: 'Measure B (0–5)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Other observation' }));
    expect(screen.getByText(/Example measure B.*demo-1/)).toBeTruthy();
    expect(screen.getByText(/Example observer.*observer/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'denied' }));
    expect(screen.queryByRole('table')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'error' }));
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getByText(/Example measure B.*demo-1/)).toBeTruthy();
  });
  it('blocks the development gallery in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    try {
      expect(() => RadarGalleryPage()).toThrow();
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
