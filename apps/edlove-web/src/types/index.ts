/**
 * EDLOVE TYPE DEFINITIONS
 *
 * TypeScript interfaces and types for EdLove data models
 * Based on EdLove architecture and content structure
 */

export type UserRole = 'admin' | 'user' | 'contributor' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  role: UserRole;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

// Common fields for all content types
export interface BaseContent {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  tags: string[];
  published: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}

// Domain I: Paradigms
export interface Paradigm extends BaseContent {
  domain: 'paradigm';
  order: number; // Display order
  color: string; // Accent color for this paradigm
  description: string; // Full markdown content
  key_principles: string[]; // Core principles
  examples: string[]; // Real-world examples
  resources: Resource[]; // Related resources
}

// Domain VI: Thinkers
export interface Thinker extends BaseContent {
  domain: 'thinker';
  era: string; // "1921–2007" or "Contemporary"
  region: string; // Geographic origin
  key_work: string; // Most important book/work
  biography: string; // Full markdown content
  contributions: string[]; // Key contributions to education
  quotes: Quote[]; // Notable quotes
  related_paradigms: string[]; // Paradigm IDs
}

// Domain VI: Practical Guides
export interface Guide extends BaseContent {
  domain: 'guide';
  paradigm: string; // Which paradigm this relates to
  difficulty: 'introductory' | 'intermediate' | 'deep';
  read_time: number; // minutes
  content: string; // Full markdown content
  steps: GuideStep[]; // Actionable steps
  resources: Resource[]; // Related resources
}

export interface GuideStep {
  title: string;
  description: string;
  action: string; // What to do
  examples?: string[]; // Real examples
}

// Domain VI: Stories
export interface Story extends BaseContent {
  domain: 'story';
  story_type: 'teacher' | 'student' | 'school' | 'family' | 'community';
  location: string;
  author_name?: string;
  author_role?: string;
  content: string; // Full markdown content
  key_insights: string[]; // Main takeaways
  related_paradigms: string[];
}

// Domain VI: Theoretical Frameworks
export interface Framework extends BaseContent {
  domain: 'framework';
  author: string;
  content: string; // Full markdown content
  key_concepts: string[];
  applications: string[]; // Practical applications
  related_thinkers: string[]; // Thinker IDs
}

export interface Quote {
  text: string;
  source?: string; // Book, speech, etc.
  year?: number;
}

export interface Resource {
  title: string;
  type: 'book' | 'article' | 'video' | 'website' | 'course' | 'tool';
  url?: string;
  description?: string;
  author?: string;
}

export interface SchoolData {
  id: string;
  name: string;
  type: 'government' | 'private' | 'international' | 'pirivena';
  province: string;
  district: string;
  student_count?: number;
  teacher_count?: number;
  facilities: string[];
  challenges: string[];
}

export interface EducationMetric {
  metric_name: string;
  value: number;
  unit: string;
  year: number;
  source: string;
  description?: string;
}

export interface GurudeviUser {
  id: string;
  full_name: string;
  email: string;
  role: 'teacher' | 'student' | 'principal';
  school_name?: string;
  gurudevi_profile_url?: string;
}

export interface GurudeviInsight {
  id: string;
  teacher_id: string;
  insight_type: 'venting' | 'note' | 'reflection';
  content: string;
  created_at: string;
  shared_with_edlove: boolean; // Anonymized sharing opt-in
}

export interface CommunityMember extends User {
  interests: string[];
  expertise: string[];
  location?: string;
  joined_at: string;
  contributions: number; // Number of posts/comments/resources shared
}

export interface Discussion {
  id: string;
  title: string;
  author_id: string;
  author: CommunityMember;
  content: string;
  category: string;
  tags: string[];
  replies_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: string;
  discussion_id: string;
  author_id: string;
  author: CommunityMember;
  content: string;
  likes_count: number;
  created_at: string;
}

export interface SearchResult {
  id: string;
  type: 'paradigm' | 'thinker' | 'guide' | 'story' | 'framework' | 'discussion';
  title: string;
  excerpt: string;
  url: string;
  relevance_score: number;
  highlights: string[]; // Matched text snippets
}

export interface FilterOptions {
  types?: string[]; // Content types to include
  tags?: string[]; // Filter by tags
  paradigms?: string[]; // Filter by paradigm
  difficulty?: string[]; // For guides
  era?: string[]; // For thinkers
  location?: string[]; // For stories/schools
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface NewsletterSubscription {
  email: string;
  interest_areas?: string[];
  frequency?: 'weekly' | 'monthly';
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  form_type: 'general' | 'collaboration' | 'feedback' | 'support';
}

export interface ResourceSubmission {
  submitter_name: string;
  submitter_email: string;
  resource_title: string;
  resource_type: Resource['type'];
  resource_url?: string;
  description: string;
  suggested_tags: string[];
  suggested_paradigms?: string[];
}

export interface NavigationState {
  current_domain: string;
  is_menu_open: boolean;
  is_search_open: boolean;
  scroll_progress: number; // 0-100
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number; // milliseconds (default: 3000)
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalState {
  is_open: boolean;
  type?: 'video' | 'image' | 'form' | 'confirmation' | 'content';
  title?: string;
  content?: any;
  on_close?: () => void;
  on_confirm?: () => void;
}

export interface AnalyticsEvent {
  event_name: string;
  properties?: Record<string, any>;
  user_id?: string;
  timestamp: string;
}

export interface PageView {
  page_url: string;
  page_title: string;
  referrer?: string;
  user_id?: string;
  session_id: string;
  timestamp: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorLog extends AppError {
  severity: ErrorSeverity;
  context: Record<string, any>;
  user_id?: string;
}

// Make all properties optional (for partial updates)
export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

// Extract just the ID from any type
export type WithId<T> = T & { id: string };

// Omit timestamps (for creation)
export type OmitTimestamps<T> = Omit<T, 'created_at' | 'updated_at'>;

// Content types union
export type ContentType = Paradigm | Thinker | Guide | Story | Framework;

// All domain types union
export type DomainType = 'paradigm' | 'thinker' | 'guide' | 'story' | 'framework';
