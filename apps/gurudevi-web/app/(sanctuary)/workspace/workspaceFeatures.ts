import {
  type CapabilityDeclaration,
  declaredCapability,
  resolvePracticeAvailability,
} from '@repo/core/logic/registry/capabilityManifest';
import { TIMELESS, type TimeProfile } from '@repo/core/logic/registry/timeProfile';
import { roomFeatures } from '@repo/core/logic/floor';
import { APP_CATALOG } from '../../../lib/appCatalog';
import type { WorkspaceRoleFilter } from '../components/RoleLensSwitcher';

type WorkspaceRole = 'teacher' | 'student' | 'principal' | 'guardian';

/**
 * A Workspace feature as the web's workspace screens show it. Nothing is
 * listed here: every field is read from the Workspace room's catalog
 * entries in the AppCatalog (lib/appCatalog.ts), the same list the phone and
 * SanctuaryFeature read.
 */
export interface WorkspaceFeatureItem {
  id: string;
  label: string;
  href: string;
  symbol: string;
  description: string;
  roles: readonly WorkspaceRole[];
  isCommon: boolean;
  capabilityId?: string;
  temporalCapabilities: {
    hasReview: boolean;
    hasPlan: boolean;
  };
  /** Full time lens profile (home mode and past rule). */
  time: TimeProfile;
}

/** Every Workspace feature the web opens: catalog entries that have a web route. */
export const WORKSPACE_FEATURES: readonly WorkspaceFeatureItem[] = roomFeatures(
  APP_CATALOG,
  'workspace',
  null,
  'web',
)
  .filter((entry) => entry.routes?.web)
  .map((entry) => {
    const time = entry.time ?? TIMELESS;
    return {
      id: entry.id,
      label: entry.label,
      href: entry.routes!.web!,
      symbol: entry.icon ?? '✨',
      description: entry.description ?? '',
      roles: (entry.roles ?? ['teacher', 'student', 'principal', 'guardian']) as WorkspaceRole[],
      isCommon: entry.common === true,
      capabilityId: entry.capabilityId,
      temporalCapabilities: {
        hasReview: time.modes.includes('review'),
        hasPlan: time.modes.includes('plan'),
      },
      time,
    };
  });

export function getCoreCapabilityForFeature(featureId: string): CapabilityDeclaration | undefined {
  const item = WORKSPACE_FEATURES.find((f) => f.id === featureId);
  if (!item?.capabilityId) return undefined;
  return declaredCapability(item.capabilityId);
}

export function isPracticeAvailableForRole(featureId: string, role?: WorkspaceRoleFilter): boolean {
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
        description:
          'Check in on your child’s learning circle, dialogue with educators, and family notices.',
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
