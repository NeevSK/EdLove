import { render, screen } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';
import type { RadarSeries } from '../../../theme/contracts';

// The mock RN engine has no SVG; shapes render as plain host nodes, so this proves what is said
// and the list gear, not the drawing (that needs G4/G5).
vi.mock('react-native-svg', () => {
  const React = require('react');
  const Shape = (props: Record<string, unknown>) =>
    React.createElement(
      'Shape',
      Object.fromEntries(Object.entries(props).filter(([key]) => key !== 'children')),
    );
  return {
    __esModule: true,
    default: Shape,
    Circle: Shape,
    Line: Shape,
    Polygon: Shape,
    Text: Shape,
  };
});

import { WorldScope } from '../../../theme/native';
import { Radar } from '../Radar/Radar';

const axes = [
  { id: 'maths', label: 'Maths' },
  { id: 'music', label: 'Music' },
  { id: 'caring', label: 'Caring for others' },
];
const series: RadarSeries[] = [
  { id: 'now', label: 'Now', values: { maths: 0.6, music: 0.9 }, emphasis: 'now' },
  {
    id: 'then',
    label: 'Start of term',
    values: { maths: 0.4, music: 0.8, caring: 0.5 },
    emphasis: 'then',
  },
];

describe('Radar', { tags: ['a11y', 'unit'] }, () => {
  it('says every area aloud, then and now, including what is not there yet', async () => {
    await render(
      <WorldScope world="sanctuary" phase="morning" mode="light">
        <Radar axes={axes} series={series} label="Your areas" missingLabel="not yet" />
      </WorldScope>,
    );
    expect(
      screen.getByLabelText(
        'Your areas. Maths: Now 60%, Start of term 40%. Music: Now 90%, Start of term 80%. Caring for others: Now not yet, Start of term 50%',
      ),
    ).toBeTruthy();
  });

  it('becomes a list below three areas instead of a broken shape', async () => {
    await render(
      <WorldScope world="sanctuary" phase="morning" mode="light">
        <Radar axes={axes.slice(0, 2)} series={series} label="Your areas" missingLabel="not yet" />
      </WorldScope>,
    );
    expect(screen.getByText('Maths: Now 60%, Start of term 40%')).toBeTruthy();
  });
});
