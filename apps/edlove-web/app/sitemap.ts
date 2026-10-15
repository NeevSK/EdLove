import type { MetadataRoute } from 'next';
import {
  getAllCosmosEntries,
  getAllInnovations,
  getAllLibraryEntries,
} from '../lib/content/reader';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://edlove.org';
  const now = new Date();

  // Core static pages
  const staticRoutes = [
    '',
    '/focus',
    '/vision',
    '/research',
    '/innovations',
    '/cosmos',
    '/pedagogy',
    '/atlas',
    '/font-lab',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 200 Educational Innovations
  const innovations = getAllInnovations().map((item) => ({
    url: `${baseUrl}/innovations/${item.slug}`,
    lastModified: item.updated ? new Date(item.updated) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Cosmos Paradigms
  const cosmos = getAllCosmosEntries().map((item) => ({
    url: `${baseUrl}/cosmos/${item.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Pedagogy Canon
  const pedagogy = getAllLibraryEntries().map((item) => ({
    url: `${baseUrl}/pedagogy/${item.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...cosmos, ...pedagogy, ...innovations];
}
