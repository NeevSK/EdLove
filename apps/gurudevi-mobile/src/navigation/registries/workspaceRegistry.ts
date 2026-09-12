import {
  BarChart3,
  Calendar,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Layers,
  MessagesSquare,
  School,
  Sparkles,
  Users,
} from '@repo/ui/icons';
import type { MobileDomainRegistry, MobileFeatureItem } from './types';

export function getWorkspaceRegistry(capacity?: string | null): MobileDomainRegistry {
  const cap = (capacity || '').toLowerCase();

  // 1. Teacher Capacity
  if (cap === 'teacher') {
    return {
      domain: 'workspace',
      title: 'Teacher Workspace',
      subtitle: 'Classroom Operations, Pedagogy & Grading',
      roleBadge: 'Teacher',
      items: [
        {
          id: 'ws-teacher-classrooms',
          title: 'Classroom Hub',
          description: 'Access active classrooms, student rosters & daily rhythm',
          route: '/workspace/classroom',
          icon: School,
          defaultSubTab: true,
        },
        {
          id: 'ws-teacher-attendance',
          title: 'Attendance Watch',
          description: 'Fast offline-first attendance registers with instant sync',
          route: '/workspace/classroom',
          icon: ClipboardCheck,
        },
        {
          id: 'ws-teacher-gradebook',
          title: 'Gradebook & Marks',
          description: 'Classroom quick-grades and formal academic reporting',
          route: '/workspace/classroom',
          icon: GraduationCap,
        },
        {
          id: 'ws-teacher-planner',
          title: 'Lesson Planner',
          description: 'Curriculum arcs, weekly plans and resource prep',
          route: '/workspace/classroom',
          icon: FileText,
        },
        {
          id: 'ws-teacher-observations',
          title: 'Observations & Pulses',
          description: 'Continuous formative notes and pastoral insights',
          route: '/workspace/classroom',
          icon: Sparkles,
        },
      ],
    };
  }

  // 2. Guardian / Parent Capacity
  if (cap === 'guardian' || cap === 'parent') {
    return {
      domain: 'workspace',
      title: 'Guardian Sanctuary',
      subtitle: 'Learner Watch, School Feed & Home Bridge',
      roleBadge: 'Guardian',
      items: [
        {
          id: 'ws-guardian-dashboard',
          title: 'Guardian Sanctuary Hub',
          description: 'Holistic overview of family learners, notices & milestones',
          route: '/workspace/guardian',
          icon: School,
          defaultSubTab: true,
        },
        {
          id: 'ws-guardian-students',
          title: 'Family Learner Room',
          description: 'Attendance rates, learner pulses and classroom bridges',
          route: '/workspace/guardian/students',
          icon: GraduationCap,
        },
        {
          id: 'ws-guardian-events',
          title: 'School Calendar Room',
          description: 'Upcoming schedules, RSVP requests and key school dates',
          route: '/workspace/guardian/events',
          icon: Calendar,
        },
        {
          id: 'ws-guardian-notifications',
          title: 'Notification Room',
          description: 'School broadcast announcements and essential parent alerts',
          route: '/workspace/guardian/notifications',
          icon: MessagesSquare,
        },
        {
          id: 'ws-guardian-bridge',
          title: 'Communication Bridge',
          description: 'Direct communication channels with faculty & school resources',
          route: '/workspace/guardian/bridge',
          icon: Sparkles,
        },
      ],
    };
  }

  // 3. Student Capacity
  if (cap === 'student') {
    return {
      domain: 'workspace',
      title: 'Student Sanctuary',
      subtitle: 'Learning Paths, Classrooms & Progress',
      roleBadge: 'Student',
      items: [
        {
          id: 'ws-student-classrooms',
          title: 'My Classrooms',
          description: 'Enrolled courses, active class discussions and announcements',
          route: '/workspace/classroom',
          icon: School,
          defaultSubTab: true,
        },
        {
          id: 'ws-student-tasks',
          title: 'Homework & Assignments',
          description: 'Pending submissions, upcoming project deadlines & rubrics',
          route: '/workspace/classroom',
          icon: ClipboardCheck,
        },
        {
          id: 'ws-student-grades',
          title: 'My Grades & Feedback',
          description: 'Continuous assessment reports, marks and teacher feedback',
          route: '/workspace/classroom',
          icon: GraduationCap,
        },
        {
          id: 'ws-student-reflection',
          title: 'Learning Reflection',
          description: 'Personal study notes, question logs and self-evaluations',
          route: '/self',
          icon: Sparkles,
        },
      ],
    };
  }

  // 4. Principal / Admin Capacity
  if (cap === 'principal' || cap === 'assistantprincipal' || cap === 'admin' || cap === 'gradehead' || cap === 'sectionhead') {
    return {
      domain: 'workspace',
      title: 'Principal Governance',
      subtitle: 'Institutional Leadership, Pulses & Records',
      roleBadge: 'Leadership',
      items: [
        {
          id: 'ws-principal-hub',
          title: 'Governance Hub',
          description: 'Executive overview, institutional pulses & cycle records',
          route: '/workspace/principal',
          icon: School,
          defaultSubTab: true,
        },
        {
          id: 'ws-principal-staff',
          title: 'Faculty & Hierarchy',
          description: 'Staff allocation, departmental leadership & classroom assignments',
          route: '/workspace/principal',
          icon: Users,
        },
        {
          id: 'ws-principal-pulse',
          title: 'Institutional Arc & Pulse',
          description: 'Whole-school attendance, wellbeing index & academic benchmarks',
          route: '/workspace/principal',
          icon: BarChart3,
        },
        {
          id: 'ws-principal-editorial',
          title: 'Editorial & Releases',
          description: 'Institutional publications, circulars & official statements',
          route: '/workspace/editorial',
          icon: FileText,
        },
      ],
    };
  }

  // 5. Founder Capacity
  if (cap === 'founder' || cap === 'developer') {
    return {
      domain: 'workspace',
      title: 'Founder Architecture',
      subtitle: 'System Vision, Multi-School Health & Core Setup',
      roleBadge: 'Founder',
      items: [
        {
          id: 'ws-founder-hub',
          title: 'Founder Architecture Hub',
          description: 'Sovereign system architecture and master controls',
          route: '/workspace/founder',
          icon: Sparkles,
          defaultSubTab: true,
        },
        {
          id: 'ws-founder-principal-peek',
          title: 'Principal Sanctuary',
          description: 'Institutional management and governance interface',
          route: '/workspace/principal',
          icon: School,
        },
        {
          id: 'ws-founder-guardian-peek',
          title: 'Guardian Sanctuary',
          description: 'Home-school communication and family learner interface',
          route: '/workspace/guardian',
          icon: Users,
        },
        {
          id: 'ws-founder-classroom-peek',
          title: 'Classroom Hub',
          description: 'Pedagogical tools and classroom delivery interface',
          route: '/workspace/classroom',
          icon: GraduationCap,
        },
      ],
    };
  }

  // General fallback
  return {
    domain: 'workspace',
    title: 'Workspace Hub',
    subtitle: 'Institutional, Classroom & Guardian Workspaces',
    items: [
      {
        id: 'ws-guardian',
        title: 'Guardian Sanctuary',
        description: 'Learner pulse, attendance watch, school notices & events',
        route: '/workspace/guardian',
        icon: School,
        defaultSubTab: true,
      },
      {
        id: 'ws-classroom',
        title: 'Classroom Sanctuary',
        description: 'Classrooms, attendance registers & gradebook',
        route: '/workspace/classroom',
        icon: GraduationCap,
      },
      {
        id: 'ws-principal',
        title: 'Principal Governance',
        description: 'Leadership overview, institutional pulses & policy records',
        route: '/workspace/principal',
        icon: Layers,
      },
      {
        id: 'ws-founder',
        title: 'Founder Architecture',
        description: 'System vision, core configuration & global health',
        route: '/workspace/founder',
        icon: Sparkles,
      },
    ],
  };
}
