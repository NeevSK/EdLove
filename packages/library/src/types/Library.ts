// ============================================================================
// LIBRARY RESOURCE TYPES
// ============================================================================
import type { TemporalScale } from "@repo/core/store";
import type {
	AuthorityTier,
	BaseResource,
	LinkRelationship,
	ResourceFormat,
	ResourceType,
	LayoutResult,
} from "@repo/core/types";

export type { ResourceFormat, ResourceType, LayoutResult }; // Re-export for package consumers
export type ResourceDifficulty = "beginner" | "intermediate" | "advanced";
export type ResourceLanguage = "english" | "sinhala" | "tamil";
export type ResourceVisibility =
	| "private"
	| "class"
	| "grade"
	| "school"
	| "public"
	| "shared"
	| "personal";
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
	 * Examples: "\u00A9 Ministry of Education, Sri Lanka", "YouTube \u2014 fair use for education",
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
	thumbnail_url?: string;
	media?: import("@repo/core/types").MediaAsset; // Abstracted Media Asset
	// Link Reliability
	link_status?: "working" | "broken" | "unknown";
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
	topic?: string; // Added for single topic filtering
	subjects?: string[];
	topics?: string[];
	grades?: number[];
	difficulty?: ResourceDifficulty;
	languages?: ResourceLanguage[];
	visibility?: ResourceVisibility;
	source?: "core" | "community";
	verified_only?: boolean;
	creator_role?: AuthorityTier;
	tags?: string[];
	search?: string;
	sort_by?:
		| "recent"
		| "popular"
		| "most_used"
		| "most_endorsed"
		| "most_bookmarked";
	limit?: number;
	offset?: number;
	viewDate?: string;
	viewScale?: TemporalScale;
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
	viewDate?: string;
	viewScale?: TemporalScale;
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
	{
		id: "All",
		en: "All",
		si: "\u0DC3\u0DD2\u0DBA\u0DBD\u0DCA\u0DBD",
		ta: "\u0B85\u0BA9\u0BC8\u0BA4\u0BCD\u0BA4\u0BC1\u0BAE\u0BCD",
	},
	{
		id: "lesson",
		en: "Lessons",
		si: "\u0DB4\u0DCF\u0DA9\u0DB8\u0DCA",
		ta: "\u0BAA\u0BBE\u0B9F\u0B99\u0BCD\u0B95\u0BB3\u0BCD",
	},
	{
		id: "worksheet",
		en: "Worksheets",
		si: "\u0DC0\u0DD0\u0DA9\u0DB4\u0DAD\u0DCA",
		ta: "\u0BAA\u0BAF\u0BBF\u0BB1\u0BCD\u0B9A\u0BBF\u0BA4\u0BCD \u0BA4\u0BBE\u0BB3\u0BCD\u0B95\u0BB3\u0BCD",
	},
	{
		id: "guide",
		en: "Guides",
		si: "\u0DB8\u0D9F\u0DB4\u0DD9\u0DB1\u0DCA\u0DC0\u0DB1\u0DCA\u0DB1\u0DB1\u0DCA",
		ta: "\u0BB5\u0BB4\u0BBF\u0B95\u0BBE\u0B9F\u0BCD\u0B9F\u0BBF\u0B95\u0BB3\u0BCD",
	},
	{
		id: "video",
		en: "Videos",
		si: "\u0DC0\u0DD3\u0DA9\u0DD2\u0DBA\u0DDD",
		ta: "\u0BB5\u0BC0\u0B9F\u0BBF\u0BAF\u0BCB\u0B95\u0BCD\u0B95\u0BB3\u0BCD",
	},
	{
		id: "pedagogy",
		en: "Pedagogy",
		si: "\u0DC1\u0DD2\u0D9A\u0DCA\u0DC2\u0DAB \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0",
		ta: "\u0B95\u0BB1\u0BCD\u0BAA\u0BBF\u0BA4\u0BCD\u0BA4\u0BB2\u0BCD \u0BAE\u0BC1\u0BB1\u0BC8",
	},
];
export interface KnowledgeNode {
	id: string;
	label: string;
	type: "resource" | "topic" | "persona" | "collection";
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
	supportedPerspectives?: ("astro" | "terra" | "dharma" | "vastu" | "jyoti")[];
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
	relationship?: NodeRelationship | "path" | "topic_association";
	isPathway?: boolean;
}
export interface KnowledgeTopology {
	nodes: KnowledgeNode[];
	links: KnowledgeLink[];
	supportedPerspectives?: ("astro" | "terra" | "dharma" | "vastu" | "jyoti")[];
	context?: {
		focusRegion?: string;
		zoomLevel?: number;
	};
}
// ============================================================================
// GRAPH & JOURNEY TYPES
// ============================================================================
export type NodeRelationship = LinkRelationship;
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
	status: "unlocked" | "in_progress" | "completed" | "mastered";
	progress_score: number;
	last_accessed_at: string;
}
