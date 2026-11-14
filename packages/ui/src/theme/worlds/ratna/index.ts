import type { PerchShape } from '../../perches';
import type { WorldDefinition } from '../../types';
import {
  NOTO_SANS_SI,
  NOTO_SANS_TA,
  NOTO_SERIF_SI,
  NOTO_SERIF_TA,
  variable,
} from '../shared/faces';
import { W } from '../shared/perch';
import { tokens } from '../tokens';

export const ratna: WorldDefinition = {
  id: 'ratna',
  names: { en: 'Gems and lace', si: 'මැණික් සහ බීරළු', ta: 'மாணிக்கமும் சரிகையும்' },
  description: 'Ivory, beeralu lace and one sapphire.',
  family: 'quiet',
  faces: {
    // Cormorant is fine and light; body sizes need it a little heavier and larger.
    serif: variable('CormorantGaramond-VF', {
      italic: 'CormorantGaramond-Italic-VF',
      weights: { '400': 500, '500': 560, '600': 620, '700': 700 },
      scale: 1.08,
    }),
    sans: variable('Jost-VF', { weights: { '400': 400, '500': 480, '600': 560, '700': 640 } }),
    si: { serif: NOTO_SERIF_SI, sans: NOTO_SANS_SI },
    ta: { serif: NOTO_SERIF_TA, sans: NOTO_SANS_TA },
  },
  motion: {
    tempo: 1.1,
    curve: 'decelerate',
    travel: 4,
    axis: 'up',
    settle: 'none',
    stagger: 0,
    haptic: 'soft',
  },
  sign: 'glint',
  // A lace window: an arch with a lattice of dots.
  perch: {
    stroke: 'ornament',
    strokeWidth: W,
    fill: 'none',
    shapes: [
      { el: 'path', attrs: { d: 'M70 162 V126 A40 26 0 0 1 150 126 V162' } },
      ...[86, 98, 110, 122, 134].map(
        (x): PerchShape => ({ el: 'circle', attrs: { cx: x, cy: 152, r: 1.6 }, fill: 'ornament' }),
      ),
    ],
  },
  preferredMode: 'light',
  palette: {
    light: tokens({
      ground: '#F7F3EE',
      raised: '#FFFDFA',
      sunken: '#ECE6DF',
      ink: '#23202A',
      inkSoft: '#57525F',
      inkFaint: '#85808E',
      lamp: '#2F5FA8',
      onLamp: '#F7F3EE',
      lampDeep: '#2F5FA8',
      glow: '#6F98DC',
      ornament: '#23202A',
      danger: '#8E2F3A',
      onDanger: '#FFF6F7',
      success: '#3F6E4A',
      focus: '#2F5FA8',
    }),
    dark: tokens({
      ground: '#14131A',
      raised: '#1E1C26',
      sunken: '#0E0D12',
      ink: '#F1EEF4',
      inkSoft: '#B9B4C2',
      inkFaint: '#858092',
      lamp: '#8FB2EA',
      onLamp: '#0E1830',
      lampDeep: '#A9C4F0',
      glow: '#8FB2EA',
      ornament: '#CFC8DA',
      danger: '#F0A0AA',
      onDanger: '#2A0E12',
      success: '#9FD0AA',
      focus: '#A9C4F0',
    }),
  },
  style: {
    corner: { control: 999, surface: 20, chip: 999, field: 14 },
    primary: { fill: 'gradient', doubleEdge: false, glow: true },
    quietForm: 'text',
    raised: { edge: 'hairline', shadow: true },
    field: 'underline',
    chip: 'outlined',
    label: 'smallcaps',
    lineWeight: 0.75,
    boundary: { dense: 'margin', calm: 'light' },
    ornament: 'lace',
  },
};
