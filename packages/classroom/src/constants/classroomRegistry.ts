import { defineFeatureLifecycle } from '@repo/core/logic/registry/domainEntry';
import type { DomainFeature } from '@repo/core/types';

const REGISTRY_LIFECYCLE = defineFeatureLifecycle({
  owner: 'classroom',
  createdAt: '2026-07-26',
  reviewAt: '2026-09-30',
  permanentJustification: 'Stable catalog capability governed by the AppCatalog owner.',
});

export const CLASSROOM_REGISTRY: Record<string, DomainFeature> = {
  teacher: {
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
    lifecycle: REGISTRY_LIFECYCLE,
    capabilityRequirement: { action: 'read', subject: 'TeacherDashboard' },
    tabDomain: 'workspace',
    analyticsKey: 'workspace.teacher_dashboard',
  },
  student: {
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
    lifecycle: REGISTRY_LIFECYCLE,
    capabilityRequirement: { action: 'read', subject: 'StudentDashboard' },
    tabDomain: 'workspace',
    analyticsKey: 'workspace.student_dashboard',
  },
};
