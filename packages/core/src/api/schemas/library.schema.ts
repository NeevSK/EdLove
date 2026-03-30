import { z } from 'zod';

export const LibraryResourceSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional().nullable(),
  type: z.string(),
  format: z.string(),
  url: z.string().url().optional().nullable(),
  file_path: z.string().optional().nullable(),
  subjects: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  grades: z.array(z.number()).default([]),
  difficulty: z.string().optional().nullable(),
  language: z.array(z.string()).default([]),
  visibility: z.string().default('public'),
  creator_id: z.string().uuid(),
  creator_role: z.string(),
  verified: z.boolean().default(false),
  is_community: z.boolean().default(false),
  views: z.number().default(0),
  uses_count: z.number().default(0),
  endorsements: z.number().default(0),
  bookmarks: z.number().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const LibraryCollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  creator_id: z.string().uuid(),
  visibility: z.string().default('public'),
  subjects: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  grades: z.array(z.number()).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ResourceEngagementSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  user_id: z.string().uuid(),
  engagement_type: z.string(),
  classroom_id: z.string().uuid().optional().nullable(),
  created_at: z.string().datetime(),
});

export type LibraryResource = z.infer<typeof LibraryResourceSchema>;
export type LibraryCollection = z.infer<typeof LibraryCollectionSchema>;
export type ResourceEngagement = z.infer<typeof ResourceEngagementSchema>;
