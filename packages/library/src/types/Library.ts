// ============================================================================
// LIBRARY RESOURCE TYPES
// ============================================================================

import { UserRole } from '@repo/core';

export type ResourceType =
    | 'lesson'
    | 'worksheet'
    | 'guide'
    | 'reading'
    | 'pedagogy'
    | 'video'
    | 'link'
    | 'other'
    | 'pdf'
    | 'doc'
    | 'note';

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
    sort_by?: 'recent' | 'popular' | 'most_used' | 'most_endorsed';
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
