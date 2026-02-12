import { defineCollection, z } from 'astro:content';

const archive = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        publishDate: z.date(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
    }),
});

const hallOfFlame = defineCollection({
    type: 'content',
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
    type: 'content',
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
    'archive': archive,
    'hall-of-flame': hallOfFlame,
    'projects': projects,
};
