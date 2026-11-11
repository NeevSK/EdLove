import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';
import type { PerspectiveKind } from '@repo/core/types/Perspective';

/**
 * The work room is never called "Workspace" on screen. It is named for the person's role in
 * the place they are standing: a teacher's room is their Classroom, a principal's is the School,
 * a student's is Learning, a guardian's is Family. The names follow the older mobile tab labels
 * (principal School, founder Platform, section head Section, grade head Grade) and the web's
 * role workspace registry (student Learning, guardian Family).
 *
 * `key` is the `tabs.*` i18n key; `fallback` is the English word when a language lacks it.
 */
export interface WorkspaceRoomName {
  key: string;
  fallback: string;
}

const CLASSROOM: WorkspaceRoomName = {
  key: 'tabs.classroom',
  fallback: 'Classroom',
};
const SCHOOL: WorkspaceRoomName = { key: 'tabs.school', fallback: 'School' };
const LEARNING: WorkspaceRoomName = {
  key: 'tabs.learning',
  fallback: 'Learning',
};
const FAMILY: WorkspaceRoomName = { key: 'tabs.family', fallback: 'Family' };
const PLATFORM: WorkspaceRoomName = {
  key: 'tabs.platform',
  fallback: 'Platform',
};
const SECTION: WorkspaceRoomName = { key: 'tabs.section', fallback: 'Section' };
const GRADE: WorkspaceRoomName = { key: 'tabs.grade', fallback: 'Grade' };
const CLASS: WorkspaceRoomName = { key: 'tabs.class', fallback: 'Class' };
const STUDIO: WorkspaceRoomName = { key: 'tabs.studio', fallback: 'Studio' };

const BY_CAPACITY: Record<Capacity, WorkspaceRoomName> = {
  teacher: CLASSROOM,
  gradeHead: GRADE,
  sectionHead: SECTION,
  principal: SCHOOL,
  assistantPrincipal: SCHOOL,
  student: LEARNING,
  parent: FAMILY,
  guardian: FAMILY,
  founder: PLATFORM,
  coFounder: PLATFORM,
  director: PLATFORM,
  admin: PLATFORM,
  developer: PLATFORM,
  systemEngineer: PLATFORM,
  // Staff who are not teaching still work in the school.
  librarian: SCHOOL,
  nurse: SCHOOL,
  member: SCHOOL,
};

export function workspaceRoomNameOf({
  perspectiveKind,
  capacity,
  studioType,
}: {
  perspectiveKind?: PerspectiveKind | null;
  capacity?: string | null;
  /** A personal perspective's kind of studio. A learner's own room is Learning. */
  studioType?: 'general' | 'educator' | 'learner' | null;
}): WorkspaceRoomName {
  if (perspectiveKind === 'guardian') return FAMILY;
  // A tuition batch is a class the tutor runs, not a school they belong to.
  if (perspectiveKind === 'commercial') return CLASS;
  if (perspectiveKind === 'personal') return studioType === 'learner' ? LEARNING : STUDIO;
  if (capacity && capacity in BY_CAPACITY) return BY_CAPACITY[capacity as Capacity];
  return CLASSROOM;
}
