import { defineCollection, z } from 'astro:content';

const cosmos = defineCollection({
    type: 'content',
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
    type: 'content',
    schema: z.object({
        title: z.string(),
        subtitle: z.string(),
        category: z.enum(['thinker', 'framework', 'guide', 'story']),
        tags: z.array(z.string()).default([]),
        readingTime: z.number().optional(),
        order: z.number().default(0),
        draft: z.boolean().default(false),
    }),
});

const sriLanka = defineCollection({
    type: 'content',
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
    type: 'content',
    schema: z.object({
        title: z.string(),
        subtitle: z.string(),
        icon: z.string(),
        order: z.number().default(0),
        draft: z.boolean().default(false),
    }),
});

const gurudevi = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        subtitle: z.string(),
        icon: z.string(),
        order: z.number().default(0),
        draft: z.boolean().default(false),
    }),
});

const resources = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        subtitle: z.string(),
        icon: z.string(),
        order: z.number().default(0),
        draft: z.boolean().default(false),
    }),
});

export const collections = {
    'cosmos': cosmos,
    'library': library,
    'sri-lanka': sriLanka,
    'community': community,
    'gurudevi': gurudevi,
    'resources': resources,
};
