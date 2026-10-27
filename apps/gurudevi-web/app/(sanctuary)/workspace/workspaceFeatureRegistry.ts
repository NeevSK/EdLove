import {
  CAPABILITY_MANIFEST,
  type CapabilityDeclaration,
  declaredCapability,
  getCapabilitiesForCapacity,
  resolvePracticeAvailability,
} from '@repo/core/logic/registry/capabilityManifest';
import type { WorkspaceRoleFilter } from '../components/RoleLensSwitcher';

export interface WorkspaceFeatureItem {
  id: string;
  label: string;
  href: string;
  symbol: string;
  description: string;
  roles: readonly ('teacher' | 'student' | 'principal' | 'guardian')[];
  isCommon: boolean;
  category: 'operations' | 'academics' | 'institutional' | 'communications';
  capabilityId?: 'attendance' | 'climate_sensing' | 'learning_studio' | 'family_bridge';
  temporalCapabilities: {
    hasReview: boolean;
    hasPlan: boolean;
  };
}

export const WORKSPACE_FEATURES: readonly WorkspaceFeatureItem[] = [
  {
    id: 'attendance',
    label: 'Daily Attendance',
    href: '/workspace',
    symbol: '🗓️',
    description: 'Classroom roll call, presence logs, and student arrival tracking.',
    roles: ['teacher', 'student', 'principal', 'guardian'],
    isCommon: true,
    category: 'operations',
    capabilityId: 'attendance',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'timetable',
    label: 'Timetable',
    href: '/workspace/timetable',
    symbol: '📅',
    description: 'Weekly schedule of periods, subjects, and classroom venues.',
    roles: ['teacher', 'student'],
    isCommon: true,
    category: 'academics',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'notices',
    label: 'Circulars & Notices',
    href: '/workspace/notices',
    symbol: '📢',
    description: 'Institutional announcements, letters, and community broadcasts.',
    roles: ['teacher', 'student', 'principal', 'guardian'],
    isCommon: true,
    category: 'communications',
    capabilityId: 'family_bridge',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'submissions',
    label: 'Assignment Submissions',
    href: '/workspace/submissions',
    symbol: '📥',
    description: 'Coursework turn-in, student assignment uploads, and teacher feedback desk.',
    roles: ['teacher', 'student'],
    isCommon: false,
    category: 'academics',
    capabilityId: 'learning_studio',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'climate',
    label: 'Climate Sensing',
    href: '/workspace/climate',
    symbol: '⛅',
    description: 'Classroom psychological safety, attunement, peer belonging, and wellbeing pulse.',
    roles: ['teacher', 'principal'],
    isCommon: false,
    category: 'operations',
    capabilityId: 'climate_sensing',
    temporalCapabilities: { hasReview: true, hasPlan: false },
  },
  {
    id: 'tuition',
    label: 'Tuition & Fees',
    href: '/workspace/tuition',
    symbol: '💳',
    description: 'Institutional fee ledgers, payment receipt generation, and family dues tracking.',
    roles: ['principal', 'guardian'],
    isCommon: false,
    category: 'institutional',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'gradebook',
    label: 'Gradebook & Marks',
    href: '/workspace/gradebook',
    symbol: '📊',
    description: 'Continuous assessment marks, rubrics, and academic performance.',
    roles: ['teacher', 'student', 'guardian'],
    isCommon: false,
    category: 'academics',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'plan',
    label: 'Curriculum & Lesson Plans',
    href: '/workspace/plan',
    symbol: '📝',
    description: 'Pedagogical plans, lesson notes, and instructional pacing.',
    roles: ['teacher', 'principal'],
    isCommon: false,
    category: 'academics',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'kiosk',
    label: 'Doorway Kiosk',
    href: '/workspace/kiosk',
    symbol: '🚪',
    description: 'Barcode & QR scanner station for gate entrance and arrival tracking.',
    roles: ['principal'],
    isCommon: false,
    category: 'institutional',
    temporalCapabilities: { hasReview: true, hasPlan: false },
  },
  {
    id: 'badges',
    label: 'ID Badges',
    href: '/workspace/badges',
    symbol: '📇',
    description: 'Student, teacher, and institutional QR credential cards.',
    roles: ['principal'],
    isCommon: false,
    category: 'institutional',
    temporalCapabilities: { hasReview: false, hasPlan: false },
  },
  {
    id: 'workforce',
    label: 'Workforce & Leave',
    href: '/workspace/workforce',
    symbol: '💼',
    description: 'Staff directory, presence logs, and leave management.',
    roles: ['teacher', 'principal'],
    isCommon: false,
    category: 'institutional',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'school',
    label: 'School Profile',
    href: '/workspace/school',
    symbol: '🏫',
    description: 'Institutional directory, campus structure, and governance settings.',
    roles: ['principal'],
    isCommon: false,
    category: 'institutional',
    temporalCapabilities: { hasReview: false, hasPlan: false },
  },
  {
    id: 'events',
    label: 'Events ERP',
    href: '/workspace/events',
    symbol: '🎉',
    description: 'Campus events, assembly schedules, and community calendar.',
    roles: ['teacher', 'principal'],
    isCommon: false,
    category: 'institutional',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'claim',
    label: 'Claim Spot',
    href: '/workspace/claim',
    symbol: '🎓',
    description: 'Self-service classroom desk claiming and enrollment verification.',
    roles: ['student', 'guardian'],
    isCommon: false,
    category: 'operations',
    temporalCapabilities: { hasReview: false, hasPlan: false },
  },
  {
    id: 'guardian',
    label: 'Guardian Portal',
    href: '/workspace/guardian',
    symbol: '🛡️',
    description: 'Enrolled learner presence, academic progress, and institutional communications bridge.',
    roles: ['guardian', 'principal'],
    isCommon: true,
    category: 'communications',
    capabilityId: 'family_bridge',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'principal',
    label: 'Principal Command Center',
    href: '/admin/principal',
    symbol: '🏛️',
    description: 'Executive situational intelligence, curriculum pacing, and institutional faculty oversight.',
    roles: ['principal'],
    isCommon: true,
    category: 'institutional',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  {
    id: 'editorial',
    label: 'Editorial Commons',
    href: '/workspace/editorial',
    symbol: '✍️',
    description: 'Collaborative student and educator writing, journal publishing, and essays.',
    roles: ['teacher', 'student'],
    isCommon: false,
    category: 'communications',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
] as const;

export function getCoreCapabilityForFeature(featureId: string): CapabilityDeclaration | undefined {
  const item = WORKSPACE_FEATURES.find((f) => f.id === featureId);
  if (!item?.capabilityId) return undefined;
  return declaredCapability(item.capabilityId);
}

export function isPracticeAvailableForRole(
  featureId: string,
  role?: WorkspaceRoleFilter,
): boolean {
  const item = WORKSPACE_FEATURES.find((f) => f.id === featureId);
  if (!item?.capabilityId) return true;
  const effectiveRole = role && role !== 'all' && role !== 'common' ? role : undefined;
  const result = resolvePracticeAvailability({
    featureId: item.capabilityId,
    platform: 'browser',
    capacity: effectiveRole,
    hasSelectedScope: true,
  });
  return result.available;
}

export function filterWorkspaceFeatures(
  features: readonly WorkspaceFeatureItem[],
  roleFilter: WorkspaceRoleFilter,
): WorkspaceFeatureItem[] {
  if (roleFilter === 'all') return [...features];
  if (roleFilter === 'common') return features.filter((f) => f.isCommon);
  return features.filter((f) => f.isCommon || f.roles.includes(roleFilter));
}

export interface WorkspaceOverviewPosture {
  eyebrow: string;
  title: string;
  description: string;
  actionText: string;
  badgeText: string;
}

export function getWorkspaceOverviewPosture(
  role: WorkspaceRoleFilter,
  intent: 'current' | 'review' | 'plan',
  dateLabel: string,
): WorkspaceOverviewPosture {
  const isReview = intent === 'review';
  const isPlan = intent === 'plan';

  switch (role) {
    case 'student':
      if (isReview) {
        return {
          eyebrow: 'Overview · Learner Archive',
          title: `Attendance & Study History for ${dateLabel}`,
          description: `Inspect your verified presence and submissions recorded on ${dateLabel}. Past marks remain sealed.`,
          actionText: 'View Past Presence',
          badgeText: 'Archival Record',
        };
      }
      if (isPlan) {
        return {
          eyebrow: 'Overview · Upcoming Horizon',
          title: `Class Timetable for ${dateLabel}`,
          description: `Preview upcoming class periods and assignment deadlines scheduled for ${dateLabel}.`,
          actionText: 'Preview Timetable',
          badgeText: 'Future Horizon',
        };
      }
      return {
        eyebrow: 'Overview · Today’s Learning Space',
        title: 'Today’s Classes & Daily Presence',
        description: 'Confirm your classroom presence and view today’s active learning schedule.',
        actionText: 'Open Daily Check-in',
        badgeText: 'Live Practice',
      };

    case 'guardian':
      if (isReview) {
        return {
          eyebrow: 'Overview · Family Archive',
          title: `Ward Attendance on ${dateLabel}`,
          description: `Review your child’s arrival logs and classroom participation for ${dateLabel}.`,
          actionText: 'Inspect Ward Log',
          badgeText: 'Archival Record',
        };
      }
      if (isPlan) {
        return {
          eyebrow: 'Overview · Family Horizon',
          title: `School Calendar for ${dateLabel}`,
          description: `Preview upcoming school events, circular releases, and term calendar for ${dateLabel}.`,
          actionText: 'View Calendar',
          badgeText: 'Future Horizon',
        };
      }
      return {
        eyebrow: 'Overview · Family Circle',
        title: 'Daily Family Space & Presence',
        description: 'Check in on your child’s learning circle, dialogue with educators, and family notices.',
        actionText: 'Open Family Space',
        badgeText: 'Live Practice',
      };

    case 'principal':
      if (isReview) {
        return {
          eyebrow: 'Overview · Institutional Audit',
          title: `Campus Compliance & Logs for ${dateLabel}`,
          description: `Audited institutional roll call, doorway kiosk traffic, and hallway drift for ${dateLabel}.`,
          actionText: 'Audit Compliance',
          badgeText: 'Archival Record',
        };
      }
      if (isPlan) {
        return {
          eyebrow: 'Overview · Institutional Planning',
          title: `Academic Calendar & Events for ${dateLabel}`,
          description: `Schedule campus activities, assembly logistics, and institutional calendar for ${dateLabel}.`,
          actionText: 'Plan Academic Event',
          badgeText: 'Future Horizon',
        };
      }
      return {
        eyebrow: 'Overview · Campus Leadership',
        title: 'Real-Time Campus Presence & Kiosks',
        description: 'Monitor live school attendance, doorway kiosks, and campus attendance flow.',
        actionText: 'Open Doorway Kiosk',
        badgeText: 'Live Practice',
      };

    case 'teacher':
    default:
      if (isReview) {
        return {
          eyebrow: 'Overview · Classroom Archive',
          title: `Attendance & Roster Audit for ${dateLabel}`,
          description: `Inspect submitted roll calls, absentee notes, and student marks for ${dateLabel}.`,
          actionText: 'Audit Attendance Log',
          badgeText: 'Archival Record',
        };
      }
      if (isPlan) {
        return {
          eyebrow: 'Overview · Instructional Horizon',
          title: `Lesson Planning & Pacing for ${dateLabel}`,
          description: `Prepare pedagogical notes, curriculum schedule, and instructional flow for ${dateLabel}.`,
          actionText: 'Draft Lesson Plan',
          badgeText: 'Future Horizon',
        };
      }
      return {
        eyebrow: 'Overview · Classroom Practice',
        title: 'Daily Attendance Roll Call',
        description: 'Take a classroom roll call and keep each student’s mark for today.',
        actionText: 'Take Attendance',
        badgeText: 'Live Practice',
      };
  }
}
