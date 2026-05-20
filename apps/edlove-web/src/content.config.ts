import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
    category: z.enum(['thinker', 'framework', 'guide', 'story']),
    tags: z.array(z.string()).default([]),
    readingTime: z.number().optional(),
    order: z.number().default(0),
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
  'sri-lanka': sriLanka,
  community,
  gurudevi,
  resources,
};
