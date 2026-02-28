// ============================================================================
// COMMUNITY & LIBRARY TYPES
// Educational Ecology Support System
// ============================================================================

import { UserRole } from '@repo/core';

// ============================================================================
// COMMUNITY POST TYPES
// ============================================================================

export type PostType = 'question' | 'resource' | 'feedback' | 'announcement' | 'discussion';
export type PostVisibility = 'class' | 'grade' | 'school' | 'teachers_only' | 'public';
export type Urgency = 'low' | 'medium' | 'high';
export type FeedbackStatus = 'pending' | 'under_review' | 'approved' | 'implemented' | 'declined';
export type GroupType = 'class' | 'grade' | 'subject' | 'club' | 'general' | 'teachers_only' | 'admin_only';
export type GroupJoinPolicy = 'open' | 'approval_required' | 'invite_only' | 'restricted';

// Simplified Domain Aliases
export type Group = CommunityGroup;
export type Post = CommunityPost;

export interface CommunityPost {
    id: string;
    author_id: string;
    author_name: string;
    author_role: UserRole;
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

    // Engagement
    reactions: Record<string, number>;
    comment_count: number;
    view_count: number;

    // Context
    group_id?: string;
    classroom_id?: string;
    school_id: string;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    author_name: string;
    author_role: UserRole;
    author_avatar?: string;
    content: string;
    is_anonymous: boolean;

    // Answer-specific (for questions)
    is_official_answer: boolean;
    upvotes: number;
    has_upvoted?: boolean; // Current user has upvoted

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface PostFilters {
    post_type?: PostType;
    visibility?: PostVisibility;
    subject?: string;
    author_role?: UserRole;
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
}

export interface CreateCommentInput {
    post_id: string;
    content: string;
    is_anonymous?: boolean;
}

// ============================================================================
// CONTRIBUTION & RECOGNITION TYPES
// ============================================================================

export type ContributionType =
    | 'question_answered'
    | 'resource_shared'
    | 'resource_endorsed'
    | 'helpful_comment'
    | 'feedback_given'
    | 'collection_created'
    | 'post_created'
    | 'peer_helped';

export interface Contribution {
    id: string;
    user_id: string;
    contribution_type: ContributionType;
    reference_id?: string;
    reference_type?: string;
    points?: number;
    created_at: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: string;
    level?: number;
    created_at: string;
}

export interface UserBadge {
    user_id: string;
    badge_id: string;
    badge: Badge;
    awarded_at: string;
}

export interface ContributionSummary {
    questions_answered: number;
    resources_shared: number;
    resources_endorsed: number;
    helpful_comments: number;
    feedback_given: number;
    collections_created: number;
    total_points: number;
    badges: Badge[];
}

// ============================================================================
// ECOSYSTEM HEALTH TYPES
// ============================================================================

export interface EcosystemMetrics {
    // Time period
    period: 'day' | 'week' | 'month';
    start_date: string;
    end_date: string;

    // Engagement metrics
    active_users: {
        total: number;
        students: number;
        teachers: number;
        principals: number;
    };

    posts: {
        total: number;
        by_type: Record<PostType, number>;
        daily_average: number;
    };

    questions: {
        asked: number;
        answered: number;
        answer_rate: number;
        avg_response_time_hours: number;
        unanswered_48h: number;
    };

    resources: {
        added: number;
        used: number;
        endorsed: number;
        verified: number;
    };

    // Feedback loop health
    feedback: {
        student_to_teacher: number;
        teacher_to_principal: number;
        response_rate: number;
        avg_response_time_hours: number;
    };

    // Community health
    community: {
        collaboration_index: number; // 0-100
        voice_distribution: {
            student_posts: number;
            teacher_posts: number;
            principal_posts: number;
            balance_score: number; // Healthy if diverse
        };
        positive_sentiment_ratio: number; // 0-1
    };

    // Warning signals
    warnings: {
        unanswered_questions: number;
        low_participation_grades: number[];
        resource_gaps: string[]; // Subjects with few resources
        teacher_burnout_signals: number;
    };
}

export interface FeedbackPulseResponse {
    id: string;
    user_id: string;
    week_rating: number; // 1-5
    blockers: string;
    suggestions: string;
    is_anonymous: boolean;
    created_at: string;
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
    created_at: string;
}

// ============================================================================
// GROUP TYPES (Community Groups)
// ============================================================================

export interface CommunityGroup {
    id: string;
    name: string;
    description: string;
    type: GroupType;
    join_policy: GroupJoinPolicy;

    // Visibility & Access
    visibility: PostVisibility;
    allowed_roles?: UserRole[]; // If specified, only these roles can see/join

    // Membership
    member_count: number;
    max_members?: number;
    is_member: boolean;
    is_admin: boolean;
    is_moderator: boolean;

    // Group Settings
    allow_posts: boolean;
    allow_announcements: boolean;
    require_post_approval: boolean;

    // Metadata
    image_url?: string;
    cover_image_url?: string;
    tags: string[];
    school_id?: string; // Optional - for school-specific groups
    classroom_id?: string; // Optional - for classroom-linked sanctuary groups
    creator_id: string;
    creator_name: string;
    created_at: string;
    updated_at: string;
}

export interface GroupMember {
    id: string;
    group_id: string;
    user_id: string;
    user_name: string;
    user_role: UserRole;
    user_avatar?: string;

    // Member role in group
    is_admin: boolean;
    is_moderator: boolean;

    // Status
    status: 'active' | 'pending' | 'banned';
    joined_at: string;
}

export interface GroupJoinRequest {
    id: string;
    group_id: string;
    user_id: string;
    user_name: string;
    user_role: UserRole;
    message?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
}

export interface GroupFilters {
    type?: GroupType;
    visibility?: PostVisibility;
    join_policy?: GroupJoinPolicy;
    school_id?: string;
    tags?: string[];
    search?: string;
    user_is_member?: boolean;
    user_can_join?: boolean;
    limit?: number;
    offset?: number;
}

export interface CreateGroupInput {
    name: string;
    description: string;
    type: GroupType;
    join_policy: GroupJoinPolicy;
    visibility: PostVisibility;
    allowed_roles?: UserRole[];
    allow_posts?: boolean;
    allow_announcements?: boolean;
    require_post_approval?: boolean;
    max_members?: number;
    image_url?: string;
    tags?: string[];
    school_id?: string;
}

// ============================================================================
// GROUP CHAT TYPES
// ============================================================================

export interface GroupMessage {
    id: string;
    group_id: string;
    author_id: string;
    content: string;
    created_at: string;
    author?: { full_name: string; avatar_url?: string };
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
