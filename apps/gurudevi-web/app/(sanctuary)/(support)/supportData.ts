import { resolveSurfaceUrl } from '../../../lib/surface-urls';
import { CONTACT_EMAILS } from '@repo/core/site';

export type SurfaceFilter = 'all' | 'explore' | 'sanctuary';

export interface GuideItem {
  id: string;
  surface: 'explore' | 'sanctuary' | 'both';
  title: string;
  eyebrow: string;
  summary: string;
  keyFeatures: string[];
  primaryAction: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  secondaryAction?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  offlineNote?: string;
  badge: string;
}

export interface ContributionTrack {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  steps: string[];
  ctaLabel: string;
  ctaHref: string;
  isExternal?: boolean;
  tag: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: 'explore' | 'sanctuary' | 'privacy' | 'technical';
}

export interface SupportContactChannel {
  name: string;
  email: string;
  purpose: string;
  leadTime: string;
  recommendedFor: string;
}

/** What the support page tells a browser tab and a search or answer engine about itself. */
export const SUPPORT_PAGE = {
  title: 'Support, Guides & Contribution · Gurudevi Sanctuary',
  description:
    'Comprehensive functionality guides, troubleshooting, direct support channels, and contribution pathways for Gurudevi Explore and Sanctuary web surfaces.',
} as const;

export const SUPPORT_CONTACT_CHANNELS: SupportContactChannel[] = [
  {
    name: 'Technical & Platform Support',
    email: CONTACT_EMAILS.support,
    purpose:
      'Assistance with browser issues, offline sync recovery, bug reports, and navigation help.',
    leadTime: 'Within 24-48 hours',
    recommendedFor:
      'Teachers, students, and guests encountering bugs or unexpected application behavior.',
  },
  {
    name: 'Institutional & School Onboarding',
    email: CONTACT_EMAILS.institutional,
    purpose:
      'School leadership conversations, cohort pilots, teacher training, and sovereign institution setups.',
    leadTime: 'Within 24 hours',
    recommendedFor: 'Principals, school directors, and ministry educational officers.',
  },
  {
    name: 'Thuthimal & Community Gratitude',
    email: CONTACT_EMAILS.gratitude,
    purpose:
      'Teacher appreciation stories, alumni sponsorship, community feedback, and pedagogical field notes.',
    leadTime: 'Within 2-3 business days',
    recommendedFor: 'Alumni, parents, and community members wishing to honor educators.',
  },
];

