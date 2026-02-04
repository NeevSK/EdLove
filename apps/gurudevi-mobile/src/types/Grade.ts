/**
 * GRADING SYSTEM TYPE DEFINITIONS
 * 
 * Defines types for the Gurudevi dual grading system.
 * Supports both traditional marks (0-100) and GPA-based grading.
 */

export interface StudentGrade {
  id: string;
  student_id: string;
  classroom_id: string;
  assignment_id?: string; // Optional: Links grade to specific assignment
  marks: number; // 0-100 (always stored)
  grade?: 'A' | 'B' | 'C' | 'D' | 'E' | 'S' | 'F';
  gpa?: number;
  rank?: number;
  feedback?: string;
  graded_at: Date;
}

export interface ClassroomGradingSettings {
  classroom_id: string;
  grading_mode: 'marks' | 'gpa' | 'both';
  show_ranks: boolean;
}
