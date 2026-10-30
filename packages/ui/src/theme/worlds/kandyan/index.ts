import type { WorldDefinition } from '../../types';
import { NOTO_SERIF_TA } from '../shared/faces';
import { W } from '../shared/perch';
import { tokens } from '../tokens';

export const kandyan: WorldDefinition = {
  id: 'kandyan',
  names: { en: 'Temple walls', si: 'විහාර බිතු', ta: 'கோயில் சுவர்கள்' },
  description: 'Lime plaster and mural earth, with a vine band at the edge.',
  family: 'cultural',
  faces: {
    // Abhaya Libre is Sinhala-first and draws small, so it is set a size up.
    serif: {
      upright: 'AbhayaLibre-Regular',
      weights: { '400': 'AbhayaLibre-Regular', '600': 'AbhayaLibre-SemiBold' },
      scale: 1.08,
    },
    sans: {
      upright: 'AbhayaLibre-Regular',
      weights: { '400': 'AbhayaLibre-Regular', '600': 'AbhayaLibre-SemiBold' },
      scale: 1.08,
    },
    si: {
      serif: {
        upright: 'AbhayaLibre-Regular',
        weights: { '400': 'AbhayaLibre-Regular', '600': 'AbhayaLibre-SemiBold' },
        scale: 1.12,
      },
      sans: {
        upright: 'AbhayaLibre-Regular',
        weights: { '400': 'AbhayaLibre-Regular', '600': 'AbhayaLibre-SemiBold' },
        scale: 1.12,
      },
    },
    ta: { serif: NOTO_SERIF_TA, sans: NOTO_SERIF_TA },
  },
  motion: {
    tempo: 1.1,
    curve: 'decelerate',
    travel: 0,
    axis: 'none',
    settle: 'eased',
    stagger: 0,
    haptic: 'crisp',
  },
  sign: 'band',
  // A niche in the temple wall: a doubled arch frame.
  perch: {
    stroke: 'ornament',
    fill: 'none',
    shapes: [
      { el: 'path', attrs: { d: 'M66 162 V128 Q110 96 154 128 V162', strokeWidth: W * 1.5 } },
      { el: 'path', attrs: { d: 'M74 162 V131 Q110 106 146 131 V162', strokeWidth: W * 0.8 } },
      { el: 'rect', attrs: { x: 60, y: 158, width: 100, height: 4 }, fill: 'ornament' },
    ],
  },
  preferredMode: 'light',
  palette: {
    light: tokens(
      {
        ground: '#F1E5CC',
        raised: '#F7EEDA',
        sunken: '#E6D6B5',
        ink: '#1F1912',
        inkSoft: '#56493A',
        inkFaint: '#85765F',
        lamp: '#B5361E',
        onLamp: '#FBF6EA',
        lampDeep: '#9C2E19',
        glow: '#CC8B2C',
        ornament: '#CC8B2C',
        danger: '#8A2A18',
        onDanger: '#FBF6EA',
        success: '#56702E',
        focus: '#9C2E19',
      },
      0.24,
    ),
    dark: tokens(
      {
        ground: '#1E1610',
        raised: '#2A1F16',
        sunken: '#150F0A',
        ink: '#F2E6CE',
        inkSoft: '#C9B596',
        inkFaint: '#8F7D63',
        lamp: '#B8432A',
        onLamp: '#FFF6EA',
        lampDeep: '#F08A6E',
        glow: '#D98C3C',
        ornament: '#D9A04A',
        danger: '#F08A6E',
        onDanger: '#2A0F08',
        success: '#A9C27A',
        focus: '#F08A6E',
      },
      0.24,
    ),
  },
  style: {
    corner: { control: 12, surface: 10, chip: [999, 999, 8, 8], field: 10 },
    primary: { fill: 'solid', doubleEdge: true, glow: false },
    quietForm: 'text',
    raised: { edge: 'frame', shadow: false },
    field: 'underline',
    chip: 'outlined',
    label: 'italic',
    lineWeight: 1,
    boundary: { dense: 'margin', calm: 'leaves' },
    ornament: 'liyawela',
  },
};
