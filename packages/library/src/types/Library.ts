// ============================================================================
// LIBRARY RESOURCE TYPES
// ============================================================================
import type { TemporalScale } from '@repo/core/store';
import type {
  BaseResource,
  Capacity,
  LayoutResult,
  LinkRelationship,
  ResourceFormat,
  ResourceType,
} from '@repo/core/types';

export type { LayoutResult, ResourceFormat, ResourceType }; // Re-export for package consumers
export type ResourceDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ResourceLanguage = 'english' | 'sinhala' | 'tamil';
export type ResourceVisibility =
  | 'private'
  | 'class'
  | 'grade'
  | 'school'
  | 'public'
  | 'shared'
  | 'personal';
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
  creator_capacity: Capacity;
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
  media?: import('@repo/core/types').MediaAsset; // Abstracted Media Asset
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
  topic?: string; // Added for single topic filtering
  subjects?: string[];
  topics?: string[];
  grades?: number[];
  difficulty?: ResourceDifficulty;
  languages?: ResourceLanguage[];
  visibility?: ResourceVisibility;
  source?: 'core' | 'community';
  verified_only?: boolean;
  creator_capacity?: Capacity;
  tags?: string[];
  search?: string;
  sort_by?: 'recent' | 'popular' | 'most_used' | 'most_endorsed' | 'most_bookmarked';
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
  only_virtual?: boolean;
  exclude_virtual?: boolean;
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
  thumbnail_url?: string;
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
    id: 'All',
    en: 'All',
    si: '\u0DC3\u0DD2\u0DBA\u0DBD\u0DCA\u0DBD',
    ta: '\u0B85\u0BA9\u0BC8\u0BA4\u0BCD\u0BA4\u0BC1\u0BAE\u0BCD',
  },
  {
    id: 'lesson',
    en: 'Lessons',
    si: '\u0DB4\u0DCF\u0DA9\u0DB8\u0DCA',
    ta: '\u0BAA\u0BBE\u0B9F\u0B99\u0BCD\u0B95\u0BB3\u0BCD',
  },
  {
    id: 'worksheet',
    en: 'Worksheets',
    si: '\u0DC0\u0DD0\u0DA9\u0DB4\u0DAD\u0DCA',
    ta: '\u0BAA\u0BAF\u0BBF\u0BB1\u0BCD\u0B9A\u0BBF\u0BA4\u0BCD \u0BA4\u0BBE\u0BB3\u0BCD\u0B95\u0BB3\u0BCD',
  },
  {
    id: 'guide',
    en: 'Guides',
    si: '\u0DB8\u0D9F\u0DB4\u0DD9\u0DB1\u0DCA\u0DC0\u0DB1\u0DCA\u0DB1\u0DB1\u0DCA',
    ta: '\u0BB5\u0BB4\u0BBF\u0B95\u0BBE\u0B9F\u0BCD\u0B9F\u0BBF\u0B95\u0BB3\u0BCD',
  },
  {
    id: 'video',
    en: 'Videos',
    si: '\u0DC0\u0DD3\u0DA9\u0DD2\u0DBA\u0DDD',
    ta: '\u0BB5\u0BC0\u0B9F\u0BBF\u0BAF\u0BCB\u0B95\u0BCD\u0B95\u0BB3\u0BCD',
  },
  {
    id: 'pedagogy',
    en: 'Pedagogy',
    si: '\u0DC1\u0DD2\u0D9A\u0DCA\u0DC2\u0DAB \u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DC0',
    ta: '\u0B95\u0BB1\u0BCD\u0BAA\u0BBF\u0BA4\u0BCD\u0BA4\u0BB2\u0BCD \u0BAE\u0BC1\u0BB1\u0BC8',
  },
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
// READER ANNOTATIONS (P2)
// ============================================================================
export type AnnotationColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple';

export interface TextHighlight {
  id: string;
  resourceId: string;
  userId: string;
  // PDF text selection
  cfiRange?: string; // EPUB CFI
  pdfSelection?: {
    pageIndex: number;
    rects: { x: number; y: number; width: number; height: number }[];
    text: string;
  };
  // Common
  color: AnnotationColor;
  createdAt: string;
  updatedAt: string;
}

export interface TextNote {
  id: string;
  resourceId: string;
  userId: string;
  // Anchor (can attach to highlight or standalone position)
  highlightId?: string;
  cfiPosition?: string;
  pdfPosition?: { pageIndex: number; x: number; y: number };
  content: string;
  // Metadata
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  resourceId: string;
  userId: string;
  // Position
  cfiProgress?: string; // EPUB
  pdfProgress?: {
    pageIndex: number;
    scrollY: number;
    totalPages: number;
  };
  // Metadata
  timeSpentMs: number;
  completedAt?: string;
  lastReadAt: string;
}

export interface Bookmark {
  id: string;
  resourceId: string;
  userId: string;
  // Position
  cfiPosition?: string;
  pdfPosition?: { pageIndex: number; scrollY: number };
  title?: string;
  note?: string;
  createdAt: string;
}

// ============================================================================
// READER STATE (ephemeral, for in-memory reader state)
// ============================================================================
export interface ReaderSettings {
  fontSize: number;
  fontFamily: 'serif' | 'sans' | 'mono';
  theme: 'light' | 'dark' | 'sepia';
  lineHeight: number;
  margin: 'narrow' | 'normal' | 'wide';
  scrollMode: 'paginated' | 'scroll';
  twoPageSpread: boolean;
}

export interface ReaderState {
  resourceId: string;
  currentLocation: {
    cfi?: string;
    pdfPageIndex?: number;
    pdfScrollY?: number;
  };
  highlights: TextHighlight[];
  notes: TextNote[];
  progress: ReadingProgress | null;
  bookmarks: Bookmark[];
  settings: ReaderSettings;
}

// ============================================================================
// DATABASE ROW TYPES (for internal use)
// ============================================================================
export interface TextHighlightRow {
  id: string;
  resource_id: string;
  user_id: string;
  cfi_range: string | null;
  pdf_page_index: number | null;
  pdf_rects: string | null;
  pdf_text: string | null;
  color: string;
  created_at: number;
  updated_at: number;
}

export interface TextNoteRow {
  id: string;
  resource_id: string;
  user_id: string;
  highlight_id: string | null;
  cfi_position: string | null;
  pdf_page_index: number | null;
  pdf_x: number | null;
  pdf_y: number | null;
  content: string;
  is_private: number;
  tags: string | null;
  created_at: number;
  updated_at: number;
}

export interface ReadingProgressRow {
  id: string;
  resource_id: string;
  user_id: string;
  cfi_progress: string | null;
  pdf_page_index: number | null;
  pdf_scroll_y: number | null;
  pdf_total_pages: number | null;
  time_spent_ms: number;
  completed_at: number | null;
  last_read_at: number;
}

export interface BookmarkRow {
  id: string;
  resource_id: string;
  user_id: string;
  cfi_position: string | null;
  pdf_page_index: number | null;
  pdf_scroll_y: number | null;
  title: string | null;
  note: string | null;
  created_at: number;
}

// ============================================================================
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

// ============================================================================
// GRAPH & JOURNEY TYPES
// ============================================================================
export type NodeRelationship = LinkRelationship;
