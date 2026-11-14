// Moved from packages/self/src/types/Wellbeing.ts (2026-11-11): @repo/core owns every contract.

/**
 * Types for progressive wellbeing features
 * Aligned with teacher sanctuary philosophy
 */

export interface Goal {
  id: string;
  user_id: string;
  text: string;
  progress: number; // 0-100
  is_completed?: boolean;
  created_at: string;
}

export interface JoyMoment {
  id: string;
  user_id: string;
  student_name?: string;
  moment_description: string;
  category: 'breakthrough' | 'question' | 'connection' | 'other';
  created_at: string;
}

export interface GratitudeEntry {
  id: string;
  user_id: string;
  content: string;
  category: 'student-said' | 'colleague-kindness' | 'personal-win';
  created_at: string;
}

export interface WisdomNote {
  id: string;
  user_id: string;
  insight: string;
  tags?: string[];
  created_at: string;
}

export interface DecisionLog {
  id: string;
  user_id: string;
  decision_text: string;
  context?: string;
  is_reviewed: boolean;
  created_at: string;
}

export interface DailyPrepItem {
  id: string;
  user_id: string;
  item_text: string;
  prep_date: string; // ISO date
  is_completed: boolean;
  created_at: string;
}

export interface FeatureUsageLog {
  id: string;
  user_id: string;
  feature_name: string;
  interaction_type: 'view' | 'interact' | 'complete';
  duration_seconds?: number;
  created_at: string;
}

export interface EnergyForecast {
  id: string;
  user_id: string;
  energy_level: 1 | 2 | 3 | 4 | 5; // 1=depleted, 5=energized
  notes?: string;
  forecast_date: string; // ISO date
  created_at: string;
}

export interface ContextualMoment {
  id: string;
  user_id: string;
  moment_type: 'afternoon_wall' | 'parking_lot_exhale' | 'sunday_prep' | 'morning_energy';
  acknowledged: boolean;
  prompt_text?: string;
  created_at: string;
}

// Feature metadata for progressive disclosure
export interface FeatureMetadata {
  id: string;
  label: string;
  icon: React.ComponentType; // Lucide icon component
  category: 'core' | 'contextual' | 'discover';
  timing?: {
    startTime?: string; // HH:mm
    endTime?: string;
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  };
  eroi?: number; // Effort Return on Investment ratio
  description: string;
}

/** The moods a person can log. Labels and emoji belong to each app's UI. */
export type MoodValue = 'sad' | 'frustrated' | 'anxious' | 'calm' | 'curious' | 'joyful';

/** A logged mood, as stored: mood and note may be empty. */
export interface MoodLog {
  id: string;
  user_id: string;
  /** 1-5. */
  mood_score: number;
  mood?: MoodValue | null;
  note?: string | null;
  created_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  quality: number; // 1-5 scale
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface FireJournalEntry {
  id: string;
  user_id: string;
  content_preview: string; // First 50 chars for privacy
  is_burned: boolean;
  created_at: string;
}

export interface Period {
  id: string;
  user_id: string;
  day_of_week: number;
  period_number: number;
  subject?: string;
  activity?: string;
  class_name?: string;
  type: 'subject' | 'relief' | 'interval';
  start_time: string;
  end_time: string;
}

export interface DailyContent {
  id: string;
  type: 'motivation' | 'did_you_know';
  content: string;
  author?: string;
  date: string;
  active: boolean;
  created_at: string;
}
