import type { WorldDefinition } from '../../types';
import { NOTO_SANS_SI, NOTO_SERIF_SI } from '../shared/faces';
import { round, W } from '../shared/perch';
import { tokens } from '../tokens';

export const tea: WorldDefinition = {
  id: 'tea',
  names: { en: 'Tea country', si: 'තේ රට', ta: 'தேயிலை நாடு' },
  description: 'Rows of tea on misty hills. Fresh, open, unhurried.',
  family: 'nature',
  faces: {
    serif: {
      upright: 'Spectral-Regular',
      italic: 'Spectral-Italic',
      weights: { '400': 'Spectral-Regular' },
    },
    sans: {
      upright: 'HindMadurai-Regular',
      weights: { '400': 'HindMadurai-Regular', '500': 'HindMadurai-Medium' },
    },
    si: { serif: NOTO_SERIF_SI, sans: NOTO_SANS_SI },
    ta: {
      serif: {
        upright: 'HindMadurai-Regular',
        weights: { '400': 'HindMadurai-Regular', '500': 'HindMadurai-Medium' },
      },
      sans: {
        upright: 'HindMadurai-Regular',
        weights: { '400': 'HindMadurai-Regular', '500': 'HindMadurai-Medium' },
      },
    },
  },
  motion: {
    tempo: 1.15,
    curve: 'standard',
    travel: 12,
    axis: 'side',
    settle: 'eased',
    stagger: 40,
    haptic: 'soft',
  },
  sign: 'rows',
  // A silver oak, tall and narrow, standing over the tea rows.
  perch: {
    shapes: [
      {
        el: 'path',
        attrs: { d: 'M178 162 V104 M178 128 L166 116 M178 118 L190 106', strokeWidth: W, ...round },
        stroke: 'ornament',
        fill: 'none',
      },
      {
        el: 'ellipse',
        attrs: { cx: 178, cy: 100, rx: 11, ry: 22, opacity: 0.4 },
        fill: 'ornament',
      },
      {
        el: 'path',
        attrs: {
          d: 'M30 156 q12 -8 24 0 q12 -8 24 0 q12 -8 24 0 q12 -8 24 0 q12 -8 24 0',
          strokeWidth: W,
          ...round,
        },
        stroke: 'lamp',
        fill: 'none',
      },
      {
        el: 'path',
        attrs: {
          d: 'M44 162 q10 -6 20 0 q10 -6 20 0 q10 -6 20 0 q10 -6 20 0',
          strokeWidth: W,
          opacity: 0.6,
          ...round,
        },
        stroke: 'lamp',
        fill: 'none',
      },
    ],
  },
  preferredMode: 'light',
  palette: {
    light: tokens({
      ground: '#EEF2E8',
      raised: '#F8FAF4',
      sunken: '#E2E9DA',
      ink: '#1E2A1C',
      inkSoft: '#435340',
      inkFaint: '#768672',
      lamp: '#3E7A3A',
      onLamp: '#F4FAF0',
      lampDeep: '#2E6430',
      glow: '#A9CFA0',
      ornament: '#6E8A50',
      danger: '#9C3424',
      onDanger: '#FFF8F0',
      success: '#3E7A3A',
      focus: '#2E6430',
    }),
    dark: tokens({
      ground: '#121A14',
      raised: '#1B251D',
      sunken: '#0C120E',
      ink: '#E6EFE0',
      inkSoft: '#B2C2AA',
      inkFaint: '#7E8E78',
      lamp: '#8FD08A',
      onLamp: '#0E2010',
      lampDeep: '#8FD08A',
      glow: '#8FD08A',
      ornament: '#6F8A5E',
      danger: '#F09A86',
      onDanger: '#2A0F08',
      success: '#8FD08A',
      focus: '#8FD08A',
    }),
  },
  style: {
    corner: { control: 999, surface: 16, chip: 999, field: 12 },
    primary: { fill: 'solid', doubleEdge: false, glow: false },
    quietForm: 'text',
    raised: { edge: 'hairline', shadow: false },
    field: 'underline',
    chip: 'underline',
    label: 'italic',
    lineWeight: 0.75,
    boundary: { dense: 'margin', calm: 'light' },
    ornament: 'rows',
  },
};
