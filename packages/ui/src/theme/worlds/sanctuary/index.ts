import type { WorldDefinition } from '../../types';
import {
  INTER,
  NOTO_SANS_SI,
  NOTO_SANS_TA,
  NOTO_SERIF_SI,
  NOTO_SERIF_TA,
  variable,
} from '../shared/faces';
import { round, W } from '../shared/perch';
import { tokens } from '../tokens';

export const sanctuary: WorldDefinition = {
  id: 'sanctuary',
  names: { en: 'Sanctuary', si: 'අභයභූමිය', ta: 'சரணாலயம்' },
  description: 'Washi paper and lamp light. The quiet default.',
  family: 'quiet',
  faces: {
    serif: variable('Newsreader-VF', {
      italic: 'Newsreader-Italic-VF',
      weights: { '400': 380, '500': 460, '600': 560, '700': 640 },
      optical: [6, 72],
    }),
    sans: INTER,
    si: { serif: NOTO_SERIF_SI, sans: NOTO_SANS_SI },
    ta: { serif: NOTO_SERIF_TA, sans: NOTO_SANS_TA },
  },
  motion: {
    tempo: 1,
    curve: 'decelerate',
    travel: 8,
    axis: 'up',
    settle: 'none',
    stagger: 0,
    haptic: 'soft',
  },
  sign: 'flame',
  // The clay lamp.
  perch: {
    shapes: [
      { el: 'path', attrs: { d: 'M76 136 Q110 162 144 136 Z', opacity: 0.85 }, fill: 'ornament' },
      {
        el: 'path',
        attrs: { d: 'M144 136 L156 131', strokeWidth: W, ...round },
        stroke: 'ornament',
      },
      { el: 'ellipse', attrs: { cx: 158, cy: 127, rx: 3, ry: 5 }, fill: 'lamp' },
    ],
  },
  preferredMode: 'light',
  palette: {
    light: tokens({
      ground: '#F5EDD6',
      raised: '#FBF6EA',
      sunken: '#ECE2C8',
      ink: '#2A2318',
      inkSoft: '#5A4E3E',
      inkFaint: '#857966',
      lamp: '#E3A24E',
      onLamp: '#2A1A08',
      lampDeep: '#8A4F17',
      glow: '#F6C27E',
      ornament: '#5B4632',
      danger: '#9C3424',
      onDanger: '#FFF8F0',
      success: '#4F7A3A',
      focus: '#A8601D',
    }),
    dark: tokens({
      ground: '#17140F',
      raised: '#221D16',
      sunken: '#100E0A',
      ink: '#F3EAD8',
      inkSoft: '#C4B8A3',
      inkFaint: '#8E8372',
      lamp: '#F0B562',
      onLamp: '#2A1A08',
      lampDeep: '#F0B562',
      glow: '#F0B562',
      ornament: '#C9A27A',
      danger: '#F09A86',
      onDanger: '#2A0F08',
      success: '#A6CC8A',
      focus: '#F0B562',
    }),
  },
  style: {
    corner: { control: 999, surface: 22, chip: 999, field: 14 },
    primary: { fill: 'gradient', doubleEdge: false, glow: true },
    quietForm: 'text',
    raised: { edge: 'hairline', shadow: false },
    field: 'underline',
    chip: 'underline',
    label: 'smallcaps',
    lineWeight: 0.75,
    boundary: { dense: 'margin', calm: 'light' },
    ornament: 'hairline',
  },
};
