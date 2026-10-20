import type { MetadataRoute } from 'next';
import { journalEntries } from './(marketing)/(editorial)/content';
import { absoluteUrl, publicPaths } from './seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const englishPages: MetadataRoute.Sitemap = publicPaths.map((path) => {
    let lastModified: Date | undefined;
    if (path.startsWith('/journal/')) {
      const slug = path.replace('/journal/', '');
      const entry = journalEntries.find((e) => e.slug === slug);
      if (entry) {
        lastModified = new Date(`${entry.publishDate}T00:00:00Z`);
      }
    }

    return {
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: path.startsWith('/journal/') ? 'monthly' : 'weekly',
      priority: path === '/' ? 1 : path.startsWith('/journal') ? 0.7 : 0.8,
    };
  });

  return [
    ...englishPages,
    {
      url: absoluteUrl('/si'),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: absoluteUrl('/'),
          si: absoluteUrl('/si'),
          ta: absoluteUrl('/ta'),
          'x-default': absoluteUrl('/'),
        },
      },
    },
    {
      url: absoluteUrl('/ta'),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: absoluteUrl('/'),
          si: absoluteUrl('/si'),
          ta: absoluteUrl('/ta'),
          'x-default': absoluteUrl('/'),
        },
      },
    },
  ];
}
