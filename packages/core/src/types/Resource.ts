// ============================================================================
// BASE RESOURCE TYPES
// ============================================================================

export type ResourceType =
  | 'lesson'
  | 'worksheet'
  | 'guide' // teacher guides
  | 'reading'
  | 'pedagogy'
  | 'video'
  | 'link'
  | 'other'
  | 'pdf'
  | 'doc'
  | 'note'
  | 'map' // real maps, visual maps, infographics, mind maps, brochures
  | 'infographic' // standalone infographics / visual explainers
  | 'story' // stories for students and teachers
  | 'circular' // official circulars from the Education Ministry (SL)
  | 'movie_trailer' // inspiring YouTube trailers
  | 'tech_guide' // technology guides for teachers
  | 'form' // interactive forms, quizzes, surveys
  | 'graphic'; // knowledge graphs, visualizations, topologies

export type ResourceFormat = 'text' | 'video' | 'interactive' | 'audio' | 'document';

export interface BaseResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  format: ResourceFormat;
  url?: string;
  file_path?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface ClassroomResource {
  id: string;
  classroom_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  type: ResourceType;
  url?: string;
  content?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  owner_context?: 'classroom' | 'institutional';
}
