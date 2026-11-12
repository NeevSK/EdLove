import { resolveSurfaceUrl } from '../surface-urls';
import { CONTACT_EMAILS } from '@repo/core/site';
import type { GurudeviHost } from '../host-routing';

export type SupportSurface = 'public' | 'explore' | 'sanctuary' | 'school';

export interface FeaturedFlow {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  isExternal?: boolean;
}

export interface BannerNotice {
  type: 'sandboxed' | 'authenticated' | 'info';
  heading: string;
  text: string;
  actionLabel?: string;
  actionHref?: string;
  isExternal?: boolean;
}

export interface SurfaceSupportConfig {
  surface: SupportSurface;
  schoolHandle?: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  bannerNotice: BannerNotice;
  featuredFlows: FeaturedFlow[];
  defaultContactCategory:
    | 'support'
    | 'explore'
    | 'sanctuary'
    | 'institutional'
    | 'contribute'
    | 'bug'
    | 'feature'
    | 'feedback';
  guideSurfaceFilter: 'all' | 'explore' | 'sanctuary';
  showDiagnostics: boolean;
  showContribution: boolean;
  showComparison: boolean;
  showAllGuidesToggle: boolean;
  primaryContactEmail: string;
}

export const EXPLORE_SUPPORT_CONFIG: SurfaceSupportConfig = {
  surface: 'explore',
  badge: 'Explore Guest House Sandbox',
  title: 'Explore Web Support & Discovery Guide',
  subtitle: 'Zero-account evaluation, sandboxed browser storage, and sample feature walkthroughs.',
  description:
    'You are exploring Gurudevi in Guest House mode. Experience contemplative self practices, sample classroom rosters, and open library readers without passwords or tracking cookies.',
  bannerNotice: {
    type: 'sandboxed',
    heading: 'Isolated Browser Sandbox Active',
    text: 'All practices and simulations stay 100% inside this device’s local browser storage. No cloud account or institutional credentials are required.',
    actionLabel: 'Open Guest House ↗',
    actionHref: resolveSurfaceUrl('explore', '/self'),
    isExternal: true,
  },
  featuredFlows: [
    {
      id: 'flow-self-practice',
      stepNumber: '01',
      title: 'Test-Drive Inner Sanctuary Practices',
      description:
        'Try the 4-7-8 mindful breathing rhythm and write in the temporary Fire Journal to see how contemplative grounding works before morning classes.',
      actionLabel: 'Launch /self Practice ↗',
      actionHref: resolveSurfaceUrl('explore', '/self'),
      isExternal: true,
    },
    {
      id: 'flow-sample-rosters',
      stepNumber: '02',
      title: 'Classroom Attendance Simulation',
      description:
        'Experiment with one-tap attendance tracking using sample student personas. See how the local database queues actions even if disconnected.',
      actionLabel: 'Open Sample Workspace ↗',
      actionHref: resolveSurfaceUrl('explore', '/workspace'),
      isExternal: true,
    },
    {
      id: 'flow-open-library',
      stepNumber: '03',
      title: 'Curated Open Library & Readers',
      description:
        'Browse sample textbooks, bilingual reading selections, and study notes in Sinhala, Tamil, and English with offline reading caching.',
      actionLabel: 'Explore Library ↗',
      actionHref: resolveSurfaceUrl('explore', '/library'),
      isExternal: true,
    },
    {
      id: 'flow-transition-sanctuary',
      stepNumber: '04',
      title: 'Transitioning to an Enrolled School',
      description:
        'Ready to adopt Gurudevi for your actual classrooms? Learn how schools set up private, synchronized workspaces with verified rosters.',
      actionLabel: 'School Onboarding Guide',
      actionHref: '#contact',
    },
  ],
  defaultContactCategory: 'explore',
  guideSurfaceFilter: 'explore',
  showDiagnostics: true,
  showContribution: true,
  showComparison: true,
  showAllGuidesToggle: true,
  primaryContactEmail: CONTACT_EMAILS.support,
};

