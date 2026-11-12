import type { FeaturePresentationMode } from '@repo/core/logic/permissions/featurePresentation';
import type { WorkspaceLayout, WorkspaceZoneId } from '@repo/core/types';
import { groupsWithSavedOrder, piecesFromLayout } from './bridge';
import type { FloorConfig } from './config';
import type { FloorInput } from './layout';
import type {
  AreaInput,
  FloorControls,
  FloorFit,
  FloorSpace,
  GroupInput,
  TimeBand,
  WorldFloorBias,
} from './types';

/**
 * One feature's default place on a room's floor. `kit` names the component
 * that draws it (a key of the kit's floor-fit table), so the size numbers live
 * once, in the kit. These are opinionated defaults: the person's saved layout
 * moves, hides and pins on top of them, and SanctuaryFeature decides presence.
 */
export interface RoomSurfacePlan {
  id: string;
  label: string;
  group: string;
  area: WorkspaceZoneId;
  kit: string;
  time?: TimeBand;
  task?: boolean;
  lit?: boolean;
  needsAttention?: boolean;
  roleImportance?: number;
}

export interface RoomPlan {
  /** Room key plus the capacity that sees it, e.g. "workspace:teacher". */
  id: string;
  room: string;
  capacity: string;
  areas: readonly AreaInput[];
  groups: readonly GroupInput[];
  surfaces: readonly RoomSurfacePlan[];
}

const TODAY: AreaInput = { id: 'today', label: 'Today', smart: true };
const WORK: AreaInput = { id: 'work', label: 'Work' };
const INSTITUTION: AreaInput = { id: 'institution', label: 'School' };
const OUTLOOK: AreaInput = { id: 'outlook', label: 'Ahead' };

const s = (
  id: string,
  label: string,
  group: string,
  area: WorkspaceZoneId,
  kit: string,
  extra: Partial<RoomSurfacePlan> = {},
): RoomSurfacePlan => ({ id, label, group, area, kit, ...extra });

/** Default floors for the work room, one per capacity (Classroom, Learning, Family, School). */
export const ROOM_PLANS: Record<string, RoomPlan> = {
  'workspace:teacher': {
    id: 'workspace:teacher',
    room: 'workspace',
    capacity: 'teacher',
    areas: [TODAY, WORK, INSTITUTION],
    groups: [
      { id: 'daily', label: 'Today', area: 'today', job: 'act' },
      { id: 'teach', label: 'Teaching', area: 'work', job: 'browse' },
      { id: 'tools', label: 'Tools', area: 'work', job: 'glance' },
      { id: 'school', label: 'School', area: 'institution', job: 'glance' },
    ],
    surfaces: [
      s('attendance', 'Attendance', 'daily', 'today', 'row', {
        time: 'now',
        task: true,
        lit: true,
      }),
      s('marking', 'Marking', 'daily', 'today', 'row', { time: 'later', needsAttention: true }),
      s('next-lesson', 'Next lesson', 'daily', 'today', 'card', { time: 'now' }),
      s('classes', 'My classes', 'teach', 'work', 'rail'),
      s('lessons', 'Lessons', 'teach', 'work', 'card'),
      s('assignments', 'Assignments', 'teach', 'work', 'card', { time: 'later' }),
      s('question-bank', 'Question bank', 'tools', 'work', 'card'),
      s('notes', 'Notes', 'tools', 'work', 'card'),
      s('timetable', 'Timetable', 'tools', 'work', 'card'),
      s('messages', 'Messages', 'tools', 'work', 'card', { needsAttention: true }),
      s('announcements', 'Announcements', 'school', 'institution', 'list'),
      s('events', 'Events', 'school', 'institution', 'card'),
    ],
  },
  'workspace:student': {
    id: 'workspace:student',
    room: 'workspace',
    capacity: 'student',
    areas: [TODAY, WORK, OUTLOOK],
    groups: [
      { id: 'daily', label: 'Today', area: 'today', job: 'act' },
      { id: 'learn', label: 'Learning', area: 'work', job: 'browse' },
      { id: 'practice', label: 'Practice', area: 'work', job: 'glance' },
      { id: 'ahead', label: 'Ahead', area: 'outlook', job: 'track' },
    ],
    surfaces: [
      s('homework', 'Homework due', 'daily', 'today', 'row', {
        time: 'now',
        task: true,
        lit: true,
      }),
      s('next-class', 'Next class', 'daily', 'today', 'card', { time: 'now' }),
      s('subjects', 'Subjects', 'learn', 'work', 'rail'),
      s('library', 'Library', 'learn', 'work', 'card'),
      s('quizzes', 'Quizzes', 'practice', 'work', 'card'),
      s('flashcards', 'Flashcards', 'practice', 'work', 'card'),
      s('results', 'Results', 'ahead', 'outlook', 'card', { time: 'later' }),
      s('exams', 'Exams', 'ahead', 'outlook', 'card', { time: 'anytime' }),
    ],
  },
  'workspace:guardian': {
    id: 'workspace:guardian',
    room: 'workspace',
    capacity: 'guardian',
    areas: [TODAY, WORK, INSTITUTION],
    groups: [
      { id: 'daily', label: 'Today', area: 'today', job: 'act' },
      { id: 'family', label: 'Family', area: 'work', job: 'browse' },
      { id: 'school', label: 'School', area: 'institution', job: 'glance' },
    ],
    surfaces: [
      s('child-day', "Your child's day", 'daily', 'today', 'card', { time: 'now', lit: true }),
      s('absences', 'Absences', 'daily', 'today', 'row', { needsAttention: true, task: true }),
      s('fees', 'Fees', 'daily', 'today', 'row', { time: 'later' }),
      s('children', 'Children', 'family', 'work', 'rail'),
      s('progress', 'Progress', 'family', 'work', 'card'),
      s('messages', 'Messages', 'family', 'work', 'card', { needsAttention: true }),
      s('school-feed', 'School news', 'school', 'institution', 'list'),
      s('events', 'Events', 'school', 'institution', 'card'),
    ],
  },
  'workspace:principal': {
    id: 'workspace:principal',
    room: 'workspace',
    capacity: 'principal',
    areas: [TODAY, INSTITUTION, OUTLOOK],
    groups: [
      { id: 'daily', label: 'Today', area: 'today', job: 'act' },
      { id: 'school', label: 'School', area: 'institution', job: 'glance' },
      { id: 'sections', label: 'Sections', area: 'institution', job: 'browse' },
      { id: 'ahead', label: 'Ahead', area: 'outlook', job: 'track' },
    ],
    surfaces: [
      s('staff-absence', 'Staff away', 'daily', 'today', 'row', {
        time: 'now',
        task: true,
        lit: true,
      }),
      s('approvals', 'Approvals', 'daily', 'today', 'list', { needsAttention: true, task: true }),
      s('today-events', 'Today at school', 'daily', 'today', 'card', { time: 'now' }),
      s('numbers', 'School numbers', 'school', 'institution', 'grid'),
      s('reports', 'Reports', 'school', 'institution', 'card'),
      s('sections', 'Sections', 'sections', 'institution', 'rail'),
      s('term-plan', 'Term plan', 'ahead', 'outlook', 'card', { time: 'anytime' }),
    ],
  },
};

