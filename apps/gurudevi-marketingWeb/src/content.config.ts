import { defineCollection } from 'astro:content';
import type { Language } from '@repo/editorial';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const journalLanguages = ['en', 'si', 'ta'] as const satisfies ReadonlyArray<Language>;

const journal = defineCollection({
  loader: glob({ base: './src/content/journal', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    workId: z.string(),
    contentKind: z
      .enum(['original', 'curated', 'licensed', 'guest', 'translation'])
      .default('original'),
    authorId: z.string().optional(),
    author: z.string().default('Gurudevi'),
    language: z.enum(journalLanguages).default('en'),
    topics: z.array(z.string()).default([]),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    readingTime: z.number().optional(),
    heroImage: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    license: z.string().default('All rights reserved'),
    source: z.string().url().optional(),
    rightsAgreementId: z.string().optional(),
    translationOf: z.string().optional(),
    translationStatus: z.enum(['not_applicable', 'draft', 'in_review', 'approved']).default('not_applicable'),
    distribution: z
      .object({
        channels: z
          .array(z.enum(['linkedin', 'medium', 'substack', 'meta', 'rss']))
          .default(['rss']),
        excerptOnly: z.array(z.enum(['linkedin', 'medium', 'substack', 'meta', 'rss'])).default([]),
        utmCampaign: z.string().default('journal'),
      })
      .default({
        channels: ['rss'],
        excerptOnly: [],
        utmCampaign: 'journal',
      }),
    draft: z.boolean().default(false),
  }),
});

const authors = defineCollection({
  loader: glob({ base: './src/content/authors', pattern: '**/*.md' }),
  schema: z.object({
    displayName: z.string(),
    biography: z.string(),
    websiteUrl: z.string().url().optional(),
    socialLinks: z.record(z.string(), z.string().url()).default({}),
    attributionName: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { journal, authors };
