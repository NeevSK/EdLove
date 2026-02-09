/**
 * Sri Lankan Standard Grading Conversion
 * 
 * A: 75-100 (4.0)
 * B: 65-74 (3.0)
 * C: 50-64 (2.0)
 * S: 35-49 (1.0)
 * F: 0-34 (0.0)
 */
export function marksToGPA(marks: number): { grade: string, gpa: number } {
  if (marks >= 75) return { grade: 'A', gpa: 4.0 };
  if (marks >= 65) return { grade: 'B', gpa: 3.0 };
  if (marks >= 50) return { grade: 'C', gpa: 2.0 };
  if (marks >= 35) return { grade: 'S', gpa: 1.0 };
  return { grade: 'F', gpa: 0.0 };
}
