export const dynamic = 'force-static';

export type BadgeTheme = 'dawn' | 'day' | 'dusk' | 'night';
export type BadgeLang = 'si' | 'ta' | 'en';

interface ThemePalette {
  readonly bg: string;
  readonly border: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly accent: string;
  readonly glow: string;
  readonly chipBg: string;
}

const PALETTES: Record<BadgeTheme, ThemePalette> = {
  day: {
    bg: '#FFFDF7',
    border: '#E8DEC8',
    textPrimary: '#1E1A15',
    textSecondary: '#6B6455',
    accent: '#D4843A',
    glow: '#F5BA42',
    chipBg: '#F5EFE0',
  },
  night: {
    bg: '#15120E',
    border: '#2E261D',
    textPrimary: '#FAF3E3',
    textSecondary: '#A39785',
    accent: '#E5984A',
    glow: '#FFCA3A',
    chipBg: '#241E17',
  },
  dawn: {
    bg: '#FFF8EE',
    border: '#F0DEC5',
    textPrimary: '#241C14',
    textSecondary: '#786854',
    accent: '#D97736',
    glow: '#FFAA33',
    chipBg: '#F7E7D0',
  },
  dusk: {
    bg: '#221A15',
    border: '#3D2E24',
    textPrimary: '#FCEFE3',
    textSecondary: '#B39E8F',
    accent: '#E08544',
    glow: '#FF9E44',
    chipBg: '#33251D',
  },
};

const CANONICAL_TAGLINES: Record<BadgeLang, { brand: string; tagline: string }> = {
  si: {
    brand: 'ගුරුදෙවි',
    tagline: 'සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම',
  },
  ta: {
    brand: 'குருதெவி',
    tagline: 'ஒருங்கிணைந்த கல்வியின் அமைதிச் சோலை',
  },
  en: {
    brand: 'Gurudevi',
    tagline: 'Sanctuary of Integrated Education',
  },
};

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatSchoolName(handle: string): string {
  if (!handle || handle === 'default' || handle === 'gurudevi') {
    return 'National Educational Ecology';
  }
  return handle
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const rawTheme = searchParams.get('theme') as BadgeTheme | null;
  const theme: BadgeTheme = rawTheme && PALETTES[rawTheme] ? rawTheme : 'day';

  const rawLang = searchParams.get('lang') as BadgeLang | null;
  const lang: BadgeLang = rawLang && CANONICAL_TAGLINES[rawLang] ? rawLang : 'si';

  const schoolParam = searchParams.get('school') ?? searchParams.get('inst') ?? 'gurudevi';
  const schoolLabel = formatSchoolName(schoolParam);

  const palette = PALETTES[theme];
  const { brand, tagline } = CANONICAL_TAGLINES[lang];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 140" width="520" height="140" role="img" aria-label="${escapeXml(brand)} - ${escapeXml(schoolLabel)}">
  <defs>
    <linearGradient id="sanctuaryGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.28" />
      <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0.04" />
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.14" />
    </filter>
  </defs>

  <!-- Badge Container Frame -->
  <rect x="2" y="2" width="516" height="136" rx="20" fill="${palette.bg}" stroke="${palette.border}" stroke-width="1.5" filter="url(#softShadow)" />
  <rect x="6" y="6" width="508" height="128" rx="16" fill="url(#sanctuaryGlow)" />

  <!-- Sacred Arch & Firefly Emblem -->
  <g transform="translate(24, 26)">
    <!-- Arch Gateway -->
    <path d="M 12 76 C 12 36, 32 12, 44 12 C 56 12, 76 36, 76 76" fill="none" stroke="${palette.accent}" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 22 76 C 22 46, 36 26, 44 26 C 52 26, 66 46, 66 76" fill="none" stroke="${palette.border}" stroke-width="1.2" stroke-linecap="round" opacity="0.7" />
    
    <!-- Tutii Luminous Spark -->
    <circle cx="44" cy="46" r="14" fill="${palette.glow}" opacity="0.25" />
    <circle cx="44" cy="46" r="7" fill="${palette.glow}" opacity="0.85" />
    <circle cx="44" cy="46" r="3.5" fill="#FFFFFF" />

    <!-- Organic Sprout Foundation -->
    <path d="M 32 76 Q 44 68 56 76" stroke="${palette.accent}" stroke-width="2" stroke-linecap="round" fill="none" />
  </g>

  <!-- School Hierarchy Badge & Details -->
  <g transform="translate(122, 28)">
    <!-- Institutional Pill -->
    <rect x="0" y="0" width="220" height="22" rx="11" fill="${palette.chipBg}" stroke="${palette.border}" stroke-width="0.8" />
    <circle cx="10" cy="11" r="3.5" fill="${palette.accent}" />
    <text x="20" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="${palette.accent}" letter-spacing="0.04em">
      ${escapeXml(schoolLabel.toUpperCase())}
    </text>

    <!-- Brand Name (Short-Vowel Gurudevi) -->
    <text x="0" y="52" font-family="'Playfair Display', Georgia, serif" font-size="23" font-weight="700" fill="${palette.textPrimary}">
      ${escapeXml(brand)}
    </text>

    <!-- Canonical Tagline -->
    <text x="0" y="76" font-family="'Noto Sans Sinhala', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, sans-serif" font-size="13.5" font-weight="500" fill="${palette.textSecondary}">
      ${escapeXml(tagline)}
    </text>
  </g>

  <!-- Verified Convivial Seal -->
  <g transform="translate(430, 24)">
    <circle cx="28" cy="28" r="22" fill="${palette.chipBg}" stroke="${palette.border}" stroke-width="1" />
    <path d="M 21 28 L 26 33 L 36 22" fill="none" stroke="${palette.accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    <text x="28" y="66" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="600" fill="${palette.textSecondary}" letter-spacing="0.06em">
      SANCTUARY
    </text>
  </g>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
