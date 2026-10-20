export const dynamic = 'force-static';

export type OgTheme = 'dawn' | 'day' | 'dusk' | 'night';
export type OgLang = 'si' | 'ta' | 'en';

interface ThemeTokens {
  readonly bg: string;
  readonly cardBg: string;
  readonly border: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly accent: string;
  readonly glow: string;
  readonly badgeBg: string;
}

const THEMES: Record<OgTheme, ThemeTokens> = {
  day: {
    bg: '#FAF6EE',
    cardBg: '#FFFDF9',
    border: '#E8DDC6',
    textPrimary: '#1F1A14',
    textSecondary: '#665E50',
    accent: '#D4843A',
    glow: '#F6B73C',
    badgeBg: '#F3EAD7',
  },
  night: {
    bg: '#120F0C',
    cardBg: '#1C1712',
    border: '#332920',
    textPrimary: '#FBF5E8',
    textSecondary: '#A89B88',
    accent: '#E5984A',
    glow: '#FFCC3E',
    badgeBg: '#2B221A',
  },
  dawn: {
    bg: '#FFF6EA',
    cardBg: '#FFFAF2',
    border: '#F2DFCA',
    textPrimary: '#261E16',
    textSecondary: '#7A6B58',
    accent: '#DB7B3B',
    glow: '#FFB03B',
    badgeBg: '#F9E9D6',
  },
  dusk: {
    bg: '#1E1712',
    cardBg: '#2A2019',
    border: '#453429',
    textPrimary: '#FDF1E6',
    textSecondary: '#B8A394',
    accent: '#E28A4B',
    glow: '#FFA34D',
    badgeBg: '#3B2B21',
  },
};

const LINGUISTIC_STRINGS: Record<OgLang, { brand: string; tagline: string; category: string }> = {
  si: {
    brand: 'ගුරුදෙවි',
    tagline: 'සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම',
    category: 'අධ්‍යාපනික පරිසර පද්ධතිය සහ සුරක්ෂිත තෝතැන්න',
  },
  ta: {
    brand: 'குருதெவி',
    tagline: 'ஒருங்கிணைந்த கல்வியின் அமைதிச் சோலை',
    category: 'கல்விச் சூழலமைப்பு மற்றும் அமைதி மையம்',
  },
  en: {
    brand: 'Gurudevi',
    tagline: 'The Sanctuary of Integrated Education',
    category: 'Educational Ecology Support System & Sanctuary',
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

function formatSchoolLabel(slug: string | null): string {
  if (!slug || slug === 'default' || slug === 'gurudevi') {
    return 'SRI LANKA NATIONAL EDUCATION ECOLOGY';
  }
  return slug
    .split(/[-_]/)
    .map((w) => w.toUpperCase())
    .join(' ');
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const rawTheme = searchParams.get('theme') as OgTheme | null;
  const theme: OgTheme = rawTheme && THEMES[rawTheme] ? rawTheme : 'day';

  const rawLang = searchParams.get('lang') as OgLang | null;
  const lang: OgLang = rawLang && LINGUISTIC_STRINGS[rawLang] ? rawLang : 'si';

  const school = searchParams.get('school');
  const customTitle = searchParams.get('title');

  const palette = THEMES[theme];
  const { brand, tagline, category } = LINGUISTIC_STRINGS[lang];

  const mainTitle = customTitle ?? (school ? `${formatSchoolLabel(school)}` : brand);
  const subtitle = customTitle ? (school ? `${brand} • ${formatSchoolLabel(school)}` : tagline) : tagline;

  // Ultra-lightweight vector card: ~8KB total payload (strictly < 300KB WhatsApp drop threshold)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${escapeXml(mainTitle)}">
  <defs>
    <radialGradient id="radialAmbient" cx="80%" cy="20%" r="70%">
      <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.32" />
      <stop offset="60%" stop-color="${palette.accent}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="${palette.bg}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.cardBg}" />
      <stop offset="100%" stop-color="${palette.cardBg}" stop-opacity="0.94" />
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.18" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="1200" height="630" fill="${palette.bg}" />
  <rect width="1200" height="630" fill="url(#radialAmbient)" />

  <!-- Inner Sanctuary Frame Card -->
  <rect x="60" y="60" width="1080" height="510" rx="36" fill="url(#cardGrad)" stroke="${palette.border}" stroke-width="2" filter="url(#cardShadow)" />

  <!-- Header Domain Tag -->
  <g transform="translate(120, 120)">
    <rect x="0" y="0" width="380" height="40" rx="20" fill="${palette.badgeBg}" stroke="${palette.border}" stroke-width="1.2" />
    <circle cx="20" cy="20" r="5" fill="${palette.accent}" />
    <text x="36" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="${palette.accent}" letter-spacing="0.08em">
      ${escapeXml(school ? `${brand} • ${formatSchoolLabel(school)}` : `${brand} SANCTUARY`)}
    </text>
  </g>

  <!-- Luminous Firefly Emblem (Tutii) -->
  <g transform="translate(940, 100)">
    <!-- Outer Aura -->
    <circle cx="60" cy="60" r="64" fill="${palette.glow}" opacity="0.16" />
    <circle cx="60" cy="60" r="42" fill="${palette.glow}" opacity="0.32" />
    <circle cx="60" cy="60" r="22" fill="${palette.glow}" opacity="0.9" />
    <circle cx="60" cy="60" r="11" fill="#FFFFFF" />

    <!-- Organic Antennae / Arch Wings -->
    <path d="M 40 40 C 25 15, 60 5, 60 45" fill="none" stroke="${palette.accent}" stroke-width="3" stroke-linecap="round" />
    <path d="M 80 40 C 95 15, 60 5, 60 45" fill="none" stroke="${palette.accent}" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Main Headline Title -->
  <g transform="translate(120, 240)">
    <text x="0" y="60" font-family="'Playfair Display', Georgia, serif" font-size="64" font-weight="700" fill="${palette.textPrimary}">
      ${escapeXml(mainTitle)}
    </text>
  </g>

  <!-- Subtitle / Tagline -->
  <g transform="translate(120, 350)">
    <text x="0" y="40" font-family="'Noto Sans Sinhala', 'Noto Sans Tamil', -apple-system, sans-serif" font-size="28" font-weight="500" fill="${palette.textSecondary}">
      ${escapeXml(subtitle)}
    </text>
  </g>

  <!-- Footer Meta Ribbon -->
  <g transform="translate(120, 470)">
    <line x1="0" y1="0" x2="840" y2="0" stroke="${palette.border}" stroke-width="1.5" />
    <text x="0" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="600" fill="${palette.accent}">
      gurudevi.app
    </text>
    <text x="140" y="35" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="500" fill="${palette.textSecondary}">
      •  ${escapeXml(category)}
    </text>
  </g>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    },
  });
}