export const FUNCTIONALITY_GUIDES: GuideItem[] = [
  {
    id: 'explore-guest-house',
    surface: 'explore',
    title: 'The Explore Guest House',
    eyebrow: 'Zero-Account Showcase',
    summary:
      'Step directly into Gurudevi without signing in. Test-drive contemplative self practices, view sample classroom rosters, and explore bilingual learning materials in an isolated browser sandbox.',
    keyFeatures: [
      'No account, password, or cookies required to experience the full interface',
      'Test 4-7-8 mindful breathing and prompt-based Fire Journaling',
      'Interact with sample student rosters and simulated attendance rhythms',
      '100% private: all session data stays strictly inside your local browser storage',
    ],
    primaryAction: {
      label: 'Open Explore Guest House ↗',
      href: resolveSurfaceUrl('explore', '/self'),
      isExternal: true,
    },
    secondaryAction: {
      label: 'Read Explore FAQ',
      href: '#faq',
    },
    offlineNote: 'Explore mode works offline once cached by your browser.',
    badge: 'Guest Access',
  },
  {
    id: 'sanctuary-inner-self',
    surface: 'both',
    title: 'Inner Sanctuary & Mindful Presence',
    eyebrow: 'Personal Reflection',
    summary:
      'A sacred digital enclave designed for educators and learners to ground themselves before classes. Features mindful breathing timers, emotional weather check-ins, and the reflective Fire Journal.',
    keyFeatures: [
      '4-7-8 and box breathing animations with calming visual pacers',
      'Fire Journal: burn temporary stress reflections or save thoughtful insights',
      'Absolute Privacy Guarantee: reflections are encrypted and never visible to school leadership',
      'Diurnal theme support: automatically softens color temperatures at dusk and night',
    ],
    primaryAction: {
      label: 'Experience /self ↗',
      href: resolveSurfaceUrl('explore', '/self'),
      isExternal: true,
    },
    secondaryAction: {
      label: 'Privacy Charter',
      href: '/privacy',
    },
    offlineNote: 'Your reflections are stored locally first, immune to connectivity drops.',
    badge: 'Self Care',
  },
  {
    id: 'sanctuary-classroom-workspace',
    surface: 'sanctuary',
    title: 'Classroom & Teacher Workspace',
    eyebrow: 'Institutional Rhythm',
    summary:
      'A respectful workspace built to lift administrative exhaustion. Mark classroom attendance in seconds, manage compassionate student evaluations, coordinate timetables, and broadcast class notices.',
    keyFeatures: [
      'One-tap rapid attendance with local-first offline queuing',
      'Compassionate gradebook emphasizing growth trajectories over punitive numbers',
      'Real-time sync indicator (green = live synced, amber = local offline changes saved)',
      'Submissions desk for student coursework review without invasive surveillance',
    ],
    primaryAction: {
      label: 'Open Sanctuary Workspace ↗',
      href: resolveSurfaceUrl('sanctuary', '/workspace'),
      isExternal: true,
    },
    secondaryAction: {
      label: 'Request School Pilot',
      href: `mailto:${CONTACT_EMAILS.institutional}?subject=School%20Workspace%20Inquiry`,
    },
    offlineNote:
      'Full offline write-support: records sync automatically upon network reconnection.',
    badge: 'School Workspace',
  },
  {
    id: 'open-library-and-readers',
    surface: 'both',
    title: 'Open Library & Bilingual Readers',
    eyebrow: 'Curated Knowledge',
    summary:
      'Curated regional texts, open textbooks, and contemplative literature available in Sinhala, Tamil, and English. Designed with an distraction-free reader that works effortlessly even on low-bandwidth school connections.',
    keyFeatures: [
      'Page-flipping PDF and document viewer with high-contrast accessibility themes',
      'In-browser reading notes and highlight bookmarks saved to your device',
      'Direct contribution gateway: submit open-license curriculum materials',
      'Zero advertising, tracking pixels, or commercial sponsorship distractions',
    ],
    primaryAction: {
      label: 'Browse Library ↗',
      href: resolveSurfaceUrl('sanctuary', '/library'),
      isExternal: true,
    },
    secondaryAction: {
      label: 'Contribute Books & Notes',
      href: resolveSurfaceUrl('sanctuary', '/library/contribute'),
      isExternal: true,
    },
    offlineNote: 'Read cached books continuously without an active internet connection.',
    badge: 'Open Knowledge',
  },
  {
    id: 'school-administration',
    surface: 'sanctuary',
    title: 'Institutional Stewardship & Admin Desks',
    eyebrow: 'Leadership Console',
    summary:
      'For principals, headmasters, and institutional administrators. Oversee holistic school health, manage teacher rosters, approve term schedules, and access aggregated attendance statistics without violating individual privacy.',
    keyFeatures: [
      'Aggregated school health metrics and attendance trend reporting',
      'Official document repository and administrative notice broadcasting',
      'Role-based permissions with strict separation between public, staff, and student tiers',
      'Exportable state-compliant reports for regional education directorates',
    ],
    primaryAction: {
      label: 'School Administration ↗',
      href: resolveSurfaceUrl('sanctuary', '/admin'),
      isExternal: true,
    },
    secondaryAction: {
      label: 'Contact Institutional Desk',
      href: `mailto:${CONTACT_EMAILS.institutional}?subject=School%20Administration%20Consultation`,
    },
    offlineNote: 'Audit trails and administrative policies stay cached for offline inspection.',
    badge: 'Stewardship',
  },
  {
    id: 'offline-sync-engine',
    surface: 'both',
    title: 'Local-First Offline Resilience',
    eyebrow: 'Connectivity Architecture',
    summary:
      'Sri Lankan classrooms often face unstable power grids and erratic internet. Gurudevi is engineered from the ground up as a local-first system that treats the network as an enhancement rather than a dependency.',
    keyFeatures: [
      'Instant local writes with optimistic UI updates',
      'Automatic sync retry with exponential backoff and conflict-free reconciliation',
      'Visual Sync Status Pill in the top bar informing you of sync state at every moment',
      'Zero data loss: changes remain persistent across browser restarts and device reboots',
    ],
    primaryAction: {
      label: 'Inspect System Status',
      href: '/status',
    },
    secondaryAction: {
      label: 'Run Local Diagnostics',
      href: '#diagnostics',
    },
    offlineNote: 'Engineered specifically for low-connectivity and intermittent power realities.',
    badge: 'Offline First',
  },
];

