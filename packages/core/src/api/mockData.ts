import { Classroom, Student, ClassroomResource, Lesson, Assignment } from '../types';

export const MOCK_CLASSROOMS: Classroom[] = [
    {
        id: 'mock-c1',
        school_id: 'mock-school',
        name: 'Grade 10 - Mathematics',
        subject: 'Mathematics',
        description: 'Advanced algebra and geometry sanctuary',
        color_theme: '#F59E0B',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'mock-c2',
        school_id: 'mock-school',
        name: 'Grade 11 - Science',
        subject: 'Science',
        description: 'Exploring the physical world',
        color_theme: '#10B981',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'mock-c3',
        school_id: 'mock-school',
        name: 'Grade 10 - English',
        subject: 'English Language',
        description: 'Global communication & literature',
        color_theme: '#3B82F6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'sample-c1',
        school_id: 'mock-school',
        name: 'Grade 10B',
        subject: 'Science',
        description: 'A sample sanctuary to explore our features',
        color_theme: '#10B981',
        teacher_id: 'mock-t',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_sample: true
    } as any,
    {
        id: 'sample-school-1',
        school_id: 'sample-school',
        name: 'Gurudevi Life School',
        subject: 'General',
        description: 'A sample school to explore administrative features',
        color_theme: '#8B5CF6',
        teacher_id: 'mock-principal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_sample: true,
        is_school: true
    } as any
];

export const MOCK_STUDENTS: Student[] = [
    { id: 'm-s1', full_name: 'Nimal Silva', class_id: 'mock-c1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'm-s2', full_name: 'Kamal Perera', class_id: 'mock-c1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'm-s3', full_name: 'Sunethra Devi', class_id: 'mock-c2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'm-s4', full_name: 'Anura Kumara', class_id: 'mock-c3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'm-s5', full_name: 'Pavaltharani S.', class_id: 'mock-c1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const MOCK_RESOURCES: ClassroomResource[] = [
    {
        id: 'm-r1',
        classroom_id: 'mock-c1',
        teacher_id: 'mock-t',
        title: 'Trigonometry Note',
        type: 'pdf',
        is_pinned: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'm-r2',
        classroom_id: 'mock-c1',
        teacher_id: 'mock-t',
        title: 'Unit Circle Interactive',
        type: 'link',
        url: 'https://example.com/unit-circle',
        is_pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export const MOCK_LESSONS: Lesson[] = [
    {
        id: 'm-l1',
        classroom_id: 'mock-c1',
        title: 'Introduction to Sine Waves',
        order_index: 1,
        created_at: new Date().toISOString()
    },
    {
        id: 'm-l2',
        classroom_id: 'mock-c1',
        title: 'The Cosine Rule',
        order_index: 2,
        created_at: new Date().toISOString()
    }
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
    {
        id: 'm-a1',
        classroom_id: 'mock-c1',
        title: 'Wave Function Practice',
        description: 'Complete questions 1-5 on page 42',
        due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export const MOCK_SCHOOL_STATS = {
    total_students: 1250,
    total_teachers: 45,
    total_classrooms: 18,
    total_sections: 3,
    attendance_rate: 0.94,
    recent_announcements: 3
};

// Visionary Library Content
export const MOCK_LIBRARY_RESOURCES: any[] = [
    {
        id: 'v-r1',
        title: 'Bhutan: Gross National Happiness in Education',
        description: 'A holistic framework for integrating wellbeing into the curriculum.',
        type: 'pdf',
        subject: 'Values',
        language: 'English',
        verified: true,
        created_at: new Date().toISOString(),
        url: 'https://example.com/bhutan-gnh.pdf'
    },
    {
        id: 'v-r2',
        title: 'Restorative Justice Toolkit',
        description: 'Practical strategies for building relational sanctuaries in classrooms.',
        type: 'video',
        subject: 'Social-Emotional',
        verified: true,
        created_at: new Date().toISOString(),
        url: 'https://youtube.com/watch?v=rj-toolkit'
    },
    {
        id: 'v-r3',
        title: 'Finland: Phenomenon-Based Learning Guide',
        description: 'How to break subject silos and foster interdisciplinary curiosity.',
        type: 'link',
        subject: 'Pedagogy',
        verified: true,
        created_at: new Date().toISOString(),
        url: 'https://example.com/finland-pbl'
    }
];

export const MOCK_LIBRARY_COLLECTIONS: any[] = [
    {
        id: 'v-c1',
        name: 'The Ecology of Care',
        description: 'Foundational resources for the Sanctuary model.',
        resource_ids: ['v-r1', 'v-r2'],
        created_at: new Date().toISOString()
    }
];

// Wisdom Council Community Content
export const MOCK_COMMUNITY_GROUPS: any[] = [
    {
        id: 'g-1',
        name: 'Wisdom Council (Principals P2P)',
        description: 'Executive oversight & peer-to-peer visionary growth.',
        type: 'private',
        member_count: 12,
        is_member: true
    },
    {
        id: 'g-2',
        name: 'Innovative Pedagogy SL',
        description: 'Sharing transformative teaching patterns for Sri Lankan schools.',
        type: 'public',
        member_count: 85,
        is_member: true
    }
];

export const MOCK_COMMUNITY_POSTS: any[] = [
    {
        id: 'p-1',
        group_id: 'g-1',
        author_id: 'u-admin',
        author_name: 'Venerable Ananda',
        content: 'Invitation to a Socratic Dialogue on Student Agency. How are we making space for souls in our scheduled blocks?',
        post_type: 'announcement',
        created_at: new Date().toISOString(),
        reactions: { '🙏': 8, '💡': 12 }
    },
    {
        id: 'p-2',
        group_id: 'g-2',
        author_id: 'u-teacher',
        author_name: 'Sanduni Perera',
        content: 'I tried a "Silence Ritual" before my Grade 10 Math class today. The energy shifted immediately from chaos to focus. Anyone else experimenting with this?',
        post_type: 'discussion',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        reactions: { '❤️': 15, '🙌': 6 }
    }
];


export const MOCK_ANNOUNCEMENTS: any[] = [
    {
        id: 'ann-1',
        school_id: 'sample-school',
        author_id: 'mock-principal',
        author_name: 'Principal Maitreya',
        content: 'Welcome to the Sanctuary of Learning. Today we begin our journey into resonance and mindfulness.',
        is_pinned: true,
        created_at: new Date().toISOString()
    },
    {
        id: 'ann-2',
        school_id: 'sample-school',
        author_id: 'mock-principal',
        author_name: 'Principal Maitreya',
        content: 'New community features are now live. Connect with your peers in the Wisdom Council.',
        is_pinned: false,
        created_at: new Date(Date.now() - 86400000).toISOString()
    }
];
