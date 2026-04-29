import { motif } from './motif';
import { ornament } from './ornament';
import { stage } from './stage';
import { surface } from './surface';
import type {
  TrubeExperienceMode,
  TrubeScorePlacementZone,
  TrubeScoreReviewState,
  TrubeScoreTextDensity,
  TrubeStageSpec,
} from './types';

export const TRUBE_SCORE_NAMES = [
  'goethe-night-study',
  'lotus-dawn',
  'branch-wind',
  'tidal-memory',
  'beethoven-dawn',
  'lotus-vigil',
  'shoreline-reverie',
  'vellum-prayer',
  'sanctuary-air',
] as const;

export type TrubeScoreName = (typeof TRUBE_SCORE_NAMES)[number];

export interface TrubeScorePreset {
  name: TrubeScoreName;
  label: string;
  description: string;
  experience: TrubeExperienceMode;
  emphasis: string;
  restraint: string;
  lineage: TrubeLineageRules;
  review: TrubeScoreReview;
  placement: TrubeScorePlacementRules;
  stage: TrubeStageSpec;
  rationale: string; // 2026 Mandate Requirement
}

export interface TrubeLineageRules {
  doctrine: string;
  dialect: string;
  temperament: string;
}

export interface TrubeScoreReview {
  state: TrubeScoreReviewState;
  approvedFor: string;
  note: string;
}

export interface TrubeScorePlacementRules {
  focalZone: TrubeScorePlacementZone;
  safeOverlayZone: TrubeScorePlacementZone;
  textDensity: TrubeScoreTextDensity;
  preferredUse: string;
  avoidUse: string;
}

export interface TrubeExperienceGuidance {
  mode: TrubeExperienceMode;
  label: string;
  description: string;
  usage: string;
}

export interface TrubeCanonicalScore {
  name: TrubeScoreName;
  role: string;
  rationale: string;
}

export interface TrubeScoreCollection {
  id: string;
  label: string;
  description: string;
  scores: TrubeScoreName[];
}

export const EXPERIENCE_GUIDANCE: Record<TrubeExperienceMode, TrubeExperienceGuidance> = {
  quiet: {
    mode: 'quiet',
    label: 'Quiet',
    description: 'Reserved, breathable, and built for long attention.',
    usage: 'Use under reading, forms, and screens where content must stay primary.',
  },
  ambient: {
    mode: 'ambient',
    label: 'Ambient',
    description: 'Living atmosphere with enough surprise to reward attention.',
    usage: 'Use for home surfaces, hero moments, and mood-carrying background layers.',
  },
  ceremonial: {
    mode: 'ceremonial',
    label: 'Ceremonial',
    description: 'A more authored performance for emotionally meaningful moments.',
    usage: 'Use sparingly for welcomes, transitions, rituals, or signature scenes.',
  },
};

export const GURUDEVI_CANONICAL_SCORES: TrubeCanonicalScore[] = [
  {
    name: 'lotus-dawn',
    role: 'Quiet awakening',
    rationale:
      'The default spiritual morning scene: warm, breathable, and suitable for reading-led surfaces.',
  },
  {
    name: 'goethe-night-study',
    role: 'Ambient depth',
    rationale:
      'The standard nocturnal atmosphere: rich enough to feel alive, restrained enough to stay behind content.',
  },
  {
    name: 'lotus-vigil',
    role: 'Ceremonial signature',
    rationale:
      'The first true signature scene for sacred or emotionally heightened moments inside Gurudevi.',
  },
];

export const TRUBE_SCORE_COLLECTIONS: TrubeScoreCollection[] = [
  {
    id: 'daily-rhythm',
    label: 'Daily Rhythm',
    description: 'Scenes for morning arrival, daytime openness, and nocturnal calm.',
    scores: ['lotus-dawn', 'shoreline-reverie', 'goethe-night-study'],
  },
  {
    id: 'sacred-ceremony',
    label: 'Sacred Ceremony',
    description: 'The most authored, spiritually concentrated offerings in the library.',
    scores: ['lotus-vigil', 'beethoven-dawn', 'vellum-prayer'],
  },
  {
    id: 'peripheral-air',
    label: 'Peripheral Air',
    description: 'Low-pressure edge atmospheres for settings, profile, and support surfaces.',
    scores: ['branch-wind', 'sanctuary-air', 'tidal-memory'],
  },
];