export const SURFACE_COMPARISON = [
  {
    feature: 'Login / Credentials',
    explore: 'None required (Instant guest preview)',
    sanctuary: 'Authenticated (Teacher / Student / Admin identity)',
  },
  {
    feature: 'Data Persistence',
    explore: 'Browser local storage (sandboxed to your device)',
    sanctuary: 'Sovereign encrypted cloud sync + local cache',
  },
  {
    feature: 'Classroom Rosters',
    explore: 'Interactive sample demo classes & students',
    sanctuary: 'Live registered school classrooms and records',
  },
  {
    feature: 'Inner Sanctuary (/self)',
    explore: 'Full access to breathing & sample journaling',
    sanctuary: 'Private encrypted reflective archive across sessions',
  },
  {
    feature: 'Offline Operation',
    explore: 'Works offline once loaded in your browser tab',
    sanctuary: 'Full read & offline write with auto-sync replay',
  },
  {
    feature: 'Ideal For',
    explore: 'Curious educators, previewing teachers, guests',
    sanctuary: 'Enrolled schools, active classes, school leaders',
  },
];

export const CONTRIBUTION_TRACKS: ContributionTrack[] = [
  {
    id: 'code-and-engineering',
    title: 'Open Source Software Engineering',
    eyebrow: 'Code & Systems',
    description:
      'Gurudevi is built on Vite, Astro, Expo 58, React 19, and local-first SQLite architectures. We invite developers, security researchers, and accessibility champions to help build calm, dignified educational software.',
    steps: [
      'Explore the monorepo architecture and check open issues on GitHub',
      'Adhere to strict Anti-Slop principles: zero unannotated deprecations, calm UI tokens',
      'Submit clean, tested pull requests with verification proofs and responsive layouts',
      'Test accessibility against APCA contrast and screen-reader keyboard flows',
    ],
    ctaLabel: 'Visit GitHub Repository ↗',
    ctaHref: 'https://github.com/edlove-foundation',
    isExternal: true,
    tag: 'Technical',
  },
  {
    id: 'curriculum-and-library',
    title: 'Curriculum & Open Library Resources',
    eyebrow: 'Knowledge Commons',
    description:
      'We welcome educators, scholars, and writers who can contribute open-educational resources (OER), bilingual lesson templates, and contemplative exercises adapted for Sri Lankan culture.',
    steps: [
      'Format teaching notes or textbooks as accessible PDFs, Markdown, or bilingual texts',
      'Submit materials through the Library Contribution Portal with Creative Commons licensing',
      'Collaborate with our curriculum reviewers to align with national learning competencies',
      'Provide contextual educator guides in Sinhala, Tamil, or English',
    ],
    ctaLabel: 'Contribute via Library Portal ↗',
    ctaHref: resolveSurfaceUrl('sanctuary', '/library/contribute'),
    isExternal: true,
    tag: 'Curriculum',
  },
  {
    id: 'localization-and-language',
    title: 'Sinhala & Tamil Cultural Localization',
    eyebrow: 'Language Sovereignty',
    description:
      'Language is not merely translated; it must resonate with cultural warmth, respect, and pedagogical clarity. Help us refine terminology and ensure native parity across all school interfaces.',
    steps: [
      'Review existing Sinhala (සි) and Tamil (த) public and workspace interfaces',
      'Propose culturally respectful pedagogical idioms that replace mechanical translations',
      'Report translation gaps, typos, or font rendering clipping in regional scripts',
      'Help build regional glossaries for contemplative and school terms',
    ],
    ctaLabel: 'Propose Translations',
    ctaHref: `mailto:${CONTACT_EMAILS.support}?subject=Gurudevi%20Localization%20Contribution`,
    isExternal: false,
    tag: 'Languages',
  },
  {
    id: 'pedagogical-field-notes',
    title: 'Teacher Field Notes & Classroom Feedback',
    eyebrow: 'Practitioner Voice',
    description:
      'Real classrooms reveal what laboratory theories miss. Tell us how your students respond to mindful breathing, how attendance flows during morning rush, and where the software creates friction.',
    steps: [
      'Test Gurudevi tools in your weekly classroom routine or morning assembly',
      'Record qualitative observations: did teachers feel lighter? Did students engage?',
      'Share field reports with our design team via email or structured interviews',
      'Join our Educator Advisory Council to shape upcoming releases',
    ],
    ctaLabel: 'Share Classroom Experience',
    ctaHref: `mailto:${CONTACT_EMAILS.support}?subject=Classroom%20Field%20Notes`,
    isExternal: false,
    tag: 'Educators',
  },
  {
    id: 'edlove-stewardship',
    title: 'EdLove Foundation & Community Stewardship',
    eyebrow: 'Mission Partnership',
    description:
      'Gurudevi is nurtured by EdLove, dedicated to keeping educational technology non-extractive, ad-free, and sovereign for Sri Lankan public schools for decades to come.',
    steps: [
      'Sponsor school connectivity packs, offline tablets, or teacher workshops',
      'Support the Thuthimal initiative honoring selfless rural teachers',
      'Introduce Gurudevi to school principals or provincial education directors',
      'Help ensure no Sri Lankan school is ever priced out of dignified software',
    ],
    ctaLabel: 'Learn About EdLove Foundation ↗',
    ctaHref: 'https://edlove.org',
    isExternal: true,
    tag: 'Foundation',
  },
];

