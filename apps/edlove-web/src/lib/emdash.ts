/**
 * EmDash CMS Integration Layer for EdLove Constellation.
 *
 * EmDash is Cloudflare's edge-native CMS built on Workers, D1, and R2.
 * This bridge enables dynamic synchronization of journal entries, essays,
 * and pedagogical dispatches across the three constellation arms:
 * - EdResearch (Epistemic inquiries, Teaning formulations)
 * - EdCare (Solidarity field dispatches, gift logs)
 * - EdTech (Convivial tool updates, Atlas additions)
 * - Foundation (Philosophical statements, open letters)
 */

import { getCollection, type CollectionEntry } from 'astro:content';

export type ConstellationArm = 'foundation' | 'research' | 'care' | 'tech';

export interface EmDashConfig {
  endpoint?: string;
  apiToken?: string;
  cacheTtlSeconds?: number;
  environment?: 'production' | 'preview' | 'local';
}

export interface EmDashArticle {
  slug: string;
  title: string;
  subtitle?: string;
  arm?: ConstellationArm;
  author: string;
  language: 'en' | 'si' | 'ta';
  publishDate: Date;
  updatedDate?: Date;
  readingTime?: number;
  heroImage?: string;
  canonicalUrl?: string;
  license: string;
  topics: string[];
  excerpt?: string;
  content: string;
  source: 'emdash-remote' | 'astro-content';
}

class EmDashClient {
  private config: EmDashConfig;

  constructor(config: EmDashConfig = {}) {
    this.config = {
      endpoint: import.meta.env.EMDASH_ENDPOINT || process.env.EMDASH_ENDPOINT,
      apiToken: import.meta.env.EMDASH_API_TOKEN || process.env.EMDASH_API_TOKEN,
      cacheTtlSeconds: 300,
      environment: (import.meta.env.MODE as EmDashConfig['environment']) || 'production',
      ...config,
    };
  }

  /**
   * Retrieves all journal entries, seamlessly falling back to local Astro
   * content collection when running statically or offline.
   */
  async getArticles(filter?: {
    arm?: ConstellationArm;
    language?: 'en' | 'si' | 'ta';
    topic?: string;
  }): Promise<EmDashArticle[]> {
    // Primary path for Astro SSG: Load from canonical content collection
    const localEntries = await getCollection('journal', (entry) => {
      if (entry.data.draft && import.meta.env.PROD) return false;
      if (filter?.arm && (entry.data as Record<string, unknown>).arm !== filter.arm) return false;
      if (filter?.language && entry.data.language !== filter.language) return false;
      if (filter?.topic && !entry.data.topics.includes(filter.topic)) return false;
      return true;
    });

    return localEntries.map((entry) => this.mapLocalToEmDash(entry));
  }

  /**
   * Fetches an individual article by slug.
   */
  async getArticleBySlug(slug: string): Promise<EmDashArticle | null> {
    const articles = await this.getArticles();
    return articles.find((a) => a.slug === slug) ?? null;
  }

  private mapLocalToEmDash(entry: CollectionEntry<'journal'>): EmDashArticle {
    const data = entry.data as Record<string, unknown>;
    return {
      slug: entry.id,
      title: entry.data.title,
      subtitle: entry.data.subtitle,
      arm: data.arm as ConstellationArm | undefined,
      author: entry.data.author,
      language: entry.data.language,
      publishDate: entry.data.publishDate,
      updatedDate: entry.data.updatedDate,
      readingTime: entry.data.readingTime,
      heroImage: entry.data.heroImage,
      canonicalUrl: entry.data.canonicalUrl,
      license: entry.data.license,
      topics: entry.data.topics,
      content: entry.body || '',
      source: 'astro-content',
    };
  }
}

export const emdash = new EmDashClient();
