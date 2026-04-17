export const SITE_URL = 'https://edlove.org';
export const SITE_NAME = 'EdLove';
export const SITE_TITLE = 'EdLove | The Educational Transformation Ecosystem';
export const SITE_DESCRIPTION =
  'EdLove is a digital sanctuary for educational transformation, connecting philosophy, Sri Lankan ground realities, Gurudevi, resources, community, and the epistemic core of education as care work.';
export const SITE_KEYWORDS = [
  'education',
  'education transformation',
  'Sri Lanka education',
  'edtech',
  'education as care work',
  'Gurudevi',
  'learning ecosystems',
  'educational philosophy'
];

export const ORGANIZATION = {
  name: 'EdLove',
  legalName: 'EdLove',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  email: 'hello@edlove.org',
  foundingDate: '2026',
  sameAs: [
    `${SITE_URL}/vision`,
    `${SITE_URL}/library`,
    `${SITE_URL}/resources`,
  ],
};

export function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export function defaultOgImage(pathname = '/') {
  return absoluteUrl(pathname === '/' ? '/favicon.svg' : '/favicon.svg');
}
