import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import robots from '../../../app/robots';
import { GET as getLlmsTxt } from '../../../app/llms.txt/route';
import { GET as getLlmsFullTxt } from '../../../app/llms-full.txt/route';
import sitemap from '../../../app/sitemap';
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  sanitizeJsonLd,
} from '../../../lib/schema-org';
import {
  INDEXNOW_ENDPOINT,
  INDEXNOW_KEY,
  submitIndexNowUrls,
} from '../../../lib/indexnow';

describe('2026 SEO, GEO & Agentic Discovery Suite', () => {
  describe('robots.ts configuration', () => {
    it('returns compliant robots.txt rules that shield private sanctuary paths', () => {
      const robotsConfig = robots();
      expect(robotsConfig.sitemap).toBe('https://gurudevi.app/sitemap.xml');
      expect(robotsConfig.host).toBe('https://gurudevi.app/');

      const rules = Array.isArray(robotsConfig.rules)
        ? robotsConfig.rules
        : [robotsConfig.rules];

      // Verify general wildcard rule
      const generalRule = rules.find((r) => r.userAgent === '*');
      expect(generalRule).toBeDefined();
      expect(generalRule?.allow).toBe('/');
      expect(generalRule?.disallow).toEqual(
        expect.arrayContaining(['/self/', '/workspace/', '/library/', '/community/']),
      );

      // Verify AI Search / Citation bots are recognized
      const aiSearchRule = rules.find(
        (r) =>
          Array.isArray(r.userAgent) &&
          r.userAgent.includes('OAI-SearchBot') &&
          r.userAgent.includes('PerplexityBot'),
      );
      expect(aiSearchRule).toBeDefined();
      expect(aiSearchRule?.allow).toBe('/');

      // Verify training scrapers are restricted
      const trainingOptOut = rules.find(
        (r) =>
          Array.isArray(r.userAgent) &&
          r.userAgent.includes('Google-Extended') &&
          r.userAgent.includes('CCBot'),
      );
      expect(trainingOptOut).toBeDefined();
      expect(trainingOptOut?.disallow).toEqual(['/']);
    });
  });

  describe('llms.txt & llms-full.txt agentic routes', () => {
    it('serves valid markdown table-of-contents on /llms.txt', async () => {
      const response = getLlmsTxt();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/plain');

      const text = await response.text();
      expect(text).toContain('# Gurudevi');
      expect(text).toContain('> Gurudevi is an education ecology support system');
      expect(text).toContain('## Core Architecture');
      expect(text).toContain('## Public Journal Articles');
      expect(text).toContain('/llms-full.txt');
      expect(text).toContain('Creative Commons (CC BY-NC 4.0)');
    });

    it('serves full aggregated knowledge corpus on /llms-full.txt', async () => {
      const response = getLlmsFullTxt();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/plain');

      const text = await response.text();
      expect(text).toContain('# Gurudevi - Complete Knowledge & Architectural Corpus');
      expect(text).toContain('Why Gurudevi Begins with Care');
      expect(text).toContain('Convivial Limit');
    });
  });

  describe('sitemap.ts freshness', () => {
    it('includes lastModified dates for editorial journal entries', () => {
      const entries = sitemap();
      const journalEntry = entries.find((e) =>
        e.url.includes('/journal/why-gurudevi-begins-with-care'),
      );
      expect(journalEntry).toBeDefined();
      expect(journalEntry?.lastModified).toBeInstanceOf(Date);
      expect(journalEntry?.priority).toBe(0.7);
    });
  });

  describe('Schema.org JSON-LD generators', () => {
    it('generates valid EducationalOrganization JSON-LD', () => {
      const org = generateOrganizationJsonLd();
      expect(org['@type']).toBe('EducationalOrganization');
      expect(org.name).toBe('Gurudevi');
      expect(org.knowsLanguage).toEqual(['en', 'si', 'ta']);
      expect(org.parentOrganization.name).toBe('EdLove Foundation');
    });

    it('generates valid WebSite JSON-LD with search authority', () => {
      const website = generateWebSiteJsonLd();
      expect(website['@type']).toBe('WebSite');
      expect(website.url).toBe('https://gurudevi.app');
    });

    it('generates compliant Article JSON-LD with author attribution', () => {
      const mockEntry = {
        slug: 'care-in-learning',
        title: 'Care in Learning',
        subtitle: 'Why attentiveness matters in education.',
        authorId: 'gurudevi',
        author: 'Gurudevi',
        language: 'en',
        topics: ['care', 'pedagogy'],
        publishDate: '2026-09-01',
        readingTime: 4,
        contentKind: 'original' as const,
        license: 'CC BY-NC 4.0',
        sections: [{ paragraphs: ['Learning is relational.'] }],
      };

      const article = generateArticleJsonLd(mockEntry, 'https://gurudevi.app/journal/care-in-learning');
      expect(article['@type']).toBe('Article');
      expect(article.headline).toBe('Care in Learning');
      expect(article.author.name).toBe('Gurudevi');
      expect(article.license).toBe('https://creativecommons.org/licenses/by-nc/4.0/');
    });

    it('generates valid BreadcrumbList JSON-LD hierarchy', () => {
      const breadcrumb = generateBreadcrumbJsonLd([
        { name: 'Home', url: 'https://gurudevi.app' },
        { name: 'Journal', url: 'https://gurudevi.app/journal' },
      ]);
      expect(breadcrumb['@type']).toBe('BreadcrumbList');
      expect(breadcrumb.itemListElement).toHaveLength(2);
      expect(breadcrumb.itemListElement[0]?.position).toBe(1);
      expect(breadcrumb.itemListElement[1]?.position).toBe(2);
    });

    it('sanitizes < characters to prevent XSS script breakouts', () => {
      const malicious = { title: 'Test</script><script>alert(1)</script>' };
      const sanitized = sanitizeJsonLd(malicious);
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).toContain('\\u003c/script>');
    });
  });

  describe('IndexNow protocol attestation', () => {
    it('verifies static key file exists in public/ matching INDEXNOW_KEY', () => {
      const keyFilePath = resolve(__dirname, '../../../public', `${INDEXNOW_KEY}.txt`);
      const keyContent = readFileSync(keyFilePath, 'utf-8').trim();
      expect(keyContent).toBe(INDEXNOW_KEY);
    });

    it('submits URLs to IndexNow endpoint successfully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve('OK'),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await submitIndexNowUrls(['https://gurudevi.app/journal/new-post']);
      expect(result.success).toBe(true);
      expect(result.status).toBe(200);

      expect(mockFetch).toHaveBeenCalledWith(
        INDEXNOW_ENDPOINT,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            host: 'gurudevi.app',
            key: INDEXNOW_KEY,
            keyLocation: `https://gurudevi.app/${INDEXNOW_KEY}.txt`,
            urlList: ['https://gurudevi.app/journal/new-post'],
          }),
        }),
      );

      vi.unstubAllGlobals();
    });
  });
});
