import { makeModelSchema } from '@repo/schema';
import { z } from 'zod';

/**
 * CommunityGroupSchema - A collective space for engagement.
 * Derived from ZenStack Group model.
 */
export const CommunityGroupSchema = makeModelSchema('Group').extend({
  member_count: z.number().default(0),
  is_member: z.boolean().default(false),
  is_admin: z.boolean().default(false),
  is_moderator: z.boolean().default(false),
});

export type CommunityGroup = z.infer<typeof CommunityGroupSchema>;

/**
 * GroupMemberSchema - Membership in a collective.
 * Derived from ZenStack GroupMember model.
 */
export const GroupMemberSchema = makeModelSchema('GroupMember');

/**
 * CommunityPostSchema - A message to the collective.
 * Derived from ZenStack Post model.
 */
export const CommunityPostSchema = makeModelSchema('Post').extend({
  author_name: z.string().optional(),
  author_capacity: z.string().optional(),
  reaction_count: z.number().default(0),
  comment_count: z.number().default(0),
  view_count: z.number().default(0),
  has_liked: z.boolean().default(false),
});

/**
 * GroupMessageSchema - Real-time pulse of a group.
 * Derived from ZenStack GroupMessage model.
 */
export const GroupMessageSchema = makeModelSchema('GroupMessage');

/**
 * CommunityReactionSchema - Resonating with a post.
 * Derived from ZenStack CommunityReaction model.
 */
export const CommunityReactionSchema = makeModelSchema('CommunityReaction');
