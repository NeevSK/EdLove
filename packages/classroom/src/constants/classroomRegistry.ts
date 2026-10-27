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
    journey: {
      featureId: 'teacher',
      targetPersonas: ['teacher'],
      stage: 'daily_circadian',
      entryRoute: '/workspace/classroom',
      sequence: [
        {
          step: 0,
          screenId: 'teacher_section_list',
          route: '/workspace/classroom',
          title: 'Teacher Studio & Class Roster',
          purpose: 'on_ramp',
        },
        {
          step: 1,
          screenId: 'classroom_session',
          route: '/workspace/classroom/[classroomId]',
          title: 'Classroom Floor',
          purpose: 'primary_action',
        },
        {
          step: 2,
          screenId: 'attendance_register',
          route: '/workspace/classroom/[classroomId]/attendance',
          title: 'Attendance Register',
          purpose: 'sub_detail',
        },
        {
          step: 3,
          screenId: 'gradebook_roster',
          route: '/workspace/classroom/[classroomId]/gradebook',
          title: 'Gradebook & Assessment',
          purpose: 'sub_detail',
        },
      ],
      feedback: {
        tutiiMode: 'guiding',
        tutiiRole: 'guide',
        haptic: 'selection',
        soundChime: 'subtle_tap',
        scaffoldDismissalKey: 'teacher_first_classroom_scaffold',
        scaffoldThreshold: 3,
      },
    },
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
    journey: {
      featureId: 'student',
      targetPersonas: ['student'],
      stage: 'daily_circadian',
      entryRoute: '/workspace/classroom/student',
      sequence: [
        {
          step: 0,
          screenId: 'student_claim_gate',
          route: '/workspace/classroom/student',
          title: 'Join Classroom Sanctuary',
          purpose: 'on_ramp',
        },
        {
          step: 1,
          screenId: 'student_learning_hub',
          route: '/workspace/classroom/student/[classroomId]',
          title: 'Student Learning Sanctuary',
          purpose: 'primary_action',
        },
        {
          step: 2,
          screenId: 'learning_reflection',
          route: '/workspace/classroom/reflect',
          title: 'Daily Somatic Reflection',
          purpose: 'feedback_completion',
        },
      ],
      feedback: {
        tutiiMode: 'celebrating',
        tutiiRole: 'companion',
        haptic: 'success',
        soundChime: 'celebration',
        scaffoldDismissalKey: 'student_desk_pass_scaffold',
        scaffoldThreshold: 3,
      },
    },
  },
};
