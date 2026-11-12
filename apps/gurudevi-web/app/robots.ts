import type { MetadataRoute } from 'next';
import { absoluteUrl, CRAWLER_RULES } from '@repo/core/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: CRAWLER_RULES.map((rule) => ({
      userAgent: typeof rule.userAgent === 'string' ? rule.userAgent : [...rule.userAgent],
      allow: typeof rule.allow === 'object' ? [...rule.allow] : rule.allow,
      disallow: typeof rule.disallow === 'object' ? [...rule.disallow] : rule.disallow,
    })),
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
