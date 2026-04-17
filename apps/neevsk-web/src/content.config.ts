import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const archive = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/archive' }),
    schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        publishDate: z.date(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
    }),
});

const hallOfFlame = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/hall-of-flame' }),
    schema: z.object({
        name: z.string(),
        subtitle: z.string(),
        chamber: z.enum([
            'The First Light',
            'Chamber of Love',
            'Chamber of Tribute',
            'Chamber of Mastery',
            'Chamber of Inspiration & Respect',
            'Chamber of Support'
        ]),
        order: z.number().default(0),
        draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        role: z.string(),
        tech: z.array(z.string()),
        link: z.string().url().optional(),
        order: z.number().default(0),
        draft: z.boolean().default(false),
    }),
});

export const collections = {
    archive,
    'hall-of-flame': hallOfFlame,
    projects,
};
