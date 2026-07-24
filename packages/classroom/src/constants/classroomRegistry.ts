import type { DomainFeature } from '@repo/core/types';

export const CLASSROOM_REGISTRY: Record<string, DomainFeature> = {
  teacher_dashboard: {
    id: 'teacher',
    surfaceId: 'teacher',
    ownerPackage: 'classroom',
    defaultZone: 'work',
    defaultOrder: 40,
    label: 'Teacher Studio',
    description: 'Daily classroom authorship and student engagement',
    citizenshipRequired: 3, // Wanderers can use locally
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    capabilityRequirement: { action: 'read', subject: 'TeacherDashboard' },
    tabDomain: 'workspace',
    analyticsKey: 'workspace.teacher_dashboard',
  },
  student_dashboard: {
    id: 'student',
    surfaceId: 'student',
    ownerPackage: 'classroom',
    defaultZone: 'work',
    defaultOrder: 50,
    label: 'Student Journey',
    description: 'Learning, submissions, and personal progress',
    citizenshipRequired: 3, // Wanderers can use locally
    mobileSupport: true,
    webSupport: true,
    state: 'live',
    capabilityRequirement: { action: 'read', subject: 'StudentDashboard' },
    tabDomain: 'workspace',
    analyticsKey: 'workspace.student_dashboard',
  },
};
