// ============================================================================
// COMMUNITY & SOCIAL TYPES
// Centralized for platform-wide reuse
// ============================================================================

import type { AuthorityTier } from './Authority';
import type { Announcement } from './School'; // Announcements are in School.ts
import type { User } from './User';

export interface AnnouncementWithAuthor extends Announcement {
  author_name?: string;
  author_avatar?: string;
}

// ============================================================================
// MANIFESTO TYPES
// ============================================================================

export type ManifestoVibe = 'visionary' | 'supportive' | 'academic' | 'wellbeing';
export type ManifestoStatus = 'active' | 'archived' | 'fulfilled';

export interface SanctuaryManifesto {
  id: string;
  school_id: string;
  creator_id: string;
  title: string;
  content: string;
  vibe: ManifestoVibe;
  status: ManifestoStatus;
  target_date?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  endorsement_count?: number;
  has_endorsed?: boolean;
}

// ============================================================================
// POLL TYPES
// ============================================================================

export interface PollOption {
  id: string;
  text: string;
}

export interface PollData {
  options: PollOption[];
  /** false = single-choice (default), true = multi-choice */
  allow_multiple?: boolean;
  /** false = votes are attributed to voters (default), true = only counts shown */
  is_anonymous?: boolean;
  /** ISO 8601 timestamp after which no more votes are accepted. null = no expiry. */
  ends_at?: string | null;
}

// ============================================================================
// COMMUNITY POST TYPES
// ============================================================================

export type PostType =
  | 'question'
  | 'resource'
  | 'feedback'
  | 'announcement'
  | 'discussion'
  | 'poll';
export type PostVisibility = 'class' | 'grade' | 'school' | 'teachers_only' | 'public';
export type Urgency = 'low' | 'medium' | 'high';
export type FeedbackStatus = 'pending' | 'under_review' | 'approved' | 'implemented' | 'declined';
export type GroupType =
  | 'class'
  | 'grade'
  | 'subject'
  | 'club'
  | 'general'
  | 'teachers_only'
  | 'admin_only';
export type GroupJoinPolicy = 'open' | 'approval_required' | 'invite_only' | 'restricted';

export interface CommunityPost {
  __typename?: 'CommunityPost';
  id: string;
  author_id: string;
  author_name: string;
  author_authority: AuthorityTier;
  author_avatar?: string;
  content: string;

  // Post categorization
  post_type: PostType;
  visibility: PostVisibility;
  subject?: string;
  tags: string[];
  is_anonymous: boolean;

  // Question-specific fields
  urgency?: Urgency;
  has_accepted_answer?: boolean;
  accepted_answer_id?: string;

  // Feedback-specific fields
  feedback_status?: FeedbackStatus;
  feedback_response?: string;
  feedback_responder_id?: string;

  // Media
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio' | 'document';

  // Poll-specific fields
  poll_data?: PollData;

  // Engagement
  reactions: Record<string, number>;
  has_liked?: boolean;
  reaction_count?: number;
  comment_count: number;
  view_count: number;

  // Context
  group_id?: string;
  group_name?: string;
  classroom_id?: string;
  school_id: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export type Post = CommunityPost; // Semantic Alias

export interface PostFilters {
  post_type?: PostType;
  visibility?: PostVisibility;
  subject?: string;
  author_authority?: AuthorityTier;
  tags?: string[];
  has_answer?: boolean;
  feedback_status?: FeedbackStatus;
  classroom_id?: string;
  group_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreatePostInput {
  content: string;
  post_type: PostType;
  visibility: PostVisibility;
  subject?: string;
  tags?: string[];
  is_anonymous?: boolean;
  urgency?: Urgency;
  group_id?: string;
  classroom_id?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'audio' | 'document';
  poll_data?: PollData;
}

export interface CreateCommentInput {
  post_id: string;
  content: string;
  is_anonymous?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_authority: AuthorityTier;
  author_avatar?: string | null;
  content: string;
  is_anonymous: boolean;

  // Answer-specific (for questions)
  is_official_answer: boolean;
  upvotes: number;
  has_upvoted: boolean; // Current user has upvoted

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
  | 'question_answered'
  | 'comment_reply'
  | 'official_answer_marked'
  | 'feedback_response'
  | 'resource_endorsed'
  | 'badge_awarded'
  | 'post_reaction';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

// ============================================================================
// GROUP TYPES
// ============================================================================

export interface CommunityGroup {
  __typename?: 'CommunityGroup';
  id: string;
  name: string;
  description: string;
  type: GroupType;
  group_type?: GroupType;
  join_policy: GroupJoinPolicy;
  handle?: string;

  visibility: PostVisibility;
  is_public: boolean;
  allowed_authorities?: AuthorityTier[];

  member_count: number;
  max_members?: number;
  is_member: boolean;
  is_admin: boolean;
  is_moderator: boolean;

  allow_posts: boolean;
  allow_announcements: boolean;
  require_post_approval: boolean;

  image_url?: string;
  cover_image_url?: string;
  tags: string[];
  school_id?: string;
  classroom_id?: string;
  creator_id: string;
  creator_name: string;
  created_at: string;
  updated_at: string;
}

export type Group = CommunityGroup; // Semantic Alias
export type SanctuaryGroup = CommunityGroup; // Domain Alias

export interface GroupMember {
  __typename?: 'GroupMember';
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  user_authority: AuthorityTier;
  user_avatar?: string;

  capacity: 'owner' | 'admin' | 'member';
  is_admin: boolean;
  is_moderator: boolean;
  status: 'active' | 'pending' | 'banned';
  joined_at: string;
  role?: 'owner' | 'admin' | 'member';
  user?: User;
  memberId?: string; // For permission context
}

export interface GroupJoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  user_authority: AuthorityTier;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: User;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  author_id: string;
  author_name: string;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================================================
// REPORTING & SAFETY TYPES
// ============================================================================

export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

export interface GroupReport {
  id: string;
  group_id: string | null;
  reporter_id: string;
  target_user_id: string | null;
  post_id: string | null;
  reason: string;
  details?: string;
  status: ReportStatus;
  created_at: string;
}

export interface ReportContentInput {
  group_id?: string;
  post_id?: string;
  target_user_id?: string;
  reason: string;
  details?: string;
}

// ============================================================================
// ENGAGEMENT TYPES
// ============================================================================

export interface CommunityReaction {
  id: string;
  target_id: string;
  target_type: 'post' | 'comment';
  user_id: string;
  created_at: string;
}

// ============================================================================
// DIRECT MESSAGING TYPES
// ============================================================================

export interface DirectConversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  other_user_name: string;
  other_user_avatar?: string;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: { full_name: string; avatar_url?: string };
}
