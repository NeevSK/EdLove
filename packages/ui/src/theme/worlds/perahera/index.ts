import type { WorldDefinition } from '../../types';
import { CATAMARAN, variable } from '../shared/faces';
import { round, W } from '../shared/perch';
import { tokens } from '../tokens';

export const perahera: WorldDefinition = {
  id: 'perahera',
  names: { en: 'Perahera', si: 'පෙරහැර', ta: 'பெரஹெரா' },
  description: 'The festival night: torchlight, drums and coloured flags. Ceremonial and bright.',
  family: 'cultural',
  faces: {
    serif: variable('Yaldevi-VF', { weights: { '400': 460, '500': 540, '600': 620, '700': 700 } }),
    sans: CATAMARAN,
    si: {
      serif: variable('Yaldevi-VF', {
        weights: { '400': 460, '500': 540, '600': 620, '700': 700 },
      }),
      sans: variable('Yaldevi-VF', { weights: { '400': 420, '500': 500, '600': 600, '700': 680 } }),
    },
    ta: { serif: CATAMARAN, sans: CATAMARAN },
  },
  motion: {
    tempo: 0.9,
    curve: 'standard',
    travel: 10,
    axis: 'up',
    settle: 'overshoot',
    stagger: 60,
    haptic: 'crisp',
  },
  sign: 'beat',
  // A torch pole with its flame.
  perch: {
    shapes: [
      {
        el: 'line',
        attrs: { x1: 168, y1: 164, x2: 168, y2: 104, strokeWidth: 3, ...round },
        stroke: 'ornament',
      },
      { el: 'path', attrs: { d: 'M168 102 q-8 -10 0 -22 q8 12 0 22 Z' }, fill: 'lamp' },
      { el: 'path', attrs: { d: 'M70 154 H150', strokeWidth: W }, stroke: 'ornament' },
    ],
  },
  preferredMode: 'dark',
  palette: {
    light: tokens(
      {
        ground: '#FFF4E0',
        raised: '#FFFBF2',
        sunken: '#F6E4C6',
        ink: '#2B1408',
        inkSoft: '#6A3E22',
        inkFaint: '#94694A',
        lamp: '#C23A08',
        onLamp: '#FFF6EA',
        lampDeep: '#A8320A',
        glow: '#FFB23E',
        ornament: '#8C1C5A',
        danger: '#8E1C2A',
        onDanger: '#FFF6EA',
        success: '#3F6E2A',
        focus: '#A8320A',
      },
      0.24,
    ),
    dark: tokens(
      {
        ground: '#140A12',
        raised: '#22121E',
        sunken: '#0E060C',
        ink: '#FFEFD9',
        inkSoft: '#E2C39E',
        inkFaint: '#A88868',
        lamp: '#FF7A2E',
        onLamp: '#1E0A04',
        lampDeep: '#FF9A5A',
        glow: '#FFB23E',
        ornament: '#E04A9A',
        danger: '#FF8A80',
        onDanger: '#2A0808',
        success: '#9FD08A',
        focus: '#FF9A5A',
      },
      0.24,
    ),
  },
  style: {
    corner: { control: 6, surface: 6, chip: 6, field: 6 },
    primary: { fill: 'gradient', doubleEdge: true, glow: true },
    quietForm: 'outlined',
    raised: { edge: 'frame', shadow: false },
    field: 'box',
    chip: 'outlined',
    label: 'boldcaps',
    display: { weight: '700', uppercase: true, letterSpacing: 0.6 },
    lineWeight: 1.5,
    boundary: { dense: 'boxes', calm: 'boxes' },
    ornament: 'flag',
  },
};
