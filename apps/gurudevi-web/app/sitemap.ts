import type { MetadataRoute } from 'next';
import { absoluteUrl, publicPaths } from './seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path.startsWith('/journal/') ? 'monthly' : 'weekly',
    priority: path === '/' ? 1 : path.startsWith('/journal') ? 0.7 : 0.8,
  }));
}
