import {
  SIMPLIFIED_GRADING_SCALE,
  STANDARD_GRADING_SCALE,
  WEIGHTED_GRADING_SCALE,
} from '../types/GradingTypes';
export class GPACalculator {
  scale;
  constructor(options = {}) {
    this.scale = this.getGradingScale(options);
  }
  getGradingScale(options) {
    switch (options.scale) {
      case 'simplified':
        return SIMPLIFIED_GRADING_SCALE;
      case 'weighted':
        return WEIGHTED_GRADING_SCALE;
      case 'custom':
        return options.customScale || STANDARD_GRADING_SCALE;
      default:
        return STANDARD_GRADING_SCALE;
    }
  }
  /**
   * Simple marks to GPA conversion (Sri Lankan Standard)
   * A: 75-100 (4.0), B: 65-74 (3.0), C: 50-64 (2.0), S: 35-49 (1.0), F: 0-34 (0.0)
   */
  marksToGPA(marks) {
    if (marks >= 75) return { grade: 'A', gpa: 4.0 };
    if (marks >= 65) return { grade: 'B', gpa: 3.0 };
    if (marks >= 50) return { grade: 'C', gpa: 2.0 };
    if (marks >= 35) return { grade: 'S', gpa: 1.0 };
    return { grade: 'F', gpa: 0.0 };
  }
  /**
   * Convert marks to grade and GPA based on the configured scale
   */
  marksToGradeAndGPA(marks) {
    const range = this.scale.ranges.find((r) => marks >= r.min && marks <= r.max);
    return range || { grade: 'F', gpa: 0.0 };
  }
  /**
   * Calculate GPA from a list of grades
   */
  calculateGPA(grades, options = {}) {
    if (grades.length === 0) return 0.0;
    let totalPoints = 0;
    let totalCredits = 0;
    for (const grade of grades) {
      // Skip excluded assignments
      if (options.excludeAssignments?.includes(grade.assignment_id || '')) {
        continue;
      }
      const weight = options.weights?.[grade.assignment_id || ''] || 1;
      const { gpa } = this.marksToGradeAndGPA(grade.marks);
      totalPoints += gpa * weight;
      totalCredits += weight;
    }
    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
  }
  /**
   * Calculate cumulative GPA across multiple grading periods
   */
  calculateCumulativeGPA(gradebookEntries) {
    const periodGPAs = {};
    // Group grades by period
    for (const entry of gradebookEntries) {
      if (!entry?.periodId) continue;
      let periodGrades = periodGPAs[entry.periodId];
      if (!periodGrades) {
        periodGrades = [];
        periodGPAs[entry.periodId] = periodGrades;
      }
      periodGrades.push({
        id: entry.id ?? '',
        student_id: entry.studentId ?? '',
        assignment_id: entry.assignmentId ?? '',
        marks: entry.marks ?? 0,
        grade: entry.letterGrade ?? '',
        gpa: entry.gpa,
        created_at: entry.gradedAt,
        updated_at: entry.gradedAt,
        classroom_id: '', // Not in GradebookEntry, but required for POA type
        graded_by: '', // Not in GradebookEntry, but required for POA type
      });
    }
    // Calculate GPA for each period
    const calculatedPeriodGPAs = {};
    let totalQualityPoints = 0;
    let totalCredits = 0;
    for (const [periodId, grades] of Object.entries(periodGPAs)) {
      const periodGPA = this.calculateGPA(grades);
      calculatedPeriodGPAs[periodId] = periodGPA;
      // For cumulative, we'll use equal weighting for periods
      totalQualityPoints += periodGPA;
      totalCredits += 1;
    }
    const cumulativeGPA = totalCredits > 0 ? totalQualityPoints / totalCredits : 0.0;
    return {
      periodGPAs: calculatedPeriodGPAs,
      cumulativeGPA,
    };
  }
  /**
   * Predict GPA based on current performance trends
   */
  predictGPA(currentGrades, remainingAssignments, options = {}) {
    const currentGPA = this.calculateGPA(currentGrades, options);
    if (remainingAssignments.length === 0) {
      return {
        predictedGPA: currentGPA,
        minGPA: currentGPA,
        maxGPA: currentGPA,
      };
    }
    // Calculate current quality points and credits
    let currentQualityPoints = 0;
    let currentCredits = 0;
    for (const grade of currentGrades) {
      if (options.excludeAssignments?.includes(grade.assignment_id || '')) continue;
      const weight = options.weights?.[grade.assignment_id || ''] || 1;
      currentQualityPoints += grade.gpa * weight;
      currentCredits += weight;
    }
    // Predict scenarios
    const remainingCredits = remainingAssignments.reduce(
      (sum, assignment) => sum + (assignment.weight || 1),
      0,
    );
    // Best case: perfect scores on remaining assignments
    const bestCasePoints = currentQualityPoints + 4.0 * remainingCredits;
    const maxGPA = (currentQualityPoints + bestCasePoints) / (currentCredits + remainingCredits);
    // Worst case: failing scores on remaining assignments
    const worstCasePoints = currentQualityPoints;
    const minGPA = worstCasePoints / (currentCredits + remainingCredits);
    // Realistic prediction based on current performance
    const predictedGPA =
      (currentGPA * currentCredits + currentGPA * remainingCredits) /
      (currentCredits + remainingCredits);
    return {
      predictedGPA: Math.min(4.0, Math.max(0.0, predictedGPA)),
      minGPA: Math.min(4.0, Math.max(0.0, minGPA)),
      maxGPA: Math.min(4.0, Math.max(0.0, maxGPA)),
    };
  }
  /**
   * Get grade distribution for a class
   */
  getGradeDistribution(grades) {
    const distribution = {};
    for (const grade of grades) {
      const { grade: letterGrade } = this.marksToGradeAndGPA(grade.marks);
      distribution[letterGrade] = (distribution[letterGrade] || 0) + 1;
    }
    return distribution;
  }
  /**
   * Calculate class rank based on GPA
   */
  calculateClassRanks(studentGPAs) {
    // Sort by GPA descending
    const sorted = [...studentGPAs].sort((a, b) => b.gpa - a.gpa);
    return sorted.map((student, index) => ({
      ...student,
      rank: index + 1,
      percentile: ((sorted.length - index) / sorted.length) * 100,
    }));
  }
  /**
   * Simple rank calculation based on marks (legacy compatibility)
   */
  calculateRanks(grades) {
    const sorted = [...grades].sort((a, b) => b.marks - a.marks);
    return grades.map((grade) => {
      const rank = sorted.findIndex((s) => s.id === grade.id) + 1;
      return { ...grade, rank };
    });
  }
}
