import { defineCollection } from 'astro:content';
import type { Language } from '@repo/editorial';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const journalLanguages = ['en', 'si', 'ta'] as const satisfies ReadonlyArray<Language>;

const cosmos = defineCollection({
  loader: glob({ base: './src/content/cosmos', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    icon: z.string(),
    order: z.number().default(0),
    accentColor: z.string().optional(),
    origin: z.string().optional(),
    coreLogic: z.string().optional(),
    draft: z.boolean().default(false),
    publishDate: z.date().optional(),
  }),
});

const library = defineCollection({
  loader: glob({ base: './src/content/library', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    icon: z.string().optional(),
    category: z.enum([
      'thinker',
      'framework',
      'guide',
      'story',
      'article',
      'research',
      'essay',
      'field-note',
    ]),
    tags: z.array(z.string()).default([]),
    readingTime: z.number().optional(),
    author: z.string().default('EdLove'),
    source: z.string().optional(),
    license: z.string().default('CC BY-SA 4.0'),
    publishDate: z.date().optional(),
    updatedDate: z.date().optional(),
    canonicalUrl: z.string().url().optional(),
    related: z.array(z.string()).default([]),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

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
    author: z.string().default('EdLove'),
    language: z.enum(journalLanguages).default('en'),
    topics: z.array(z.string()).default([]),
    publishDate: z.date(),
    updatedDate: z.date().optional(),
    readingTime: z.number().optional(),
    heroImage: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    license: z.string().default('CC BY-SA 4.0'),
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

const sriLanka = defineCollection({
  loader: glob({ base: './src/content/sri-lanka', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    icon: z.string(),
    category: z.enum(['schooling', 'tuition', 'discrepancy']).optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const community = defineCollection({
  loader: glob({ base: './src/content/community', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    icon: z.string(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const gurudevi = defineCollection({
  loader: glob({ base: './src/content/gurudevi', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    icon: z.string(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const resources = defineCollection({
  loader: glob({ base: './src/content/resources', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    icon: z.string(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  cosmos,
  library,
  journal,
  authors,
  'sri-lanka': sriLanka,
  community,
  gurudevi,
  resources,
};
