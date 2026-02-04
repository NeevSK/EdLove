/**
 * GRADING SYSTEM UTILITIES
 * 
 * Core functions for grade conversion and rank calculation.
 * Based on Sri Lankan education system standards.
 */

import { StudentGrade } from '../types/Grade';

/**
 * Converts marks (0-100) to grade letter and GPA (4.0 scale)
 * 
 * Conversion Table:
 * - 75-100: A (4.0 GPA) - Excellent
 * - 65-74:  B (3.0 GPA) - Very Good
 * - 55-64:  C (2.0 GPA) - Good
 * - 45-54:  D (1.0 GPA) - Satisfactory
 * - 35-44:  E (0.5 GPA) - Pass
 * - 25-34:  S (0.0 GPA) - Fail
 * - 0-24:   F (0.0 GPA) - Fail
 */
export function marksToGPA(marks: number): { grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'S' | 'F'; gpa: number } {
  if (marks >= 75) return { grade: 'A', gpa: 4.0 };
  if (marks >= 65) return { grade: 'B', gpa: 3.0 };
  if (marks >= 55) return { grade: 'C', gpa: 2.0 };
  if (marks >= 45) return { grade: 'D', gpa: 1.0 };
  if (marks >= 35) return { grade: 'E', gpa: 0.5 };
  if (marks >= 25) return { grade: 'S', gpa: 0.0 };
  return { grade: 'F', gpa: 0.0 };
}

/**
 * Calculates ranks for students based on marks.
 * Handles ties by assigning the same rank to students with equal marks.
 * When students tie, the next rank skips the tied positions.
 * Example: Two students tie for rank 1, next student gets rank 3.
 * 
 * @param grades - Array of student grades to rank
 * @returns Array of grades with rank property assigned
 */
export function calculateRanks(grades: StudentGrade[]): StudentGrade[] {
  // Sort by marks (descending - highest marks first)
  const sorted = [...grades].sort((a, b) => b.marks - a.marks);
  
  // Assign ranks (handle ties with proper rank skipping)
  return sorted.map((grade, index) => {
    // If same marks as previous student, assign same rank
    if (index > 0 && grade.marks === sorted[index - 1].marks) {
      return { ...grade, rank: sorted[index - 1].rank };
    }
    // Otherwise, rank is index + 1 (accounting for 0-based indexing)
    return { ...grade, rank: index + 1 };
  });
}
