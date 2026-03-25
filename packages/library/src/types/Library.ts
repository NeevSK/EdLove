// ============================================================================
// LIBRARY RESOURCE TYPES
// ============================================================================

import { AuthorityTier, BaseResource, ResourceFormat, ResourceType } from '@repo/core';

export type { ResourceFormat, ResourceType }; // Re-export for package consumers

export type ResourceDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ResourceLanguage = 'english' | 'sinhala' | 'tamil';
export type ResourceVisibility = 'private' | 'class' | 'grade' | 'school' | 'public' | 'shared' | 'personal';

export interface LibraryResource extends BaseResource {
    // Categorization
    subjects: string[];
    topics: string[];
    grades: number[];
    difficulty: ResourceDifficulty;
    language: ResourceLanguage[];

    // Localized content
    title_si?: string;
    title_ta?: string;
    title_en?: string;
    description_si?: string;
    description_ta?: string;
    description_en?: string;

    // Permissions
    visibility: ResourceVisibility;
    creator_id: string;
    creator_name: string;
    creator_role: AuthorityTier;

    // Quality indicators
    verified: boolean;
    is_community: boolean;
    verified_by?: string;
    verified_by_name?: string;
    curriculum_aligned: boolean;
    license?: string;
    /**
     * Human-readable copyright/usage notice displayed prominently to users.
     * Required for externally-sourced content (movie trailers, maps, circulars).
     * Examples: "© Ministry of Education, Sri Lanka", "YouTube — fair use for education",
     *           "Creative Commons CC-BY-SA 4.0"
     */
    copyright_notice?: string;

    // Engagement metrics
    views: number;
    uses_count: number;
    endorsements: number;
    bookmarks: number;
    has_endorsed?: boolean; // Current user has endorsed
    has_bookmarked?: boolean; // Current user has bookmarked

    // Metadata
    tags: string[];
    school_id: string;
    media?: import('@repo/core').MediaAsset; // Abstracted Media Asset

    // Link Reliability
    link_status?: 'working' | 'broken' | 'unknown';
    last_checked_at?: string;
    fail_count?: number;
}

export interface LibraryCollection {
    id: string;
    name: string;
    description: string;
    creator_id: string;
    creator_name: string;
    visibility: ResourceVisibility;
    resources: LibraryResource[];
    resource_ids: string[];
    sequence_order: number[];

    // Categorization
    subjects: string[];
    topics: string[];
    grades: number[];
    estimated_duration?: string;

    // Engagement
    forks: number;
    used_by_count: number;
    endorsements: number;
    has_endorsed?: boolean;
    has_bookmarked?: boolean;
    thumbnail_url?: string;
    is_official?: boolean;

    // Metadata
    school_id: string;
    is_virtual?: boolean; // If derived from subjects/topics
    original_collection_id?: string; // If forked
    created_at: string;
    updated_at: string;
}

export interface ResourceFilters {
    type?: ResourceType;
    subject?: string; // Kept for filtering compat, maps to 'subjects'
    topic?: string;   // Added for single topic filtering
    subjects?: string[];
    topics?: string[];
    grades?: number[];
    difficulty?: ResourceDifficulty;
    languages?: ResourceLanguage[];
    visibility?: ResourceVisibility;
    source?: 'core' | 'community';
    verified_only?: boolean;
    creator_role?: AuthorityTier;
    tags?: string[];
    search?: string;
    sort_by?: 'recent' | 'popular' | 'most_used' | 'most_endorsed' | 'most_bookmarked';
    limit?: number;
    offset?: number;
}

