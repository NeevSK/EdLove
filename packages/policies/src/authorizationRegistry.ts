/**
 * Shared authorization vocabulary. ZenStack owns data predicates and Cedar
 * owns action decisions, but neither side may invent different nouns/verbs.
 * The repository parity audit validates this registry against both schemas.
 */
export const AUTHORIZATION_ACTIONS = ['read', 'create', 'update', 'delete', 'use_ai'] as const;

export const AUTHORIZATION_RESOURCES = [
  'User',
  'School',
  'Classroom',
  'AttendanceRecord',
  'DailyAttendance',
  'AttendanceSession',
  'Grade',
  'GradeMark',
  'Assignment',
  'Lesson',
  'Material',
  'StaffLeave',
  'MoodLog',
  'FireJournal',
  'InventoryItem',
  'Group',
  'Post',
  'Ledger',
  'Guardian',
  'SentinelAuditLog',
  'JoyMoments',
  'GratitudeEntries',
  'EnergyForecasts',
  'PersonalClassroom',
  'AIAssistant',
] as const;

export const BOND_ENTITY_TYPES = [
  'PLATFORM',
  'SCHOOL',
  'CLASSROOM',
  'COMMUNITY',
  'GROUP',
  'PERSONAL',
  'PERSONAL_CLASSROOM',
] as const;