export const SANCTUARY_SUPPORT_CONFIG: SurfaceSupportConfig = {
  surface: 'sanctuary',
  badge: 'Sanctuary Living Workspace',
  title: 'Sanctuary Operational Support & Teacher Care',
  subtitle: 'Live synchronization, teacher rhythms, student presence, and institutional desks.',
  description:
    'Dedicated support for active educators, school principals, and enrolled students. Resolve classroom synchronization questions, learn about strict reflection privacy, and manage administrative desks.',
  bannerNotice: {
    type: 'authenticated',
    heading: 'Authenticated Institutional Environment',
    text: 'You are on the official Sanctuary workspace desk. Classroom records synchronize securely with sovereign local-first encryption.',
    actionLabel: 'Return to Workspace ↗',
    actionHref: resolveSurfaceUrl('sanctuary', '/workspace'),
    isExternal: true,
  },
  featuredFlows: [
    {
      id: 'flow-sanctuary-sync',
      stepNumber: '01',
      title: 'Attendance Rhythms & Sync Status',
      description:
        'Marking attendance during rural power or connectivity cuts? Check the sync pill in your top bar. Offline changes replay automatically upon reconnection.',
      actionLabel: 'View Sync Status Guide',
      actionHref: '#diagnostics',
    },
    {
      id: 'flow-sanctuary-privacy',
      stepNumber: '02',
      title: 'Inner Sanctuary (/self) Privacy Architecture',
      description:
        'Your daily emotional weather, mindful breathing history, and Fire Journal reflections are protected by a strict privacy boundary: invisible to principals and colleagues.',
      actionLabel: 'Open /self Enclave ↗',
      actionHref: resolveSurfaceUrl('sanctuary', '/self'),
      isExternal: true,
    },
    {
      id: 'flow-sanctuary-gradebook',
      stepNumber: '03',
      title: 'Compassionate Gradebook & Rubrics',
      description:
        'Emphasize qualitative student growth over punitive marks. Configure rubric matrices and share developmental feedback with students and guardians.',
      actionLabel: 'Inspect Gradebook ↗',
      actionHref: resolveSurfaceUrl('sanctuary', '/workspace/gradebook'),
      isExternal: true,
    },
    {
      id: 'flow-sanctuary-admin',
      stepNumber: '04',
      title: 'School Administration & Rosters',
      description:
        'Principal and administrative desks: manage teacher assignments, term calendars, emergency broadcast notices, and institutional compliance.',
      actionLabel: 'Admin Stewardship ↗',
      actionHref: resolveSurfaceUrl('sanctuary', '/admin'),
      isExternal: true,
    },
  ],
  defaultContactCategory: 'sanctuary',
  guideSurfaceFilter: 'sanctuary',
  showDiagnostics: true,
  showContribution: true,
  showComparison: true,
  showAllGuidesToggle: true,
  primaryContactEmail: CONTACT_EMAILS.support,
};

export const PUBLIC_SUPPORT_CONFIG: SurfaceSupportConfig = {
  surface: 'public',
  badge: 'Public Care & Guidance',
  title: 'Support that makes the work lighter.',
  subtitle:
    'Unified help, feature walkthroughs, school pilot onboarding, and community co-creation.',
  description:
    'Everything you need to navigate Gurudevi. Discover how the zero-credential Explore Guest House works, master the authenticated Sanctuary workspaces, connect with our care team, or contribute to open-source educational software for Sri Lanka.',
  bannerNotice: {
    type: 'info',
    heading: 'Unified Support Sanctuary',
    text: 'Grounded support for Explore and Sanctuary surfaces. Whether test-driving guest features or managing enrolled schools, we are listening closely.',
  },
  featuredFlows: [
    {
      id: 'flow-public-explore',
      stepNumber: '01',
      title: 'The Explore Guest House',
      description:
        'Instant test-drive of Gurudevi with zero logins or accounts. Experience mindful breathing, sample attendance, and library readers in an isolated browser sandbox.',
      actionLabel: 'Test Drive Explore ↗',
      actionHref: resolveSurfaceUrl('explore', '/self'),
      isExternal: true,
    },
    {
      id: 'flow-public-school',
      stepNumber: '02',
      title: 'School Onboarding & Pilot Cohorts',
      description:
        'Principals and school directors: start a careful, invite-led conversation to bring sovereign local-first software to your classrooms.',
      actionLabel: 'Inquire for School',
      actionHref: `mailto:${CONTACT_EMAILS.institutional}?subject=School%20Pilot%20Inquiry`,
    },
    {
      id: 'flow-public-offline',
      stepNumber: '03',
      title: 'Offline-First Resilience',
      description:
        'Designed for Sri Lankan realities: routine reads and writes continue seamlessly during power outages and network drops.',
      actionLabel: 'Inspect Architecture',
      actionHref: '#diagnostics',
    },
    {
      id: 'flow-public-contribute',
      stepNumber: '04',
      title: 'Contribute to the Ecology',
      description:
        'Help build open-source code, translate into Sinhala and Tamil, submit open curriculum books, or share classroom field notes.',
      actionLabel: 'View Contribution Tracks',
      actionHref: '#contribute',
    },
  ],
  defaultContactCategory: 'support',
  guideSurfaceFilter: 'all',
  showDiagnostics: true,
  showContribution: true,
  showComparison: true,
  showAllGuidesToggle: true,
  primaryContactEmail: CONTACT_EMAILS.support,
};