export interface RoomFloorOptions {
  plan: RoomPlan;
  /** SanctuaryFeature's decision per surface id; missing means available. */
  presentationOf?: (surfaceId: string) => FeaturePresentationMode;
  /** The kit's fit for a component name (floorFitOf in the kit). */
  fitOf: (kit: string) => FloorFit;
  layout?: Pick<
    WorkspaceLayout,
    'order' | 'hidden' | 'pinned' | 'zoneBySurface' | 'groupOrder'
  > | null;
  space: FloorSpace;
  controls: FloorControls;
  world?: WorldFloorBias;
  config?: Partial<FloorConfig>;
}

/** The engine's input for one room, as one person in one bond sees it now. */
export function roomFloorInput({
  plan,
  presentationOf = () => 'available',
  fitOf,
  layout = null,
  space,
  controls,
  world,
  config,
}: RoomFloorOptions): FloorInput {
  const { pieces } = piecesFromLayout(
    plan.surfaces.map((x) => ({
      id: x.id,
      label: x.label,
      group: x.group,
      defaultArea: x.area,
      presentation: presentationOf(x.id),
      fit: fitOf(x.kit),
      time: x.time,
      task: x.task,
      lit: x.lit,
      needsAttention: x.needsAttention,
      roleImportance: x.roleImportance,
    })),
    layout,
  );
  return {
    room: plan.id,
    areas: plan.areas,
    groups: groupsWithSavedOrder(plan.groups, layout?.groupOrder),
    pieces,
    space,
    controls,
    world,
    config,
  };
}

/** Plan id for a capacity's work room, when there is one. */
export function workRoomPlanOf(capacity: string | null | undefined): RoomPlan | undefined {
  const key = (
    {
      teacher: 'teacher',
      tutor: 'teacher',
      marker: 'teacher',
      student: 'student',
      guardian: 'guardian',
      principal: 'principal',
    } as Record<string, string>
  )[capacity ?? ''];
  return key ? ROOM_PLANS[`workspace:${key}`] : undefined;
}

/**
 * The plan's features as layout-sync surfaces, so the person's saved order,
 * pins and hidden pieces apply to them like any workspace surface.
 */
export function roomSurfaceDefinitions(plan: RoomPlan, workspaceId: string) {
  return plan.surfaces.map((x, i) => ({
    surfaceId: x.id,
    workspaceId,
    capabilityKey: x.id,
    ownerPackage: 'core' as const,
    defaultZone: x.area,
    defaultOrder: i,
    title: x.label,
    groupId: x.group,
    mobileSupport: true,
    webSupport: true,
  }));
}
