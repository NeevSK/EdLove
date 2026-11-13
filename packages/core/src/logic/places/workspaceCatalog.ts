import { type Capacity, CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';

/**
 * The Workspace catalog: every Workspace feature, and the floor each capacity opens to.
 * docs/architecture/places-roles-and-features.md is the model: Workspace is a floor per capacity,
 * a floor lists its features, and people are offered only what is on their floor. Each app says
 * how it renders a feature (its route or screen); this catalog says what exists and for whom.
 *
 * Which features sit on which floor is product content and changes freely; the structure holds:
 * every capacity has a floor (the type below does not compile without one), and a feature on a
 * floor exists in the catalog.
 */

export type WorkspaceFeatureCategory =
  | 'operations'
  | 'academics'
  | 'institutional'
  | 'communications';

export interface WorkspaceFeature {
  readonly label: string;
  readonly symbol: string;
  readonly description: string;
  readonly category: WorkspaceFeatureCategory;
}

export const WORKSPACE_FEATURES = {
  attendance: {
    label: 'Daily Attendance',
    symbol: '🗓️',
    description: 'Classroom roll call, presence logs, and student arrival tracking.',
    category: 'operations',
  },
  qr_scanner: {
    label: 'QR Scanner',
    symbol: '📷',
    description:
      'Scan classroom enrollment codes, attendance badges, or resource tokens directly in browser.',
    category: 'operations',
  },
  timetable: {
    label: 'Timetable',
    symbol: '📅',
    description: 'Weekly schedule of periods, subjects, and classroom venues.',
    category: 'academics',
  },
  notices: {
    label: 'Circulars & Notices',
    symbol: '📢',
    description: 'Institutional announcements, letters, and community broadcasts.',
    category: 'communications',
  },
  submissions: {
    label: 'Assignment Submissions',
    symbol: '📥',
    description: 'Coursework turn-in, student assignment uploads, and teacher feedback desk.',
    category: 'academics',
  },
  climate: {
    label: 'Climate Sensing',
    symbol: '⛅',
    description: 'Classroom psychological safety, attunement, peer belonging, and wellbeing pulse.',
    category: 'operations',
  },
  tuition: {
    label: 'Tuition & Fees',
    symbol: '💳',
    description: 'Institutional fee ledgers, payment receipt generation, and family dues tracking.',
    category: 'institutional',
  },
  gradebook: {
    label: 'Gradebook & Marks',
    symbol: '📊',
    description: 'Continuous assessment marks, rubrics, and academic performance.',
    category: 'academics',
  },
  plan: {
    label: 'Curriculum & Lesson Plans',
    symbol: '📝',
    description: 'Pedagogical plans, lesson notes, and instructional pacing.',
    category: 'academics',
  },
  kiosk: {
    label: 'Doorway Kiosk',
    symbol: '🚪',
    description: 'Barcode & QR scanner station for gate entrance and arrival tracking.',
    category: 'institutional',
  },
  badges: {
    label: 'ID Badges',
    symbol: '📇',
    description: 'Student, teacher, and institutional QR credential cards.',
    category: 'institutional',
  },
  workforce: {
    label: 'Workforce & Leave',
    symbol: '💼',
    description: 'Staff directory, presence logs, and leave management.',
    category: 'institutional',
  },
  school: {
    label: 'School Profile',
    symbol: '🏫',
    description: 'Institutional directory, campus structure, and governance settings.',
    category: 'institutional',
  },
  events: {
    label: 'Events ERP',
    symbol: '🎉',
    description: 'Campus events, assembly schedules, and community calendar.',
    category: 'institutional',
  },
  claim: {
    label: 'Claim Spot',
    symbol: '🎓',
    description: 'Self-service classroom desk claiming and enrollment verification.',
    category: 'operations',
  },
  guardian: {
    label: 'Guardian Portal',
    symbol: '🛡️',
    description:
      'Enrolled learner presence, academic progress, and institutional communications bridge.',
    category: 'communications',
  },
  principal: {
    label: 'Principal Command Center',
    symbol: '🏛️',
    description:
      'Executive situational intelligence, curriculum pacing, and institutional faculty oversight.',
    category: 'institutional',
  },
  editorial: {
    label: 'Editorial Commons',
    symbol: '✍️',
    description: 'Collaborative student and educator writing, journal publishing, and essays.',
    category: 'communications',
  },
  founder_command: {
    label: 'Founder Command',
    symbol: '🧭',
    description: 'Network-wide stewardship: schools, sync health and foundational charters.',
    category: 'institutional',
  },
  agent_lab: {
    label: 'Agent Lab',
    symbol: '🧪',
    description: 'Durable agent execution runner and scenario visualizer.',
    category: 'operations',
  },
  icon_lab: {
    label: 'Icon & Token Lab',
    symbol: '🎨',
    description: 'Brand design tokens, iconography and contrast calibration.',
    category: 'operations',
  },
} as const satisfies Readonly<Record<string, WorkspaceFeature>>;

export type WorkspaceFeatureId = keyof typeof WORKSPACE_FEATURES;

type Floor = readonly WorkspaceFeatureId[];

// Seeded on 13 Nov 2026 from what each capacity saw on the web, by each tool's own roles.
const teacher: Floor = [
  'attendance',
  'qr_scanner',
  'timetable',
  'notices',
  'submissions',
  'climate',
  'gradebook',
  'plan',
  'workforce',
  'events',
  'editorial',
];
const student: Floor = [
  'attendance',
  'qr_scanner',
  'timetable',
  'notices',
  'submissions',
  'gradebook',
  'claim',
  'editorial',
];
const principal: Floor = [
  'attendance',
  'qr_scanner',
  'notices',
  'climate',
  'tuition',
  'plan',
  'kiosk',
  'badges',
  'workforce',
  'school',
  'events',
  'guardian',
  'principal',
];
const guardian: Floor = [
  'attendance',
  'qr_scanner',
  'notices',
  'tuition',
  'gradebook',
  'claim',
  'guardian',
];
const builders: Floor = ['agent_lab', 'icon_lab'];

/** The floor each capacity opens to. Every capacity has its own, even where two start out alike. */
export const WORKSPACE_FLOORS: { readonly [C in Capacity]: Floor } = {
  founder: [...teacher, 'founder_command', ...builders],
  coFounder: [...teacher, 'founder_command'],
  director: [...teacher, 'founder_command'],
  principal,
  assistantPrincipal: principal,
  admin: principal,
  teacher,
  sectionHead: teacher,
  gradeHead: teacher,
  librarian: teacher,
  nurse: teacher,
  developer: [...teacher, ...builders],
  systemEngineer: teacher,
  student,
  member: student,
  guardian,
  parent: guardian,
};

/** The features on a capacity's floor, in floor order. A capacity outside the schema has none. */
export function workspaceFloor(capacity: string): readonly WorkspaceFeatureId[] {
  const known = capacityNamed(capacity);
  return known ? WORKSPACE_FLOORS[known] : [];
}

/**
 * The capacity a name refers to. Accounts use `CapacitySchema` names (`assistantPrincipal`);
 * development previews and Explore personas write them in capitals (`TEACHER`). No two capacities
 * differ only by case, so the match ignores it.
 */
export function capacityNamed(name: string): Capacity | undefined {
  const lower = name.toLowerCase();
  return CapacitySchema.options.find((capacity) => capacity.toLowerCase() === lower);
}

/** Whether a feature is on a capacity's floor, and so may be offered or opened. */
export function isOnWorkspaceFloor(capacity: string, feature: WorkspaceFeatureId): boolean {
  return workspaceFloor(capacity).includes(feature);
}