export const SCORE_PRESETS: Record<TrubeScoreName, TrubeScorePreset> = {
  'goethe-night-study': {
    name: 'goethe-night-study',
    label: 'Goethe Night Study',
    description: 'A deep, nocturnal atmosphere with subtle auroral drift and rich grain.',
    experience: 'ambient',
    emphasis: 'Atmospheric depth and nocturnal focus for calm attention.',
    restraint: 'Keep foreground elements light and breathable.',
    lineage: {
      doctrine: 'Nocturnal focus with depth.',
      dialect: 'Gurudevi nocturnal study.',
      temperament: 'Calm, deep, focused.',
    },
    review: {
      state: 'approved',
      approvedFor: 'All nocturnal surfaces',
      note: 'The standard for nocturnal depth.',
    },
    placement: {
      focalZone: 'centered',
      safeOverlayZone: 'upper-third',
      textDensity: 'moderate',
      preferredUse: 'Night mode backgrounds and focused reading areas.',
      avoidUse: 'High-energy daytime contexts.',
    },
    stage: stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 0.94,
          quality: 'balanced',
          surface: surface('aurora', {
            light: 'night',
            motion: 'gentle',
            intensity: 'balanced',
            grain: 'rich',
            alpha: 0.84,
          }),
        },
        {
          id: 'air',
          role: 'air',
          opacity: 0.28,
          quality: 'efficient',
          surface: surface('mist', {
            light: 'predawn',
            motion: 'gentle',
            intensity: 'subtle',
            grain: 'soft',
            alpha: 0.42,
          }),
        },
      ],
      '#121b28',
    ),
    rationale: 'Deep nocturnal focus with atmospheric depth for calm attention.',
  },
  'lotus-dawn': {
    name: 'lotus-dawn',
    label: 'Lotus Dawn',
    description: 'A bright, fresh morning scene with leaf warmth and misty clarity.',
    experience: 'quiet',
    emphasis: 'Breathable morning clarity for receptive states.',
    restraint: 'Use with high-contrast text and minimal UI overlays.',
    lineage: {
      doctrine: 'Morning receptivity with clarity.',
      dialect: 'Gurudevi morning awakening.',
      temperament: 'Fresh, bright, receptive.',
    },
    review: {
      state: 'approved',
      approvedFor: 'All morning surfaces',
      note: 'The primary morning anthem.',
    },
    placement: {
      focalZone: 'upper-third',
      safeOverlayZone: 'lower-third',
      textDensity: 'light',
      preferredUse: 'Morning arrivals and fresh starts.',
      avoidUse: 'Dense night-time focus sessions.',
    },
    stage: stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 0.92,
          quality: 'balanced',
          surface: surface('young-leaf', {
            light: 'morning',
            motion: 'gentle',
            intensity: 'balanced',
            grain: 'standard',
            alpha: 0.8,
          }),
        },
        {
          id: 'air',
          role: 'air',
          opacity: 0.24,
          quality: 'efficient',
          surface: surface('mist', {
            light: 'morning',
            motion: 'gentle',
            intensity: 'subtle',
            grain: 'soft',
            alpha: 0.38,
          }),
        },
      ],
      '#f2ead9',
    ),
    rationale: 'Breathable morning clarity for quiet awakening and receptive states.',
  },
  'branch-wind': {
    name: 'branch-wind',
    label: 'Branch Wind',
    description: 'A cooler sky-field with branch-like structural drift.',
    experience: 'ambient',
    emphasis: 'Directional motion and airy structure without stealing the whole screen.',
    restraint: 'Avoid stacking with dense cards or heavy shadows in the foreground.',
    lineage: {
      doctrine: 'Perimeter-led motion that leaves the center readable.',
      dialect: 'Gurudevi structural air and branchlike drift.',
      temperament: 'Alert, light, directional.',
    },
    review: {
      state: 'in-review',
      approvedFor: 'Settings and peripheral atmospheres',
      note: 'Promising for secondary surfaces, still under product fit review.',
    },
    placement: {
      focalZone: 'edge-weighted',
      safeOverlayZone: 'centered',
      textDensity: 'light',
      preferredUse: 'Profile or settings backgrounds where structure should stay at the periphery.',
      avoidUse: 'Layouts with too many floating elements competing at the edges.',
    },
    stage: stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 0.9,
          quality: 'balanced',
          surface: surface('mist', {
            light: 'midday',
            motion: 'gentle',
            intensity: 'balanced',
            grain: 'soft',
            alpha: 0.72,
          }),
        },
        {
          id: 'shimmer',
          role: 'shimmer',
          opacity: 0.18,
          quality: 'efficient',
          surface: surface('aurora', {
            light: 'dusk',
            motion: 'alive',
            intensity: 'subtle',
            grain: 'standard',
            alpha: 0.26,
          }),
        },
      ],
      '#dfe8ea',
    ),
    rationale: 'Directional perimeter motion for spatial alertness and peripheral air.',
  },
  'tidal-memory': {
    name: 'tidal-memory',
    label: 'Tidal Memory',
    description: 'Layered mist and aurora motion meant for waterline and shorelike compositions.',
    experience: 'quiet',
    emphasis: 'Low-tension flow for reflective surfaces and calm transitions.',
    restraint: 'Use when the product needs calmness, not drama or symbolic focus.',
    lineage: {
      doctrine: 'Slow transitional motion with low visual pressure.',
      dialect: 'Gurudevi reflective shoreline study.',
      temperament: 'Restful, open, drifting.',
    },
    review: {
      state: 'experimental',
      approvedFor: 'Exploration only',
      note: 'Hold for future transitional scenes after more device validation.',
    },
    placement: {
      focalZone: 'lower-third',
      safeOverlayZone: 'upper-third',
      textDensity: 'minimal',
      preferredUse:
        'Transitional surfaces, meditative pauses, and low-contrast reading environments.',
      avoidUse: 'Moments that need symbolic focus or strong emotional arrival.',
    },
    stage: stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 0.94,
          quality: 'balanced',
          surface: surface('mist', {
            light: 'golden-hour',
            motion: 'gentle',
            intensity: 'balanced',
            grain: 'soft',
            alpha: 0.76,
          }),
        },
        {
          id: 'air',
          role: 'air',
          opacity: 0.2,
          quality: 'efficient',
          surface: surface('aurora', {
            light: 'dusk',
            motion: 'alive',
            intensity: 'subtle',
            grain: 'rich',
            alpha: 0.22,
          }),
        },
      ],
      '#f0e3d1',
    ),
    rationale: 'Restful transitional flow for low-pressure reflective surfaces.',
  },
  'beethoven-dawn': {
    name: 'beethoven-dawn',
    label: 'Beethoven Dawn',
    description: 'A rising aurora ensemble with leaf warmth and ceremonial light.',
    experience: 'ceremonial',
    emphasis: 'Expansive arrival energy, meant to feel like a first movement opening.',
    restraint:
      'Reserve for launches, welcomes, and hero canvases rather than dense utility screens.',
    lineage: {
      doctrine: 'Heroic opening with controlled ceremonial lift.',
      dialect: 'Gurudevi dawn grandeur.',
      temperament: 'Rising, luminous, declarative.',
    },
    review: {
      state: 'in-review',
      approvedFor: 'High ceremony welcomes',
      note: 'Visually strong but still needs restraint checks in product context.',
    },
    placement: {
      focalZone: 'upper-third',
      safeOverlayZone: 'lower-third',
      textDensity: 'minimal',
      preferredUse: 'Opening ceremonies, first-run moments, and flagship entry canvases.',
      avoidUse: 'Compact utilities, nested sheets, or form-heavy contexts.',
    },
    stage: stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 0.96,
          quality: 'cinematic',
          surface: surface('aurora', {
            light: 'golden-hour',
            motion: 'alive',
            intensity: 'vivid',
            grain: 'rich',
            alpha: 0.88,
          }),
        },
        {
          id: 'air',
          role: 'air',
          opacity: 0.3,
          quality: 'balanced',
          surface: surface('mist', {
            light: 'morning',
            motion: 'gentle',
            intensity: 'balanced',
            grain: 'soft',
            alpha: 0.4,
          }),
        },
        {
          id: 'shimmer',
          role: 'shimmer',
          opacity: 0.2,
          quality: 'efficient',
          surface: surface('young-leaf', {
            light: 'morning',
            motion: 'alive',
            intensity: 'subtle',
            grain: 'standard',
            alpha: 0.28,
          }),
        },
      ],
      '#f4e2c5',
    ),
    rationale: 'Ceremonial arrival energy for flagship entry canvases and expansive welcomes.',
  },
  'lotus-vigil': {
    name: 'lotus-vigil',
    label: 'Lotus Vigil',
    description:
      'A dark contemplative chamber with drafted lotus geometry and subtle constellations.',
    experience: 'ceremonial',
    emphasis: 'A meditative focal scene with stillness at the center and fine detail at the edge.',
    restraint:
      'Pair with low-density layouts and a limited text hierarchy so the vigil can breathe.',
    lineage: {
      doctrine: 'Sacred focus with low-density interface framing.',
      dialect: 'Gurudevi liturgical stillness.',
      temperament: 'Contemplative, solemn, concentrated.',
    },
    review: {
      state: 'approved',
      approvedFor: 'Gurudevi lineage standard',
      note: 'Approved as the signature ceremonial scene.',
    },
    placement: {
      focalZone: 'centered',
      safeOverlayZone: 'lower-third',
      textDensity: 'minimal',
      preferredUse:
        'Sacred pauses, milestone completions, and moments where the interface should feel almost liturgical.',
      avoidUse: 'Transactional tasks, multi-card dashboards, or strong competing iconography.',
    },
    stage: stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 0.96,
          quality: 'balanced',
          surface: surface('aurora', {
            light: 'night',
            motion: 'gentle',
            intensity: 'balanced',
            grain: 'rich',
            alpha: 0.86,
          }),
        },
        {
          id: 'air',
          role: 'air',
          opacity: 0.22,
          quality: 'efficient',
          surface: surface('mist', {
            light: 'predawn',
            motion: 'still',
            intensity: 'subtle',
            grain: 'soft',
            alpha: 0.3,
          }),
        },
      ],
      '#101723',
    ),
    rationale: 'Sacred focus and contemplative stillness for milestone arrivals.',
  },
  'shoreline-reverie': {
    name: 'shoreline-reverie',
    label: 'Shoreline Reverie',
    description: 'A brighter coastal study with slow tide motion and airy branchlike detail.',
    experience: 'ambient',
    emphasis: 'Open, breathable space that still rewards attention at the edges.',
    restraint: 'Keep supporting UI tonal and avoid pairing with loud accent gradients.',
    lineage: {
      doctrine: 'Open spatial field with edge reward.',
      dialect: 'Gurudevi afternoon coastal air.',
      temperament: 'Fresh, lucid, spacious.',
    },
    review: {
      state: 'in-review',
      approvedFor: 'Afternoon home surfaces',
      note: 'Strong candidate for daytime home screens pending broader usage tests.',
    },
    placement: {
      focalZone: 'lower-third',
      safeOverlayZone: 'upper-third',
      textDensity: 'moderate',
      preferredUse: 'Afternoon home surfaces and open layouts with spacious headers.',
      avoidUse: 'Dense tabular content or screens that already rely on vivid accent colors.',
    },
    stage: stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 0.94,
          quality: 'balanced',
          surface: surface('mist', {
            light: 'midday',
            motion: 'gentle',
            intensity: 'balanced',
            grain: 'soft',
            alpha: 0.78,
          }),
        },
        {
          id: 'air',
          role: 'air',
          opacity: 0.24,
          quality: 'efficient',
          surface: surface('young-leaf', {
            light: 'golden-hour',
            motion: 'gentle',
            intensity: 'subtle',
            grain: 'standard',
            alpha: 0.3,
          }),
        },
      ],
      '#edf0e8',
    ),
    rationale: 'Open spatial field with edge rewards for daytime home surfaces.',
  },
  'vellum-prayer': {
    name: 'vellum-prayer',
    label: 'Vellum Prayer',
    description: 'Soft vellum-like warmth with filigree breath and restrained lotus draftsmanship.',
    experience: 'quiet',
    emphasis:
      'Paperlike calm with enough authored detail to feel devotional rather than decorative.',
    restraint:
      'Use with very light interface chrome and avoid loud accents, strong borders, or dense utility bars.',
    lineage: {
      doctrine: 'Quiet material depth with almost tactile softness.',
      dialect: 'Gurudevi vellum warmth and drafted prayerful stillness.',
      temperament: 'Tender, intimate, hushed.',
    },
    review: {
      state: 'in-review',
      approvedFor: 'Reading sanctuaries and devotional cards',
      note: 'A strong quiet offering that needs real-world readability checks with long-form content.',
    },
    placement: {
      focalZone: 'centered',
      safeOverlayZone: 'lower-third',
      textDensity: 'minimal',
      preferredUse: 'Reading entry points, sacred notes, and reflective single-column surfaces.',
      avoidUse:
        'Notification-heavy screens or layouts with multiple competing call-to-action groups.',
    },
    stage: stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 0.92,
          quality: 'balanced',
          surface: surface('mist', {
            light: 'morning',
            motion: 'gentle',
            intensity: 'subtle',
            grain: 'soft',
            alpha: 0.72,
          }),
        },
        {
          id: 'air',
          role: 'air',
          opacity: 0.26,
          quality: 'efficient',
          surface: surface('young-leaf', {
            light: 'golden-hour',
            motion: 'still',
            intensity: 'subtle',
            grain: 'standard',
            alpha: 0.26,
          }),
        },
      ],
      '#efe5d3',
    ),
    rationale: 'Tactile paperlike calm for reading sanctuaries and devotional spaces.',
  },
  'sanctuary-air': {
    name: 'sanctuary-air',
    label: 'Sanctuary Air',
    description:
      'A peripheral atmospheric field with cool mist and slight aurora lift for support screens.',
    experience: 'ambient',
    emphasis:
      'Breath at the edges, openness in the center, and enough motion to keep utility screens from feeling sterile.',
    restraint:
      'Keep the center clear and do not add competing central illustrations or high-density overlays.',
    lineage: {
      doctrine: 'Periphery motion with operational calm.',
      dialect: 'Gurudevi support-surface airiness.',
      temperament: 'Open, light, unobtrusive.',
    },
    review: {
      state: 'in-review',
      approvedFor: 'Profile, settings, and support surfaces',
      note: 'A practical offering that still needs validation across lower-end devices and denser layouts.',
    },
    placement: {
      focalZone: 'edge-weighted',
      safeOverlayZone: 'centered',
      textDensity: 'moderate',
      preferredUse:
        'Operational screens that still deserve atmosphere, especially settings and profile areas.',
      avoidUse: 'Hero landings, ceremonial moments, or sacred focus scenes.',
    },
    stage: stage(
      [
        {
          id: 'body',
          role: 'body',
          opacity: 0.9,
          quality: 'balanced',
          surface: surface('mist', {
            light: 'predawn',
            motion: 'gentle',
            intensity: 'balanced',
            grain: 'soft',
            alpha: 0.74,
          }),
        },
        {
          id: 'shimmer',
          role: 'shimmer',
          opacity: 0.16,
          quality: 'efficient',
          surface: surface('aurora', {
            light: 'morning',
            motion: 'gentle',
            intensity: 'subtle',
            grain: 'standard',
            alpha: 0.24,
          }),
        },
      ],
      '#dfe5e6',
    ),
    rationale: 'Operational atmospheric calm for settings and support surfaces.',
  },
};

