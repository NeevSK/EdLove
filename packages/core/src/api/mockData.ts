/**
 * @internal
 * @deprecated [DEPRECATED PUBLIC INTERFACE]
 * This monolithic mock dataset is an internal legacy fixture source. Do NOT import
 * directly into UI components, web floors, or mobile screens.
 *
 * CANONICAL MIGRATION PATH:
 *   1. Runtime data: Call `api.<domain>.<method>()` or domain hooks (`useCommunityPosts`, etc.).
 *      `createResonantProxy` automatically intercepts and supplies sandbox samples in demo/ghost mode.
 *   2. Synchronous SSR / initial state: Call `getSandboxSamples(domain, method, args)`
 *      from `@repo/core/api/sandboxDataset`.
 */

import type {
  StaffLeaveDTO,
  StaffPresenceSummary,
  StudentAttendancePulse,
  TeacherCarouselItem,
} from '@repo/core/api/staffManagement';
import type { AppNotification, Assignment, Classroom, ClassroomResource, Lesson, Student } from '@repo/core/types';
export interface MockClassroom extends Classroom {
  is_sample?: boolean;
  is_school?: boolean;
}

export interface MockStudent extends Omit<Partial<Student>, "roll_number" | "joined_at"> {
  id: string;
  full_name: string;
  classroom_id: string;
  status: 'active' | 'left' | 'suspended';
  student_id: string;
  roll_number?: string | number | null;
  enrolled_at?: Date;
  joined_at?: Date | string;
}

export interface MockLibraryResource {
  id: string;
  title: string;
  description: string;
  type: string;
  subject?: string;
  subjects?: string[];
  language?: string;
  verified?: boolean;
  created_at?: Date;
  url?: string;
  format?: string;
  is_official?: boolean;
}

export interface MockLibraryCollection {
  id: string;
  name: string;
  description: string;
  subjects?: string[];
  resource_ids: string[];
  created_at: Date;
  is_official?: boolean;
}

export interface MockLearningCenter {
  id: string;
  name: string;
  province: string;
  district: string;
  booksCount: number;
  digitalHub: boolean;
  hours: string;
  contact: string;
}

export interface MockTopologyNode {
  id: string;
  label: string;
  type: 'resource' | 'topic';
  group?: string;
  thumbnail?: string;
  metadata?: {
    subjects?: string[];
    topics?: string[];
    tags?: string[];
    description?: string;
    is_ministry_official?: boolean;
  };
}

export interface MockTopologyLink {
  source: string;
  target: string;
  value: number;
  relationship: string;
}

export interface MockKnowledgeTopology {
  nodes: MockTopologyNode[];
  links: MockTopologyLink[];
}

export interface MockDocumentOutlineItem {
  id: string;
  title: string;
  page: number;
}

export interface MockVideoChapter {
  title: string;
  time: string;
  seconds: number;
}