export const SUPPORT_FAQS: FaqItem[] = [
  {
    category: 'explore',
    question: 'Do I need to create an account or provide an email to use Explore Web?',
    answer:
      'No. The Explore Web (Guest House) requires zero registration, email, or credentials. You can immediately step into the interface, practice mindful breathing, try the fire journal, and interact with simulated classrooms. Everything you do stays in your browser’s temporary storage.',
  },
  {
    category: 'explore',
    question: 'Will my data from Explore Web transfer over if our school adopts Gurudevi?',
    answer:
      'Explore Web is designed as an isolated test-drive sandbox with sample personas so you can evaluate the experience safely. When your school officially joins Sanctuary, teachers receive an official school account with persistent cloud sync and verified student rosters.',
  },
  {
    category: 'sanctuary',
    question:
      'Can my principal, school leader, or colleagues read my personal reflections in /self?',
    answer:
      'Never. The Inner Sanctuary (/self) is protected by an unbreakable architectural boundary. Reflections, mindful breathing logs, and fire journal entries are encrypted and strictly private to your personal device. School administrators only receive aggregated attendance and institutional coordination metrics.',
  },
  {
    category: 'technical',
    question: 'How does Gurudevi work when school Wi-Fi or electricity fails?',
    answer:
      'Gurudevi is built local-first. When your connection drops, the app switches transparently to local offline operation. You can continue marking attendance, taking notes, and reading cached library books. When power or connectivity returns, changes synchronize automatically without manual intervention.',
  },
  {
    category: 'sanctuary',
    question: 'How does a school get onboarded to Gurudevi Sanctuary?',
    answer:
      'School onboarding is invite-led and carefully guided. Principals or department heads write to institutional@gurudevi.lk. We arrange an initial conversation, set up your sovereign school workspace with custom vanity subdomain (e.g. schoolname.gurudevi.app), and provide hands-on teacher onboarding workshops.',
  },
  {
    category: 'privacy',
    question: 'Are students or teachers tracked for commercial advertising?',
    answer:
      'Never. Gurudevi has zero advertisements, zero behavioral ad trackers, and zero third-party data monetization. We are funded through the non-profit EdLove Foundation and sovereign philanthropic support. Educational data belongs exclusively to the schools and learners who generate it.',
  },
  {
    category: 'technical',
    question: 'What browsers and devices are supported?',
    answer:
      'Gurudevi Web works on modern versions of Chrome, Safari, Firefox, Edge, and mobile browsers on Android and iOS. We optimize for low-power smartphones (360px viewport upwards) as well as classroom smart boards, and keep bundle sizes compact for 3G/4G rural mobile networks.',
  },
  {
    category: 'sanctuary',
    question: 'How do role permissions work for Teachers, Students, and School Leaders?',
    answer:
      'Gurudevi enforces strict role-based access. Teachers have access to their assigned classes, attendance registries, and gradebooks. Students see their personal growth journals, timetables, and library collections. School leaders have institutional overview consoles without surveillance into personal student/teacher notes.',
  },
];
