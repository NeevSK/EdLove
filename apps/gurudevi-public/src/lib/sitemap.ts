import { journalEntries } from '../content/journal';

export type ChangeFrequency = 'weekly' | 'monthly';

export interface SitemapMeta {
  lastmod?: string;
  changefreq: ChangeFrequency;
  priority: number;
}

const publishedAt = new Map(
  journalEntries.map((entry) => [
    `/journal/${entry.slug}`,
    new Date(`${entry.publishDate}T00:00:00Z`),
  ]),
);

/** How a page is described in the sitemap, from its path (locale prefix included). */
export function sitemapMeta(pathname: string): SitemapMeta {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/si' || path === '/ta') return { changefreq: 'weekly', priority: 0.9 };
  const english = path.replace(/^\/(si|ta)(?=\/)/, '');
  return {
    lastmod: publishedAt.get(english)?.toISOString(),
    changefreq: english.startsWith('/journal/') ? 'monthly' : 'weekly',
    priority: english === '/' ? 1 : english.startsWith('/journal') ? 0.7 : 0.8,
  };
}
