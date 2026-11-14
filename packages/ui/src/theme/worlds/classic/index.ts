import type { WorldDefinition } from '../../types';
import { INTER, NOTO_SANS_SI, NOTO_SANS_TA } from '../shared/faces';
import { round, W } from '../shared/perch';
import { tokens } from '../tokens';

/**
 * Classic: the plain, familiar app. One sans face (Inter with the Noto Sinhala
 * and Tamil sans, all core fonts, so nothing extra loads), neutral ground, a
 * solid primary, boxed fields and no scene behind the rooms. For people who
 * want Gurudevi to look like a normal app, and the lightest world on a floor phone.
 */
export const classic: WorldDefinition = {
  id: 'classic',
  names: { en: 'Classic', si: 'සම්භාව්‍ය', ta: 'வழக்கமான' },
  description: 'A plain, familiar app. Clear, neutral, nothing in the way.',
  family: 'quiet',
  faces: {
    serif: INTER,
    sans: INTER,
    si: { serif: NOTO_SANS_SI, sans: NOTO_SANS_SI },
    ta: { serif: NOTO_SANS_TA, sans: NOTO_SANS_TA },
  },
  motion: {
    tempo: 0.9,
    curve: 'standard',
    travel: 6,
    axis: 'up',
    settle: 'none',
    stagger: 0,
    haptic: 'crisp',
  },
  sign: 'dots',
  // A plain dot on a line: the quietest perch.
  perch: {
    shapes: [
      {
        el: 'path',
        attrs: { d: 'M70 148 L150 148', strokeWidth: W, ...round },
        stroke: 'ornament',
        fill: 'none',
      },
      { el: 'ellipse', attrs: { cx: 110, cy: 136, rx: 7, ry: 7 }, fill: 'lamp' },
    ],
  },
  preferredMode: 'light',
  floor: 'plain',
  palette: {
    light: tokens({
      ground: '#F6F7F9',
      raised: '#FFFFFF',
      sunken: '#ECEEF2',
      ink: '#15181D',
      inkSoft: '#434A55',
      inkFaint: '#646B76',
      lamp: '#2F5BD3',
      onLamp: '#FFFFFF',
      lampDeep: '#2448B0',
      glow: '#A9C0F5',
      ornament: '#3A3F47',
      danger: '#B3261E',
      onDanger: '#FFFFFF',
      success: '#2E7D32',
      focus: '#2448B0',
    }),
    dark: tokens({
      ground: '#121417',
      raised: '#1B1E23',
      sunken: '#0C0E10',
      ink: '#ECEEF1',
      inkSoft: '#B8BEC7',
      inkFaint: '#8E95A0',
      lamp: '#8AB4F8',
      onLamp: '#0B1A3A',
      lampDeep: '#A8C7FA',
      glow: '#8AB4F8',
      ornament: '#8E95A0',
      danger: '#F2B8B5',
      onDanger: '#3A0B08',
      success: '#81C995',
      focus: '#A8C7FA',
    }),
  },
  style: {
    corner: { control: 12, surface: 16, chip: 8, field: 10 },
    primary: { fill: 'solid', doubleEdge: false, glow: false },
    quietForm: 'outlined',
    raised: { edge: 'hairline', shadow: true },
    field: 'box',
    chip: 'outlined',
    label: 'boldcaps',
    lineWeight: 1,
    boundary: { dense: 'margin', calm: 'boxes' },
    ornament: 'hairline',
    material: {
      light: 'none',
      grain: 0,
      temperature: 0,
      shadow: 'neutral',
      detail: 'sparse',
      response: 'quiet',
    },
  },
};
