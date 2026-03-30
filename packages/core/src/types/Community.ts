export interface Group {
    id: string;
    name: string;
    description?: string;
    school_id?: string;
    creator_id: string;
    type: string;
    visibility: string;
    join_policy: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface GroupMember {
    id: string;
    user_id: string;
    group_id: string;
    role: string;
    status: string;
}

export interface Post {
    id: string;
    group_id: string;
    author_id: string;
    school_id?: string;
    content: string;
    author_tier: string;
    created_at: string;
    updated_at: string;
}

export interface GroupMessage {
    id: string;
    group_id: string;
    author_id: string;
    content: string;
    created_at: string;
}

export interface CommunityReaction {
    id: string;
    post_id: string;
    user_id: string;
    emoji: string;
}
