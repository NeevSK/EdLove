export const SITE_URL = 'https://gurudevi.edlove.org';
export const SITE_NAME = 'Gurudevi';
export const SITE_TITLE = 'Gurudevi | Education Ecology Support System';
export const SITE_DESCRIPTION =
  'Gurudevi is an education ecology support system for teachers, schools, and institutions, centered on care, sanctuary, and healthy learning environments.';
export const SITE_KEYWORDS = [
  'Gurudevi',
  'education ecology',
  'teacher support',
  'Sri Lanka',
  'school support',
  'EdLove',
];

export const ORGANIZATION = {
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

export function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export function defaultOgImage(pathname = '/') {
  return absoluteUrl(`/og${pathname === '/' ? '' : pathname}.png`);
}
