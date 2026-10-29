/**
 * The typefaces each world is written in, and how each one moves.
 *
 * Every name is an embedded font (apps/gurudevi-mobile/app.json, expo-font
 * plugin) whose file name and PostScript name match, built from google/fonts
 * by scripts/fonts/build-world-fonts.py. Variable faces take their weight
 * from the `wght` axis, so a world can sit between the usual steps (Sanctuary
 * reads at 380, not 400). Static faces name one file per weight.
 *
 * Sinhala and Tamil always have a face of their own, chosen to match the
 * world's voice; the Noto families are the fallback every world shares.
 */

import type {
  FaceSpec,
  FontWeight,
  WorldFaces,
  WorldId,
  WorldLanguage,
  WorldMotion,
} from './types';

const STEPS: Record<FontWeight, number> = { '400': 400, '500': 500, '600': 600, '700': 700 };

function variable(upright: string, extra: Partial<FaceSpec> = {}): FaceSpec {
  return { upright, weights: STEPS, ...extra };
}

const NOTO_SERIF_SI = variable('NotoSerifSinhala-VF');
const NOTO_SANS_SI = variable('NotoSansSinhala-VF');
const NOTO_SERIF_TA = variable('NotoSerifTamil-VF');
const NOTO_SANS_TA = variable('NotoSansTamil-VF');

const INTER = variable('Inter-VF', { optical: [14, 32] });
const CATAMARAN = variable('Catamaran-VF', {
  weights: { '400': 420, '500': 520, '600': 640, '700': 740 },
});

