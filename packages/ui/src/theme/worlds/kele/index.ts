import type { WorldDefinition } from '../../types';
import { NOTO_SANS_SI, variable } from '../shared/faces';
import { round } from '../shared/perch';
import { tokens } from '../tokens';

export const kele: WorldDefinition = {
  id: 'kele',
  names: { en: 'Forest canopy', si: 'කැලෑ වියන', ta: 'காட்டு விதானம்' },
  description: 'Backlit leaves and dark branches, looking up.',
  family: 'nature',
  faces: {
    serif: variable('Alegreya-VF', {
      italic: 'Alegreya-Italic-VF',
      weights: { '400': 420, '500': 500, '600': 580, '700': 660 },
    }),
    sans: {
      upright: 'AlegreyaSans-Regular',
      weights: { '400': 'AlegreyaSans-Regular', '600': 'AlegreyaSans-Bold' },
    },
    si: { serif: NOTO_SANS_SI, sans: NOTO_SANS_SI },
    ta: {
      serif: {
        upright: 'MuktaMalar-Regular',
        weights: { '400': 'MuktaMalar-Regular', '600': 'MuktaMalar-SemiBold' },
      },
      sans: {
        upright: 'MuktaMalar-Regular',
        weights: { '400': 'MuktaMalar-Regular', '600': 'MuktaMalar-SemiBold' },
      },
    },
  },
  motion: {
    tempo: 1,
    curve: 'spring',
    travel: 10,
    axis: 'up',
    settle: 'overshoot',
    stagger: 30,
    haptic: 'soft',
  },
  sign: 'leaf',
  // A branch with two leaves.
  perch: {
    shapes: [
      {
        el: 'path',
        attrs: { d: 'M30 150 Q110 132 190 146', strokeWidth: 3, ...round },
        stroke: 'ornament',
        fill: 'none',
      },
      { el: 'path', attrs: { d: 'M58 146 q-6 -14 8 -18 q2 12 -8 18 Z' }, fill: 'lamp' },
      {
        el: 'path',
        attrs: { d: 'M164 144 q10 -10 20 -4 q-8 10 -20 4 Z', opacity: 0.8 },
        fill: 'lamp',
      },
    ],
  },
  preferredMode: 'light',
  palette: {
    light: tokens({
      ground: '#EEF3E2',
      raised: '#F8FBF1',
      sunken: '#E0E9CE',
      ink: '#1C2A16',
      inkSoft: '#46593A',
      inkFaint: '#728366',
      lamp: '#9CC23A',
      onLamp: '#1C2A16',
      lampDeep: '#4A6A1C',
      glow: '#C9E07A',
      ornament: '#2E3A22',
      danger: '#8E2F22',
      onDanger: '#FFF6F0',
      success: '#4A6A1C',
      focus: '#4A6A1C',
    }),
    dark: tokens({
      ground: '#111A0F',
      raised: '#1A2617',
      sunken: '#0B120A',
      ink: '#E8F0DC',
      inkSoft: '#B4C4A2',
      inkFaint: '#7E8F6E',
      lamp: '#B9DB5A',
      onLamp: '#17210F',
      lampDeep: '#C6E373',
      glow: '#B9DB5A',
      ornament: '#6E8A4E',
      danger: '#F0A08A',
      onDanger: '#2A0F08',
      success: '#C6E373',
      focus: '#C6E373',
    }),
  },
  style: {
    corner: { control: [22, 6, 22, 6], surface: [26, 8, 26, 8], chip: [16, 4, 16, 4], field: 12 },
    primary: { fill: 'gradient', doubleEdge: false, glow: false },
    quietForm: 'text',
    raised: { edge: 'none', shadow: true },
    field: 'underline',
    chip: 'outlined',
    label: 'smallcaps',
    lineWeight: 1,
    boundary: { dense: 'margin', calm: 'thread' },
    ornament: 'branch',
  },
};
