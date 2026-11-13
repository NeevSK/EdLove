import {
  type CapabilityDeclaration,
  declaredCapability,
  resolvePracticeAvailability,
} from '@repo/core/logic/registry/capabilityManifest';
import {
  WORKSPACE_FEATURES as CATALOG,
  type WorkspaceFeature,
  type WorkspaceFeatureId,
  workspaceFloor,
} from '@repo/core/logic/places/workspaceCatalog';

/**
 * How the browser opens each Workspace feature. What exists, and which capacity's floor it is on,
 * is the catalog in `@repo/core/logic/places/workspaceCatalog`; this records only the web's route
 * for it. A feature with no entry here is not offered on the web (the QR scanner has no browser
 * route yet).
 */
interface WebDelivery {
  readonly href: string;
  readonly capabilityId?: 'attendance' | 'climate_sensing' | 'learning_studio' | 'family_bridge';
  readonly temporalCapabilities: Readonly<{ hasReview: boolean; hasPlan: boolean }>;
}

const WEB_DELIVERY: Readonly<Partial<Record<WorkspaceFeatureId, WebDelivery>>> = {
  attendance: {
    href: '/workspace',
    capabilityId: 'attendance',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  timetable: {
    href: '/workspace/timetable',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  notices: {
    href: '/workspace/notices',
    capabilityId: 'family_bridge',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  submissions: {
    href: '/workspace/submissions',
    capabilityId: 'learning_studio',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  climate: {
    href: '/workspace/climate',
    capabilityId: 'climate_sensing',
    temporalCapabilities: { hasReview: true, hasPlan: false },
  },
  tuition: { href: '/workspace/tuition', temporalCapabilities: { hasReview: true, hasPlan: true } },
  gradebook: {
    href: '/workspace/gradebook',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  plan: { href: '/workspace/plan', temporalCapabilities: { hasReview: true, hasPlan: true } },
  kiosk: { href: '/workspace/kiosk', temporalCapabilities: { hasReview: true, hasPlan: false } },
  badges: { href: '/workspace/badges', temporalCapabilities: { hasReview: false, hasPlan: false } },
  workforce: {
    href: '/workspace/workforce',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  school: { href: '/workspace/school', temporalCapabilities: { hasReview: false, hasPlan: false } },
  events: { href: '/workspace/events', temporalCapabilities: { hasReview: true, hasPlan: true } },
  claim: { href: '/workspace/claim', temporalCapabilities: { hasReview: false, hasPlan: false } },
  guardian: {
    href: '/workspace/guardian',
    capabilityId: 'family_bridge',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  principal: { href: '/admin/principal', temporalCapabilities: { hasReview: true, hasPlan: true } },
  editorial: {
    href: '/workspace/editorial',
    temporalCapabilities: { hasReview: true, hasPlan: true },
  },
  founder_command: {
    href: '/admin/founder',
    temporalCapabilities: { hasReview: false, hasPlan: false },
  },
  agent_lab: { href: '/agent-lab', temporalCapabilities: { hasReview: false, hasPlan: false } },
  icon_lab: { href: '/icon-lab', temporalCapabilities: { hasReview: false, hasPlan: false } },
};

export interface WorkspaceFeatureItem extends WorkspaceFeature, WebDelivery {
  readonly id: WorkspaceFeatureId;
}

function item(id: WorkspaceFeatureId): WorkspaceFeatureItem | undefined {
  const delivery = WEB_DELIVERY[id];
  return delivery ? { id, ...CATALOG[id], ...delivery } : undefined;
}

/** Every Workspace feature the web can open, for finding one by id or route. Not a menu. */
export const WEB_WORKSPACE_FEATURES: readonly WorkspaceFeatureItem[] = (
  Object.keys(CATALOG) as WorkspaceFeatureId[]
).flatMap((id) => item(id) ?? []);

/** The features on a capacity's floor that the web can open, in floor order: the only menu. */
export function workspaceFeaturesFor(
  capacity: string | null | undefined,
): readonly WorkspaceFeatureItem[] {
  return capacity ? workspaceFloor(capacity).flatMap((id) => item(id) ?? []) : [];
}

/** The Workspace feature a route belongs to, if any. */
export function workspaceFeatureAt(pathname: string): WorkspaceFeatureItem | undefined {
  return WEB_WORKSPACE_FEATURES.find((feature) => feature.href === pathname);
}

/**
 * Whether a destination may be offered to a capacity. A link into a Workspace feature is offered
 * only when that feature is on the capacity's floor; any other destination is not Workspace's call.
 */
export function isOfferedTo(capacity: string | null | undefined, href: string): boolean {
  const feature = workspaceFeatureAt(href.split('?')[0] ?? href);
  return !feature || workspaceFeaturesFor(capacity).some((offered) => offered.id === feature.id);
}

export function getCoreCapabilityForFeature(featureId: string): CapabilityDeclaration | undefined {
  const feature = WEB_WORKSPACE_FEATURES.find((f) => f.id === featureId);
  return feature?.capabilityId ? declaredCapability(feature.capabilityId) : undefined;
}

export function isPracticeAvailableForCapacity(
  featureId: string,
  capacity?: string | null,
): boolean {
  const feature = WEB_WORKSPACE_FEATURES.find((f) => f.id === featureId);
  if (!feature?.capabilityId) return true;
  return resolvePracticeAvailability({
    featureId: feature.capabilityId,
    platform: 'browser',
    capacity: capacity ?? undefined,
    hasSelectedScope: true,
  }).available;
}

/** Which wording the Workspace overview speaks in. Copy only; what is offered is the floor. */
export type WorkspaceVoice = 'teacher' | 'student' | 'principal' | 'guardian';

export function workspaceVoice(capacity: string | null | undefined): WorkspaceVoice {
  const lower = capacity?.toLowerCase();
  if (lower === 'student' || lower === 'member') return 'student';
  if (lower === 'principal' || lower === 'assistantprincipal' || lower === 'admin')
    return 'principal';
  if (lower === 'guardian' || lower === 'parent') return 'guardian';
  return 'teacher';
}

export interface WorkspaceOverviewPosture {
  eyebrow: string;
  title: string;
  description: string;
  actionText: string;
  badgeText: string;
}

export function getWorkspaceOverviewPosture(
  voice: WorkspaceVoice,
  intent: 'current' | 'review' | 'plan',
  dateLabel: string,
): WorkspaceOverviewPosture {
  const isReview = intent === 'review';
  const isPlan = intent === 'plan';

  switch (voice) {
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
