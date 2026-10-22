/**
 * The six worlds Gurudevi ships.
 *
 * Each is a palette (light and dark) and a dozen style decisions. Colour lives
 * in the world; controls stay ink and paper, with one lit thing at a time.
 *
 * Cultural care: worlds borrow materials, colours and patterns (lime plaster,
 * a vine band, still water, brass). They never use sacred figures or scenes.
 */

import { mix } from './color';
import type { WorldDefinition, WorldId, WorldTokens } from './types';

type BaseTokens = Omit<WorldTokens, 'line'>;

function tokens(base: BaseTokens, lineAmount = 0.2): WorldTokens {
  return { ...base, line: mix(base.ground, base.ink, lineAmount) };
}

const sanctuary: WorldDefinition = {
  id: 'sanctuary',
  names: { en: 'Sanctuary', si: 'අභයභූමිය', ta: 'சரணாலயம்' },
  description: 'Washi paper and lamp light. The quiet default.',
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

const kandyan: WorldDefinition = {
  id: 'kandyan',
  names: { en: 'Temple walls', si: 'විහාර බිතු', ta: 'கோயில் சுவர்கள்' },
  description: 'Lime plaster and mural earth, with a vine band at the edge.',
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

const wewa: WorldDefinition = {
  id: 'wewa',
  names: { en: 'Wewa', si: 'වැව', ta: 'குளம்' },
  description: 'Still tank water and moonlight. Calm, cool, deep.',
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

const kele: WorldDefinition = {
  id: 'kele',
  names: { en: 'Forest canopy', si: 'කැලෑ වියන', ta: 'காட்டு விதானம்' },
  description: 'Backlit leaves and dark branches, looking up.',
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

const angampora: WorldDefinition = {
  id: 'angampora',
  names: { en: 'Angampora', si: 'අංගම්පොර', ta: 'அங்கம்பொற' },
  description: 'Packed earth and brass. Square, grounded, exact.',
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
    label: 'smallcaps',
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

const ratna: WorldDefinition = {
  id: 'ratna',
  names: { en: 'Gems and lace', si: 'මැණික් සහ බීරළු', ta: 'மாணிக்கமும் சரிகையும்' },
  description: 'Ivory, beeralu lace and one sapphire.',
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

export const WORLDS: Readonly<Record<WorldId, WorldDefinition>> = {
  sanctuary,
  kandyan,
  wewa,
  kele,
  angampora,
  ratna,
};

export const WORLD_IDS = Object.keys(WORLDS) as WorldId[];

export const DEFAULT_WORLD: WorldId = 'sanctuary';

export function isWorldId(value: unknown): value is WorldId {
  return typeof value === 'string' && value in WORLDS;
}
