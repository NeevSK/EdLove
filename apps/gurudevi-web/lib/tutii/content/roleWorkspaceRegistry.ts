// apps/gurudevi-web/lib/tutii/content/roleWorkspaceRegistry.ts

export type SanctuaryRoleKey = 'teacher' | 'principal' | 'student' | 'guardian' | 'all';

export interface RoleWorkspaceDescriptor {
  role: SanctuaryRoleKey;
  roleLabel: string;
  roleEmoji: string;
  tabLabel: string;
  tabIcon: string;
  tutiiSentence: string;
  previewTitle: string;
  previewDetail: string;
  href: string;
}

export const ROLE_WORKSPACE_DESCRIPTORS: Record<SanctuaryRoleKey, RoleWorkspaceDescriptor> = {
  teacher: {
    role: 'teacher',
    roleLabel: 'Teacher',
    roleEmoji: '👨‍🏫',
    tabLabel: 'Classroom',
    tabIcon: '🏫',
    tutiiSentence:
      'Classroom is your teaching floor: 10-second attendance roll calls, term gradebooks, and class pacing.',
    previewTitle: 'Inside Classroom',
    previewDetail: '10-Second Roll Call • Term Gradebooks • Class Pacing Guides',
    href: '/workspace?task=attendance',
  },
  principal: {
    role: 'principal',
    roleLabel: 'Principal',
    roleEmoji: '🏛️',
    tabLabel: 'School',
    tabIcon: '🏛️',
    tutiiSentence:
      'School is your campus control desk: doorway kiosk, teacher circulars, student ID badges, and staff rosters.',
    previewTitle: 'Inside School',
    previewDetail: 'Campus Kiosk • Staff Circulars • Verified ID Badges • Roster Management',
    href: '/workspace?task=school',
  },
  student: {
    role: 'student',
    roleLabel: 'Student',
    roleEmoji: '🎓',
    tabLabel: 'Learning',
    tabIcon: '🎓',
    tutiiSentence:
      'Learning is your personal study desk: today’s timetable, assignments, attendance presence, and learning plans.',
    previewTitle: 'Inside Learning',
    previewDetail: 'Daily Timetable • Assignment Submissions • Attendance Streak',
    href: '/workspace?task=timetable',
  },
  guardian: {
    role: 'guardian',
    roleLabel: 'Guardian',
    roleEmoji: '👨‍👩‍👧',
    tabLabel: 'Family',
    tabIcon: '👨‍👩‍👧',
    tutiiSentence:
      'Family is your school window: your ward’s attendance check-ins, circulars, and teacher messages.',
    previewTitle: 'Inside Family',
    previewDetail: 'Ward Attendance Alerts • School Circulars • Direct Teacher Notices',
    href: '/workspace?task=attendance',
  },
  all: {
    role: 'all',
    roleLabel: 'Common',
    roleEmoji: '🌿',
    tabLabel: 'Workspace',
    tabIcon: '🏫',
    tutiiSentence:
      'Workspace is where daily school work happens: attendance roll calls, gradebooks, and school operations.',
    previewTitle: 'Inside Workspace',
    previewDetail: '10-Second Attendance Roll Call • Term Gradebooks • Class Pacing',
    href: '/workspace',
  },
};

export const AVAILABLE_ROLES_LIST: SanctuaryRoleKey[] = [
  'teacher',
  'principal',
  'student',
  'guardian',
];

export function getRoleWorkspaceDescriptor(role?: string | null): RoleWorkspaceDescriptor {
  if (!role) return ROLE_WORKSPACE_DESCRIPTORS.teacher;
  const normalized = role.toLowerCase().trim() as SanctuaryRoleKey;
  return ROLE_WORKSPACE_DESCRIPTORS[normalized] ?? ROLE_WORKSPACE_DESCRIPTORS.teacher;
}
