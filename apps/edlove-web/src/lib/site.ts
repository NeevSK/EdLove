export const SITE_URL = 'https://edlove.org';
export const SITE_NAME = 'EdLove';
export const SITE_TITLE = 'EdLove Foundation | The Education Constellation';
export const SITE_DESCRIPTION =
  'EdLove is a not-for-profit, non-governmental organisation contributing to education in an honest, truthful manner: giving love to the next generation, for flourishing in their environment and developing themselves.';
export const SITE_KEYWORDS = [
  'EdLove',
  'EdLove Foundation',
  'EdResearch',
  'EdCare',
  'EdKind',
  'EdLife',
  'EdTech',
  'Gurudevi',
  'Intuitui Labs',
  'Sri Lanka education',
  'critical realism',
  'process philosophy',
  'conviviality',
  'teaning',
];

export const CONSTELLATION = {
  foundation: {
    name: 'EdLove Foundation',
    status: 'Not-for-profit, non-governmental; registration pending',
    vision: 'Contributing to education in an honest, truthful manner',
    meaning: 'Ed + Love = Education + Love',
    definitionOfEducation:
      'Giving love to the next generation, for flourishing in their environment and developing themselves',
    path: '/foundation',
  },
  arms: [
    {
      id: 'research',
      name: 'EdResearch',
      tagline: 'Two orders: research on education, and research on education research',
      path: '/research',
    },
    {
      id: 'care',
      name: 'EdCare',
      tagline: 'Outward giving: EdKind (material support) and EdLife (human development)',
      path: '/care',
    },
    {
      id: 'tech',
      name: 'EdTech',
      tagline:
        'Technology in education: the Global EdTech Atlas and Gurudevi, built with Intuitui Labs',
      path: '/tech',
    },
  ],
  builder: {
    name: 'Intuitui Labs',
    url: 'https://intuituilabs.studio',
    relationship: 'Builder of Gurudevi; technical and analytical support for EdResearch',
    canonicalPhrasing: 'Gurudevi, an EdLove initiative, built by Intuitui Labs.',
  },
};

export interface NavLink {
  name: string;
  href: string;
  badge?: string;
}

export const MAIN_NAV_LINKS: NavLink[] = [
  { name: 'Foundation', href: '/foundation' },
  { name: 'EdResearch', href: '/research' },
  { name: 'EdCare', href: '/care' },
  { name: 'EdTech', href: '/tech' },
  { name: 'Journal', href: '/journal' },
];

export const ORGANIZATION = {
  name: 'EdLove Foundation',
  legalName: 'EdLove Foundation',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  email: 'hello@edlove.org',
  foundingDate: '2026',
  sameAs: [
    `${SITE_URL}/foundation`,
    `${SITE_URL}/about`,
    `${SITE_URL}/team`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/research`,
    `${SITE_URL}/care`,
    `${SITE_URL}/tech`,
    'https://gurudevi.app',
    'https://intuituilabs.studio',
    'https://neevsk.intuituilabs.studio/v1',
  ],
};

export function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export function canonicalUrl(pathname: string) {
  const normalizedPath = pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}`;
  return absoluteUrl(normalizedPath);
}

export function defaultOgImage(pathname = '/') {
  return absoluteUrl('/og-image.svg');
}