export function createSchoolSupportConfig(schoolHandle: string): SurfaceSupportConfig {
  const formattedHandle = schoolHandle.charAt(0).toUpperCase() + schoolHandle.slice(1);
  return {
    surface: 'school',
    schoolHandle,
    badge: `${formattedHandle} Campus Support`,
    title: `${formattedHandle} School Support Desk`,
    subtitle: `Dedicated guidance for ${formattedHandle} students, teachers, and school families.`,
    description: `Welcome to the official support portal for ${formattedHandle}. Access campus timetables, connect with school administrators, and get help with classroom accounts.`,
    bannerNotice: {
      type: 'info',
      heading: `${formattedHandle} Verified Campus Portal`,
      text: `You are connected directly to the sovereign ${formattedHandle} institutional domain. Inquiries are routed to both campus coordinators and the Gurudevi engineering team.`,
      actionLabel: `Visit ${formattedHandle} Campus ↗`,
      actionHref: `/school/${schoolHandle}`,
    },
    featuredFlows: [
      {
        id: 'flow-school-classes',
        stepNumber: '01',
        title: `${formattedHandle} Classrooms & Timetables`,
        description: `View assigned term periods, class teacher notices, and campus schedules for ${formattedHandle}.`,
        actionLabel: 'Campus Overview ↗',
        actionHref: `/school/${schoolHandle}`,
      },
      {
        id: 'flow-school-attendance',
        stepNumber: '02',
        title: 'Student & Teacher Attendance',
        description:
          'Assistance for teachers recording morning registration or families checking attendance records.',
        actionLabel: 'Attendance Guidance',
        actionHref: '#faq',
      },
      {
        id: 'flow-school-self',
        stepNumber: '03',
        title: 'Inner Sanctuary & Mindfulness',
        description:
          'How students and staff at this campus engage in contemplative morning breathing and private journaling.',
        actionLabel: 'Self Care Practice ↗',
        actionHref: resolveSurfaceUrl('explore', '/self'),
        isExternal: true,
      },
      {
        id: 'flow-school-contact',
        stepNumber: '04',
        title: 'Campus Leadership & Administration',
        description:
          'Contact the principal or IT coordinator of this school directly for credential issues or enrollment changes.',
        actionLabel: 'Dispatch School Message',
        actionHref: '#contact',
      },
    ],
    defaultContactCategory: 'institutional',
    guideSurfaceFilter: 'sanctuary',
    showDiagnostics: true,
    showContribution: true,
    showComparison: true,
    showAllGuidesToggle: true,
    primaryContactEmail: CONTACT_EMAILS.institutional,
  };
}

export function getSupportConfig(
  surface: GurudeviHost,
  schoolHandle?: string | null,
): SurfaceSupportConfig {
  switch (surface) {
    case 'explore':
      return EXPLORE_SUPPORT_CONFIG;
    case 'sanctuary':
      return SANCTUARY_SUPPORT_CONFIG;
    case 'school':
      return schoolHandle ? createSchoolSupportConfig(schoolHandle) : PUBLIC_SUPPORT_CONFIG;
    case 'public':
    case 'other':
    default:
      return PUBLIC_SUPPORT_CONFIG;
  }
}
