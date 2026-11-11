/**
 * The work room is named for the person's capacity in the bond they are acting through:
 * a teacher's room is their Classroom, a principal's is the School, a student's is Learning,
 * a guardian's is Family. The kind of entity behind the bond (personal, institutional,
 * commercial) is a separate axis and never changes the name: a teacher's personal bond and a
 * tutor's batch are both a Classroom. A capacity without a name of its own is "Workspace".
 *
 * The names follow the older mobile tab labels (principal School, founder Platform, section
 * head Section, grade head Grade) and the web's role workspace registry (student Learning,
 * guardian Family).
 *
 * `key` is the `tabs.*` i18n key; `fallback` is the English word when a language lacks it.
 */
export interface WorkspaceRoomName {
  key: string;
  fallback: string;
}

const name = (key: string, fallback: string): WorkspaceRoomName => ({
  key: `tabs.${key}`,
  fallback,
});

const CLASSROOM = name('classroom', 'Classroom');
const SCHOOL = name('school', 'School');
const LEARNING = name('learning', 'Learning');
const FAMILY = name('family', 'Family');
const PLATFORM = name('platform', 'Platform');
const SECTION = name('section', 'Section');
const GRADE = name('grade', 'Grade');
const INSTITUTE = name('institute', 'Institute');
export const WORKSPACE_ROOM_FALLBACK = name('workspace', 'Workspace');

/**
 * Institutional and personal capacities (`CapacitySchema`) and the commercial batch roles
 * (`CommercialPerspective.role`). Anything not listed is a Workspace.
 */
const BY_CAPACITY: Readonly<Record<string, WorkspaceRoomName>> = {
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
  admin: PLATFORM,
  developer: PLATFORM,
  systemEngineer: PLATFORM,
  // Commercial batch roles: tutors and markers work in a class.
  lead_tutor: CLASSROOM,
  assistant_tutor: CLASSROOM,
  paper_marker: CLASSROOM,
};

/** In a commercial bond, `founder` owns a tuition institute, not the platform. */
const COMMERCIAL: Readonly<Record<string, WorkspaceRoomName>> = {
  founder: INSTITUTE,
};

export function workspaceRoomNameOf({
  capacity,
  commercial = false,
}: {
  /** The active bond's capacity (or the commercial batch role). */
  capacity?: string | null;
  /** The bond is with a commercial entity (a tuition institute or batch). */
  commercial?: boolean;
}): WorkspaceRoomName {
  if (!capacity) return WORKSPACE_ROOM_FALLBACK;
  const named =
    (commercial && Object.hasOwn(COMMERCIAL, capacity) ? COMMERCIAL[capacity] : undefined) ??
    (Object.hasOwn(BY_CAPACITY, capacity) ? BY_CAPACITY[capacity] : undefined);
  return named ?? WORKSPACE_ROOM_FALLBACK;
}
