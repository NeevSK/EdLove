/**
 * Functional Screen Atlas Data
 *
 * Complete directory of all screens across Web and Mobile, categorized by role/capacity.
 * Translates poetic legacy labels into plain, practical school functions.
 */

export type ScreenRole = 'class_teacher' | 'subject_teacher' | 'principal' | 'student' | 'guardian';

export type ScreenCategory =
  | 'attendance'
  | 'academics'
  | 'grading'
  | 'operations'
  | 'pastoral'
  | 'library';

export interface ScreenEntry {
  id: string;
  name: string;
  jobSummary: string;
  detailedDescription: string;
  roles: readonly ScreenRole[];
  category: ScreenCategory;
  webRoute: string;
  mobileRoute: string;
  legacyPoeticName?: string;
  badge?: string;
}

export const SCREEN_ROLES: readonly { id: ScreenRole; label: string; icon: string; description: string }[] = [
  {
    id: 'class_teacher',
    label: 'Class Teacher (Homeroom)',
    icon: '📋',
    description: 'Owns official morning census roll call, pastoral welfare, and student profiles for Grade 10-A.',
  },
  {
    id: 'subject_teacher',
    label: 'Subject Teacher',
    icon: '📚',
    description: 'Teaches subjects (Sinhala, Science, Maths) across parallel sections, authors tests, and enters marks.',
  },
  {
    id: 'principal',
    label: 'Principal & Leadership',
    icon: '🏛️',
    description: 'Oversees school-wide census, teacher relief substitution, facility events, circulars, and assets.',
  },
  {
    id: 'student',
    label: 'Student / Learner',
    icon: '🎓',
    description: 'Views class timetable, attends lessons, completes quizzes, and tracks personal presence.',
  },
  {
    id: 'guardian',
    label: 'Parent & Guardian',
    icon: '👨‍👩‍👧',
    description: 'Monitors ward attendance, medical excuses, term report cards, and school announcements.',
  },
];

