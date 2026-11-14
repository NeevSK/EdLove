import type { WorldDefinition } from '../../types';
import { NOTO_SANS_SI, NOTO_SERIF_SI, variable } from '../shared/faces';
import { round, W } from '../shared/perch';
import { tokens } from '../tokens';

export const rosa: WorldDefinition = {
  id: 'rosa',
  names: { en: 'Rose and pichcha', si: 'රෝස සහ පිච්ච', ta: 'ரோஜாவும் மல்லிகையும்' },
  description: 'Rose petals and white pichcha jasmine. Gentle, warm, blooming.',
  family: 'bloom',
  faces: {
    serif: variable('Lora-Regular', {
      italic: 'Lora-Italic',
      weights: { '400': 430, '500': 480, '600': 560, '700': 640 },
    }),
    // Nunito reads best a little above regular; 520 sits between regular and medium.
    sans: variable('Nunito-VF', { weights: { '400': 520, '500': 600, '600': 700, '700': 780 } }),
    si: { serif: NOTO_SERIF_SI, sans: NOTO_SANS_SI },
    ta: {
      serif: variable('Arima-VF', { weights: { '400': 430, '500': 500, '600': 600, '700': 680 } }),
      sans: variable('Arima-VF'),
    },
  },
  motion: {
    tempo: 1.2,
    curve: 'spring',
    travel: 6,
    axis: 'up',
    settle: 'overshoot',
    stagger: 30,
    haptic: 'soft',
  },
  sign: 'petal',
  // A rose stem with a leaf and thorns.
  perch: {
    shapes: [
      {
        el: 'path',
        attrs: { d: 'M40 156 Q110 136 184 150', strokeWidth: 2.4, ...round },
        stroke: 'ornament',
        fill: 'none',
      },
      {
        el: 'path',
        attrs: { d: 'M150 146 q8 -14 22 -12 q-6 14 -22 12 Z', opacity: 0.7 },
        fill: 'ornament',
      },
      {
        el: 'path',
        attrs: { d: 'M80 148 l-3 -6 M118 142 l2 -6', strokeWidth: W, ...round },
        stroke: 'ornament',
      },
      { el: 'circle', attrs: { cx: 184, cy: 148, r: 5 }, fill: 'lamp' },
    ],
  },
  preferredMode: 'light',
  palette: {
    light: tokens({
      ground: '#FBF1F1',
      raised: '#FFF9F8',
      sunken: '#F3E3E3',
      ink: '#3A1F27',
      inkSoft: '#6E4A55',
      inkFaint: '#9A7C85',
      lamp: '#B8325A',
      onLamp: '#FFF7F9',
      lampDeep: '#962848',
      glow: '#F7C6D3',
      ornament: '#7E9A6A',
      danger: '#9C2A2A',
      onDanger: '#FFF7F9',
      success: '#4F7A3A',
      focus: '#962848',
    }),
    dark: tokens({
      ground: '#1F1418',
      raised: '#2B1C22',
      sunken: '#170E12',
      ink: '#FAEDF1',
      inkSoft: '#D8BEC7',
      inkFaint: '#A08791',
      lamp: '#F28AA8',
      onLamp: '#2A0E18',
      lampDeep: '#F5A3BA',
      glow: '#F7C6D3',
      ornament: '#E9E4D6',
      danger: '#F09A86',
      onDanger: '#2A0F08',
      success: '#A6CC8A',
      focus: '#F5A3BA',
    }),
  },
  style: {
    corner: { control: 999, surface: 28, chip: 999, field: 18 },
    primary: { fill: 'gradient', doubleEdge: false, glow: true },
    quietForm: 'text',
    raised: { edge: 'none', shadow: true },
    field: 'box',
    chip: 'outlined',
    label: 'italic',
    display: { italic: true, letterSpacing: 0 },
    lineWeight: 1,
    boundary: { dense: 'margin', calm: 'light' },
    ornament: 'pichcha',
  },
};