export const FACES: Readonly<Record<WorldId, WorldFaces>> = {
  sanctuary: {
    serif: variable('Newsreader-VF', {
      italic: 'Newsreader-Italic-VF',
      weights: { '400': 380, '500': 460, '600': 560, '700': 640 },
      optical: [6, 72],
    }),
    sans: INTER,
    si: { serif: NOTO_SERIF_SI, sans: NOTO_SANS_SI },
    ta: { serif: NOTO_SERIF_TA, sans: NOTO_SANS_TA },
  },
  wewa: {
    serif: variable('Fraunces-VF', {
      italic: 'Fraunces-Italic-VF',
      weights: { '400': 360, '500': 440, '600': 540, '700': 620 },
      optical: [9, 144],
      axes: { SOFT: 40 },
      nightAxes: { SOFT: 100 },
    }),
    sans: INTER,
    si: { serif: NOTO_SANS_SI, sans: NOTO_SANS_SI },
    ta: { serif: NOTO_SANS_TA, sans: NOTO_SANS_TA },
  },
  ratna: {
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
  kele: {
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
  tea: {
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
  kandyan: {
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
  angampora: {
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
  perahera: {
    serif: variable('Yaldevi-VF', { weights: { '400': 460, '500': 540, '600': 620, '700': 700 } }),
    sans: CATAMARAN,
    si: {
      serif: variable('Yaldevi-VF', {
        weights: { '400': 460, '500': 540, '600': 620, '700': 700 },
      }),
      sans: variable('Yaldevi-VF', { weights: { '400': 420, '500': 500, '600': 600, '700': 680 } }),
    },
    ta: { serif: CATAMARAN, sans: CATAMARAN },
  },
  rosa: {
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
  colombo: {
    serif: variable('SpaceGrotesk-VF', {
      weights: { '400': 420, '500': 480, '600': 560, '700': 640 },
    }),
    sans: variable('IBMPlexSans-Regular', { axes: { wdth: 92 } }),
    si: { serif: NOTO_SANS_SI, sans: NOTO_SANS_SI },
    ta: { serif: NOTO_SANS_TA, sans: NOTO_SANS_TA },
  },
  spark: {
    // Anybody ships as its italic only: the slant is the world. Titles stretch wider after dark.
    serif: variable('Anybody-Italic-VF', {
      weights: { '400': 640, '500': 720, '600': 800, '700': 860 },
      axes: { wdth: 122 },
      nightAxes: { wdth: 150 },
    }),
    sans: variable('Inter-VF', {
      optical: [14, 32],
      weights: { '400': 420, '500': 520, '600': 640, '700': 760 },
    }),
    si: {
      serif: variable('NotoSansSinhala-Width-VF', {
        axes: { wdth: 82 },
        weights: { '400': 600, '500': 660, '600': 720, '700': 800 },
      }),
      sans: variable('NotoSansSinhala-Width-VF', { axes: { wdth: 90 } }),
    },
    ta: {
      serif: variable('NotoSansTamil-Width-VF', {
        axes: { wdth: 82 },
        weights: { '400': 600, '500': 660, '600': 720, '700': 800 },
      }),
      sans: variable('NotoSansTamil-Width-VF', { axes: { wdth: 90 } }),
    },
  },
};

/** How each world moves; see `WorldMotion` and docs/Core/design/2026-10-26-world-model.md. */
export const MOTION: Readonly<Record<WorldId, WorldMotion>> = {
  sanctuary: {
    tempo: 1,
    curve: 'decelerate',
    travel: 8,
    axis: 'up',
    settle: 'none',
    stagger: 0,
    haptic: 'soft',
  },
  wewa: {
    tempo: 1.25,
    curve: 'decelerate',
    travel: 6,
    axis: 'up',
    settle: 'eased',
    stagger: 0,
    haptic: 'soft',
  },
  ratna: {
    tempo: 1.1,
    curve: 'decelerate',
    travel: 4,
    axis: 'up',
    settle: 'none',
    stagger: 0,
    haptic: 'soft',
  },
  kele: {
    tempo: 1,
    curve: 'spring',
    travel: 10,
    axis: 'up',
    settle: 'overshoot',
    stagger: 30,
    haptic: 'soft',
  },
  tea: {
    tempo: 1.15,
    curve: 'standard',
    travel: 12,
    axis: 'side',
    settle: 'eased',
    stagger: 40,
    haptic: 'soft',
  },
  kandyan: {
    tempo: 1.1,
    curve: 'decelerate',
    travel: 0,
    axis: 'none',
    settle: 'eased',
    stagger: 0,
    haptic: 'crisp',
  },
  angampora: {
    tempo: 0.85,
    curve: 'sharp',
    travel: 12,
    axis: 'up',
    settle: 'none',
    stagger: 0,
    haptic: 'crisp',
  },
  perahera: {
    tempo: 0.9,
    curve: 'standard',
    travel: 10,
    axis: 'up',
    settle: 'overshoot',
    stagger: 60,
    haptic: 'crisp',
  },
  rosa: {
    tempo: 1.2,
    curve: 'spring',
    travel: 6,
    axis: 'up',
    settle: 'overshoot',
    stagger: 30,
    haptic: 'soft',
  },
  colombo: {
    tempo: 0.9,
    curve: 'standard',
    travel: 16,
    axis: 'side',
    settle: 'none',
    stagger: 0,
    haptic: 'crisp',
  },
  spark: {
    tempo: 0.75,
    curve: 'spring',
    travel: 20,
    axis: 'side',
    settle: 'overshoot',
    stagger: 40,
    haptic: 'crisp',
  },
};

function namesOf(face: FaceSpec): string[] {
  const names = [face.upright, ...(face.italic ? [face.italic] : [])];
  for (const w of Object.values(face.weights)) if (typeof w === 'string') names.push(w);
  return names;
}

/** Every font file a world draws with, for one language (what the web must load). */
export function fontNamesOf(world: WorldId, lang: WorldLanguage): string[] {
  const f = FACES[world];
  const faces =
    lang === 'si' || lang === 'ta'
      ? [f.serif, f.sans, f[lang].serif, f[lang].sans]
      : [f.serif, f.sans];
  return [...new Set(faces.flatMap(namesOf))];
}
