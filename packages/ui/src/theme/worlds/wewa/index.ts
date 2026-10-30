import type { WorldDefinition } from '../../types';
import { INTER, NOTO_SANS_SI, NOTO_SANS_TA, variable } from '../shared/faces';
import { W } from '../shared/perch';
import { tokens } from '../tokens';

export const wewa: WorldDefinition = {
  id: 'wewa',
  names: { en: 'Wewa', si: 'වැව', ta: 'குளம்' },
  description: 'Still tank water and moonlight. Calm, cool, deep.',
  family: 'quiet',
  faces: {
    serif: variable('Fraunces-VF', {
      italic: 'Fraunces-Italic-VF',
      weights: { '400': 360, '500': 440, '600': 540, '700': 620 },
      optical: [9, 144],
      axes: { SOFT: 40 },
      nightAxes: { SOFT: 100 },
    }),
    sans: INTER,
    si: { serif: NOTO_SANS_SI, sans: NOTO_SANS_SI },
    ta: { serif: NOTO_SANS_TA, sans: NOTO_SANS_TA },
  },
  motion: {
    tempo: 1.25,
    curve: 'decelerate',
    travel: 6,
    axis: 'up',
    settle: 'eased',
    stagger: 0,
    haptic: 'soft',
  },
  sign: 'ripple',
  // A lotus pad on still water.
  perch: {
    shapes: [
      {
        el: 'path',
        attrs: {
          d: 'M110 148 L133 138.5 A46 11 0 1 0 149.8 142.5 Z',
          fillOpacity: 0.4,
          strokeWidth: W,
        },
        fill: 'ornament',
        stroke: 'ornament',
      },
      {
        el: 'path',
        attrs: { d: 'M40 156 Q60 152 80 156 M140 156 Q160 152 180 156', strokeWidth: W },
        stroke: 'line',
        fill: 'none',
      },
    ],
  },
  preferredMode: 'dark',
  palette: {
    light: tokens({
      ground: '#EAF1EE',
      raised: '#F5F9F7',
      sunken: '#DCE7E3',
      ink: '#10262E',
      inkSoft: '#3D575D',
      inkFaint: '#6A8286',
      lamp: '#2F7F78',
      onLamp: '#F2FBF9',
      lampDeep: '#22665F',
      glow: '#78BEB4',
      ornament: '#5FA39A',
      danger: '#A33A33',
      onDanger: '#FFF5F3',
      success: '#2F7F58',
      focus: '#22665F',
    }),
    dark: tokens({
      ground: '#0F2230',
      raised: '#163140',
      sunken: '#0A1822',
      ink: '#EAF2F0',
      inkSoft: '#A9C0C2',
      inkFaint: '#75908F',
      lamp: '#9ED8D2',
      onLamp: '#062024',
      lampDeep: '#9ED8D2',
      glow: '#9ED8D2',
      ornament: '#5E9A8C',
      danger: '#F2A7A0',
      onDanger: '#2A0E0B',
      success: '#9ED8B4',
      focus: '#9ED8D2',
    }),
  },
  style: {
    corner: { control: 999, surface: 22, chip: 999, field: 14 },
    primary: { fill: 'gradient', doubleEdge: false, glow: true },
    quietForm: 'text',
    raised: { edge: 'hairline', shadow: false },
    field: 'underline',
    chip: 'outlined',
    label: 'smallcaps',
    lineWeight: 0.75,
    boundary: { dense: 'margin', calm: 'light' },
    ornament: 'ripple',
  },
};