export function getScorePreset(name: TrubeScoreName): TrubeScorePreset {
  return SCORE_PRESETS[name];
}

export function getScoresForExperience(mode: TrubeExperienceMode): TrubeScorePreset[] {
  return TRUBE_SCORE_NAMES.map((name) => SCORE_PRESETS[name]).filter(
    (score) => score.experience === mode,
  );
}

export function getExperienceGuidance(mode: TrubeExperienceMode): TrubeExperienceGuidance {
  return EXPERIENCE_GUIDANCE[mode];
}

export function getCanonicalScores(): TrubeCanonicalScore[] {
  return GURUDEVI_CANONICAL_SCORES;
}

export function getScoreCollections(): TrubeScoreCollection[] {
  return TRUBE_SCORE_COLLECTIONS;
}

export function getCollectionScores(collectionId: string): TrubeScorePreset[] {
  const collection = TRUBE_SCORE_COLLECTIONS.find((item) => item.id === collectionId);
  if (!collection) {
    return [];
  }

  return collection.scores.map((name) => SCORE_PRESETS[name]);
}

export function getScoresByReviewState(state: TrubeScoreReviewState): TrubeScorePreset[] {
  return TRUBE_SCORE_NAMES.map((name) => SCORE_PRESETS[name]).filter(
    (score) => score.review.state === state,
  );
}