export interface CollectionFilters {
    subject?: string;
    grades?: number[];
    visibility?: ResourceVisibility;
    creator_id?: string;
    userId?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface CreateResourceInput {
    title: string;
    description: string;
    type: ResourceType;
    format: ResourceFormat;
    url?: string;
    file_path?: string;
    subject: string;
    subjects?: string[];
    topics?: string[];
    grades: number[];
    difficulty: ResourceDifficulty;
    language: ResourceLanguage;
    languages?: ResourceLanguage[];
    visibility: ResourceVisibility;
    tags?: string[];
    curriculum_aligned?: boolean;
    license?: string;
    /**
     * Copyright / usage notice. Mandatory when type is movie_trailer, map, circular,
     * infographic, or any externally-hosted content.
     */
    copyright_notice?: string;

    // Optional localized content for creation
    title_si?: string;
    title_ta?: string;
    title_en?: string;
    description_si?: string;
    description_ta?: string;
    description_en?: string;
}

export interface CreateCollectionInput {
    name: string;
    description: string;
    visibility: ResourceVisibility;
    resource_ids: string[];
    subject: string; // Kept for compat
    subjects?: string[];
    topics?: string[];
    grades: number[];
    estimated_duration?: string;
}

// ============================================================================
// UI CONSTANTS (Library First Protocol)
// ============================================================================

export const LIBRARY_UI_CATEGORIES = [
    { id: 'All', en: 'All', si: 'සියල්ල', ta: 'அனைத்தும்' },
    { id: 'lesson', en: 'Lessons', si: 'පාඩම්', ta: 'பாடங்கள்' },
    { id: 'worksheet', en: 'Worksheets', si: 'වැඩපත්', ta: 'பயிற்சித் தாள்கள்' },
    { id: 'guide', en: 'Guides', si: 'මඟපෙන්වන්නන්', ta: 'வழிகாட்டிகள்' },
    { id: 'video', en: 'Videos', si: 'වීඩියෝ', ta: 'வீடியோக்கள்' },
    { id: 'pedagogy', en: 'Pedagogy', si: 'ශික්ෂණ විද්‍යාව', ta: 'கற்பித்தல் முறை' },
];

export interface KnowledgeNode {
    id: string;
    label: string;
    type: 'resource' | 'topic' | 'persona' | 'collection';
    group: string;
    thumbnail?: string;
    isHero?: boolean;
    isPathway?: boolean;
    metadata?: {
        subjects?: string[];
        topics?: string[];
        tags?: string[];
        description?: string;
        is_ministry_official?: boolean;
        duration?: string;
    };
    // Metadata-driven visibility
    supportedPerspectives?: ('astro' | 'terra' | 'dharma' | 'vastu' | 'jyoti')[];
    
    // Geographical context for Terra
    geo?: {
        lat: number;
        lng: number;
        provinceId: string;
        districtId: string;
    };
    
    // Sequential context for Dharma
    path?: {
        order: number;
        dependencies: string[];
    };
    // D3 specific fields (optional for type safety)
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

export interface KnowledgeLink {
    source: string | KnowledgeNode;
    target: string | KnowledgeNode;
    value: number;
    relationship?: NodeRelationship | 'path' | 'topic_association';
    isPathway?: boolean;
}


export interface KnowledgeTopology {
    nodes: KnowledgeNode[];
    links: KnowledgeLink[];
    supportedPerspectives?: ('astro' | 'terra' | 'dharma' | 'vastu' | 'jyoti')[];
    context?: {
        focusRegion?: string;
        zoomLevel?: number;
    };
}

// ============================================================================
// GRAPH & JOURNEY TYPES
// ============================================================================

export type NodeRelationship =
    | 'prerequisite'
    | 'related'
    | 'leads_to'
    | 'part_of'
    | 'opposite'
    | 'example';

export interface LibraryEdge {
    id: string;
    from_node_id: string;
    to_node_id: string;
    relationship: NodeRelationship;
    weight: number;
    is_ai_generated: boolean;
    is_verified: boolean;
    created_at: string;
}

export interface LibraryTag {
    id: string;
    name_si?: string;
    name_ta?: string;
    name_en: string;
    category?: string;
}

export interface UserJourney {
    id: string;
    user_id: string;
    node_id: string;
    status: 'unlocked' | 'in_progress' | 'completed' | 'mastered';
    progress_score: number;
    last_accessed_at: string;
}
