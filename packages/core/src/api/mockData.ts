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
  language?: string;
  verified?: boolean;
  created_at?: Date;
  url?: string;
}

export interface MockLibraryCollection {
  id: string;
  name: string;
  description: string;
  resource_ids: string[];
  created_at: Date;
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
];

export const MOCK_LIBRARY_COLLECTIONS: MockLibraryCollection[] = [
  {
    id: 'v-c1',
    name: 'The Ecology of Care',
    description: 'Foundational resources for the Sanctuary model.',
    resource_ids: ['v-r1', 'v-r2'],
    created_at: new Date(),
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

