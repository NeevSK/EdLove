import { educational } from '@repo/core/logic/managers/factory';
import {
  EduSchoolSchema,
  SchoolGradeSchema,
  SchoolSchema,
  SchoolStatsSchema,
  SectionSchema,
} from '@repo/core/logic/schemas/school.schema';
import type {
  EduSchool,
  SchoolGrade as Grade,
  School,
  SchoolStats,
  Section,
} from '@repo/core/types';

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

  /** Search canonical registry facts without creating a tenant school. */
  async searchCanonicalSchools(query: string, limit = 20): Promise<EduSchool[]> {
    const data = await educational.institutions.searchCanonical(query, limit);
    return (data || []).map((school) => EduSchoolSchema.parse(school)) as EduSchool[];
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
    const _stats = await educational.classrooms.getTeacherStats(schoolId); // This is a bit of a mismatch in names, but follows existing patterns

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
  async generateInviteCode(
    schoolId: string,
    capacity: string,
    createdBy: string,
    idempotencyKey?: string,
  ): Promise<any> {
    return educational.institutions.generateInviteCode(
      schoolId,
      capacity,
      createdBy,
      idempotencyKey,
    );
  },
};

// ---------------------------------------------------------------------------
// Sandbox ghost-seeding registration for this domain.
// ---------------------------------------------------------------------------
import { isEmptyOrNull, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import { MOCK_SCHOOL, MOCK_SCHOOL_STATS } from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'school',
  ghostMethods: ['getSchool', 'getSchoolStats'],
  isEmpty: (method, data) => {
    if (method === 'getSchool') return !data || !(data as any).id;
    if (method === 'getSchoolStats') {
      const s = data as any;
      return !s || (s.total_students === 0 && s.total_teachers === 0 && s.total_classrooms === 0);
    }
    return isEmptyOrNull(data);
  },
  getSamples: (method) => {
    if (method === 'getSchool') return { ...MOCK_SCHOOL, is_sample: true };
    return { ...MOCK_SCHOOL_STATS, is_sample: true };
  },
});
