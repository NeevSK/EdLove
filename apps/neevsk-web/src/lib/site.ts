export const SITE_URL = 'https://neevsk.edlove.org';
export const SITE_NAME = 'NeevSK';
export const SITE_TITLE = 'NeevSK | Existential Cyberneticist';
export const SITE_DESCRIPTION =
  'NeevSK is a personal knowledge, archive, and project surface exploring existential cybernetics, digital artifacts, and epistemic systems.';
export const SITE_KEYWORDS = [
  'NeevSK',
  'existential cybernetics',
  'archive',
  'projects',
  'knowledge systems',
  'EdLove',
];

export const PERSON = {
  name: 'NeevSK',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

export function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export function defaultOgImage(pathname = '/') {
  return absoluteUrl(`/og${pathname === '/' ? '' : pathname}.png`);
}
