// ============================================================================
// LIBRARY RESOURCE TYPES
// ============================================================================

import { UserRole } from '@repo/core';

export type ResourceType =
    | 'lesson'
    | 'worksheet'
    | 'guide'           // teacher guides
    | 'reading'
    | 'pedagogy'
    | 'video'
    | 'link'
    | 'other'
    | 'pdf'
    | 'doc'
    | 'note'
    // Holistic library expansion
    | 'map'             // real maps, visual maps, infographics, mind maps, brochures
    | 'infographic'     // standalone infographics / visual explainers
    | 'story'           // stories for students and teachers
    | 'circular'        // official circulars from the Education Ministry (SL)
    | 'movie_trailer'   // inspiring YouTube trailers — local, Indian, international
    | 'tech_guide';     // technology guides for teachers

export type ResourceFormat = 'text' | 'video' | 'interactive' | 'audio' | 'document';
export type ResourceDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ResourceLanguage = 'english' | 'sinhala' | 'tamil';
export type ResourceVisibility = 'private' | 'class' | 'grade' | 'school' | 'public';

export interface LibraryResource {
    id: string;
    title: string;
    description: string;
    type: ResourceType;
    format: ResourceFormat;
    url?: string;
    file_path?: string;

    // Categorization
    subject: string;
    topics: string[];
    grades: number[];
    difficulty: ResourceDifficulty;
    language: ResourceLanguage;

    // Permissions
    visibility: ResourceVisibility;
    creator_id: string;
    creator_name: string;
    creator_role: UserRole;

    // Quality indicators
    verified: boolean;
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
    created_at: string;
    updated_at: string;
    media?: import('@repo/core').MediaAsset; // Abstracted Media Asset

    // Link Reliability
    link_status?: 'working' | 'broken' | 'unknown';
    last_checked_at?: string;
    fail_count?: number;
}

export interface ResourceCollection {
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
    subject: string;
    topics: string[];
    grades: number[];
    estimated_duration?: string;

    // Engagement
    forks: number;
    used_by_count: number;
    endorsements: number;
    has_endorsed?: boolean;

    // Metadata
    school_id: string;
    original_collection_id?: string; // If forked
    created_at: string;
    updated_at: string;
}

export interface ResourceFilters {
    type?: ResourceType;
    subject?: string;
    topics?: string[];
    grades?: number[];
    difficulty?: ResourceDifficulty;
    language?: ResourceLanguage;
    visibility?: ResourceVisibility;
    verified_only?: boolean;
    creator_role?: UserRole;
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
    topics?: string[];
    grades: number[];
    difficulty: ResourceDifficulty;
    language: ResourceLanguage;
    visibility: ResourceVisibility;
    tags?: string[];
    curriculum_aligned?: boolean;
    license?: string;
    /**
     * Copyright / usage notice. Mandatory when type is movie_trailer, map, circular,
     * infographic, or any externally-hosted content.
     */
    copyright_notice?: string;
}

export interface CreateCollectionInput {
    name: string;
    description: string;
    visibility: ResourceVisibility;
    resource_ids: string[];
    subject: string;
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
    { id: 'worksheet', en: 'Worksheets', si: 'වැඩපත්', ta: 'பயிற்සිத் தாள்கள்' },
    { id: 'guide', en: 'Guides', si: 'මඟපෙන්වන්නන්', ta: 'வழிகாட்டிகள்' },
    { id: 'video', en: 'Videos', si: 'වීඩියෝ', ta: 'வீடியோக்கள்' },
    { id: 'pedagogy', en: 'Pedagogy', si: 'ශික්ෂණ විද්‍යාව', ta: 'கற்பித்தல் முறை' },
];

export interface KnowledgeNode {
    id: string;
    label: string;
    type: 'resource' | 'topic';
    group: string;
    metadata?: any;
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
}

export interface KnowledgeTopology {
    nodes: KnowledgeNode[];
    links: KnowledgeLink[];
}
