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

const PRIVATE: AreaInput = { id: 'private', label: 'Just you' };

/** Self is everyone's own room; teachers and principals gain one more group. */
function selfPlan(capacity: string): RoomPlan {
  const work =
    capacity === 'teacher'
      ? [s('working', 'Working rhythm', 'work-life', 'private', 'card')]
      : capacity === 'principal'
        ? [s('leadership', 'Leadership focus', 'work-life', 'private', 'card')]
        : [];
  return {
    id: `self:${capacity}`,
    room: 'self',
    capacity,
    areas: [TODAY, PRIVATE],
    groups: [
      { id: 'today', label: 'Today', area: 'today', job: 'act' },
      { id: 'grow', label: 'Growing', area: 'private', job: 'glance' },
      { id: 'care', label: 'Care', area: 'private', job: 'glance' },
      ...(work.length
        ? [{ id: 'work-life', label: 'Work and you', area: 'private', job: 'glance' as const }]
        : []),
    ],
    surfaces: [
      s('pulse', 'Check in', 'today', 'today', 'card', { time: 'now', lit: true, task: true }),
      s('journey', 'Your journey', 'grow', 'private', 'card'),
      s('growth', 'Study goals', 'grow', 'private', 'card', { time: 'later' }),
      s('care', 'Sleep and joy', 'care', 'private', 'card'),
      s('reflection', 'Reflect', 'care', 'private', 'card'),
      ...work,
    ],
  };
}

for (const capacity of ['student', 'teacher', 'guardian', 'principal']) {
  ROOM_PLANS[`self:${capacity}`] = selfPlan(capacity);
}

/** Community is the same room for every capacity: the school's square. */
ROOM_PLANS['community:everyone'] = {
  id: 'community:everyone',
  room: 'community',
  capacity: 'everyone',
  areas: [TODAY, WORK, INSTITUTION],
  groups: [
    { id: 'news', label: 'New for you', area: 'today', job: 'glance' },
    { id: 'talk', label: 'Talk', area: 'work', job: 'act' },
    { id: 'groups', label: 'Groups', area: 'work', job: 'browse' },
    { id: 'school', label: 'School', area: 'institution', job: 'glance' },
  ],
  surfaces: [
    s('feed', 'Feed', 'news', 'today', 'list', { time: 'now', lit: true }),
    s('chats', 'Chats', 'talk', 'work', 'row', { needsAttention: true }),
    s('direct', 'Direct messages', 'talk', 'work', 'row'),
    s('my-groups', 'Your groups', 'groups', 'work', 'rail'),
    s('explore', 'Find groups', 'groups', 'work', 'card'),
    s('announcements', 'Announcements', 'school', 'institution', 'list'),
    s('forest', 'Forest', 'school', 'institution', 'card'),
  ],
};

/**
 * The Library is one room for everyone; people who make lessons (teachers,
 * tutors, markers, principals) also get a "Make" group for contributing and
 * reviewing. Reading carries on first, then shelves, then finding.
 */
function libraryPlan(capacity: 'reader' | 'maker'): RoomPlan {
  const maker = capacity === 'maker';
  return {
    id: `library:${capacity}`,
    room: 'library',
    capacity,
    areas: [TODAY, WORK, INSTITUTION],
    groups: [
      { id: 'reading', label: 'Reading now', area: 'today', job: 'act' },
      { id: 'shelves', label: 'Shelves', area: 'work', job: 'browse' },
      { id: 'find', label: 'Find', area: 'work', job: 'find' },
      ...(maker ? [{ id: 'make', label: 'Make', area: 'work', job: 'act' as const }] : []),
      { id: 'school-shelf', label: 'From your school', area: 'institution', job: 'glance' },
    ],
    surfaces: [
      s('continue', 'Carry on reading', 'reading', 'today', 'card', { time: 'now', lit: true }),
      s('new', 'New on the shelves', 'reading', 'today', 'rail', { time: 'later' }),
      s('collections', 'Your collections', 'shelves', 'work', 'rail'),
      s('subjects', 'Subjects', 'shelves', 'work', 'grid'),
      s('search', 'Search the library', 'find', 'work', 'row', { task: true }),
      s('map', 'Library map', 'find', 'work', 'card', { time: 'anytime' }),
      ...(maker
        ? [
            s('contribute', 'Add a resource', 'make', 'work', 'row', { task: true }),
            s('review', 'Waiting for review', 'make', 'work', 'list', { needsAttention: true }),
          ]
        : []),
      s('school-shelf', 'School shelf', 'school-shelf', 'institution', 'rail'),
    ],
  };
}

ROOM_PLANS['library:reader'] = libraryPlan('reader');
ROOM_PLANS['library:maker'] = libraryPlan('maker');

/**
 * Profile is who you are across every bond: the same room for everyone.
 * The card first, then your bonds, your journey, and the account's care.
 */
ROOM_PLANS['profile:everyone'] = {
  id: 'profile:everyone',
  room: 'profile',
  capacity: 'everyone',
  areas: [TODAY, PRIVATE],
  groups: [
    { id: 'you', label: 'You', area: 'today', job: 'glance' },
    { id: 'bonds', label: 'Your places', area: 'private', job: 'act' },
    { id: 'journey', label: 'Journey', area: 'private', job: 'browse' },
    { id: 'account', label: 'Account', area: 'private', job: 'find' },
  ],
  surfaces: [
    s('card', 'Your card', 'you', 'today', 'card', { lit: true }),
    s('bonds', 'Schools and roles', 'bonds', 'private', 'list'),
    s('invite', 'Join with a code', 'bonds', 'private', 'row', { task: true }),
    s('achievements', 'Achievements', 'journey', 'private', 'rail'),
    s('record', 'Your record', 'journey', 'private', 'card', { time: 'anytime' }),
    s('security', 'Sign-in and devices', 'account', 'private', 'row'),
    s('privacy', 'Privacy', 'account', 'private', 'row'),
    s('settings', 'Settings', 'account', 'private', 'row'),
  ],
};

/** The plan for a room as one capacity sees it, when there is one. */
export function roomPlanOf(
  room: string,
  capacity: string | null | undefined,
): RoomPlan | undefined {
  if (room === 'workspace') return workRoomPlanOf(capacity);
  if (room === 'community') return ROOM_PLANS['community:everyone'];
  if (room === 'profile') return ROOM_PLANS['profile:everyone'];
  if (room === 'library') {
    const makers = ['teacher', 'tutor', 'marker', 'principal', 'sectionHead', 'gradeHead'];
    return ROOM_PLANS[makers.includes(capacity ?? '') ? 'library:maker' : 'library:reader'];
  }
  if (room === 'self') {
    const key =
      ({ tutor: 'teacher', marker: 'teacher' } as Record<string, string>)[capacity ?? ''] ??
      capacity;
    return ROOM_PLANS[`self:${key}`] ?? ROOM_PLANS['self:student'];
  }
  return undefined;
}

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
    room: plan.room,
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