export const FUNCTIONAL_SCREENS: readonly ScreenEntry[] = [
  // --- Attendance & Census ---
  {
    id: 'roll-call-register',
    name: 'Daily Morning Roll Call Register',
    jobSummary: 'Official morning student attendance roll call for the pastoral homeroom.',
    detailedDescription:
      'The legally binding census head-count taken every morning (Present, Late, Absent, Excused) against the pastoral GradeClass (10-A). Feeds national reporting.',
    roles: ['class_teacher', 'principal'],
    category: 'attendance',
    webRoute: '/workspace/attendance',
    mobileRoute: '/attendance',
    legacyPoeticName: 'Model A Attendance Register / Roll Call Floor',
    badge: 'Official Census',
  },
  {
    id: 'student-presence-history',
    name: 'Student Attendance & Absence History',
    jobSummary: 'Longitudinal attendance streaks, monthly percentages, and excused absence logs.',
    detailedDescription:
      'Individual student presence logs, detecting consecutive absence patterns (Pattern 5 gate) and tracking medical certificates or parent notes.',
    roles: ['class_teacher', 'principal', 'student', 'guardian'],
    category: 'attendance',
    webRoute: '/self/attendance',
    mobileRoute: '/(tabs)/workspace/classroom/student/[classroomId]',
    legacyPoeticName: 'Presence Pulse / Hallway Drift Sensor',
  },
  {
    id: 'student-claim-enrollment',
    name: 'Student Enrollment & Account Claim',
    jobSummary: 'Enrolling new admissions and merging temporary paper records into real student accounts.',
    detailedDescription:
      'Administrative desk to register students into official grade levels and link provisional "shadow" learners created by teachers to verified identities.',
    roles: ['class_teacher', 'principal'],
    category: 'attendance',
    webRoute: '/workspace/claim',
    mobileRoute: '/thuthimal-claim',
    legacyPoeticName: 'Shadow Learner Claim Wizard / Thuthimal',
  },

  // --- Academics & Teaching ---
  {
    id: 'teacher-workspace-home',
    name: 'Teacher Workspace (My Classroom Hub)',
    jobSummary: 'Primary daily dashboard showing your Own Class and assigned Subject Classrooms.',
    detailedDescription:
      'Central launchpad separating your Homeroom (Grade 10-A) from your multi-section Subject Teaching Groups (Sinhala 10, Science 10).',
    roles: ['class_teacher', 'subject_teacher'],
    category: 'academics',
    webRoute: '/workspace',
    mobileRoute: '/(tabs)/workspace',
    legacyPoeticName: 'Sanctuary Workspace Floor & Living Cards',
    badge: 'Daily Core',
  },
  {
    id: 'subject-classroom-hub',
    name: 'Subject Classroom Teaching Hub',
    jobSummary: 'Dedicated classroom space for lesson units, handouts, student roster, and assignments.',
    detailedDescription:
      'The subject teacher’s workshop. Displays curriculum units, lesson handouts, enrolled students across parallel sections, and open coursework.',
    roles: ['subject_teacher', 'student'],
    category: 'academics',
    webRoute: '/workspace/classroom/class-sin-10',
    mobileRoute: '/(tabs)/workspace/classroom/[classroomId]',
    legacyPoeticName: 'Bounded Workspace / Teaching Circle Floor',
  },
  {
    id: 'weekly-timetable',
    name: 'School Timetable & Period Schedule',
    jobSummary: '8-period weekly bell schedule with subjects, assigned rooms, and teacher allocations.',
    detailedDescription:
      'Full weekly matrix of 40-minute periods, showing teacher room assignments, free periods for relief, and subject bell schedules.',
    roles: ['class_teacher', 'subject_teacher', 'student'],
    category: 'academics',
    webRoute: '/workspace/timetable',
    mobileRoute: '/(tabs)/workspace/plan',
    legacyPoeticName: 'Temporal Cadence Horizon',
  },
  {
    id: 'curriculum-planner',
    name: 'Curriculum & Term Syllabus Planner',
    jobSummary: 'Long-term term scheme of work, learning competency pacing, and upcoming units.',
    detailedDescription:
      'Maps Ministry curriculum guidelines against the 3 academic terms, ensuring parallel sections (10-A, 10-B, 10-C) maintain synchronized pacing.',
    roles: ['subject_teacher', 'principal'],
    category: 'academics',
    webRoute: '/workspace/plan',
    mobileRoute: '/(tabs)/workspace/plan',
    legacyPoeticName: 'Plan and Bridge Framework',
  },
  {
    id: 'homework-submissions-desk',
    name: 'Homework & Assignment Submissions Desk',
    jobSummary: 'Inbox for grading student homework, viewing uploaded worksheets, and returning feedback.',
    detailedDescription:
      'Central inbox where teachers review student work submissions, assign scores, write constructive feedback, and request resubmissions.',
    roles: ['subject_teacher', 'student'],
    category: 'academics',
    webRoute: '/workspace/submissions',
    mobileRoute: '/(tabs)/workspace/classroom/[classroomId]',
    legacyPoeticName: 'Student Submission Quests',
  },
  {
    id: 'private-educator-notes',
    name: 'Private Drafts & Lesson Reflections',
    jobSummary: 'Private unmonitored educator notebook for lesson seeds and personal teaching logs.',
    detailedDescription:
      'A private, protected educator space. Notes written here are sacred drafts and are never accessible to school administration or supervisors.',
    roles: ['class_teacher', 'subject_teacher'],
    category: 'academics',
    webRoute: '/self',
    mobileRoute: '/(tabs)/self',
    legacyPoeticName: 'Personal Educator Sanctuary & Draft Seeds',
  },

  // --- Examination & Grading ---
  {
    id: 'gradebook-registry',
    name: 'Term Marks & Gradebook Registry',
    jobSummary: 'Master gradebook for recording term test scores, calculating averages, and assigning A/B/C/S/W grades.',
    detailedDescription:
      'Full academic marks sheet supporting MoE Circular 23/2017 grading standards. Automatically calculates national letter grades and term GPA.',
    roles: ['class_teacher', 'subject_teacher', 'principal'],
    category: 'grading',
    webRoute: '/workspace/gradebook',
    mobileRoute: '/gradebook',
    legacyPoeticName: 'Gradebook Floor & Marks Engine',
    badge: 'Examinations',
  },
  {
    id: 'cross-section-moderation',
    name: 'Parallel Section Moderation Strip',
    jobSummary: 'Statistical comparison of parallel section grade distributions (10-A vs 10-B vs 10-C).',
    detailedDescription:
      'Detects examiner harshness or grading drift between parallel cohorts before official term marks are finalized and sealed for parents.',
    roles: ['subject_teacher', 'principal'],
    category: 'grading',
    webRoute: '/workspace/gradebook',
    mobileRoute: '/gradebook',
    legacyPoeticName: 'Moderation Balance Strip',
  },

  // --- Operations & Administration ---
  {
    id: 'principal-leadership-desk',
    name: 'Principal Overview & School Situational Desk',
    jobSummary: 'Executive overview of whole-school attendance, teacher arrivals, and daily notices.',
    detailedDescription:
      'High-level control room for the Principal and Vice Principals. Displays school census totals, staff presence, and school health metrics.',
    roles: ['principal'],
    category: 'operations',
    webRoute: '/admin/principal',
    mobileRoute: '/(tabs)/workspace/principal',
    legacyPoeticName: 'Principal Notes / Morning Situational Brief',
  },
  {
    id: 'teacher-relief-roster',
    name: 'Staff Relief & Substitution Manager',
    jobSummary: 'Managing daily teacher absences and assigning free-period teachers to cover absent classes.',
    detailedDescription:
      'Monitors teacher absenteeism and automatically suggests available free-period educators to prevent unsupervised classrooms.',
    roles: ['principal', 'class_teacher'],
    category: 'operations',
    webRoute: '/workspace/workforce',
    mobileRoute: '/(tabs)/workspace/workforce-role',
    legacyPoeticName: 'Campus Operations & Relief Logistics',
  },
  {
    id: 'school-events-calendar',
    name: 'School Events, Excursions & Sports Calendar',
    jobSummary: 'Coordinating Inter-House Athletics, Field Excursions, Term Exams, and Public Holidays.',
    detailedDescription:
      'Institution-wide calendar governing one-time events (Sigiriya field trip) and recurring cycles with budget tracking and parent consent slips.',
    roles: ['principal', 'class_teacher', 'subject_teacher', 'student', 'guardian'],
    category: 'operations',
    webRoute: '/workspace/events',
    mobileRoute: '/(tabs)/workspace/events',
    legacyPoeticName: 'Institutional ERP Events & Resource Allocation',
  },
  {
    id: 'school-official-notices',
    name: 'Circulars & Official School Notices',
    jobSummary: 'Publishing official Ministry circulars, principal bulletins, and emergency alerts.',
    detailedDescription:
      'School-wide noticeboard. Can be targeted to the entire school, specific grade cohorts (e.g. Grade 10 only), or faculty staff.',
    roles: ['principal', 'class_teacher', 'subject_teacher', 'student', 'guardian'],
    category: 'operations',
    webRoute: '/workspace/notices',
    mobileRoute: '/(tabs)/community/announcements',
    legacyPoeticName: 'Plan-and-Bridge Calm Notices / Broadcasts',
  },
  {
    id: 'school-census-profile',
    name: 'School Census Profile & MoE Classification',
    jobSummary: 'School national census registration (1AB, 1C, Type 2, Type 3) and medium offerings.',
    detailedDescription:
      'Official institutional identity linked to the Ministry of Education census directory, tracking student capacity, province, and school type.',
    roles: ['principal'],
    category: 'operations',
    webRoute: '/workspace/school',
    mobileRoute: '/school-creation',
    legacyPoeticName: 'School Institutional Registry',
  },

  // --- Pastoral & Community ---
  {
    id: 'student-conduct-climate',
    name: 'Student Wellbeing & Classroom Climate',
    jobSummary: 'Non-punitive student behavioral observations, peer dynamics, and learning climate logs.',
    detailedDescription:
      'Classroom atmosphere monitoring. Allows educators to record positive interventions, student emotional signals, and learning obstacles.',
    roles: ['class_teacher', 'principal'],
    category: 'pastoral',
    webRoute: '/workspace/climate',
    mobileRoute: '/(tabs)/workspace/welfare',
    legacyPoeticName: 'Classroom Climate Sensing & Atmosphere Ledger',
  },
  {
    id: 'parent-guardian-bridge',
    name: 'Parent Portal & Family Dialogues',
    jobSummary: 'Parent portal for monitoring student progress, attendance alerts, and direct teacher messaging.',
    detailedDescription:
      'Family bridge giving parents visibility into verified term grades, daily arrival timestamps, and direct school correspondence.',
    roles: ['guardian', 'class_teacher'],
    category: 'pastoral',
    webRoute: '/workspace/guardian',
    mobileRoute: '/(tabs)/workspace/guardian',
    legacyPoeticName: 'Family Sanctuary Bridge',
  },
  {
    id: 'subject-curriculum-library',
    name: 'Curriculum Vault & Open Educational Library',
    jobSummary: 'Digital repository of past exam papers, textbook chapters, audio lessons, and syllabi.',
    detailedDescription:
      'Digital school library storing textbooks, past O/L papers, audio lessons, and supplementary learning modules accessible by all students.',
    roles: ['class_teacher', 'subject_teacher', 'student', 'guardian'],
    category: 'library',
    webRoute: '/library',
    mobileRoute: '/(tabs)/library',
    legacyPoeticName: 'Curriculum Vault / Living Library Archive',
  },
];

