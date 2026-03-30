import { z } from 'zod';

export const CommunityGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  school_id: z.string().optional(),
  creator_id: z.string(),
  type: z.string().default('general'),
  visibility: z.string().default('public'),
  join_policy: z.string().default('open'),
  is_public: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CommunityGroup = z.infer<typeof CommunityGroupSchema>;

export const GroupMemberSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  group_id: z.string(),
  role: z.string().default('member'),
  status: z.string().default('active'),
});

export const CommunityPostSchema = z.object({
  id: z.string(),
  group_id: z.string(),
  author_id: z.string(),
  school_id: z.string().optional(),
  content: z.string(),
  author_tier: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const GroupMessageSchema = z.object({
  id: z.string(),
  group_id: z.string(),
  author_id: z.string(),
  content: z.string(),
  created_at: z.string(),
});

export const CommunityReactionSchema = z.object({
  id: z.string(),
  post_id: z.string(),
  user_id: z.string(),
  emoji: z.string().default('d'),
});
