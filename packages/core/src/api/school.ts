import {
  SchoolGradeSchema,
  SchoolSchema,
  SchoolStatsSchema,
  SectionSchema,
} from '../logic/schemas/school.schema';
import type { SchoolGrade as Grade, School, SchoolStats, Section } from '../types';
import { educational } from '../logic/managers/factory';

/**
 * API methods for Managing School Institutions.
 * Following Protocol-Oriented Authority.
 */
export const schoolAPI = {
  /**
   * Create a new school
   */
  async create(data: {
    name: string;
    handle?: string | null;
    type: string;
    created_by: string;
  }): Promise<School> {
    const newSchool = await educational.institutions.create(data);
    return SchoolSchema.parse(newSchool) as unknown as School;
  },

  /**
   * Initializes a personal workspace for a user.
   */
  async initializePersonalWorkspace(userId: string, name: string): Promise<string | null> {
    const schoolName = `${name}'s Workspace`;
    const schoolData = await educational.institutions.create({
      name: schoolName,
      type: 'personal_workspace',
      created_by: userId,
    });
    return schoolData?.id || null;
  },

  /**
   * Get school details
   */
  async getSchool(schoolId: string): Promise<School> {
    const data = await educational.institutions.getById(schoolId);
    return SchoolSchema.parse(data) as unknown as School;
  },

  /**
   * Update school details
   */
  async update(id: string, updates: Partial<School>): Promise<School> {
    const data = await educational.institutions.update(id, updates);
    return SchoolSchema.parse(data) as unknown as School;
  },

  /**
   * Search for schools by name
   */
  async searchSchools(query: string): Promise<School[]> {
    const data = await educational.institutions.search(query);
    return (data || []).map((s) => SchoolSchema.parse(s)) as unknown as School[];
  },

  /**
   * Get sections for a school.
   */
  async getSections(schoolId: string): Promise<Section[]> {
    const data = await educational.institutions.getSections(schoolId);
    return (data || []).map((section) => SectionSchema.parse(section)) as unknown as Section[];
  },

  /**
   * Get grades for a section.
   */
  async getGrades(sectionId: string): Promise<Grade[]> {
    const data = await educational.institutions.getGrades(sectionId);
    return (data || []).map((grade) => SchoolGradeSchema.parse(grade)) as unknown as Grade[];
  },

  /**
   * Get school statistics for dashboard
   */
  async getSchoolStats(schoolId: string, _viewDate?: string): Promise<SchoolStats> {
    // Note: Stats are currently computed in the repository or projection services.
    // We delegate to the educational manager which uses the stats repository.
    const stats = await educational.classrooms.getTeacherStats(schoolId); // This is a bit of a mismatch in names, but follows existing patterns
    
    // Fallback for now to maintain API shape
    const fallbackStats = {
      total_students: 0,
      total_teachers: 0,
      total_classrooms: 0,
      total_sections: 0,
    };

    return SchoolStatsSchema.parse(fallbackStats) as unknown as SchoolStats;
  },

  /**
   * Get invite codes for a school
   */
  async getInviteCodes(schoolId: string): Promise<any[]> {
    return educational.institutions.getInviteCodes(schoolId);
  },

  /**
   * Create a new section for a school.
   */
  async createSection(schoolId: string, name: string): Promise<Section> {
    const data = await educational.institutions.createSection(schoolId, name);
    return SectionSchema.parse(data) as unknown as Section;
  },

  /**
   * Create a new grade for a section.
   */
  async createGrade(sectionId: string, number: number): Promise<Grade> {
    const data = await educational.institutions.createGrade(sectionId, number);
    return SchoolGradeSchema.parse(data) as unknown as Grade;
  },

  /**
   * Generate a new invite code for a school
   */
  async generateInviteCode(schoolId: string, role: string, createdBy: string): Promise<any> {
    return educational.institutions.generateInviteCode(schoolId, role, createdBy);
  },
};