export function getProductionReadyScores(): TrubeScorePreset[] {
  return getScoresByReviewState('approved');
}

export function getScoreExtras(name: TrubeScoreName) {
  switch (name) {
    case 'beethoven-dawn':
      return {
        ornament: ornament('filigree', { seed: 43, density: 0.62, opacity: 0.34 }),
        motif: motif('branch-flow', { seed: 47, density: 0.52, opacity: 0.32, style: 'luminous' }),
      };
    case 'goethe-night-study':
      return {
        ornament: ornament('constellation', { seed: 31, density: 0.7, opacity: 0.58 }),
        motif: motif('lotus-sketch', { seed: 29, density: 0.54, opacity: 0.5, style: 'luminous' }),
      };
    case 'lotus-dawn':
      return {
        ornament: ornament('filigree', { seed: 13, density: 0.46, opacity: 0.34 }),
        motif: motif('lotus-sketch', { seed: 17, density: 0.6, opacity: 0.38, style: 'draft' }),
      };
    case 'branch-wind':
      return {
        ornament: ornament('vein', { seed: 23, density: 0.44, opacity: 0.26 }),
        motif: motif('branch-flow', { seed: 19, density: 0.58, opacity: 0.34, style: 'ink' }),
      };
    case 'lotus-vigil':
      return {
        ornament: ornament('constellation', { seed: 53, density: 0.42, opacity: 0.26 }),
        motif: motif('lotus-sketch', { seed: 59, density: 0.66, opacity: 0.42, style: 'ink' }),
      };
    case 'shoreline-reverie':
      return {
        ornament: ornament('vein', { seed: 61, density: 0.3, opacity: 0.18 }),
        motif: motif('tide-lines', { seed: 67, density: 0.64, opacity: 0.24, style: 'draft' }),
      };
    case 'sanctuary-air':
      return {
        ornament: ornament('vein', { seed: 71, density: 0.22, opacity: 0.16 }),
        motif: motif('branch-flow', { seed: 73, density: 0.36, opacity: 0.2, style: 'draft' }),
      };
    case 'vellum-prayer':
      return {
        ornament: ornament('filigree', { seed: 79, density: 0.38, opacity: 0.26 }),
        motif: motif('lotus-sketch', { seed: 83, density: 0.48, opacity: 0.24, style: 'draft' }),
      };
    default:
      return {
        ornament: ornament('constellation', { seed: 37, density: 0.24, opacity: 0.18 }),
        motif: motif('tide-lines', { seed: 41, density: 0.72, opacity: 0.28, style: 'draft' }),
      };
  }
}
