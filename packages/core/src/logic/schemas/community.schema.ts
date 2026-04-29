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
  member_count: z.number().default(0),
  is_member: z.boolean().default(false),
  is_admin: z.boolean().default(false),
  is_moderator: z.boolean().default(false),
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
  author_name: z.string().optional(),
  author_authority: z.string().optional(),
  school_id: z.string().optional(),
  content: z.string(),
  post_type: z.string().default('discussion'),
  visibility: z.string().default('school'),
  author_tier: z.string().optional(),
  media_url: z.string().optional(),
  media_type: z.string().optional(),
  reaction_count: z.number().default(0),
  comment_count: z.number().default(0),
  view_count: z.number().default(0),
  has_liked: z.boolean().default(false),
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
