import { authors, journalEntries } from './(marketing)/(editorial)/content';

export const SITE_URL = 'https://gurudevi.app';
export const SITE_NAME = 'Gurudevi';
export const SITE_DESCRIPTION =
  'A sanctuary and education ecology support system for teachers, students, schools, families, and communities.';

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
