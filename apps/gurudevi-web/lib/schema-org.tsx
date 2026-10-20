import type { JournalEntry } from '../app/(marketing)/(editorial)/content';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../app/seo';

/**
 * Sanitizes JSON strings for secure injection inside <script type="application/ld+json">.
 * Replaces '<' with its unicode equivalent '\u003c' to prevent XSS breakout vulnerabilities.
 */
export function sanitizeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ['ගුරුදෙවි', 'குருதெவி', 'EdLove Gurudevi'],
    url: SITE_URL,
    logo: `${SITE_URL}/hero-teacher-editorial.png`,
    description: SITE_DESCRIPTION,
    parentOrganization: {
      '@type': 'Organization',
      name: 'EdLove Foundation',
      url: 'https://edlove.org',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sri Lanka',
    },
    knowsLanguage: ['en', 'si', 'ta'],
  };
}

export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: ['en', 'si', 'ta'],
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  };
}

export function generateArticleJsonLd(entry: JournalEntry, canonicalUrl: string) {
  const publishIso = `${entry.publishDate}T00:00:00Z`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    headline: entry.title,
    description: entry.subtitle,
    inLanguage: entry.language,
    mainEntityOfPage: canonicalUrl,
    datePublished: publishIso,
    dateModified: publishIso,
    author: {
      '@type': 'Person',
      name: entry.author,
      url: `${SITE_URL}/authors/${entry.authorId}`,
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/hero-teacher-editorial.png`,
    },
    license: entry.license === 'CC BY-NC 4.0'
      ? 'https://creativecommons.org/licenses/by-nc/4.0/'
      : entry.license,
    keywords: entry.topics.join(', '),
  };
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Server component helper to render valid, safe JSON-LD script tag.
 */
export function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(data) }}
    />
  );
}
