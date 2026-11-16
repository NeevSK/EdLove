import { fireEvent, render, screen } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';
import type { RadarObservation } from '../../../theme/contracts';
import { Radar } from '../Radar/Radar';

vi.mock('react-native-svg', async () => {
  const native = await vi.importActual<typeof import('react-native')>('react-native');
  return {
    default: native.View,
    Circle: native.View,
    Defs: native.View,
    Ellipse: native.View,
    G: native.View,
    Line: native.View,
    Path: native.View,
    Polygon: native.View,
    RadialGradient: native.View,
    Rect: native.View,
    Stop: native.View,
    Text: native.Text,
  };
});

const observation: RadarObservation = {
  subject: { id: 'sample-person', label: 'Example learner' },
  measure: { id: 'sample-measure', label: 'Learning example', version: 'v1' },
  perspective: { id: 'self', label: 'Self reflection', kind: 'self' },
  plotPolicy: 'declared-comparable',
  sourceLabel: 'Gallery fixture',
  synthetic: true,
  stale: false,
  axes: [
    { id: 'focus', label: 'Focus', min: 0, max: 100, value: 0, unit: '%' },
    { id: 'care', label: 'Care', min: 0, max: 100, value: null, unit: '%' },
    { id: 'practice', label: 'Practice', min: 0, max: 100, value: 60, unit: '%' },
  ],
};

describe('Radar', { tags: ['a11y', 'unit'] }, () => {
  it('keeps the measure, perspective, source and synthetic example explicit', async () => {
    await render(<Radar label="Radar overview" state={{ kind: 'ready', observation }} />);

    expect(screen.getByRole('header', { name: 'Radar overview' })).toBeTruthy();
    expect(screen.getByText('Example learner')).toBeTruthy();
    expect(screen.getByText('Learning example · v1')).toBeTruthy();
    expect(screen.getByText('Self reflection (self) · Gallery fixture · Observation time not supplied')).toBeTruthy();
    expect(screen.getByText('Example data · synthetic')).toBeTruthy();
    expect(screen.getByText('1. Focus: 0 % · range 0–100 %')).toBeTruthy();
    expect(screen.getByText('2. Care: Not recorded · range 0–100 %')).toBeTruthy();
  });

  it('keeps unavailable and denied states free of extra observation metadata', async () => {
    const denied = { kind: 'denied', message: 'No access', observation } as const;
    const { rerender } = await render(<Radar label="Overview" state={denied} />);
    expect(screen.getByText('Access unavailable')).toBeTruthy();
    expect(screen.getByText('No access')).toBeTruthy();
    expect(screen.queryByText('Example learner')).toBeNull();
    expect(screen.getByTestId('feedback-scene-empty', { includeHiddenElements: true })).toBeTruthy();

    await rerender(<Radar label="Overview" state={{ kind: 'unavailable', message: 'Source offline' }} />);
    expect(screen.getByText('Radar unavailable')).toBeTruthy();
    expect(screen.getByText('Source offline')).toBeTruthy();
    expect(screen.queryByText('Example learner')).toBeNull();
    expect(screen.getByTestId('feedback-scene-empty', { includeHiddenElements: true })).toBeTruthy();
  });

  it('shows empty and loading states distinctly without observation details', async () => {
    const { rerender } = await render(
      <Radar label="Overview" state={{ kind: 'empty', message: 'No observation exists' }} />,
    );
    expect(screen.getByText('No observation')).toBeTruthy();
    expect(screen.getByText('No observation exists')).toBeTruthy();

    await rerender(<Radar label="Overview" state={{ kind: 'loading', message: 'Loading sample' }} />);
    expect(screen.getByRole('progressbar', { name: 'Loading sample' })).toBeTruthy();
    expect(screen.queryByText('Example learner')).toBeNull();
  });

  it('offers retry only for an error when a retry action exists', async () => {
    const onRetry = vi.fn();
    const { rerender } = await render(
      <Radar label="Overview" state={{ kind: 'error', message: 'Source failed' }} onRetry={onRetry} />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByTestId('feedback-scene-error', { includeHiddenElements: true })).toBeTruthy();

    await rerender(
      <Radar label="Overview" state={{ kind: 'unavailable', message: 'Not connected' }} onRetry={onRetry} />,
    );
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });

  it('declines invalid observations instead of inventing chart values', async () => {
    const invalid: RadarObservation = {
      ...observation,
      axes: observation.axes.map((axis, index) => (index === 0 ? { ...axis, value: 101 } : axis)),
    };
    await render(<Radar label="Overview" state={{ kind: 'ready', observation: invalid }} />);
    expect(screen.getByText('The supplied observation cannot be displayed.')).toBeTruthy();
    expect(screen.queryByText('Example learner')).toBeNull();
  });

  it('lists sparse values while leaving the missing axis unplotted', async () => {
    await render(<Radar label="Overview" state={{ kind: 'ready', observation }} />);
    expect(screen.getByText('2. Care: Not recorded · range 0–100 %')).toBeTruthy();
    expect(screen.getByText('3. Practice: 60 % · range 0–100 %')).toBeTruthy();
  });

  it('states when a measure has no recorded dimensions', async () => {
    const withoutAxes: RadarObservation = { ...observation, axes: [] };
    await render(<Radar label="Overview" state={{ kind: 'ready', observation: withoutAxes }} />);
    expect(screen.getByText('No dimensions recorded.')).toBeTruthy();
  });
});
