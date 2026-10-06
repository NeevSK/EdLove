import { authors, journalEntries } from './(marketing)/(editorial)/content';

export const SITE_URL = 'https://gurudevi.app';
export const SITE_NAME = 'Gurudevi';
export const SITE_DESCRIPTION =
  'Gurudevi is an education ecology support system and sanctuary for education in Sri Lanka, supporting teachers, students, schools, families, and communities.';

export const SUPPORT_EMAIL = 'support@gurudevi.app';
export const INSTITUTIONAL_EMAIL = 'institutional@gurudevi.app';
export const GRATITUDE_EMAIL = 'gratitude@gurudevi.app';

export const publicPaths = [
  '/',
  '/about',
  '/faq',
  '/thuthimal',
  '/privacy',
  '/terms',
  '/delete-account',
  '/support',
  '/journal',
  ...authors.map((author) => `/authors/${author.id}`),
  ...journalEntries.map((entry) => `/journal/${entry.slug}`),
] as const;

export function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}
