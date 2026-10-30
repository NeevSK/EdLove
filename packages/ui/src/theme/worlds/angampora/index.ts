import type { WorldDefinition } from '../../types';
import { CATAMARAN, variable } from '../shared/faces';
import { tokens } from '../tokens';

export const angampora: WorldDefinition = {
  id: 'angampora',
  names: { en: 'Angampora', si: 'අංගම්පොර', ta: 'அங்கம்பொற' },
  description: 'Packed earth and brass. Square, grounded, exact.',
  family: 'cultural',
  faces: {
    serif: variable('GemunuLibre-VF', {
      weights: { '400': 480, '500': 560, '600': 680, '700': 760 },
    }),
    sans: CATAMARAN,
    si: {
      serif: variable('GemunuLibre-VF', {
        weights: { '400': 480, '500': 560, '600': 680, '700': 760 },
      }),
      sans: variable('GemunuLibre-VF', {
        weights: { '400': 460, '500': 540, '600': 640, '700': 720 },
      }),
    },
    ta: { serif: CATAMARAN, sans: CATAMARAN },
  },
  motion: {
    tempo: 0.85,
    curve: 'sharp',
    travel: 12,
    axis: 'up',
    settle: 'none',
    stagger: 0,
    haptic: 'crisp',
  },
  sign: 'lamp',
  // A brass lamp stand.
  perch: {
    fill: 'ornament',
    shapes: [
      { el: 'rect', attrs: { x: 84, y: 146, width: 52, height: 5 } },
      { el: 'rect', attrs: { x: 106, y: 151, width: 8, height: 9 } },
      { el: 'rect', attrs: { x: 92, y: 160, width: 36, height: 4 } },
      { el: 'circle', attrs: { cx: 88, cy: 141, r: 3.5 }, fill: 'lamp' },
      { el: 'circle', attrs: { cx: 132, cy: 141, r: 3.5 }, fill: 'lamp' },
    ],
  },
  preferredMode: 'dark',
  palette: {
    light: tokens(
      {
        ground: '#F0E6D6',
        raised: '#F8F1E5',
        sunken: '#E4D5BE',
        ink: '#2A1E17',
        inkSoft: '#5A4838',
        inkFaint: '#887361',
        lamp: '#7A561C',
        onLamp: '#FFF8EC',
        lampDeep: '#6E4D18',
        glow: '#C9A05A',
        ornament: '#B4893F',
        danger: '#9A3322',
        onDanger: '#FFF8EC',
        success: '#5A6E2A',
        focus: '#6E4D18',
      },
      0.26,
    ),
    dark: tokens(
      {
        ground: '#2A1E17',
        raised: '#352720',
        sunken: '#1F1611',
        ink: '#F1E3CF',
        inkSoft: '#C9B39A',
        inkFaint: '#9A8670',
        lamp: '#D9B262',
        onLamp: '#23170F',
        lampDeep: '#E2BE73',
        glow: '#E2BE73',
        ornament: '#C9A05A',
        danger: '#E89A82',
        onDanger: '#23170F',
        success: '#B9C27A',
        focus: '#E2BE73',
      },
      0.26,
    ),
  },
  style: {
    corner: { control: 4, surface: 4, chip: 3, field: 4 },
    primary: { fill: 'gradient', doubleEdge: false, glow: false },
    quietForm: 'text',
    raised: { edge: 'hairline', shadow: false },
    field: 'underline',
    chip: 'outlined',
    label: 'boldcaps',
    display: { weight: '700', uppercase: true, letterSpacing: 0.4 },
    lineWeight: 1,
    boundary: { dense: 'margin', calm: 'boxes' },
    ornament: 'stance',
  },
  refine: (recipes, t) => ({
    ...recipes,
    text: {
      ...recipes.text,
      label: { ...recipes.text.label, letterSpacing: 1.6, weight: '600', color: t.inkSoft },
    },
    button: {
      ...recipes.button,
      label: { ...recipes.button.label, letterSpacing: 0.4 },
    },
  }),
};