export interface MockGroup {
  id: string;
  name: string;
  description: string;
  type: string;
  group_type?: string;
  join_policy: string;
  visibility: string;
  is_public: boolean;
  member_count: number;
  is_member: boolean;
  is_admin: boolean;
  is_moderator: boolean;
  allow_posts: boolean;
  allow_announcements: boolean;
  require_post_approval: boolean;
  tags: string[];
  creator_id: string;
  creator_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface MockCommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_policy?: string;
  content: string;
  post_type: string;
  visibility: string;
  reaction_count: number;
  comment_count: number;
  has_liked: boolean;
  group_id?: string;
  group_name?: string;
  school_id: string;
  media_url?: string;
  media_type?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MockAnnouncement {
  id: string;
  school_id: string;
  author_id: string;
  author_name?: string;
  content: string;
  is_pinned: boolean;
  created_at: Date | string;
}

export interface MockEcho {
  id: string;
  classroom_id: string;
  school_id: string;
  student_id: string;
  content: string;
  is_anonymous: boolean;
  is_read: boolean;
  teacher_response: string | null;
  responded_by: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  student_name: string;
}

export interface MockComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface MockGroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

export interface MockDirectConversation {
  id: string;
  participant_id: string;
  participant_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface MockStudentObservation {
  id: string;
  classroom_id: string;
  student_id: string;
  student_name: string;
  title: string;
  content: string;
  category: string;
  status: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockClassroomNote {
  id: string;
  classroom_id: string;
  author_id: string;
  author_name?: string;
  content: string;
  note_type: string;
  visibility: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockLessonMaterial {
  id: string;
  classroom_id: string;
  lesson_id?: string;
  title: string;
  material_type: string;
  url: string;
  created_at: string;
}

export interface MockStudentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: string;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  created_at: string;
}


export const MOCK_SCHOOL = {
  id: 'sample-school-1',
  school_id: 'sample-school-1',
  name: 'Gurudevi Sanctuary of Learning',
  school_type: 'Sanctuary',
  status: 'active',
  created_at: new Date('2026-01-01T08:00:00Z').toISOString(),
  total_students: 450,
  total_teachers: 28,
  is_sample: true,
};

export const MOCK_CLASSROOMS: MockClassroom[] = [
  {
    id: 'sample-c1',
    school_id: 'sample-school-1',
    name: 'Grade 10B - Science & Living Systems',
    subject: 'Science',
    description: 'Living systems, environmental equilibrium, and natural sciences sanctuary',
    color_theme: '#10B981',
    teacher_id: 'mock-t',
    is_archived: false,
    created_at: new Date('2026-01-10T08:00:00Z'),
    updated_at: new Date('2026-01-10T08:00:00Z'),
    is_sample: true,
  },
  {
    id: 'sample-c2',
    school_id: 'sample-school-1',
    name: 'Grade 11A - Pure Mathematics',
    subject: 'Mathematics',
    description: 'Advanced algebra, geometric reasoning, and spatial geometry',
    color_theme: '#F59E0B',
    teacher_id: 'mock-t',
    is_archived: false,
    created_at: new Date('2026-01-10T08:00:00Z'),
    updated_at: new Date('2026-01-10T08:00:00Z'),
    is_sample: true,
  },
  {
    id: 'sample-c3',
    school_id: 'sample-school-1',
    name: 'Grade 9 - English & Creative Arts',
    subject: 'English Language',
    description: 'Literature, critical storytelling, and expressive communication',
    color_theme: '#3B82F6',
    teacher_id: 'mock-t',
    is_archived: false,
    created_at: new Date('2026-01-10T08:00:00Z'),
    updated_at: new Date('2026-01-10T08:00:00Z'),
    is_sample: true,
  },
  {
    id: 'sample-school-1',
    school_id: 'sample-school-1',
    name: 'Gurudevi Sanctuary of Learning',
    subject: 'General',
    description: 'A holistic learning sanctuary integrating academic rigor and mindful wellbeing',
    color_theme: '#8B5CF6',
    teacher_id: 'mock-principal',
    is_archived: false,
    created_at: new Date('2026-01-01T08:00:00Z'),
    updated_at: new Date('2026-01-01T08:00:00Z'),
    is_sample: true,
    is_school: true,
  },
  {
    id: 'mock-c1',
    school_id: 'mock-school',
    name: 'Grade 10 - Mathematics',
    subject: 'Mathematics',
    description: 'Advanced algebra and geometry sanctuary',
    color_theme: '#F59E0B',
    is_archived: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'mock-c2',
    school_id: 'mock-school',
    name: 'Grade 11 - Science',
    subject: 'Science',
    description: 'Exploring the physical world',
    color_theme: '#10B981',
    is_archived: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'mock-c3',
    school_id: 'mock-school',
    name: 'Grade 10 - English',
    subject: 'English Language',
    description: 'Global communication & literature',
    color_theme: '#3B82F6',
    is_archived: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const MOCK_STUDENTS: MockStudent[] = [
  // Authentic roster linked to sample-c1 (Grade 10B - Science)
  {
    id: 'sample-s1',
    full_name: 'Nimal Silva',
    classroom_id: 'sample-c1',
    status: 'active',
    student_id: 'sample-s1',
    roll_number: '10B-01',
    enrolled_at: new Date('2026-01-10'),
    joined_at: new Date('2026-01-10'),
  },
  {
    id: 'sample-s2',
    full_name: 'Kavindi Bandara',
    classroom_id: 'sample-c1',
    status: 'active',
    student_id: 'sample-s2',
    roll_number: '10B-02',
    enrolled_at: new Date('2026-01-10'),
    joined_at: new Date('2026-01-10'),
  },
  {
    id: 'sample-s3',
    full_name: 'Shenal Perera',
    classroom_id: 'sample-c1',
    status: 'active',
    student_id: 'sample-s3',
    roll_number: '10B-03',
    enrolled_at: new Date('2026-01-10'),
    joined_at: new Date('2026-01-10'),
  },
  {
    id: 'sample-s4',
    full_name: 'Rashmi Fernando',
    classroom_id: 'sample-c1',
    status: 'active',
    student_id: 'sample-s4',
    roll_number: '10B-04',
    enrolled_at: new Date('2026-01-10'),
    joined_at: new Date('2026-01-10'),
  },
  {
    id: 'sample-s5',
    full_name: 'Dinesh Jayawardena',
    classroom_id: 'sample-c1',
    status: 'active',
    student_id: 'sample-s5',
    roll_number: '10B-05',
    enrolled_at: new Date('2026-01-10'),
    joined_at: new Date('2026-01-10'),
  },
  {
    id: 'sample-s6',
    full_name: 'Fathima Rizvi',
    classroom_id: 'sample-c1',
    status: 'active',
    student_id: 'sample-s6',
    roll_number: '10B-06',
    enrolled_at: new Date('2026-01-10'),
    joined_at: new Date('2026-01-10'),
  },
  {
    id: 'sample-s7',
    full_name: 'Thilini Senanayake',
    classroom_id: 'sample-c1',
    status: 'active',
    student_id: 'sample-s7',
    roll_number: '10B-07',
    enrolled_at: new Date('2026-01-10'),
    joined_at: new Date('2026-01-10'),
  },
  {
    id: 'sample-s8',
    full_name: 'Sachithra Gamage',
    classroom_id: 'sample-c1',
    status: 'active',
    student_id: 'sample-s8',
    roll_number: '10B-08',
    enrolled_at: new Date('2026-01-10'),
    joined_at: new Date('2026-01-10'),
  },
  {
    id: 'sample-s9',
    full_name: 'Anuki Wickramasinghe',
    classroom_id: 'sample-c1',
    status: 'active',
    student_id: 'sample-s9',
    roll_number: '10B-09',
    enrolled_at: new Date('2026-01-10'),
    joined_at: new Date('2026-01-10'),
  },
  {
    id: 'sample-s10',
    full_name: 'Kaveen Weerasinghe',
    classroom_id: 'sample-c1',
    status: 'active',
    student_id: 'sample-s10',
    roll_number: '10B-10',
    enrolled_at: new Date('2026-01-10'),
    joined_at: new Date('2026-01-10'),
  },

  // General mocks
  {
    id: 'm-s1',
    full_name: 'Nimal Silva',
    classroom_id: 'mock-c1',
    status: 'active',
    student_id: 'm-s1',
    roll_number: '10A-01',
    enrolled_at: new Date(),
    joined_at: new Date(),
  },
  {
    id: 'm-s2',
    full_name: 'Kamal Perera',
    classroom_id: 'mock-c1',
    status: 'active',
    student_id: 'm-s2',
    roll_number: '10A-02',
    enrolled_at: new Date(),
    joined_at: new Date(),
  },
  {
    id: 'm-s3',
    full_name: 'Sunethra Devi',
    classroom_id: 'mock-c2',
    status: 'active',
    student_id: 'm-s3',
    roll_number: '11S-01',
    enrolled_at: new Date(),
    joined_at: new Date(),
  },
  {
    id: 'm-s4',
    full_name: 'Anura Kumara',
    classroom_id: 'mock-c3',
    status: 'active',
    student_id: 'm-s4',
    roll_number: '10E-01',
    enrolled_at: new Date(),
    joined_at: new Date(),
  },
  {
    id: 'm-s5',
    full_name: 'Pavaltharani S.',
    classroom_id: 'mock-c1',
    status: 'active',
    student_id: 'm-s5',
    roll_number: '10A-03',
    enrolled_at: new Date(),
    joined_at: new Date(),
  },
];

export const MOCK_ATTENDANCE_SNAPSHOTS: Record<
  string,
  { records: { student_id: string; status: 'present' | 'absent' | 'late' | 'excused'; notes?: string }[] }
> = {
  'sample-c1': {
    records: [
      { student_id: 'sample-s1', status: 'present' },
      { student_id: 'sample-s2', status: 'present' },
      { student_id: 'sample-s3', status: 'late', notes: 'School transport delay' },
      { student_id: 'sample-s4', status: 'present' },
      { student_id: 'sample-s5', status: 'present' },
      { student_id: 'sample-s6', status: 'excused', notes: 'National Science Olympiad' },
      { student_id: 'sample-s7', status: 'present' },
      { student_id: 'sample-s8', status: 'present' },
      { student_id: 'sample-s9', status: 'present' },
      { student_id: 'sample-s10', status: 'absent' },
    ],
  },
  'mock-c1': {
    records: [
      { student_id: 'm-s1', status: 'present' },
      { student_id: 'm-s2', status: 'present' },
      { student_id: 'm-s5', status: 'late' },
    ],
  },
};

export const MOCK_RESOURCES: ClassroomResource[] = [
  {
    id: 'm-r1',
    classroom_id: 'sample-c1',
    teacher_id: 'mock-t',
    title: 'Grade 10 Living Systems Study Guide',
    type: 'pdf',
    is_pinned: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'm-r2',
    classroom_id: 'sample-c1',
    teacher_id: 'mock-t',
    title: 'Cellular Respiration Virtual Lab',
    type: 'link',
    url: 'https://example.com/cellular-lab',
    is_pinned: false,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'm-r3',
    classroom_id: 'mock-c1',
    teacher_id: 'mock-t',
    title: 'Trigonometry Note',
    type: 'pdf',
    is_pinned: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'sample-l1',
    classroom_id: 'sample-c1',
    title: 'Cellular Respiration & Energy Flow',
    order_index: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'sample-l2',
    classroom_id: 'sample-c1',
    title: 'Photosynthesis & Ecological Balance',
    order_index: 2,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'sample-l3',
    classroom_id: 'sample-c1',
    title: 'Optics & Natural Light Refraction',
    order_index: 3,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'm-l1',
    classroom_id: 'mock-c1',
    title: 'Introduction to Sine Waves',
    order_index: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'm-l2',
    classroom_id: 'mock-c1',
    title: 'The Cosine Rule',
    order_index: 2,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'sample-a1',
    classroom_id: 'sample-c1',
    title: 'Practical Chromatography Lab Report',
    description: 'Document your findings on plant pigment separation via paper chromatography',
    due_date: new Date(Date.now() + 86400000 * 3),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'sample-a2',
    classroom_id: 'sample-c1',
    title: 'Local Ecosystem Field Journal',
    description: 'Observe and categorize three native bird species and their feeding patterns',
    due_date: new Date(Date.now() + 86400000 * 5),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'm-a1',
    classroom_id: 'mock-c1',
    title: 'Wave Function Practice',
    description: 'Complete questions 1-5 on page 42',
    due_date: new Date(Date.now() + 86400000 * 3),
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const MOCK_SCHOOL_STATS = {
  total_students: 450,
  total_teachers: 28,
  total_classrooms: 12,
  total_sections: 4,
  attendance_rate: 0.942,
  recent_announcements: 3,
};

// Visionary Library Content
export const MOCK_LIBRARY_RESOURCES: MockLibraryResource[] = [
  {
    id: 'v-r1',
    title: 'Bhutan: Gross National Happiness in Education',
    description: 'A holistic framework for integrating wellbeing into the curriculum.',
    type: 'pdf',
    subject: 'Values',
    language: 'English',
    verified: true,
    created_at: new Date(),
    url: 'https://example.com/bhutan-gnh.pdf',
  },
  {
    id: 'v-r2',
    title: 'Restorative Justice Toolkit',
    description: 'Practical strategies for building relational sanctuaries in classrooms.',
    type: 'video',
    subject: 'Social-Emotional',
    verified: true,
    created_at: new Date(),
    url: 'https://youtube.com/watch?v=rj-toolkit',
  },
  {
    id: 'v-r3',
    title: 'Finland: Phenomenon-Based Learning Guide',
    description: 'How to break subject silos and foster interdisciplinary curiosity.',
    type: 'link',
    subject: 'Pedagogy',
    verified: true,
    created_at: new Date(),
    url: 'https://example.com/finland-pbl',
  },
  {
    id: 'res-contemplative-pedagogy',
    title: 'Mindfulness & Contemplative Pedagogy',
    description:
      'A foundational guide on stillness, deep inquiry, and intentional study in modern learning environments.',
    type: 'Guide',
    subject: 'Pedagogy',
    language: 'English',
    verified: true,
    created_at: new Date('2026-02-01'),
    url: 'https://gurudevi.app',
  },
  {
    id: 'res-dialogues-truth',
    title: 'Dialogues on Living and Truth',
    description:
      'Selections and commentaries exploring ethical living, personal reflection, and the quiet mind.',
    type: 'Manuscript',
    subject: 'Philosophy',
    language: 'English',
    verified: true,
    created_at: new Date('2026-02-10'),
    url: 'https://gurudevi.app',
  },
  {
    id: 'res-reflective-journaling',
    title: 'Principles of Reflective Journaling',
    description:
      'Techniques for capturing daily observations, self-discovery, and cultivating honest self-awareness.',
    type: 'Practice',
    subject: 'Self',
    language: 'English',
    verified: true,
    created_at: new Date('2026-02-15'),
    url: 'https://gurudevi.app',
  },
  {
    id: 'res-quiet-classrooms',
    title: 'The Quiet Classroom: Space for Inquiry',
    description:
      'Designing classroom rhythms that balance shared collaboration with restorative personal quiet.',
    type: 'Guide',
    subject: 'Classroom',
    language: 'English',
    verified: true,
    created_at: new Date('2026-03-01'),
    url: 'https://gurudevi.app',
  },
  {
    id: 'mangroves',
    title: 'Field Guide to Sri Lankan Mangrove Ecosystems',
    description:
      'Comprehensive taxonomic and field manual for coastal wetland conservation and flora identification.',
    type: 'pdf',
    subject: 'Biology',
    subjects: ['Biology', 'Ecology'],
    language: 'English',
    verified: true,
    created_at: new Date('2026-03-05'),
    url: '/sample-curriculum.pdf',
    format: 'document',
    is_official: true,
  },
  {
    id: 'intro-botany',
    title: 'Field Botany: Identifying Endemic Wet-Zone Plants',
    description:
      'Video lecture and taxonomic demonstration on identifying endemic species in Sinharaja rainforest.',
    type: 'video',
    subject: 'Science',
    subjects: ['Science', 'Botany'],
    language: 'English',
    verified: true,
    created_at: new Date('2026-03-10'),
    url: '/sample-lecture.mp4',
    format: 'video',
    is_official: true,
  },
  {
    id: 'classical-verse',
    title: 'Anthology of Classical Sinhala & Tamil Epics',
    description:
      'Annotated poetic selections from Guttila Kavya, Selalihini Sandeshaya, and Silappadikaram.',
    type: 'pdf',
    subject: 'Literature',
    subjects: ['Literature', 'Humanities'],
    language: 'English',
    verified: true,
    created_at: new Date('2026-03-12'),
    url: '/sample-curriculum.pdf',
    format: 'document',
    is_official: true,
  },
  {
    id: 'geometry-proofs',
    title: 'Geometric Proofs in Classical Sri Lankan Architecture',
    description:
      'Video analysis of sacred geometric proportions and brick stūpa structural mechanics.',
    type: 'video',
    subject: 'Mathematics',
    subjects: ['Mathematics', 'Architecture'],
    language: 'English',
    verified: true,
    created_at: new Date('2026-03-15'),
    url: '/sample-lecture.mp4',
    format: 'video',
    is_official: true,
  },
];

export const MOCK_LIBRARY_COLLECTIONS: MockLibraryCollection[] = [
  {
    id: 'col-curriculum-core',
    name: 'National Curriculum & Sri Lankan Pedagogy',
    description:
      'Foundational syllabi, educational circulars, and teacher reference materials for island schools.',
    subjects: ['Curriculum', 'Pedagogy'],
    resource_ids: ['res-contemplative-pedagogy', 'res-quiet-classrooms'],
    created_at: new Date('2026-01-15'),
    is_official: true,
  },
  {
    id: 'col-island-botany',
    name: 'Wet-Zone Ecology & Endemic Flora',
    description:
      'Biological taxonomy and herbarium field guides across Sinharaja and Sri Lankan rainforest preserves.',
    subjects: ['Biology', 'Environment'],
    resource_ids: ['mangroves', 'intro-botany', 'v-r1'],
    created_at: new Date('2026-02-01'),
    is_official: true,
  },
  {
    id: 'col-classical-humanities',
    name: 'Classical Sinhala, Tamil & Pali Epics',
    description:
      'Annotated translations of ancient chronicles, rock inscriptions, and ethical philosophical treatises.',
    subjects: ['Literature', 'Philosophy'],
    resource_ids: ['res-dialogues-truth', 'classical-verse', 'v-r2'],
    created_at: new Date('2026-02-20'),
    is_official: true,
  },
  {
    id: 'v-c1',
    name: 'The Ecology of Care',
    description: 'Foundational resources for the Sanctuary model.',
    subjects: ['Values', 'Social-Emotional'],
    resource_ids: ['v-r1', 'v-r2'],
    created_at: new Date('2026-01-01'),
    is_official: true,
  },
];

export const MOCK_LEARNING_CENTERS: readonly MockLearningCenter[] = [
  {
    id: 'lc-1',
    name: 'Colombo Central Educational Resource Center',
    province: 'Western',
    district: 'Colombo',
    booksCount: 18400,
    digitalHub: true,
    hours: 'Mon-Sat: 08:30 - 17:00',
    contact: '+94 11 269 1234',
  },
  {
    id: 'lc-2',
    name: 'Kandy Municipal Community Library & Heritage Archives',
    province: 'Central',
    district: 'Kandy',
    booksCount: 12200,
    digitalHub: true,
    hours: 'Mon-Sat: 09:00 - 16:30',
    contact: '+94 81 222 5678',
  },
  {
    id: 'lc-3',
    name: 'Jaffna Public Learning Hub & Science Corner',
    province: 'Northern',
    district: 'Jaffna',
    booksCount: 24500,
    digitalHub: true,
    hours: 'Daily: 08:00 - 18:00',
    contact: '+94 21 222 2345',
  },
  {
    id: 'lc-4',
    name: 'Galle Fort Cultural & Maritime Curricular Archive',
    province: 'Southern',
    district: 'Galle',
    booksCount: 9800,
    digitalHub: false,
    hours: 'Tue-Sun: 09:00 - 17:00',
    contact: '+94 91 223 4567',
  },
  {
    id: 'lc-5',
    name: 'Badulla Uva Provincial Resource Library',
    province: 'Uva',
    district: 'Badulla',
    booksCount: 7500,
    digitalHub: true,
    hours: 'Mon-Fri: 08:30 - 16:00',
    contact: '+94 55 222 7890',
  },
];

export const MOCK_KNOWLEDGE_TOPOLOGY: MockKnowledgeTopology = {
  nodes: [
    {
      id: 'mangroves',
      label: 'Mangrove Ecology Field Guide',
      type: 'resource',
      group: 'botany',
      metadata: {
        subjects: ['Biology', 'Ecology'],
        description: 'Comprehensive study of coastal wetlands and mangrove adaptation.',
        is_ministry_official: true,
      },
    },
    {
      id: 'intro-botany',
      label: 'Field Botany Identification',
      type: 'resource',
      group: 'botany',
      metadata: {
        subjects: ['Science'],
        description: 'Identifying endemic wet-zone plants and leaf structures.',
        is_ministry_official: true,
      },
    },
    {
      id: 'classical-verse',
      label: 'Classical Verse & Epics',
      type: 'resource',
      group: 'humanities',
      metadata: {
        subjects: ['Literature'],
        description: 'Anthology of Classical Sinhala and Tamil poetic works.',
      },
    },
    {
      id: 'geometry-proofs',
      label: 'Classical Architectural Geometry',
      type: 'resource',
      group: 'mathematics',
      metadata: {
        subjects: ['Mathematics'],
        description: 'Geometric theorems applied to Anuradhapura sacred architecture.',
      },
    },
    { id: 'topic:wetlands', label: 'Wetlands & Ecosystems', type: 'topic', group: 'curiosity' },
    { id: 'topic:taxonomy', label: 'Botanical Taxonomy', type: 'topic', group: 'curiosity' },
    { id: 'topic:epics', label: 'Sri Lankan Epics', type: 'topic', group: 'curiosity' },
    { id: 'topic:geometry', label: 'Sacred Geometry', type: 'topic', group: 'curiosity' },
  ],
  links: [
    { source: 'mangroves', target: 'topic:wetlands', value: 2, relationship: 'topic_association' },
    { source: 'intro-botany', target: 'topic:taxonomy', value: 2, relationship: 'topic_association' },
    { source: 'mangroves', target: 'intro-botany', value: 1, relationship: 'prerequisite' },
    { source: 'classical-verse', target: 'topic:epics', value: 2, relationship: 'topic_association' },
    { source: 'geometry-proofs', target: 'topic:geometry', value: 2, relationship: 'topic_association' },
  ],
};

export const MOCK_DOCUMENT_OUTLINES: readonly MockDocumentOutlineItem[] = [
  { id: 'ch1', title: '1. Sanctuary Covenant & Regional Ecology', page: 1 },
  { id: 'ch2', title: '2. Morphological Taxonomy & Native Habitat', page: 6 },
  { id: 'ch3', title: '3. Field Identification & Herbarium Protocols', page: 12 },
  { id: 'ch4', title: '4. Restorative Pedagogical Inquiries', page: 18 },
];

export const MOCK_VIDEO_CHAPTERS: readonly MockVideoChapter[] = [
  { title: '1. Introduction & Regional Context', time: '00:00', seconds: 0 },
  { title: '2. Taxonomic Features & Leaf Venation', time: '04:15', seconds: 255 },
  { title: '3. Conservation Status & Field Notes', time: '11:30', seconds: 690 },
  { title: '4. Student Reflective Exercises', time: '18:45', seconds: 1125 },
];

export interface MockCuratorStagedItem {
  id: string;
  title: string;
  description: string;
  contributor: string;
  submittedAt: string;
  type: string;
  subjects: string[];
}

export const MOCK_CURATOR_STAGED_ITEMS: readonly MockCuratorStagedItem[] = [
  {
    id: 'stage-1',
    title: 'Grade 10 Sinhala Literature Annotations (GCE O/L)',
    description:
      'Comprehensive line-by-line pedagogical commentary for Guttila Kavya and Selalihini Sandeshaya.',
    contributor: 'Venerable W. Rahula Thero (Ananda College)',
    submittedAt: 'Today, 14:20',
    type: 'Guide',
    subjects: ['Sinhala', 'Literature'],
  },
  {
    id: 'stage-2',
    title: 'Applied Physics: Solar Water Pump Calculation Workbook',
    description:
      'Practical calculation worksheets for dry-zone agro-well irrigation systems and mechanical hydraulics.',
    contributor: 'Eng. K. Sivakumar (Jaffna Central College)',
    submittedAt: 'Yesterday, 18:45',
    type: 'Worksheet',
    subjects: ['Physics', 'Agriculture'],
  },
];

export interface MockCuratorBrokenItem {
  id: string;
  title: string;
  url: string;
  failCount: number;
  reportedAt: string;
}

export const MOCK_CURATOR_BROKEN_ITEMS: readonly MockCuratorBrokenItem[] = [
  {
    id: 'broken-1',
    title: 'Department of Educational Publications 2024 Circular Archive',
    url: 'https://edupub.gov.lk/circulars/2024/spec.pdf',
    failCount: 3,
    reportedAt: '2 days ago',
  },
];

export interface MockTeacherHistoryItem {
  id: string;
  academic_year: string;
  designation: string;
  school_name: string;
  subjects: string[];
  classrooms_count: number;
  students_count: number;
  achievements: string[];
}

export const MOCK_TEACHER_PROFESSIONAL_HISTORY: readonly MockTeacherHistoryItem[] = [
  {
    id: 'th-1',
    academic_year: '2025 - 2026',
    designation: 'Senior Faculty & Department Lead',
    school_name: 'Dharmaraja National College',
    subjects: ['Advanced Physics', 'Applied Mathematics'],
    classrooms_count: 4,
    students_count: 142,
    achievements: ['District Science Olympiad 1st Place Mentor', 'Curriculum Innovator Award'],
  },
  {
    id: 'th-2',
    academic_year: '2023 - 2025',
    designation: 'Secondary Educator',
    school_name: 'Ananda Balika Vidyalaya',
    subjects: ['General Science', 'Mathematics'],
    classrooms_count: 3,
    students_count: 108,
    achievements: ['100% G.C.E. O/L Pass Rate in Mathematics'],
  },
];

// Wisdom Council Community Content
export const MOCK_COMMUNITY_GROUPS: MockGroup[] = [
  {
    id: 'demo-group-1',
    name: 'Nature Photography',
    description: 'Sharing the beauty of the natural world through our lenses.',
    type: 'interest',
    group_type: 'interest',
    join_policy: 'open',
    visibility: 'public',
    is_public: true,
    member_count: 1240,
    is_member: false,
    is_admin: false,
    is_moderator: false,
    allow_posts: true,
    allow_announcements: false,
    require_post_approval: false,
    tags: ['photography', 'nature', 'art'],
    creator_id: 'system',
    creator_name: 'Nature Bot',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: 'demo-group-2',
    name: 'Code & Craft',
    description: 'Building the future, one line at a time.',
    type: 'club',
    group_type: 'club',
    join_policy: 'open',
    visibility: 'public',
    is_public: true,
    member_count: 850,
    is_member: true,
    is_admin: false,
    is_moderator: false,
    allow_posts: true,
    allow_announcements: true,
    require_post_approval: false,
    tags: ['coding', 'makers', 'future'],
    creator_id: 'system',
    creator_name: 'Dev Lead',
    created_at: new Date('2024-01-05'),
    updated_at: new Date('2024-01-05'),
  },
  {
    id: 'demo-group-3',
    name: 'Mindfulness Circle',
    description: 'Finding peace in the present moment.',
    type: 'interest',
    group_type: 'interest',
    join_policy: 'open',
    visibility: 'public',
    is_public: true,
    member_count: 3200,
    is_member: false,
    is_admin: false,
    is_moderator: false,
    allow_posts: true,
    allow_announcements: false,
    require_post_approval: false,
    tags: ['meditation', 'wellness', 'peace'],
    creator_id: 'system',
    creator_name: 'Zen Guide',
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-10'),
  },
];

export const MOCK_COMMUNITY_POSTS: MockCommunityPost[] = [
  {
    id: 'demo-post-1',
    author_id: 'demo-user-1',
    author_name: 'Ariya',
    author_policy: 'student',
    content:
      "Just finished my first React project! It's so rewarding to see it all come together. Anyone else working on something fun today? \uD83C\uDF3F",
    post_type: 'discussion',
    visibility: 'public',
    reaction_count: 42,
    comment_count: 8,
    has_liked: true,
    group_id: 'demo-group-2',
    group_name: 'Code & Craft',
    school_id: 'demo-school',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'demo-post-2',
    author_id: 'demo-user-2',
    author_name: 'Master Sam',
    author_policy: 'teacher',
    content:
      "I've uploaded the new resource on 'Algorithmic Thinking' in the Library. Check it out and let me know if you have any questions!",
    post_type: 'resource',
    visibility: 'public',
    reaction_count: 15,
    comment_count: 3,
    has_liked: false,
    group_id: 'demo-group-2',
    group_name: 'Code & Craft',
    school_id: 'demo-school',
    created_at: new Date(Date.now() - 3600000),
    updated_at: new Date(Date.now() - 3600000),
  },
  {
    id: 'demo-post-3',
    author_id: 'demo-user-3',
    author_name: 'Luna',
    author_policy: 'student',
    content: 'Found this beautiful spot in the garden today. Nature is the best designer. \u2728',
    post_type: 'discussion',
    visibility: 'public',
    media_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc',
    media_type: 'image',
    reaction_count: 89,
    comment_count: 12,
    has_liked: false,
    group_id: 'demo-group-1',
    group_name: 'Nature Photography',
    school_id: 'demo-school',
    created_at: new Date(Date.now() - 7200000),
    updated_at: new Date(Date.now() - 7200000),
  },
];

export const MOCK_ANNOUNCEMENTS: MockAnnouncement[] = [
  {
    id: 'ann-1',
    school_id: 'sample-school',
    author_id: 'mock-principal',
    author_name: 'Principal Maitreya',
    content:
      'Welcome to the Sanctuary of Learning. Today we begin our journey into resonance and mindfulness.',
    is_pinned: true,
    created_at: new Date(),
  },
  {
    id: 'ann-2',
    school_id: 'sample-school',
    author_id: 'mock-principal',
    author_name: 'Principal Maitreya',
    content: 'New community features are now live. Connect with your peers in the Wisdom Council.',
    is_pinned: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// \u2500\u2500 Demo / Sandbox: Staff Management \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export const MOCK_STAFF_PRESENCE: StaffPresenceSummary = {
  present: 38,
  absent: 4,
  onLeave: 3,
  total: 45,
};

export const MOCK_TEACHER_CAROUSEL: TeacherCarouselItem[] = [
  {
    userId: 'mock-t1',
    fullName: 'Sanduni Perera',
    capacity: 'teacher',
    todayStatus: 'present',
    classroomCount: 3,
    avatarUrl: null,
  },
  {
    userId: 'mock-t2',
    fullName: 'Nimal Wickrama',
    capacity: 'teacher',
    todayStatus: 'present',
    classroomCount: 2,
    avatarUrl: null,
  },
  {
    userId: 'mock-t3',
    fullName: 'Amali Fernando',
    capacity: 'gradeHead',
    todayStatus: 'late',
    classroomCount: 4,
    avatarUrl: null,
  },
  {
    userId: 'mock-t4',
    fullName: 'Roshan Silva',
    capacity: 'teacher',
    todayStatus: 'absent',
    classroomCount: 2,
    avatarUrl: null,
  },
  {
    userId: 'mock-t5',
    fullName: 'Kavindra Dias',
    capacity: 'teacher',
    todayStatus: 'present',
    classroomCount: 1,
    avatarUrl: null,
  },
];

export const MOCK_STUDENT_PULSE: StudentAttendancePulse = {
  todayRate: 91,
  yesterdayRate: 88,
  atRiskCount: 4,
};

export const MOCK_PENDING_LEAVES: StaffLeaveDTO[] = [
  {
    id: 'mock-l1',
    school_id: 'mock-school',
    user_id: 'mock-t4',
    leave_type: 'medical',
    start_date: new Date(),
    end_date: new Date(Date.now() + 2 * 86400000),
    reason: 'Scheduled medical procedure',
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 3600000),
  },
  {
    id: 'mock-l2',
    school_id: 'mock-school',
    user_id: 'mock-t2',
    leave_type: 'personal',
    start_date: new Date(Date.now() + 7 * 86400000),
    end_date: new Date(Date.now() + 7 * 86400000),
    reason: 'Family commitment',
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date(Date.now() - 7200000),
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'sample-notif-1',
    type: 'school.announcement',
    title: 'Welcome to Gurudevi Sanctuary of Learning',
    body: 'Your sanctuary workspace has been initialized with sample Grade 10B Science & Grade 11A Mathematics classrooms.',
    is_read: false,
    reference_id: 'sample-c1',
    reference_type: 'classroom',
    created_at: '2026-10-17T07:30:00.000Z',
  },
  {
    id: 'sample-notif-2',
    type: 'school.attendance',
    title: 'Daily Attendance Register Ready',
    body: 'Grade 10B - Science & Living Systems roll call is ready for marking.',
    is_read: false,
    reference_id: 'sample-c1',
    reference_type: 'attendance',
    created_at: '2026-10-17T06:45:00.000Z',
  },
  {
    id: 'sample-notif-3',
    type: 'school.lesson',
    title: 'New Learning Resource Published',
    body: 'Cellular Energetics & Photosynthesis lesson plan added to Grade 10B.',
    is_read: true,
    reference_id: 'sample-res-1',
    reference_type: 'resource',
    created_at: '2026-10-16T14:20:00.000Z',
  },
  {
    id: 'sample-notif-4',
    type: 'wellbeing.pulse',
    title: 'Daily School Pulse Snapshot',
    body: 'Overall attendance at Gurudevi Sanctuary is at 94.2% across 3 active classrooms.',
    is_read: true,
    reference_id: 'sample-school-1',
    reference_type: 'school',
    created_at: '2026-10-16T09:00:00.000Z',
  },
];

export const MOCK_ECHOES: MockEcho[] = [
  {
    id: 'sample-echo-1',
    classroom_id: 'sample-c1',
    school_id: 'sample-school-1',
    student_id: 'sample-s1',
    content:
      'The interactive plant cell model helped clarify photosynthesis! Can we do an ecological field lab next week?',
    is_anonymous: false,
    is_read: false,
    teacher_response:
      'Wonderful observation, Nimal! We have an outdoor quadrant study planned for Friday.',
    responded_by: 'mock-t',
    responded_at: new Date(Date.now() - 1800000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
    student_name: 'Nimal Silva',
  },
  {
    id: 'sample-echo-2',
    classroom_id: 'sample-c1',
    school_id: 'sample-school-1',
    student_id: 'sample-s2',
    content: 'Could we get an extra practice problem on quadratic factorization before the quiz?',
    is_anonymous: true,
    is_read: true,
    teacher_response: null,
    responded_by: null,
    responded_at: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    student_name: 'Anonymous Student',
  },
  {
    id: 'sample-echo-3',
    classroom_id: 'sample-c2',
    school_id: 'sample-school-1',
    student_id: 'sample-s3',
    content: 'Understood geometric proofs much better after the visual step-by-step.',
    is_anonymous: false,
    is_read: true,
    teacher_response: 'Glad to hear that, Shenal. Keep up the consistent practice!',
    responded_by: 'mock-t',
    responded_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    student_name: 'Shenal Perera',
  },
];

export const MOCK_COMMUNITY_COMMENTS: MockComment[] = [
  {
    id: 'sample-comment-1',
    post_id: 'demo-post-1',
    author_id: 'sample-s2',
    author_name: 'Kavindi Bandara',
    content: 'Congratulations Ariya! What component did you find most challenging to build?',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'sample-comment-2',
    post_id: 'demo-post-1',
    author_id: 'demo-user-1',
    author_name: 'Ariya',
    content:
      'State management across tabs was tricky, but using atomic stores made it super smooth!',
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'sample-comment-3',
    post_id: 'demo-post-2',
    author_id: 'sample-s4',
    author_name: 'Rashmi Fernando',
    content: 'The recursion diagram in chapter 3 was incredibly clear. Thank you Master Sam!',
    created_at: new Date(Date.now() - 2400000).toISOString(),
  },
];

export const MOCK_GROUP_MESSAGES: MockGroupMessage[] = [
  {
    id: 'sample-msg-1',
    group_id: 'demo-group-2',
    sender_id: 'demo-user-1',
    sender_name: 'Ariya',
    content:
      'Anyone interested in pair-programming on the offline SQLite sync algorithm this afternoon?',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sample-msg-2',
    group_id: 'demo-group-2',
    sender_id: 'sample-s3',
    sender_name: 'Shenal Perera',
    content: 'Count me in! I will join the study circle after the mathematics lesson.',
    created_at: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 'sample-msg-3',
    group_id: 'demo-group-1',
    sender_id: 'demo-user-3',
    sender_name: 'Luna',
    content:
      'Uploaded three new high-res macro photos of morning dew on lotus leaves to the shared album.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const MOCK_DIRECT_CONVERSATIONS: MockDirectConversation[] = [
  {
    id: 'sample-conv-1',
    participant_id: 'mock-t',
    participant_name: 'Teacher Sam',
    last_message: 'Remember to submit your plant specimen photo by Friday 3 PM.',
    last_message_at: new Date(Date.now() - 5400000).toISOString(),
    unread_count: 0,
  },
  {
    id: 'sample-conv-2',
    participant_id: 'sample-s2',
    participant_name: 'Kavindi Bandara',
    last_message: 'Thanks for sharing the science notes!',
    last_message_at: new Date(Date.now() - 86400000).toISOString(),
    unread_count: 0,
  },
];

export const MOCK_STUDENT_OBSERVATIONS: MockStudentObservation[] = [
  {
    id: 'sample-obs-1',
    classroom_id: 'sample-c1',
    student_id: 'sample-s1',
    student_name: 'Nimal Silva',
    title: 'Strong Botanical Inquiry',
    content:
      'Nimal demonstrated exceptional intuitive grasp of plant vascular systems during the micro-slide exercise.',
    category: 'academic_strength',
    status: 'finalized',
    is_private: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-obs-2',
    classroom_id: 'sample-c1',
    student_id: 'sample-s2',
    student_name: 'Kavindi Bandara',
    title: 'Collaborative Group Leadership',
    content:
      'Organized and paced the peer review circle for the cellular energy lab with patience and clarity.',
    category: 'collaborative_presence',
    status: 'finalized',
    is_private: false,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const MOCK_CLASSROOM_NOTES: MockClassroomNote[] = [
  {
    id: 'sample-note-1',
    classroom_id: 'sample-c1',
    author_id: 'mock-t',
    author_name: 'Teacher Sam',
    content:
      'Class demonstrated remarkable interest in the Sri Lankan rainforest micro-ecosystem study. Recommend extending the practical observation session to 90 minutes next Friday.',
    note_type: 'observation',
    visibility: 'internal',
    is_pinned: true,
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'sample-note-2',
    classroom_id: 'sample-c1',
    author_id: 'mock-t',
    author_name: 'Teacher Sam',
    content: 'Homework return rate: 100% on the living systems vocabulary worksheet. Well done all.',
    note_type: 'announcement',
    visibility: 'classroom',
    is_pinned: false,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const MOCK_LESSON_MATERIALS: MockLessonMaterial[] = [
  {
    id: 'sample-mat-1',
    classroom_id: 'sample-c1',
    lesson_id: 'sample-l1',
    title: 'Cellular Respiration Laboratory Protocol',
    material_type: 'document',
    url: 'https://example.com/materials/lab-protocol.pdf',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-mat-2',
    classroom_id: 'sample-c1',
    lesson_id: 'sample-l1',
    title: 'Interactive Photosynthesis Diagram & Quiz',
    material_type: 'link',
    url: 'https://example.com/materials/photosynthesis-interactive',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const MOCK_STUDENT_SUBMISSIONS: MockStudentSubmission[] = [
  {
    id: 'sample-sub-1',
    assignment_id: 'sample-a1',
    student_id: 'sample-s1',
    status: 'graded',
    score: 95,
    feedback: 'Excellent breakdown of mitochondrial membrane potential.',
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-sub-2',
    assignment_id: 'sample-a2',
    student_id: 'sample-s1',
    status: 'submitted',
    score: null,
    feedback: null,
    submitted_at: new Date(Date.now() - 14400000).toISOString(),
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

export const MOCK_TEACHER_STATS = {
  active_classes: 3,
  total_students: 78,
  average_pulse: 94.2,
};

export const MOCK_STUDENT_STATS = {
  active_sanctuaries: 3,
  goals_set: 5,
  growth_points: 120,
};

export const MOCK_TEMPORAL_MILESTONES = [
  {
    id: 'milestone-1',
    phase: 'past' as const,
    date: '2026-02-15',
    title: 'Term 1 Foundation Assessment Completed',
    description: '94.2% overall attendance and foundation coursework achieved.',
    classroom_name: 'Grade 10B - Science & Living Systems',
  },
  {
    id: 'milestone-2',
    phase: 'present' as const,
    date: '2026-10-17',
    title: 'Mid-Term Living Systems Field Studies',
    description: 'Active photosynthesis laboratory & ecological observation.',
    classroom_name: 'Grade 10B - Science & Living Systems',
  },
  {
    id: 'milestone-3',
    phase: 'future' as const,
    date: '2026-11-20',
    title: 'Sanctuary Ecological Fair & Presentations',
    description: 'Cross-classroom collaborative exhibitions and student resonance awards.',
    classroom_name: 'All Sanctuaries',
  },
];

export const MOCK_SELF_MOOD_HISTORY = [
  {
    id: 'sample-mood-1',
    mood_score: 5,
    mood: 'energized',
    note: 'Morning breathwork and serene walk through the garden.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sample-mood-2',
    mood_score: 4,
    mood: 'calm',
    note: 'Focused study session on ecological biology.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-mood-3',
    mood_score: 4,
    mood: 'reflective',
    note: 'Discussed graduation goals with mentor teacher.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const MOCK_JOURNAL_ENTRIES = [
  {
    id: 'sample-journal-1',
    content_preview:
      'Releasing the anxiety of perfection. What matters is steady, honest presence.',
    is_burned: true,
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'sample-journal-2',
    content_preview: 'Gratitude for the quiet sanctuary morning before the bell.',
    is_burned: true,
    created_at: new Date(Date.now() - 129600000).toISOString(),
  },
];

export const MOCK_STUDENT_GRADES = [
  {
    id: 'sample-grade-1',
    grade: 88,
    feedback: 'Clear reasoning and careful presentation of botanical data.',
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
    assignments: { title: 'Practical Chromatography Lab Report' },
    classrooms: { name: 'Grade 10B - Science & Living Systems' },
    is_sample: true,
  },
  {
    id: 'sample-grade-2',
    grade: 92,
    feedback: 'Deep conceptual grasp of quadratic and spatial patterns.',
    submitted_at: new Date(Date.now() - 259200000).toISOString(),
    assignments: { title: 'Wave Function Practice' },
    classrooms: { name: 'Grade 11A - Pure Mathematics' },
    is_sample: true,
  },
  {
    id: 'sample-grade-3',
    grade: 78,
    feedback: 'Good observation of native species. Keep refining the discussion section.',
    submitted_at: new Date(Date.now() - 432000000).toISOString(),
    assignments: { title: 'Local Ecosystem Field Journal' },
    classrooms: { name: 'Grade 10B - Science & Living Systems' },
    is_sample: true,
  },
];

export const MOCK_STUDENT_GOALS = [
  {
    id: 'sample-goal-1',
    text: 'Complete all pending sanctuary quests this week',
    progress: 65,
    is_sample: true,
  },
  {
    id: 'sample-goal-2',
    text: 'Achieve mastery in living systems laboratory protocols',
    progress: 85,
    is_sample: true,
  },
  {
    id: 'sample-goal-3',
    text: 'Engage in daily reflective meditation and journal entry',
    progress: 70,
    is_sample: true,
  },
];

export interface MockUserProfile {
  id: string;
  display_name: string;
  username: string;
  bio: string;
  phone: string;
  avatar_url: string | null;
  experience_years: number;
  subjects_taught: string[];
  qualifications: string[];
  social_links: { platform: string; url: string }[];
  energy_tokens: number;
  stats: {
    circles_visited: number;
    mindful_streak_days: number;
    journals_released: number;
  };
  focus_areas: string[];
  role_title?: string;
  custom_badges?: { id: string; label: string; icon: string; description: string }[];
  research_interests?: string[];
  affiliations?: string[];
  is_sample?: boolean;
}

export const DEFAULT_MOCK_USER_PROFILE: MockUserProfile = {
  id: 'sample-user-teacher',
  display_name: 'Ananda Sen',
  username: 'ananda_educator',
  bio: 'Exploring contemplative pedagogical methods, ecological science, and mindful mathematics.',
  phone: '+91 98765 43210',
  avatar_url: null,
  experience_years: 5,
  subjects_taught: ['Contemplative Pedagogy', 'Mathematics', 'Ethical Inquiring'],
  qualifications: ['B.Sc. Education', 'PGDE (Merit)', 'Sanctuary Mindfulness Fellow'],
  social_links: [{ platform: 'Website', url: 'https://sanctuary.edlove.org/teachers/ananda' }],
  energy_tokens: 42,
  stats: {
    circles_visited: 4,
    mindful_streak_days: 7,
    journals_released: 3,
  },
  focus_areas: ['🪷 Mindful Pedagogies', '🧭 Restorative Inquiring', '🌿 Forest Learning', '📊 Compassionate Analytics'],
  role_title: 'Lead Dharma & Mathematics Educator',
  custom_badges: [
    { id: 'mindful-fellow', label: 'Mindfulness Fellow', icon: '🪷', description: 'Certified contemplative education practitioner' },
    { id: 'forest-guide', label: 'Forest Field Guide', icon: '🌿', description: 'Accredited wet-zone biodiversity outdoor instructor' },
  ],
  research_interests: ['Ethnomathematics in South Asia', 'Silence Rhythms in Classroom Attention'],
  affiliations: ['Sanctuary Pedagogical Guild', 'EdLove Open Curriculum Collective'],
  is_sample: true,
};

export const MOCK_USER_PROFILES: Record<string, MockUserProfile> = {
  teacher: DEFAULT_MOCK_USER_PROFILE,
  educator: DEFAULT_MOCK_USER_PROFILE,
  principal: {
    id: 'sample-user-principal',
    display_name: 'Dr. Devika Sharma',
    username: 'devika_lead',
    bio: 'Fostering ecological, mindful, and collaborative learning communities across all standards.',
    phone: '+91 98111 22334',
    avatar_url: null,
    experience_years: 14,
    subjects_taught: ['Educational Leadership', 'Institutional Ethics'],
    qualifications: ['Ph.D. Education Administration', 'M.Ed. Leadership', 'National Council Fellow'],
    social_links: [{ platform: 'LinkedIn', url: 'https://linkedin.com/in/devika-sharma-sanctuary' }],
    energy_tokens: 120,
    stats: {
      circles_visited: 8,
      mindful_streak_days: 14,
      journals_released: 6,
    },
    focus_areas: ['🏛️ Institutional Ethics', '🌐 Community Ecology', '📊 Whole-School Sensing', '🕊️ Restorative Governance'],
    role_title: 'School Leader & Principal',
    custom_badges: [
      { id: 'school-architect', label: 'School Architect', icon: '🏛️', description: 'Whole-school institutional systems builder' },
      { id: 'restorative-steward', label: 'Restorative Steward', icon: '🕊️', description: 'Certified conflict transformation mediator' },
    ],
    research_interests: ['Restorative Institutional Governance', 'Distributed School Autonomy'],
    affiliations: ['Council of Contemplative Principals', 'National Institute of Education'],
    is_sample: true,
  },
  admin: {
    id: 'sample-user-principal',
    display_name: 'Dr. Devika Sharma',
    username: 'devika_lead',
    bio: 'Fostering ecological, mindful, and collaborative learning communities across all standards.',
    phone: '+91 98111 22334',
    avatar_url: null,
    experience_years: 14,
    subjects_taught: ['Educational Leadership', 'Institutional Ethics'],
    qualifications: ['Ph.D. Education Administration', 'M.Ed. Leadership', 'National Council Fellow'],
    social_links: [{ platform: 'LinkedIn', url: 'https://linkedin.com/in/devika-sharma-sanctuary' }],
    energy_tokens: 120,
    stats: {
      circles_visited: 8,
      mindful_streak_days: 14,
      journals_released: 6,
    },
    focus_areas: ['🏛️ Institutional Ethics', '🌐 Community Ecology', '📊 Whole-School Sensing', '🕊️ Restorative Governance'],
    role_title: 'Institutional Administrator',
    is_sample: true,
  },
  student: {
    id: 'sample-user-student',
    display_name: 'Kiran Patel',
    username: 'kiran_learner',
    bio: 'Curious explorer of living systems, field biology, and celestial patterns.',
    phone: '',
    avatar_url: null,
    experience_years: 0,
    subjects_taught: [],
    qualifications: ['Student Council Representative', 'Science Olympiad Finalist'],
    social_links: [],
    energy_tokens: 18,
    stats: {
      circles_visited: 2,
      mindful_streak_days: 3,
      journals_released: 1,
    },
    focus_areas: ['🌱 Living Systems', '📐 Pure Mathematics', '🔭 Celestial Mechanics', '🎨 Reflective Journaling'],
    role_title: 'Young Learner & Student',
    custom_badges: [
      { id: 'curiosity-seeker', label: 'Curiosity Seeker', icon: '🔭', description: 'Completed 5 exploratory science inquiries' },
      { id: 'peer-resonance', label: 'Peer Ally', icon: '🤝', description: 'Active collaborator in peer study circles' },
    ],
    research_interests: ['Wetland Macroinvertebrates', 'Telescope Optics'],
    affiliations: ['Sanctuary Youth Science Circle'],
    is_sample: true,
  },
  guardian: {
    id: 'sample-user-guardian',
    display_name: 'Meera Patel',
    username: 'meera_parent',
    bio: 'Parent advocate passionate about holistic emotional growth and outdoor learning environments.',
    phone: '+91 94444 55555',
    avatar_url: null,
    experience_years: 0,
    subjects_taught: ['Parent-Teacher Advisory'],
    qualifications: ['Community Wellbeing Facilitator'],
    social_links: [],
    energy_tokens: 35,
    stats: {
      circles_visited: 3,
      mindful_streak_days: 5,
      journals_released: 2,
    },
    focus_areas: ['🤝 Parent-Teacher Synergy', '🏡 Holistic Growth', '🌻 Nature-Based Play'],
    role_title: 'Family & Guardian',
    custom_badges: [
      { id: 'family-bridge', label: 'Family Bridge Steward', icon: '🏡', description: 'Active home-school community partnership leader' },
    ],
    research_interests: ['Emotional Co-regulation in Family Spaces'],
    affiliations: ['Parent-Teacher Advisory Council'],
    is_sample: true,
  },
  founder: {
    id: 'sample-user-founder',
    display_name: 'Bodhi Dharmasena',
    username: 'bodhi_founder',
    bio: 'Pioneering contemplative education infrastructure, distributed pedagogy, and regenerative school ecosystems.',
    phone: '+94 77 900 1122',
    avatar_url: null,
    experience_years: 22,
    subjects_taught: ['Ecological Systems Design', 'Sovereign Institutional Architecture'],
    qualifications: ['EdLove Foundation Steward', 'Chartered Educational Architect', 'Honorary Fellow in Regenerative Pedagogy'],
    social_links: [
      { platform: 'Website', url: 'https://edlove.org/stewards/bodhi' },
      { platform: 'GitHub', url: 'https://github.com/edlove' },
    ],
    energy_tokens: 350,
    stats: {
      circles_visited: 24,
      mindful_streak_days: 108,
      journals_released: 19,
    },
    focus_areas: ['🏛️ Regenerative Systems', '🌱 Forest Architecture', '📜 Sovereign Ledgers', '✨ Diurnal Flow'],
    role_title: 'Platform Founder & Steward',
    custom_badges: [
      { id: 'founding-steward', label: 'Founding Steward', icon: '🏛️', description: 'Architect of the Gurudevi Sanctuary and EdLove network' },
      { id: 'master-guardian', label: 'Sovereign Protocol Pioneer', icon: '🛡️', description: 'Pioneer of the 2026 Sovereign Account Protocol' },
      { id: 'negentropy-patron', label: 'Negentropy Patron', icon: '⚡', description: 'Sustaining communal vitality reservoirs' },
    ],
    research_interests: ['Sovereign Sync Architecture', 'Contemplative Cognitive Ergonomics', 'Post-Industrial Village Pedagogy'],
    affiliations: ['EdLove Foundation', 'Sri Lanka Regenerative Schools Guild', 'Sanctuary Global Council'],
    is_sample: true,
  },
  researcher: {
    id: 'sample-user-researcher',
    display_name: 'Dr. Tharika Jayawardena',
    username: 'tharika_neuro',
    bio: 'Investigating attentional neurodynamics, breath synchronization in classroom spaces, and contemplative mathematics.',
    phone: '+94 71 456 7890',
    avatar_url: null,
    experience_years: 9,
    subjects_taught: ['Cognitive Neurodynamics', 'Mindful Data Science'],
    qualifications: ['Ph.D. Cognitive Neuroscience (Cambridge)', 'B.Sc. Cognitive Psychology', 'Global Attention Lab Fellow'],
    social_links: [
      { platform: 'Website', url: 'https://tharika-neuro.org' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/tharika-neuro' },
    ],
    energy_tokens: 165,
    stats: {
      circles_visited: 11,
      mindful_streak_days: 28,
      journals_released: 9,
    },
    focus_areas: ['🧠 Attentional Neurodynamics', '🔬 Empirical Mindfulness', '📊 Compassionate Metrics', '🌿 Bio-Acoustic Ecology'],
    role_title: 'Contemplative Cognitive Scientist',
    custom_badges: [
      { id: 'lead-investigator', label: 'Lead Investigator', icon: '🔬', description: 'Principal investigator on Attention Negentropy in learning spaces' },
      { id: 'peer-reviewer', label: 'Sanctuary Peer Reviewer', icon: '📖', description: 'Verified reviewer of pedagogical research monographs' },
      { id: 'open-science', label: 'Open Science Fellow', icon: '🌐', description: 'Advocate for open dataset reproduction and transparent metrics' },
    ],
    research_interests: ['EEG Synchronization during Group Chanting', 'Diurnal Cognition and Circadian Classrooms'],
    affiliations: ['Sanctuary Research Atlas', 'National Institute of Cognitive Education'],
    is_sample: true,
  },
};

// ---------------------------------------------------------------------------
// CANONICAL WORKSPACE & INSTITUTIONAL MOCKS (Classroom, Principal, Guardian, Admin)
// ---------------------------------------------------------------------------

export interface MockClassroomDetailStudent {
  id: string;
  name: string;
  rollNumber: number;
  attendanceRate: number;
}

export const MOCK_CLASSROOM_DETAIL_STUDENTS: readonly MockClassroomDetailStudent[] = [
  { id: 'st-1', name: 'Amara Perera', rollNumber: 1, attendanceRate: 96 },
  { id: 'st-2', name: 'Kavi Fernando', rollNumber: 2, attendanceRate: 92 },
  { id: 'st-3', name: 'Mihiri Silva', rollNumber: 3, attendanceRate: 88 },
  { id: 'st-4', name: 'Naveen Jayasuriya', rollNumber: 4, attendanceRate: 100 },
  { id: 'st-5', name: 'Sahan Wickramasinghe', rollNumber: 5, attendanceRate: 94 },
  { id: 'st-6', name: 'Sanduni Rathnayake', rollNumber: 6, attendanceRate: 98 },
];

export interface MockClassroomDetailLesson {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  summary: string;
}

export const MOCK_CLASSROOM_DETAIL_LESSONS: readonly MockClassroomDetailLesson[] = [
  {
    id: 'les-1',
    title: 'Cellular Respiration & Bio-energetics',
    date: '2026-10-26',
    status: 'completed',
    summary: 'Explored ATP synthesis, mitochondrial electron transport, and plant photosynthetic parity.',
  },
  {
    id: 'les-2',
    title: 'Indigenous Wetland Ecology of Muthurajawela',
    date: '2026-10-28',
    status: 'scheduled',
    summary: 'Field observation preparation, endemic flora identification, and water salinity profiling.',
  },
  {
    id: 'les-3',
    title: 'Mendelian Genetics & Inheritance Patterns',
    date: '2026-10-31',
    status: 'scheduled',
    summary: 'Punnett squares, monohybrid crosses, and phenotypic ratios in botanical cultivars.',
  },
];

export interface MockClassroomDetailAssignment {
  id: string;
  title: string;
  dueDate: string;
  submissionsCount: number;
  totalStudents: number;
  status: 'active' | 'grading' | 'closed';
}

export const MOCK_CLASSROOM_DETAIL_ASSIGNMENTS: readonly MockClassroomDetailAssignment[] = [
  {
    id: 'asg-1',
    title: 'Microscopic Observation Portfolio',
    dueDate: '2026-10-30',
    submissionsCount: 5,
    totalStudents: 6,
    status: 'active',
  },
  {
    id: 'asg-2',
    title: 'Wetland Bio-Indicator Analysis Report',
    dueDate: '2026-11-04',
    submissionsCount: 0,
    totalStudents: 6,
    status: 'active',
  },
];

export interface MockClassroomDetailObservation {
  id: string;
  studentName: string;
  date: string;
  type: 'positive' | 'concern' | 'neutral';
  note: string;
}

export const MOCK_CLASSROOM_DETAIL_OBSERVATIONS: readonly MockClassroomDetailObservation[] = [
  {
    id: 'obs-1',
    studentName: 'Amara Perera',
    date: '2026-10-25',
    type: 'positive',
    note: 'Demonstrated exemplary clarity in explaining chloroplast thylakoid membrane reactions.',
  },
  {
    id: 'obs-2',
    studentName: 'Mihiri Silva',
    date: '2026-10-24',
    type: 'concern',
    note: 'Needs reinforcement on biochemical enzyme kinetic curve plotting.',
  },
  {
    id: 'obs-3',
    studentName: 'Naveen Jayasuriya',
    date: '2026-10-22',
    type: 'neutral',
    note: 'Assigned as laboratory group captain for Muthurajawela wetland field trip.',
  },
];

export interface MockCurriculumProgress {
  grade: string;
  subject: string;
  completionPercent: number;
  status: 'on_track' | 'lagging' | 'accelerated';
}

export const MOCK_PRINCIPAL_CURRICULUM_PROGRESS: readonly MockCurriculumProgress[] = [
  { grade: 'Grade 10', subject: 'Science & Ecology', completionPercent: 78, status: 'on_track' },
  { grade: 'Grade 11', subject: 'Pure Mathematics', completionPercent: 84, status: 'accelerated' },
  { grade: 'Grade 10', subject: 'Sinhala & Classical Literature', completionPercent: 62, status: 'lagging' },
  { grade: 'Grade 12', subject: 'Biological Sciences', completionPercent: 72, status: 'on_track' },
  { grade: 'Grade 13', subject: 'History & Civics', completionPercent: 88, status: 'accelerated' },
];

export interface MockPendingStaffLeave {
  id: string;
  staffName: string;
  role: string;
  type: string;
  duration: string;
  substitute: string;
}

export const MOCK_PRINCIPAL_PENDING_LEAVES: readonly MockPendingStaffLeave[] = [
  {
    id: 'leave-101',
    staffName: 'Bandula Karunaratne',
    role: 'Senior Science Master',
    type: 'Casual',
    duration: '2026-10-28 → 2026-10-29',
    substitute: 'Sunil Jayawardena',
  },
  {
    id: 'leave-103',
    staffName: 'Chitra Wickramasinghe',
    role: 'Nutrition & Pantry Director',
    type: 'Medical',
    duration: '2026-10-30',
    substitute: 'Internal Support',
  },
];

export interface MockGuardianChild {
  id: string;
  name: string;
  grade: string;
  attendanceRate: number;
  homeroomTeacher: string;
  avatarInitials: string;
}

export const MOCK_GUARDIAN_CHILDREN: readonly MockGuardianChild[] = [
  {
    id: 'st-amara',
    name: 'Amara Perera',
    grade: 'Grade 10A • Science & Ecology',
    attendanceRate: 96,
    homeroomTeacher: 'Bandula Karunaratne',
    avatarInitials: 'AP',
  },
  {
    id: 'st-kavi',
    name: 'Kavi Perera',
    grade: 'Grade 7B • Middle School',
    attendanceRate: 98,
    homeroomTeacher: 'Sunil Jayawardena',
    avatarInitials: 'KP',
  },
];

export interface MockGuardianAttendanceEvent {
  id: string;
  date: string;
  time: string;
  type: string;
  status: 'present' | 'late' | 'excused';
  session: string;
}

export const MOCK_GUARDIAN_ATTENDANCE_TIMELINE: readonly MockGuardianAttendanceEvent[] = [
  {
    id: 'att-1',
    date: '2026-10-26',
    time: '07:42 AM',
    type: 'Campus Arrival',
    status: 'present',
    session: 'Homeroom Census',
  },
  {
    id: 'att-2',
    date: '2026-10-25',
    time: '07:45 AM',
    type: 'Campus Arrival',
    status: 'present',
    session: 'Homeroom Census',
  },
  {
    id: 'att-3',
    date: '2026-10-24',
    time: '07:38 AM',
    type: 'Campus Arrival',
    status: 'present',
    session: 'Homeroom Census',
  },
  {
    id: 'att-4',
    date: '2026-10-23',
    time: '07:40 AM',
    type: 'Campus Arrival',
    status: 'present',
    session: 'Homeroom Census',
  },
];

export interface MockGuardianNotice {
  id: string;
  author: string;
  role: string;
  date: string;
  title: string;
  content: string;
}

export const MOCK_GUARDIAN_NOTICES: readonly MockGuardianNotice[] = [
  {
    id: 'not-1',
    author: 'Bandula Karunaratne',
    role: 'Senior Science Master',
    date: '2026-10-25',
    title: 'Muthurajawela Wetland Ecology Field Trip Consent Form',
    content:
      'Please review and complete the attached digital consent voucher for our practical ecological survey on Friday, November 7.',
  },
  {
    id: 'not-2',
    author: 'Dr. Nirmala Perera',
    role: 'Student Care Circle',
    date: '2026-10-20',
    title: 'Term 3 Somatic Well-Being Check-in',
    content:
      'Amara has actively participated in our morning mindfulness and breathing exercises with calm focus.',
  },
];

export interface MockGradebookStudent {
  id: string;
  name: string;
  rollNumber: number;
  marks: number;
  feedback: string;
}

export const MOCK_GRADEBOOK_ROSTER: readonly MockGradebookStudent[] = [
  {
    id: 'st-1',
    name: 'Amara Perera',
    rollNumber: 1,
    marks: 88,
    feedback: 'Strong conceptual clarity',
  },
  { id: 'st-2', name: 'Kavi Fernando', rollNumber: 2, marks: 76, feedback: 'Active participation' },
  {
    id: 'st-3',
    name: 'Mihiri Silva',
    rollNumber: 3,
    marks: 62,
    feedback: 'Improving in problem solving',
  },
  { id: 'st-4', name: 'Nila Sen', rollNumber: 4, marks: 94, feedback: 'Exemplary work' },
  {
    id: 'st-5',
    name: 'Ravi Das',
    rollNumber: 5,
    marks: 44,
    feedback: 'Needs additional practice on fractions',
  },
  { id: 'st-6', name: 'Mira Anand', rollNumber: 6, marks: 71, feedback: 'Consistent progress' },
];

export interface MockFounderSchool {
  id: string;
  name: string;
  censusId: string;
  students: number;
  teachers: number;
  status: 'active' | 'onboarding';
}

export const MOCK_FOUNDER_SCHOOLS: readonly MockFounderSchool[] = [
  {
    id: 'sch-1',
    name: 'Ananda College Educational Sanctuary',
    censusId: 'LK-WP-COL-001',
    students: 1240,
    teachers: 68,
    status: 'active',
  },
  {
    id: 'sch-2',
    name: 'Dharmaraja College Heritage Circle',
    censusId: 'LK-CP-KAN-004',
    students: 980,
    teachers: 52,
    status: 'active',
  },
  {
    id: 'sch-3',
    name: 'Jaffna Hindu College Sanctuary Hall',
    censusId: 'LK-NP-JAF-012',
    students: 860,
    teachers: 44,
    status: 'active',
  },
];

export interface MockOfficialCircularDoc {
  id: string;
  title: string;
  category: 'circular' | 'curriculum' | 'administrative' | 'policy';
  issueDate: string;
  status: 'published' | 'review';
  documentNo: string;
}

export const MOCK_OFFICIAL_CIRCULARS: readonly MockOfficialCircularDoc[] = [
  {
    id: 'doc-1',
    title: 'National Guidelines for Mindfulness & Contemplative Education in Schools',
    category: 'policy',
    issueDate: '2026-09-15',
    status: 'published',
    documentNo: 'MOE/CIRC/2026/41',
  },
  {
    id: 'doc-2',
    title: 'Grade 10 Ecology & Biological Diversity Curricular Specification',
    category: 'curriculum',
    issueDate: '2026-08-20',
    status: 'published',
    documentNo: 'NIE/SYLL/BIO/G10',
  },
  {
    id: 'doc-3',
    title: 'Inter-School Learning Forest & Community Exchange Protocols',
    category: 'administrative',
    issueDate: '2026-10-01',
    status: 'published',
    documentNo: 'SANCT/ADMIN/2026/08',
  },
  {
    id: 'doc-4',
    title: 'Draft: Student Voice Journal Privacy & PDPA Compliance Directives',
    category: 'policy',
    issueDate: '2026-10-05',
    status: 'review',
    documentNo: 'SANCT/LEGAL/PDPA/DRAFT',
  },
];

export interface MockClimateDimension {
  id: string;
  name: string;
  description: string;
  score: number;
}

export const MOCK_CLIMATE_DIMENSIONS: readonly MockClimateDimension[] = [
  {
    id: 'safety',
    name: 'Psychological & Emotional Safety',
    description: 'Students feel accepted, safe from bullying, and unjudged when making errors.',
    score: 4,
  },
  {
    id: 'belonging',
    name: 'Peer Belonging & Collaboration',
    description: 'Classmates support each other naturally during group learning and quiet study.',
    score: 5,
  },
  {
    id: 'connection',
    name: 'Teacher Warmth & Attunement',
    description: 'Educators notice student distress, listen empathetically, and guide kindly.',
    score: 4,
  },
  {
    id: 'balance',
    name: 'Workload & Sensory Pace',
    description: 'Homework and syllabus speed allow adequate rest, sleep, and family time.',
    score: 3,
  },
  {
    id: 'vitality',
    name: 'Classroom Vitality & Hope',
    description:
      'Joy, wonder, and curiosity are alive in classroom discussions and hands-on experiments.',
    score: 4,
  },
];

export interface MockDoorwayBadgeStudent {
  id: string;
  studentId: string;
  name: string;
  rollNumber: number;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export const MOCK_DOORWAY_BADGE_STUDENTS: readonly MockDoorwayBadgeStudent[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    studentId: 'stu-01',
    name: 'Nimal Bandara',
    rollNumber: 1,
    status: 'present',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    studentId: 'stu-02',
    name: 'Kasun Perera',
    rollNumber: 2,
    status: 'present',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    studentId: 'stu-03',
    name: 'Ananya Sharma',
    rollNumber: 3,
    status: 'present',
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    studentId: 'stu-04',
    name: 'Devinda Silva',
    rollNumber: 4,
    status: 'present',
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    studentId: 'stu-05',
    name: 'Fatima Zahra',
    rollNumber: 5,
    status: 'present',
  },
];

export interface MockTimetablePeriod {
  number: number;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  periodKind?: 'core' | 'lab' | 'assembly' | 'wellbeing';
}

export interface MockTimetablePrepItem {
  id: string;
  task: string;
  completed: boolean;
  category: 'materials' | 'lesson_plan' | 'attendance';
}

export const MOCK_TIMETABLE_PREP_ITEMS: readonly MockTimetablePrepItem[] = [
  {
    id: 'prep-1',
    task: 'Confirm Morning Roll Call & verify Gate Kiosk arrivals',
    completed: true,
    category: 'attendance',
  },
  {
    id: 'prep-2',
    task: 'Prepare Grade 10 Science practical equipment (Lab 3A)',
    completed: false,
    category: 'materials',
  },
  {
    id: 'prep-3',
    task: 'Review Term 1 continuous assessment rubric & homework logs',
    completed: false,
    category: 'lesson_plan',
  },
  {
    id: 'prep-4',
    task: 'Prepare afternoon circle gratitude notes & quiet room setup',
    completed: true,
    category: 'materials',
  },
];

export const MOCK_TIMETABLE_SCHEDULE: Record<
  'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday',
  readonly MockTimetablePeriod[]
> = {
  Monday: [
    {
      number: 1,
      time: '07:50 – 08:30',
      subject: 'Integrated Mathematics',
      teacher: 'Mrs. Perera',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 2,
      time: '08:30 – 09:10',
      subject: 'Language & Literacy (Sinhala)',
      teacher: 'Mr. Silva',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 3,
      time: '09:10 – 09:50',
      subject: 'Environmental Studies',
      teacher: 'Ms. Fernando',
      room: 'Science Lab',
      periodKind: 'lab',
    },
    {
      number: 4,
      time: '09:50 – 10:30',
      subject: 'English as Second Language',
      teacher: 'Mrs. Jayawardena',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 5,
      time: '10:50 – 11:30',
      subject: 'Buddhism / Ethics',
      teacher: 'Ven. Rahula',
      room: 'Temple Circle',
      periodKind: 'wellbeing',
    },
    {
      number: 6,
      time: '11:30 – 12:10',
      subject: 'Aesthetic Studies (Music & Art)',
      teacher: 'Mr. Bandara',
      room: 'Art Studio',
      periodKind: 'core',
    },
    {
      number: 7,
      time: '12:10 – 12:50',
      subject: 'Physical Education & Movement',
      teacher: 'Coach Wickramasinghe',
      room: 'Playground Oval',
      periodKind: 'wellbeing',
    },
    {
      number: 8,
      time: '12:50 – 01:30',
      subject: 'Practical Life Skills & Agriculture',
      teacher: 'Mr. Jayasuriya',
      room: 'School Farm & Garden',
      periodKind: 'lab',
    },
  ],
  Tuesday: [
    {
      number: 1,
      time: '07:50 – 08:30',
      subject: 'Language & Literacy (Sinhala)',
      teacher: 'Mr. Silva',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 2,
      time: '08:30 – 09:10',
      subject: 'Integrated Mathematics',
      teacher: 'Mrs. Perera',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 3,
      time: '09:10 – 09:50',
      subject: 'History & Cultural Heritage',
      teacher: 'Mr. Weerasinghe',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 4,
      time: '09:50 – 10:30',
      subject: 'Science & Nature Practical',
      teacher: 'Ms. Fernando',
      room: 'Science Lab',
      periodKind: 'lab',
    },
    {
      number: 5,
      time: '10:50 – 11:30',
      subject: 'English Reading & Writing Circle',
      teacher: 'Mrs. Jayawardena',
      room: 'Library Deck',
      periodKind: 'core',
    },
    {
      number: 6,
      time: '11:30 – 12:10',
      subject: 'Mindfulness & Contemplative Study',
      teacher: 'Ven. Rahula',
      room: 'Peace Hall',
      periodKind: 'wellbeing',
    },
    {
      number: 7,
      time: '12:10 – 12:50',
      subject: 'Information & Digital Literacy',
      teacher: 'Mr. Gunaratne',
      room: 'Computer Desk',
      periodKind: 'lab',
    },
    {
      number: 8,
      time: '12:50 – 01:30',
      subject: 'Co-curricular Clubs & Community',
      teacher: 'Section Head',
      room: 'Main Assembly',
      periodKind: 'assembly',
    },
  ],
  Wednesday: [
    {
      number: 1,
      time: '07:50 – 08:30',
      subject: 'Morning Assembly & Reflection',
      teacher: 'All Staff',
      room: 'Courtyard Lawn',
      periodKind: 'assembly',
    },
    {
      number: 2,
      time: '08:30 – 09:10',
      subject: 'Integrated Mathematics',
      teacher: 'Mrs. Perera',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 3,
      time: '09:10 – 09:50',
      subject: 'Environmental Studies Fieldwork',
      teacher: 'Ms. Fernando',
      room: 'Botanical Path',
      periodKind: 'lab',
    },
    {
      number: 4,
      time: '09:50 – 10:30',
      subject: 'Language & Literacy (Sinhala)',
      teacher: 'Mr. Silva',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 5,
      time: '10:50 – 11:30',
      subject: 'English Communication Practice',
      teacher: 'Mrs. Jayawardena',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 6,
      time: '11:30 – 12:10',
      subject: 'Aesthetic Studies (Drama & Song)',
      teacher: 'Mr. Bandara',
      room: 'Amphitheatre',
      periodKind: 'core',
    },
    {
      number: 7,
      time: '12:10 – 12:50',
      subject: 'Buddhism / Values Inquiry',
      teacher: 'Ven. Rahula',
      room: 'Temple Circle',
      periodKind: 'wellbeing',
    },
    {
      number: 8,
      time: '12:50 – 01:30',
      subject: 'Quiet Reading & Peer Tutoring',
      teacher: 'Class Teacher',
      room: 'Hall 3A',
      periodKind: 'wellbeing',
    },
  ],
  Thursday: [
    {
      number: 1,
      time: '07:50 – 08:30',
      subject: 'Science & Practical Discovery',
      teacher: 'Ms. Fernando',
      room: 'Science Lab',
      periodKind: 'lab',
    },
    {
      number: 2,
      time: '08:30 – 09:10',
      subject: 'Integrated Mathematics',
      teacher: 'Mrs. Perera',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 3,
      time: '09:10 – 09:50',
      subject: 'Language & Creative Writing',
      teacher: 'Mr. Silva',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 4,
      time: '09:50 – 10:30',
      subject: 'History & Civics',
      teacher: 'Mr. Weerasinghe',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 5,
      time: '10:50 – 11:30',
      subject: 'English as Second Language',
      teacher: 'Mrs. Jayawardena',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 6,
      time: '11:30 – 12:10',
      subject: 'Practical Life Skills & Carpentry',
      teacher: 'Mr. Jayasuriya',
      room: 'Workshop Shed',
      periodKind: 'lab',
    },
    {
      number: 7,
      time: '12:10 – 12:50',
      subject: 'Physical Education & Games',
      teacher: 'Coach Wickramasinghe',
      room: 'Playground Oval',
      periodKind: 'wellbeing',
    },
    {
      number: 8,
      time: '12:50 – 01:30',
      subject: 'Student Reflection Circle',
      teacher: 'Class Teacher',
      room: 'Hall 3A',
      periodKind: 'wellbeing',
    },
  ],
  Friday: [
    {
      number: 1,
      time: '07:50 – 08:30',
      subject: 'Integrated Mathematics Quiz & Review',
      teacher: 'Mrs. Perera',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 2,
      time: '08:30 – 09:10',
      subject: 'Language & Oral Presentation',
      teacher: 'Mr. Silva',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 3,
      time: '09:10 – 09:50',
      subject: 'English Comprehension & Storytelling',
      teacher: 'Mrs. Jayawardena',
      room: 'Hall 3A',
      periodKind: 'core',
    },
    {
      number: 4,
      time: '09:50 – 10:30',
      subject: 'Environmental Science Lab Demo',
      teacher: 'Ms. Fernando',
      room: 'Science Lab',
      periodKind: 'lab',
    },
    {
      number: 5,
      time: '10:50 – 11:30',
      subject: 'Ethics & Inter-faith Dialogue',
      teacher: 'Ven. Rahula',
      room: 'Peace Hall',
      periodKind: 'wellbeing',
    },
    {
      number: 6,
      time: '11:30 – 12:10',
      subject: 'Visual & Performing Arts Exhibition',
      teacher: 'Mr. Bandara',
      room: 'Art Studio',
      periodKind: 'core',
    },
    {
      number: 7,
      time: '12:10 – 12:50',
      subject: 'School Garden Harvesting & Ecology',
      teacher: 'Mr. Jayasuriya',
      room: 'School Farm & Garden',
      periodKind: 'lab',
    },
    {
      number: 8,
      time: '12:50 – 01:30',
      subject: 'Weekly Closing Circle & Gratitude Log',
      teacher: 'Class Teacher',
      room: 'Hall 3A',
      periodKind: 'wellbeing',
    },
  ],
};

export const MOCK_TOOLS_SAMPLE_CSV = `Subject,Grade,Curriculum Code,Students Enrolled,Status
Mathematics,Grade 10,MATH-LK-10,48,Active
Physical Science,Grade 11,SCI-LK-11,52,Active
Sinhala Literature,Grade 10,SIN-LIT-10,36,Active
Tamil Heritage & Arts,Grade 11,TAM-ART-11,41,Active
English Second Language,Grade 9,ENG-ESL-09,60,Review
Agriculture & Ecology,Grade 10,AGRI-ECO-10,29,Active`;

export const MOCK_TOOLS_SAMPLE_OCR = `DEPARTMENT OF EDUCATIONAL PUBLICATIONS • SRI LANKA
NATIONAL CURRICULAR FRAMEWORK — GRADE 10 BIOLOGICAL SCIENCES

SECTION 3.2: COASTAL & WETLAND MANGROVE ECOSYSTEMS
Confidence Score: 98.4%
Detected Language: English (Official Translation)
Recognized Blocks: 3 paragraphs, 142 words

Key Botanical Identifiers:
- Rhizophora mucronata (True Mangrove) with arching stilt roots.
- Bruguiera gymnorhiza (Kanda Mangrove) characterized by knee roots.
- Sonneratia caseolaris (Kirala) exhibiting vertical pneumatophores.

Pedagogical Core Concept:
Mangrove ecosystems form the frontline buffer against coastal erosion and serve as nutrient-rich nurseries for marine biodiversity.`;

export interface MockToolsBundleItem {
  id: string;
  title: string;
  type: string;
  pages: number;
}

export const MOCK_TOOLS_BUNDLE_ITEMS: readonly MockToolsBundleItem[] = [
  { id: '1', title: 'Curricular Unit 3: Mangrove Ecology', type: 'PDF Circular', pages: 12 },
  { id: '2', title: 'Worksheet 3B: Wetland Identification Matrix', type: 'Worksheet', pages: 2 },
  { id: '3', title: 'Archival Photo Plate: Madu Ganga Estuary', type: 'Image Plate', pages: 1 },
];



