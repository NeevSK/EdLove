import type { SupportedLocale } from './types';
import coreEn from '../../../../packages/core/src/logic/i18n/locales/en.json';
import coreSi from '../../../../packages/core/src/logic/i18n/locales/si.json';
import coreTa from '../../../../packages/core/src/logic/i18n/locales/ta.json';

type TranslationTree = Record<string, any>;

/**
 * Common Web Platform & Navigation Dictionaries
 * Strictly adheres to sacred orthography invariants:
 * - Sinhala brand: ගුරුදෙවි (short vowel)
 * - Tamil brand: குருதெவி (short vowel)
 * - Sinhala tagline: සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම
 */
const WEB_DICTIONARIES: Record<SupportedLocale, TranslationTree> = {
  en: {
    brand: {
      name: 'Gurudevi',
      tagline: 'Technology that gives energy back to education.',
      sanctuaryTagline: 'Education Ecology Support System and Sanctuary for Education',
      description:
        'A sovereign, respectful sanctuary for teachers, students, schools, and families in Sri Lanka.',
    },
    nav: {
      ecology: 'The Ecology',
      workspaces: 'Workspaces',
      roadmap: 'Roadmap',
      journal: 'Journal',
      faq: 'FAQ',
      support: 'Support',
      status: 'System status',
      guidelines: 'Guidelines',
      privacy: 'Privacy',
      terms: 'Terms',
      deleteAccount: 'Delete account',
      openPlatform: 'Open platform',
      signIn: 'Sign in to Sanctuary',
      chooseLanguage: 'Choose language',
      skipToContent: 'Skip to content',
      close: 'Close',
    },
    hero: {
      eyebrow: 'Gurudevi · Education Ecology',
      title: 'Technology that gives energy back to education.',
      lede: 'A sovereign, respectful sanctuary for teachers, students, schools, and families in Sri Lanka.',
      primaryCta: 'Follow the Multi-Year Horizon',
      secondaryCta: 'Explore the 4 Workspaces',
      caption: 'Built around the people who make learning possible in Sri Lanka.',
    },
    roles: {
      teachers: {
        label: 'Teachers',
        title: 'More room to teach.',
        body: 'Prepare and reflect without administrative exhaustion.',
      },
      leaders: {
        label: 'Leaders',
        title: 'Visibility without surveillance.',
        body: 'Coordinate the school while respecting teacher privacy.',
      },
      students: {
        label: 'Students',
        title: 'Agency and curiosity.',
        body: 'Participate actively with dignity and consent.',
      },
      families: {
        label: 'Families',
        title: 'Connection with care.',
        body: 'Stay close to learning without turning care into control.',
      },
    },
    workspaces: {
      title: '4 Sovereign Workspaces',
      subtitle: 'Designed for the actual relationships in Sri Lankan education.',
      w1: {
        number: '01',
        roleLabel: 'Teachers & Students',
        name: 'Classroom Sanctuary',
        body: 'Lesson preparation, reflection, and teaching—grounded in pedagogical care.',
      },
      w2: {
        number: '02',
        roleLabel: 'School Leaders',
        name: 'School Coordination',
        body: 'Institutional patterns and resource stewardship without surveillance.',
      },
      w3: {
        number: '03',
        roleLabel: 'Families & Guardians',
        name: 'Family Space',
        body: 'A transparent bridge between school and home with mutual respect.',
      },
      w4: {
        number: '04',
        roleLabel: 'Young Learners',
        name: 'Learning Studio',
        body: 'A quiet space for self-directed practice, learning commons, and agency.',
      },
    },
    actions: {
      save: 'Save',
      back: 'Back',
      next: 'Next',
      cancel: 'Cancel',
      confirm: 'Confirm',
      signOut: 'Sign out',
      reflect: 'Reflect',
      search: 'Search',
      submit: 'Submit',
      loading: 'Loading...',
      okay: 'Okay',
      selectLanguage: 'Select language',
    },
    footer: {
      tagline: 'Technology that gives energy back to education.',
      copyright: 'Gurudevi · Part of the EdLove Foundation',
      explore: 'Explore',
      elsewhere: 'Elsewhere',
    },
    gateway: {
      footer: {
        privacy: 'Privacy Policy',
        terms: 'Terms of Use',
        guidelines: 'Community Guidelines',
        accountData: 'Account & Data',
        status: 'System Status',
        partOf: 'Part of the',
        edloveFoundation: 'EdLove Foundation',
        madeWithLove: 'Made with ❤️ in',
      },
    },
    auth: {
      welcomeTitle: 'Welcome to Gurudevi 🙏',
      badgeText: 'Login / Signup',
      continueGoogle: 'Continue with Google',
      continueApple: 'Continue with Apple',
      continueEmail: 'Continue with email',
      connecting: 'Connecting…',
      allSignInOptions: '← All sign-in options',
      emailLabel: 'Email address',
      passwordLabel: 'Password',
      forgotPassword: 'Forgot password?',
      rememberMe30Days: 'Remember me for 30 days',
      signInWithPassword: 'Sign in with password',
      signingIn: 'Signing in…',
      sendMagicLink: 'Send magic link',
      sendingLink: 'Sending link…',
      usePasswordInstead: 'Use password instead',
      checkEmailSecureGuest: 'Check your email to secure this guest sanctuary. Your existing work stays attached to it.',
      checkEmailMagicLink: 'Check your email for a secure link. If this address is new, confirming it creates your account.',
      signInUnavailable: 'Sign in is unavailable because this environment is missing its public Supabase settings.',
      kioskWorkstation: 'Shared / School Lab Workstation',
      autoPurge: 'Auto-purge on close',
      enterPin: 'Enter PIN to access profile',
      unlockSanctuary: 'Unlock Sanctuary',
      useAnotherAccount: 'Use another account / new sign-in',
      removeAccountConfirm: 'Remove this account profile from this computer?',
      incorrectPin: 'Incorrect PIN. Please try again.',
      unableVerifyPin: 'Unable to verify PIN.',
    },
    support: {
      tabs: {
        guides: 'Functionality Guides',
        contact: 'Direct Channels',
        contribute: 'Contribute to Gurudevi',
        faq: 'Troubleshooting & FAQ',
        diagnostics: 'Live Diagnostics',
      },
      surfaceFilter: {
        all: 'All Surfaces',
        explore: 'Explore Surface',
        sanctuary: 'Sanctuary Surface',
      },
      searchFaqPlaceholder: 'Search questions or keywords...',
    },
    self: {
      hero: {
        teacher: {
          title: "Teacher's Sadhana",
          subtitle: 'Working rhythm, energy balance and decompression',
          badge: 'Educator',
        },
        student: {
          title: 'Mastery & Inner Pulse',
          subtitle: 'Study flow, emotional calm and self-growth',
          badge: 'Student',
        },
        guardian: {
          title: 'Guardian Sanctuary',
          subtitle: 'Family presence, grounding and mindful pause',
          badge: 'Guardian',
        },
        principal: {
          title: "Principal's Inner Sanctuary",
          subtitle: 'Executive discernment, composure and tenets',
          badge: 'Leadership',
        },
        founder: {
          title: "Founder's Vision Lab",
          subtitle: 'Architectural discernment and creative sanctuary',
          badge: 'Founder',
        },
        admin: {
          title: 'Personal Sanctuary',
          subtitle: 'Mindfulness, growth and daily reflections',
          badge: 'Platform',
        },
      },
      roleTabs: {
        all: 'All Practices',
        teacher: 'Teacher',
        student: 'Student',
        principal: 'Principal',
        guardian: 'Guardian',
      },
      reframe: {
        title: 'Thought Reframe Wizard',
        subtitle: 'Deconstruct unhelpful internal narratives with compassionate, evidence-based cognitive reframing',
        steps: {
          step1: '1. Notice',
          step2: '2. Name',
          step3: '3. Spot Trap',
          step4: '4. Reframe',
        },
        q1: 'What automatic thought is looping right now?',
        q2: 'What emotion is tied to this thought?',
        q3: 'Which cognitive trap does this resemble?',
        q4: 'What is a more balanced, compassionate perspective?',
        finish: 'Complete Reframe',
        continue: 'Continue',
      },
    },
    roadmap: {
      eyebrow: 'The Multi-Year Horizon',
      title: 'From conceptual genesis to living sanctuary.',
      subtitle:
        'Built for enduring transformation in Sri Lanka—progressing with care, dignity, and relationship across three distinct phases.',
      y2026: {
        date: 'Alpha Genesis',
        phase: 'Alpha Release',
        badge: 'Opening Cohort',
        summary:
          'The genesis of the Gurudevi sanctuary. Foundational reflection and preparation tools for invited Sri Lankan pilot schools.',
        d1: 'Teacher Sanctuary & reflection spaces',
        d2: 'Local-first offline storage & privacy',
        d3: 'Invited school pilot cohorts',
      },
      y2027: {
        date: 'Ecology Expansion',
        phase: 'Beta Release',
        badge: 'Multi-Workspace',
        summary:
          'Extending the sanctuary across students, families, and school leaders with shared reality and clear privacy boundaries.',
        d1: 'Classroom, School, Family, and Studio spaces',
        d2: 'Federated coordination without surveillance',
        d3: 'Bilingual Sinhala & Tamil trials',
      },
      y2028: {
        date: 'Nationwide Opening',
        phase: 'GA Sanctuary',
        badge: 'Public Commons',
        summary:
          'Nationwide availability of the open educational sanctuary, delivering lasting institutional harmony and digital sovereignty.',
        d1: 'Open access for all Sri Lankan schools',
        d2: 'Sovereign open infrastructure & data protocols',
        d3: 'Community-led pedagogical stewardship',
      },
    },
    supportForm: {
      categoryLabel: 'Category',
      nameLabel: 'Name',
      optionalHint: '(optional)',
      emailLabel: 'Email',
      messageLabel: 'Message',
      submitCta: 'Send support note ↗',
      sendingCta: 'Sending note…',
      directEmailTitle: 'A direct email is the current support channel.',
      directEmailBody:
        'Our support form is not configured yet. Please email us and we’ll take care of you.',
      emailSupportCta: 'Email support',
      categories: {
        support: 'General Support & Inquiries',
        explore: 'Explore Web & Guest House',
        sanctuary: 'Sanctuary Workspace & School Sync',
        bug: 'Report a Bug or Defect',
        feature: 'Feature Request / Idea',
        contribute: 'Contribute (Code, Curriculum, Translation)',
        institutional: 'School Onboarding & Pilot Request',
        feedback: 'General Experience Feedback',
      },
    },
    legal: {
      provenance: {
        version: 'Version',
        effectiveDate: 'Effective Date',
        regulatoryBasis: 'Regulatory Basis',
        stewardship: 'Stewardship',
      },
    },
    workspace: {
      toolsNav: 'Workspace tools navigation',
      features: {
        attendance: 'Daily Attendance',
        qr_scanner: 'QR Scanner',
        timetable: 'Timetable',
        notices: 'Circulars & Notices',
        submissions: 'Assignment Submissions',
        climate: 'Climate Sensing',
        tuition: 'Tuition & Fees',
      },
    },
    breathe: {
      badge: 'Somatic Regulation',
      title: 'Breath Resonance',
      inhale: 'Inspire Deeply',
      hold: 'Pause in Fullness',
      exhale: 'Release Slowly',
      rest: 'Rest in Stillness',
      startBtn: 'Initiate Breath Cycle',
      stopBtn: 'Cease Exercise',
      restartBtn: 'Restart Cycle',
      groundedTitle: 'Grounded & Present',
      groundedText:
        'Breath cycle fulfilled. Your nervous system has recalibrated toward equilibrium.',
      cycleText: 'Cycle {{current}} of {{total}}',
      idleHint:
        'Follow the gentle 4-2-6-2 cadence to anchor your presence and release physical tension.',
    },
    fireJournalWeb: {
      arrivalTitle: 'Make room for what needs to be released.',
      arrivalSubtitle: 'Write freely. When you release an entry, the full text is not retained.',
      safeTryBtn: 'Try this safely',
      endSafeTryBtn: 'End Safe Try and discard',
      releasePrompt: 'What can leave your hands today?',
      burnBtn: 'Release to the flame',
      burningBtn: 'Releasing to flame…',
    },
    settings: {
      title: 'Sanctuary Settings',
      subtitle:
        'Personalize your atmosphere, sensory motion, privacy consent, and regional accessibility.',
      atmosphereTitle: 'Visual Atmosphere & Light',
      atmosphereDesc:
        'Adjust ambient color temperature and contrast to support circadian learning rhythms.',
      sensoryTitle: 'Sensory Motion & Attunement',
      sensoryDesc:
        'Tune interface transitions to respect neurodivergent learners and contemplative focus.',
      soundTitle: 'Contemplative Sound & Ambiance',
      soundDesc:
        'Gentle harmonic audio cues for mindful pauses and session milestones.',
      quietModeLabel: 'Quiet Sanctuary Mode',
      quietModeDesc:
        'Suppresses all ambient chime audio and non-critical pings during deep reading hours.',
      notifTitle: 'Notification Rhythms & Pacing',
      notifDesc:
        'Configure your alerts to preserve cognitive peace and prevent notification fatigue.',
      privacyTitle: 'Privacy & PDPA Compliance',
      privacyDesc:
        'You hold full sovereignty over your personal data under the Sri Lanka PDPA.',
      languageTitle: 'Regional Language & Orthography',
      languageDesc:
        'Select official Sri Lankan national language with dignified typography.',
      securityTitle: 'Device Trust & Security Floor',
      securityDesc:
        'Audit active sessions, manage cryptographic device tokens, and review data portability.',
      enabled: 'Enabled',
      muted: 'Muted',
      active: 'Active',
      off: 'Off',
      paused: 'Paused',
      saveNotice: 'Settings updated',
    },
    status: {
      eyebrow: 'Operations',
      title: 'Ecology Health & Live Telemetry',
      description:
        'Real-time status of the Gurudevi sanctuary platform, database connectivity, and policy engines.',
      allOperational: 'All systems operational',
      degraded: 'Degraded performance',
      checking: 'Checking telemetry…',
    },
    journal: {
      eyebrow: 'Gurudevi Journal',
      title: 'Notes from an education ecology.',
      description:
        'Stories, practice notes, and reflections for the people who make learning possible.',
      readEntry: 'Read the journal entry',
      allEntries: '← All journal entries',
      minRead: '{{count}} min read',
      byAuthor: 'By',
      publishedUnder: 'Published under',
      source: 'Source',
      notFoundTitle: 'Journal entry not found',
      returnToJournal: 'Return to the journal',
    },
    classroom: {
      eyebrow: 'Academic Pedagogical Sanctuary',
      curatedBy: 'Curated by {{name}}',
      returnRollCall: 'Return to Roll Call',
      openGradebook: 'Open Gradebook',
      enrolledStudents: 'Enrolled Students',
      activeLearners: 'Active learners',
      curriculumUnits: 'Curriculum Units',
      completed: 'Completed',
      activeAssignments: 'Active Assignments',
      dueThisCycle: 'Due this cycle',
      reflectiveNotes: 'Reflective Notes',
      insights: 'Atmosphere insights',
      tabStudents: 'Enrolled Students',
      tabLessons: 'Curriculum & Units',
      tabAssignments: 'Assignments',
      tabNotes: 'Reflective Field Notes',
      workspaceBreadcrumb: 'Workspace',
      classroomsBreadcrumb: 'Classrooms',
    },
    tuition: {
      backToWorkspace: '← Back to Attendance Workspace',
      title: 'Tuition & Term Contributions',
      offlineLedger: 'Offline Ledger Active',
      liveSync: 'Live Sync Connected',
      collected: 'Collected to Date',
      outstanding: 'Pending / Outstanding',
      filterAll: 'All Records',
      filterPaid: 'Paid / Settled',
      filterPending: 'Pending',
      filterOverdue: 'Overdue',
    },
  },
  si: {
    brand: {
      name: 'ගුරුදෙවි',
      tagline: 'සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම',
      sanctuaryTagline: 'සමෝධානිත අධ්‍යාපනයේ සුපසන් කෙම්බිම',
      description:
        'ශ්‍රී ලාංකේය ගුරු-සිසු සබැඳියාවට සවියක් වන, අධ්‍යාපනයේ ගෞරවය සුරකින සුපසන් කෙම්බිම.',
    },
    nav: {
      ecology: 'දැක්ම',
      workspaces: 'කලාප',
      roadmap: 'මග සලකුණු',
      journal: 'සඟරාව',
      faq: 'විමසුම්',
      support: 'සහාය',
      status: 'පද්ධති තත්ත්වය',
      guidelines: 'මාර්ගෝපදේශ',
      privacy: 'පෞද්ගලිකත්වය',
      terms: 'කොන්දේසි',
      deleteAccount: 'ගිණුම ඉවත් කරන්න',
      openPlatform: 'කෙම්බිමට',
      signIn: 'සුපසන් කෙම්බිමට',
      chooseLanguage: 'භාෂාව තෝරන්න',
      skipToContent: 'ප්‍රධාන අන්තර්ගතයට යන්න',
      close: 'වසන්න',
    },
    hero: {
      eyebrow: 'ගුරුදෙවි · අධ්‍යාපනික සහජීවනය',
      title: 'අධ්‍යාපනයට නව පණක් දෙන ගෞරවනීය තාක්ෂණය.',
      lede: 'ශ්‍රී ලංකාවේ ගුරුභවතුන්, සිසු දරුවන්, පාසල් සහ පවුල් සවිබල ගන්වන නිස්කලංක ඩිජිටල් කෙම්බිම.',
      primaryCta: 'ඉදිරි ගමන් මඟ සොයා යන්න',
      secondaryCta: 'කෙම්බිම් 4 හඳුනාගන්න',
      caption: 'ශ්‍රී ලංකාවේ ඉගෙනුමේ හදගැස්ම හඳුනන මිනිසුන් වෙනුවෙන්මයි.',
    },
    roles: {
      teachers: {
        label: 'ගුරුභවතුන්',
        title: 'ඉගැන්වීමට නිදහස් සිතක්.',
        body: 'පරිපාලන ලිපිගොනු වෙහෙසින් තොරව සූදානම, සැලසුම සහ ආවර්ජනය.',
      },
      leaders: {
        label: 'පාසල් නායකත්වය',
        title: 'සෝදිසියෙන් තොර සුපැහැදිලි දැක්ම.',
        body: 'ගුරුවරුන්ගේ ස්වාධීනත්වයට සහ පෞද්ගලිකත්වයට ගරු කරමින් පාසල මෙහෙයවීම.',
      },
      students: {
        label: 'සිසු දරුවන්',
        title: 'ස්වයං කුතුහලය සහ ආත්ම විශ්වාසය.',
        body: 'ගෞරවනීය සහ සුරක්ෂිත පරිසරයක ක්‍රියාකාරීව ඉගෙනීමට එක්වීම.',
      },
      families: {
        label: 'පවුල් සහ දෙමාපියන්',
        title: 'ආදරණීය බැඳීම.',
        body: 'සැලකිල්ල අධික පාලනයක් බවට පත් නොකර දරුවාගේ ඉගෙනුම් ගමනට සමීපව සිටීම.',
      },
    },
    workspaces: {
      title: 'ස්වෛරී අධ්‍යයන කෙම්බිම් 4',
      subtitle: 'ශ්‍රී ලංකාවේ පාසල් ප්‍රජාවේ සැබෑ මානව සබඳතා වෙනුවෙන්ම නිර්මාණය කළ අවකාශ.',
      w1: {
        number: '01',
        roleLabel: 'ගුරුභවතුන් සහ සිසුන්',
        name: 'පන්ති කාමර කෙම්බිම',
        body: 'පාඩම් සැලසුම්, ඉගැන්වීම සහ ආවර්ජනය—අධ්‍යාපනික කරුණාව පෙරදැරිව.',
      },
      w2: {
        number: '02',
        roleLabel: 'පාසල් නායකත්වය',
        name: 'පාසල් සම්බන්ධීකරණය',
        body: 'නිරීක්ෂණ පීඩනයෙන් තොරව ආයතනික සම්පත් සහ දෛනික රටා සුපසන්ව කළමනාකරණය.',
      },
      w3: {
        number: '03',
        roleLabel: 'පවුල් සහ භාරකරුවන්',
        name: 'පවුලේ සුහද අවකාශය',
        body: 'අන්‍යෝන්‍ය විශ්වාසය පෙරදැරිව පාසල සහ නිවස යා කරන විනිවිද පාලම.',
      },
      w4: {
        number: '04',
        roleLabel: 'ළමා ඉගෙනුම්කරුවන්',
        name: 'ස්වයං ඉගෙනුම් මැදිරිය',
        body: 'ස්වයං අභ්‍යාස, පොදු දැනුම් සම්පත් සහ ළමා ස්වාධීනත්වය සඳහා නිහඬ ඉඩක්.',
      },
    },
    actions: {
      save: 'සුරකින්න',
      back: 'ආපසු',
      next: 'ඉදිරියට',
      cancel: 'අවලංගු කරන්න',
      confirm: 'තහවුරු කරන්න',
      signOut: 'සමුගන්න',
      reflect: 'ආවර්ජනය',
      search: 'සොයන්න',
      submit: 'යොමු කරන්න',
      loading: 'පූරණය වෙමින්...',
      okay: 'හරි',
      selectLanguage: 'භාෂාව තෝරන්න',
    },
    footer: {
      tagline: 'අධ්‍යාපනයේ සැබෑ ජීවය පුබුදුවන සුපසන් තාක්ෂණය.',
      copyright: 'ගුරුදෙවි · එඩ්ලව් (EdLove) පදනමේ කොටසකි',
      explore: 'ගවේෂණය',
      elsewhere: 'වෙනත් සබැඳි',
    },
    gateway: {
      footer: {
        privacy: 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය',
        terms: 'භාවිත කොන්දේසි',
        guidelines: 'ප්‍රජා මාර්ගෝපදේශ',
        accountData: 'ගිණුම සහ දත්ත',
        status: 'පද්ධති තත්ත්වය',
        partOf: 'අනුග්‍රහය:',
        edloveFoundation: 'එඩ්ලව් (EdLove) පදනම',
        madeWithLove: 'ආදරයෙන් නිමැවිණි:',
      },
    },
    auth: {
      welcomeTitle: 'ගුරුදෙවි වෙත සාදරයෙන් පිළිගනිමු 🙏',
      badgeText: 'පිවිසුම / ලියාපදිංචිය',
      continueGoogle: 'Google මඟින් පිවිසෙන්න',
      continueApple: 'Apple මඟින් පිවිසෙන්න',
      continueEmail: 'විද්‍යුත් තැපෑලෙන් පිවිසෙන්න',
      connecting: 'සම්බන්ධ වෙමින්…',
      allSignInOptions: '← සියලු පිවිසුම් විකල්ප',
      emailLabel: 'විද්‍යුත් තැපැල් ලිපිනය',
      passwordLabel: 'මුරපදය',
      forgotPassword: 'මුරපදය අමතකද?',
      rememberMe30Days: 'දින 30ක් මා මතක තබාගන්න',
      signInWithPassword: 'මුරපදයෙන් පිවිසෙන්න',
      signingIn: 'පිවිසෙමින්…',
      sendMagicLink: 'පිවිසුම් සබැඳිය එවන්න',
      sendingLink: 'සබැඳිය එවමින්…',
      usePasswordInstead: 'මුරපදය භාවිත කරන්න',
      checkEmailSecureGuest: 'මෙම අමුත්තන්ගේ අවකාශය සුරක්ෂිත කිරීමට ඔබේ විද්‍යුත් තැපෑල පරීක්ෂා කරන්න. ඔබේ පෙර වැඩ එලෙසම පවතිනු ඇත.',
      checkEmailMagicLink: 'සුරක්ෂිත පිවිසුම් සබැඳිය සඳහා ඔබේ විද්‍යුත් තැපෑල පරීක්ෂා කරන්න. මෙය නව ලිපිනයක් නම්, තහවුරු කළ පසු ගිණුම සෑදේ.',
      signInUnavailable: 'පද්ධති සැකසුම් අසම්පූර්ණ බැවින් පිවිසීම තාවකාලිකව කළ නොහැක.',
      kioskWorkstation: 'පොදු / පාසල් පරිගණක විද්‍යාගාරය',
      autoPurge: 'වසන විට දත්ත ස්වයංක්‍රීයව ඉවත් වේ',
      enterPin: 'ගිණුමට පිවිසීමට PIN අංකය ඇතුළත් කරන්න',
      unlockSanctuary: 'කෙම්බිමට පිවිසෙන්න',
      useAnotherAccount: 'වෙනත් ගිණුමකින් පිවිසෙන්න',
      removeAccountConfirm: 'මෙම පරිගණකයෙන් මෙම ගිණුම ඉවත් කරන්නද?',
      incorrectPin: 'PIN අංකය වැරදියි. කරුණාකර නැවත උත්සාහ කරන්න.',
      unableVerifyPin: 'PIN අංකය තහවුරු කළ නොහැකි විය.',
    },
    support: {
      tabs: {
        guides: 'මඟපෙන්වීම් සහ නිරූපණ',
        contact: 'සෘජු සන්නිවේදන',
        contribute: 'ගුරුදෙවි වෙත දායක වන්න',
        faq: 'ගැටලු නිරාකරණය සහ ප්‍රශ්නෝත්තර',
        diagnostics: 'පද්ධති පරීක්ෂාව',
      },
      surfaceFilter: {
        all: 'සියලු අවකාශ',
        explore: 'ගවේෂණ අවකාශය',
        sanctuary: 'සුපසන් කෙම්බිම',
      },
      searchFaqPlaceholder: 'ප්‍රශ්න හෝ වචන සොයන්න...',
    },
    self: {
      hero: {
        teacher: {
          title: 'ගුරු ආධ්‍යාත්මික සාධනා',
          subtitle: 'ඉගැන්වීමේ රිද්මය, ශක්ති සමබරතාව සහ සන්සුන් බව',
          badge: 'අධ්‍යාපනඥ',
        },
        student: {
          title: 'දැනුම් ප්‍රගුණතාව සහ අභ්‍යන්තර පිබිදීම',
          subtitle: 'ඉගෙනුම් රිද්මය, චිත්තවේගී සන්සුන් බව සහ ස්වයං සංවර්ධනය',
          badge: 'සිසුවා',
        },
        guardian: {
          title: 'දෙමාපිය සුපසන් අවකාශය',
          subtitle: 'පවුලේ සෙනෙහස, මානසික සුවය සහ සන්සුන් විරාමය',
          badge: 'භාරකරු',
        },
        principal: {
          title: 'විදුහල්පති අභ්‍යන්තර කෙම්බිම',
          subtitle: 'පරිපාලන විචක්ෂණභාවය, සන්සුන් නායකත්වය සහ ප්‍රතිපත්ති',
          badge: 'නායකත්වය',
        },
        founder: {
          title: 'දැක්මේ නිර්මාණ අවකාශය',
          subtitle: 'මූලෝපායික ප්‍රඥාව සහ නිහඬ චින්තනය',
          badge: 'නිර්මාතෘ',
        },
        admin: {
          title: 'පුද්ගලික සුපසන් අවකාශය',
          subtitle: 'මානසික සුවය, සංවර්ධනය සහ දෛනික ආවර්ජනය',
          badge: 'පද්ධතිය',
        },
      },
      roleTabs: {
        all: 'සියලු අභ්‍යාස',
        teacher: 'ගුරුභවතුන්',
        student: 'සිසු දරුවන්',
        principal: 'විදුහල්පති',
        guardian: 'භාරකරුවන්',
      },
      reframe: {
        title: 'සිතුවිලි නැවත හැඩගැසීමේ මඟපෙන්වුම',
        subtitle: 'හිතට බර දෙන සිතුවිලි කරුණාවෙන් සහ සාක්ෂි සහිතව සමබර කරගනිමු',
        steps: {
          step1: '1. හඳුනාගැනීම',
          step2: '2. හැඟීම නම් කිරීම',
          step3: '3. උගුල හඳුනාගැනීම',
          step4: '4. සමබර කිරීම',
        },
        q1: 'ඔබේ සිත තුළ නිතරම කැරකෙන ස්වයං සිතුවිල්ල කුමක්ද?',
        q2: 'මේ සිතුවිල්ල සමඟ බැඳී ඇති හැඟීම කුමක්ද?',
        q3: 'මෙය කුමන ආකාරයේ සිතුවිලි උගුලකට සමානද?',
        q4: 'වඩාත් සමබර සහ කරුණාවන්ත ආදේශක දැක්ම කුමක්ද?',
        finish: 'නැවත හැඩගැසීම සම්පූර්ණයි',
        continue: 'ඉදිරියට',
      },
    },
    roadmap: {
      eyebrow: 'බහු-වාර්ෂික ගමන් මඟ',
      title: 'සංකල්පීය උපතේ සිට ජීවමාන සුපසන් කෙම්බිම දක්වා.',
      subtitle:
        'ශ්‍රී ලංකාවේ චිරස්ථායී පරිවර්තනය උදෙසා—කරුණාව, ගෞරවය සහ මානව සබඳතා පෙරදැරිව පැහැදිලි අදියර තුනකින් ඉදිරියට.',
      y2026: {
        date: 'ඇල්ෆා ආරම්භය',
        phase: 'ඇල්ෆා නිකුතුව',
        badge: 'ආරම්භක කණ්ඩායම',
        summary:
          'ගුරුදෙවි සුපසන් කෙම්බිමේ ආරම්භය. ආරාධිත ශ්‍රී ලාංකේය නියමු පාසල් සඳහා මූලික සූදානම් සහ ආවර්ජන මෙවලම්.',
        d1: 'ගුරු ආවර්ජන සහ සැකසුම් අවකාශ',
        d2: 'උපාංගය තුළම සුරැකෙන දත්ත පෞද්ගලිකත්වය',
        d3: 'නියමු පාසල් කණ්ඩායම්',
      },
      y2027: {
        date: 'පරිසරයේ ව්‍යාප්තිය',
        phase: 'බීටා නිකුතුව',
        badge: 'බහු-කෙම්බිම්',
        summary:
          'පැහැදිලි පෞද්ගලිකත්ව සීමා සහ හවුල් දැක්මක් සහිතව සිසුන්, පවුල් සහ පාසල් නායකයන් වෙත කෙම්බිම පුළුල් කිරීම.',
        d1: 'පන්තිකාමර, පාසල්, පවුල් සහ මැදිරි අවකාශ',
        d2: 'සෝදිසි කිරීම්වලින් තොර සම්බන්ධීකරණය',
        d3: 'සිංහල සහ දෙමළ ද්විභාෂා අත්හදා බැලීම්',
      },
      y2028: {
        date: 'දීපව්‍යාප්ත විවෘත කිරීම',
        phase: 'පොදු කෙම්බිම',
        badge: 'පොදු දායාදය',
        summary:
          'සමස්ත ශ්‍රී ලංකාවටම විවෘත අධ්‍යාපනික කෙම්බිම, ආයතනික සමගිය සහ ඩිජිටල් ස්වෛරීභාවය සුරකිමින්.',
        d1: 'සියලු ශ්‍රී ලාංකේය පාසල් සඳහා විවෘත ප්‍රවේශය',
        d2: 'ස්වෛරී විවෘත යටිතල පහසුකම් සහ දත්ත ප්‍රොටෝකෝල',
        d3: 'ප්‍රජා මූලික අධ්‍යාපනික භාරකාරත්වය',
      },
    },
    supportForm: {
      categoryLabel: 'වර්ගය',
      nameLabel: 'නම',
      optionalHint: '(අත්‍යවශ්‍ය නොවේ)',
      emailLabel: 'විද්‍යුත් තැපෑල',
      messageLabel: 'පණිවිඩය',
      submitCta: 'සහාය සටහන යොමු කරන්න ↗',
      sendingCta: 'යොමු වෙමින්…',
      directEmailTitle: 'සෘජු විද්‍යුත් තැපෑල මඟින් සම්බන්ධ වන්න.',
      directEmailBody:
        'අපගේ පෝරමය තවමත් සකස් වෙමින් පවතී. කරුණාකර විද්‍යුත් තැපෑලෙන් අප අමතන්න.',
      emailSupportCta: 'විද්‍යුත් තැපෑලෙන් සහාය ලබාගන්න',
      categories: {
        support: 'පොදු සහාය සහ විමසීම්',
        explore: 'ගවේෂණ අමුත්තන්ගේ අවකාශය',
        sanctuary: 'පාසල් කෙම්බිම සහ සමමුහුර්තකරණය',
        bug: 'දෝෂයක් වාර්තා කරන්න',
        feature: 'විශේෂාංග යෝජනාවක්',
        contribute: 'දායක වීම (කේත, විෂය නිර්දේශ, පරිවර්තන)',
        institutional: 'පාසලක් එක් කරගැනීම',
        feedback: 'පොදු අත්දැකීම් ප්‍රතිචාර',
      },
    },
    legal: {
      provenance: {
        version: 'අනුවාදය',
        effectiveDate: 'බලපැවැත්වෙන දිනය',
        regulatoryBasis: 'නියාමන පදනම',
        stewardship: 'භාරකාරත්වය',
      },
    },
    workspace: {
      toolsNav: 'කෙම්බිමේ මෙවලම් මඟපෙන්වුම',
      features: {
        attendance: 'දෛනික පැමිණීම',
        qr_scanner: 'QR ස්කෑනරය',
        timetable: 'කාලසටහන',
        notices: 'නිවේදන සහ චක්‍රලේඛ',
        submissions: 'පැවරුම් යොමුකිරීම්',
        climate: 'පන්තිකාමර පරිසරය',
        tuition: 'අධ්‍යයන ගාස්තු',
      },
    },
    breathe: {
      badge: 'කායික සංයමය',
      title: 'ශ්වසන රිද්මය',
      inhale: 'ගැඹුරින් ආශ්වාස කරන්න',
      hold: 'සන්සුන්ව හුස්ම රඳවාගන්න',
      exhale: 'හෙමින් ප්‍රශ්වාස කරන්න',
      rest: 'නිහඬව විවේකී වන්න',
      startBtn: 'ශ්වසන අභ්‍යාසය අරඹන්න',
      stopBtn: 'ව්‍යායාමය නවත්වන්න',
      restartBtn: 'නැවත ආරම්භ කරන්න',
      groundedTitle: 'සන්සුන්ව වර්තමානයට',
      groundedText:
        'ශ්වසන වටය සම්පූර්ණයි. ඔබේ මනස සහ ස්නායු පද්ධතිය සමබරතාවයට පත්විය.',
      cycleText: 'වටය {{current}} / {{total}}',
      idleHint:
        'ශාරීරික පීඩනය ලිහිල් කර සිත සන්සුන් කරගැනීමට 4-2-6-2 රිද්මය අනුගමනය කරන්න.',
    },
    fireJournalWeb: {
      arrivalTitle: 'හිතේ බරක් නිදහස් කරගන්න ඉඩක්.',
      arrivalSubtitle:
        'සිතට දැනෙන දේ නිදහසේ ලියන්න. ගිනිදැල්ලට මුදාහළ පසු කිසිදු අකුරක් රඳවා නොගනී.',
      safeTryBtn: 'ආරක්ෂිතව අත්හදා බලන්න',
      endSafeTryBtn: 'අත්හදා බැලීම අවසන් කරන්න',
      releasePrompt: 'අද දිනයේ ඔබේ සිතින් අතහැරිය හැක්කේ කුමක්ද?',
      burnBtn: 'ගිනිදැල්ලට නිදහස් කරන්න',
      burningBtn: 'ගිනිදැල්ලට මුදාහරිමින්…',
    },
    settings: {
      title: 'කෙම්බිමේ සැකසුම්',
      subtitle:
        'ඔබේ පරිසරයේ ආලෝකය, ඉන්ද්‍රිය චලන, පෞද්ගලිකත්වය සහ භාෂා ප්‍රවේශ්‍යතාව සකසා ගන්න.',
      atmosphereTitle: 'දෘශ්‍ය වටපිටාව සහ ආලෝකය',
      atmosphereDesc:
        'දවසේ වේලාවට ගැලපෙන පරිදි ආලෝක උෂ්ණත්වය සහ ප්‍රතිවිරෝධය වෙනස් කරන්න.',
      sensoryTitle: 'ඉන්ද්‍රිය චලන සහ රිද්මය',
      sensoryDesc:
        'සිතේ ඒකාග්‍රතාව සුරකින අයුරින් අතුරුමුහුණතේ චලන සහ මාරුවීම් සකසන්න.',
      soundTitle: 'සන්සුන් ශබ්ද සහ පරිසරය',
      soundDesc:
        'පැමිණීම් සහ සන්සුන් විරාම සඳහා මෘදු නාද සංඥා.',
      quietModeLabel: 'නිහඬ කෙම්බිම් මාදිලිය',
      quietModeDesc:
        'ගැඹුරු කියවීම් හෝ සන්සුන් අවස්ථාවන්හිදී සියලු අනවශ්‍ය ශබ්ද නතර කෙරේ.',
      notifTitle: 'දැනුම්දීම් රිද්මය',
      notifDesc:
        'මානසික වෙහෙස වළක්වා ගනිමින් අවශ්‍යම පණිවිඩ පමණක් ලැබෙන සේ සකසන්න.',
      privacyTitle: 'පෞද්ගලිකත්වය සහ දත්ත ආරක්ෂාව',
      privacyDesc:
        'ශ්‍රී ලංකා දත්ත ආරක්ෂණ පනත යටතේ ඔබේ තොරතුරු පිළිබඳ පූර්ණ පාලනය ඔබට හිමිය.',
      languageTitle: 'භාෂාව සහ අක්ෂර වින්‍යාසය',
      languageDesc:
        'සුපැහැදිලි අක්ෂර කලාවෙන් යුත් ශ්‍රී ලාංකේය රාජ්‍ය භාෂාවක් තෝරාගන්න.',
      securityTitle: 'උපාංග විශ්වාසය සහ ආරක්ෂාව',
      securityDesc:
        'සක්‍රිය සැසි, ආරක්ෂක ටෝකන සහ දත්ත පිටපත් පරීක්ෂා කර කළමනාකරණය කරන්න.',
      enabled: 'සක්‍රියයි',
      muted: 'නිහඬයි',
      active: 'සක්‍රියයි',
      off: 'අක්‍රියයි',
      paused: 'විරාමිතයි',
      saveNotice: 'සැකසුම් යාවත්කාලීන විය',
    },
    status: {
      eyebrow: 'මෙහෙයුම් තත්ත්වය',
      title: 'පද්ධති යහපැවැත්ම සහ සජීවී දත්ත',
      description:
        'ගුරුදෙවි කෙම්බිමේ දත්ත සමුදාය, ජාල සබඳතා සහ සේවා පද්ධතිවල සජීවී තත්ත්වය.',
      allOperational: 'සියලු පද්ධති සාර්ථකව ක්‍රියාත්මකයි',
      degraded: 'සේවා කාර්යක්ෂමතාව මඳක් අඩුවී ඇත',
      checking: 'පරීක්ෂා කරමින්…',
    },
    journal: {
      eyebrow: 'ගුරුදෙවි සඟරාව',
      title: 'අධ්‍යාපනික කෙම්බිමක සටහන් සහ අත්දැකීම්.',
      description:
        'ඉගෙනුම සැබෑවක් කරන මිනිසුන් උදෙසා කතාන්දර, භාවිත සටහන් සහ ආවර්ජනා.',
      readEntry: 'සටහන කියවන්න',
      allEntries: '← සියලු සඟරා සටහන්',
      minRead: 'විනාඩි {{count}} ක කියවීමක්',
      byAuthor: 'රචනය:',
      publishedUnder: 'ප්‍රකාශිත බලපත්‍රය:',
      source: 'මූලාශ්‍රය',
      notFoundTitle: 'සඟරා සටහන සොයාගත නොහැකි විය',
      returnToJournal: 'ආපසු සඟරාව වෙත',
    },
    classroom: {
      eyebrow: 'ශාස්ත්‍රීය ඉගෙනුම් කෙම්බිම',
      curatedBy: 'මෙහෙයවීම: {{name}}',
      returnRollCall: 'පැමිණීමේ ලේඛනයට',
      openGradebook: 'ලකුණු සටහනට',
      enrolledStudents: 'ලියාපදිංචි සිසුන්',
      activeLearners: 'සක්‍රිය ඉගෙනුම්කරුවන්',
      curriculumUnits: 'විෂය ඒකක',
      completed: 'සම්පූර්ණයි',
      activeAssignments: 'ක්‍රියාකාරී පැවරුම්',
      dueThisCycle: 'මෙම වටයේදී නියමිත',
      reflectiveNotes: 'ආවර්ජනා සටහන්',
      insights: 'පන්ති කාමරයේ තත්ත්වය',
      tabStudents: 'සිසුන්',
      tabLessons: 'පාඩම් ඒකක',
      tabAssignments: 'පැවරුම්',
      tabNotes: 'ක්ෂේත්‍ර සටහන්',
      workspaceBreadcrumb: 'වැඩබිම',
      classroomsBreadcrumb: 'පන්ති කාමර',
    },
    tuition: {
      backToWorkspace: '← ආපසු පැමිණීමේ වැඩබිමට',
      title: 'ගාස්තු සහ වාරික දායකත්ව',
      offlineLedger: 'නොබැඳි ලේඛනය සක්‍රියයි',
      liveSync: 'සජීවී සබඳතාව සක්‍රියයි',
      collected: 'මේ දක්වා එකතු වූ මුදල',
      outstanding: 'හිඟ / අයවිය යුතු මුදල්',
      filterAll: 'සියලු වාර්තා',
      filterPaid: 'ගෙවා අවසන්',
      filterPending: 'අයවිය යුතු',
      filterOverdue: 'කල් ඉකුත් වූ',
    },
  },
  ta: {
    brand: {
      name: 'குருதெவி',
      tagline: 'கல்வியின் உயிரோட்டமான அமைதிச் சோலை',
      sanctuaryTagline: 'கல்வியின் உயிரோட்டமான அமைதிச் சோலை',
      description:
        'இலங்கையில் ஆசிரியர்கள், மாணவர்கள், பள்ளிகள் மற்றும் குடும்பங்களின் கண்ணியத்தைப் பாதுகாக்கும் கல்வி அமைதிச் சோலை.',
    },
    nav: {
      ecology: 'சூழல்',
      workspaces: 'களங்கள்',
      roadmap: 'பயணப் பாதை',
      journal: 'குறிப்பேடு',
      faq: 'வினா-விடை',
      support: 'ஆதரவு',
      status: 'கட்டமைப்பு நிலை',
      guidelines: 'வழிகாட்டுதல்கள்',
      privacy: 'தனியுரிமை',
      terms: 'விதிமுறைகள்',
      deleteAccount: 'கணக்கை நீக்கு',
      openPlatform: 'சோலைக்குள்',
      signIn: 'சோலையில் நுழைக',
      chooseLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
      skipToContent: 'உள்ளடக்கத்திற்குச் செல்க',
      close: 'மூடுக',
    },
    hero: {
      eyebrow: 'குருதெவி · கல்விச் சூழலமைப்பு',
      title: 'கல்விக்கு புத்துயிரூட்டும் மாண்புமிக்க தொழில்நுட்பம்.',
      lede: 'இலங்கையின் ஆசிரியர்கள், மாணவர்கள், பள்ளிகள் மற்றும் குடும்பங்களை அரவணைக்கும் அமைதியான எண்ணிமச் சோலை.',
      primaryCta: 'எதிர்காலப் பயணப் பாதையைக் காண்க',
      secondaryCta: '4 முக்கிய களங்களை அறிக',
      caption: 'இலங்கையில் கற்றலை உயிர்ப்புடன் வைத்திருக்கும் மனிதர்களுக்காகவே உருவானது.',
    },
    roles: {
      teachers: {
        label: 'ஆசிரியர்கள்',
        title: 'கற்பிக்கப் புதிய சுதந்திரம்.',
        body: 'நிர்வாகச் சுமைகளின்றி பாடம் தயாரித்தலும் ஆழ்ந்த சுயசிந்தனையும்.',
      },
      leaders: {
        label: 'பள்ளித் தலைவர்கள்',
        title: 'கண்காணிப்பின்றி தெளிவான வழிகாட்டல்.',
        body: 'ஆசிரியர்களின் தன்னாட்சியை மதித்து முழுப் பள்ளியையும் நேர்த்தியாக வழிநடத்துதல்.',
      },
      students: {
        label: 'மாணவர்கள்',
        title: 'ஆற்றலும் இயல்பான ஆர்வமும்.',
        body: 'சுயமரியாதையுடனும் ஆர்வத்துடனும் கற்றலில் முழுமையாக ஈடுபடுதல்.',
      },
      families: {
        label: 'குடும்பங்கள்',
        title: 'அன்போடு கூடிய அரவணைப்பு.',
        body: 'கட்டுப்பாடுகள் இன்றி குழந்தைகளின் கல்விப் பயணத்திற்கு துணையாக இருத்தல்.',
      },
    },
    workspaces: {
      title: '4 இறையாண்மைக் களங்கள்',
      subtitle: 'இலங்கைக் கல்விச் சமூகத்தின் உண்மையான மனித உறவுகளுக்காக நேர்த்தியாக செதுக்கப்பட்டது.',
      w1: {
        number: '01',
        roleLabel: 'ஆசிரியர்களும் மாணவர்களும்',
        name: 'வகுப்பறை அமைதிச் சோலை',
        body: 'பாடத் தயாரிப்பு, கற்பித்தல் மற்றும் கற்றல் பகிர்வு—கல்விப் பராமரிப்பின் அடித்தளத்தில்.',
      },
      w2: {
        number: '02',
        roleLabel: 'பள்ளித் தலைவர்கள்',
        name: 'பள்ளி ஒருங்கிணைப்புக் களம்',
        body: 'கண்காணிப்பு அழுத்தமின்றி பள்ளி வளங்களையும் கால அட்டவணைகளையும் சீராக நிர்வகித்தல்.',
      },
      w3: {
        number: '03',
        roleLabel: 'குடும்பங்களும் பாதுகாவலர்களும்',
        name: 'குடும்ப வெளி',
        body: 'பரஸ்பர மரியாதையுடன் பள்ளிக்கும் வீட்டிற்கும் இடையே ஒரு வெளிப்படையான பாலம்.',
      },
      w4: {
        number: '04',
        roleLabel: 'இளம் கற்பவர்கள்',
        name: 'சுய கற்றல் கூடம்',
        body: 'சுய பயிற்சி, பொது நூலக வளங்கள் மற்றும் மாணவர் சுதந்திரத்திற்கான அமைதியான வெளி.',
      },
    },
    actions: {
      save: 'சேமிக்க',
      back: 'பின்னே',
      next: 'அடுத்து',
      cancel: 'ரத்து செய்',
      confirm: 'உறுதி செய்',
      signOut: 'விடைபெறுக',
      reflect: 'சிந்தனை',
      search: 'தேடுக',
      submit: 'சமர்ப்பிக்க',
      loading: 'ஏற்றுகிறது...',
      okay: 'சரி',
      selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    },
    footer: {
      tagline: 'கல்வியின் ஆன்மாவிற்கு புத்துயிரூட்டும் உன்னதத் தொழில்நுட்பம்.',
      copyright: 'குருதெவி · எட்லவ் (EdLove) அறக்கட்டளையின் ஒரு பகுதி',
      explore: 'ஆராய்க',
      elsewhere: 'பிற தளங்கள்',
    },
    gateway: {
      footer: {
        privacy: 'தனியுரிமைக் கொள்கை',
        terms: 'பயன்பாட்டு விதிகள்',
        guidelines: 'சமூக வழிகாட்டுதல்கள்',
        accountData: 'கணக்கும் தரவும்',
        status: 'கட்டமைப்பு நிலை',
        partOf: 'அங்கம்:',
        edloveFoundation: 'எட்லவ் (EdLove) அறக்கட்டளை',
        madeWithLove: 'அன்போடு உருவானது:',
      },
    },
    auth: {
      welcomeTitle: 'குருதெவிக்கு அன்புடன் வரவேற்கிறோம் 🙏',
      badgeText: 'நுழைவு / பதிவு',
      continueGoogle: 'Google மூலம் தொடர்க',
      continueApple: 'Apple மூலம் தொடர்க',
      continueEmail: 'மின்னஞ்சல் மூலம் தொடர்க',
      connecting: 'இணைக்கிறது…',
      allSignInOptions: '← அனைத்து நுழைவுத் தெரிவுகள்',
      emailLabel: 'மின்னஞ்சல் முகவரி',
      passwordLabel: 'கடவுச்சொல்',
      forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
      rememberMe30Days: '30 நாட்களுக்கு என்னை நினைவில் கொள்க',
      signInWithPassword: 'கடவுச்சொல் மூலம் நுழைக',
      signingIn: 'நுழைகிறது…',
      sendMagicLink: 'நுழைவு இணைப்பை அனுப்புக',
      sendingLink: 'இணைப்பு அனுப்பப்படுகிறது…',
      usePasswordInstead: 'கடவுச்சொல்லைப் பயன்படுத்துக',
      checkEmailSecureGuest: 'இந்த விருந்தினர் சோலையைப் பாதுகாக்க உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும். உங்கள் முந்தைய வேலைகள் இதிலேயே இணைந்திருக்கும்.',
      checkEmailMagicLink: 'பாதுகாப்பான இணைப்பிற்கு உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும். இது புதிய முகவரியாயின், உறுதிசெய்ததும் கணக்கு உருவாக்கப்படும்.',
      signInUnavailable: 'கட்டமைப்பு அமைப்புகள் முழுமையற்றதால் நுழைவு தற்காலிகமாக இயங்கவில்லை.',
      kioskWorkstation: 'பகிரப்பட்ட / பள்ளி ஆய்வகக் கணினி',
      autoPurge: 'மூடும்போது தானாக நீக்கப்படும்',
      enterPin: 'கணக்கை அணுக PIN ஐ உள்ளிடுக',
      unlockSanctuary: 'சோலையைத் திறக்க',
      useAnotherAccount: 'வேறொரு கணக்கில் நுழைக',
      removeAccountConfirm: 'இந்தக் கணக்கை இந்தக் கணினியிலிருந்து நீக்கவா?',
      incorrectPin: 'தவறான PIN. மீண்டும் முயற்சிக்கவும்.',
      unableVerifyPin: 'PIN ஐ உறுதிப்படுத்த முடியவில்லை.',
    },
    support: {
      tabs: {
        guides: 'வழிகாட்டல்களும் செய்முறைகளும்',
        contact: 'நேரடித் தொடர்பு',
        contribute: 'குருதெவிக்குப் பங்களிக்க',
        faq: 'சிக்கல் தீர்வும் வினா-விடையும்',
        diagnostics: 'நேரடிப் பரிசோதனை',
      },
      surfaceFilter: {
        all: 'அனைத்து களங்களும்',
        explore: 'ஆராய்வு வெளி',
        sanctuary: 'அமைதிச் சோலை',
      },
      searchFaqPlaceholder: 'கேள்விகள் அல்லது சொற்களைத் தேடுக...',
    },
    self: {
      hero: {
        teacher: {
          title: 'ஆசிரியரின் சாதனா',
          subtitle: 'பணிச் சீர்மை, ஆற்றல் சமநிலை மற்றும் அமைதி',
          badge: 'கல்வியாளர்',
        },
        student: {
          title: 'தேர்ச்சியும் உள்ளார்ந்த துடிப்பும்',
          subtitle: 'கற்றல் ஓட்டம், அமைதி மற்றும் சுய வளர்ச்சி',
          badge: 'மாணவர்',
        },
        guardian: {
          title: 'பாதுகாவலர் சோலை',
          subtitle: 'குடும்ப இருப்பு, மன அமைதி மற்றும் கனிவான இடைவேளை',
          badge: 'பாதுகாவலர்',
        },
        principal: {
          title: 'அதிபரின் உள்ளார்ந்த அமைதி',
          subtitle: 'நிர்வாகத் தெளிவு, நிதானம் மற்றும் கொள்கைகள்',
          badge: 'தலைமைத்துவம்',
        },
        founder: {
          title: 'தொலைநோக்கு சிந்தனைக் களம்',
          subtitle: 'உயரிய விவேகம் மற்றும் அமைதியான சிந்தனை',
          badge: 'நிறுவனர்',
        },
        admin: {
          title: 'தனிப்பட்ட அமைதிச் சோலை',
          subtitle: 'மன அமைதி, வளர்ச்சி மற்றும் தினசரி சுயசிந்தனை',
          badge: 'கட்டமைப்பு',
        },
      },
      roleTabs: {
        all: 'அனைத்து பயிற்சிகளும்',
        teacher: 'ஆசிரியர்',
        student: 'மாணவர்',
        principal: 'அதிபர்',
        guardian: 'பாதுகாவலர்',
      },
      reframe: {
        title: 'எண்ணங்களை மறுசீரமைக்கும் வழிகாட்டி',
        subtitle: 'மன அழுத்தத்தை ஏற்படுத்தும் எண்ணங்களை கனிவுடனும் சான்றுகளுடனும் மறுசீரமைப்போம்',
        steps: {
          step1: '1. கவனித்தல்',
          step2: '2. பெயரிடல்',
          step3: '3. தவறைக் கண்டறிதல்',
          step4: '4. மறுசீரமைத்தல்',
        },
        q1: 'உங்கள் மனதில் மீண்டும் மீண்டும் சுழலும் தானியங்கி எண்ணம் என்ன?',
        q2: 'இந்த எண்ணத்துடன் இணைந்த உணர்வு என்ன?',
        q3: 'இது எந்த வகையான சிந்தனைத் தவறாகத் தோன்றுகிறது?',
        q4: 'மிகவும் சமநிலையான, கனிவான மாற்றுப் பார்வை என்ன?',
        finish: 'மறுசீரமைப்பை நிறைவு செய்க',
        continue: 'தொடர்க',
      },
    },
    roadmap: {
      eyebrow: 'பல்லாண்டுப் பயணப் பாதை',
      title: 'கருத்துருத் தொடக்கம் முதல் வாழும் அமைதிச் சோலை வரை.',
      subtitle:
        'இலங்கையில் நிலையான மாற்றத்திற்காக—அக்கறை, கண்ணியம் மற்றும் உறவுகளுடன் மூன்று தெளிவான கட்டங்களில் முன்னேறுகிறது.',
      y2026: {
        date: 'ஆல்ஃபா தொடக்கம்',
        phase: 'ஆல்ஃபா வெளியீடு',
        badge: 'தொடக்கக் குழு',
        summary:
          'குருதெவி அமைதிச் சோலையின் தோற்றம். அழைக்கப்பட்ட இலங்கைப் முன்னோடிப் பள்ளிகளுக்கான அடிப்படைத் தயாரிப்பு மற்றும் சுயசிந்தனைக் கருவிகள்.',
        d1: 'ஆசிரியர் சிந்தனை மற்றும் தயாரிப்பு வெளிகள்',
        d2: 'சாதனத்திற்குள்ளேயே சேமிக்கப்படும் தனியுரிமை',
        d3: 'முன்னோடிப் பள்ளிக் குழுக்கள்',
      },
      y2027: {
        date: 'சூழலின் விரிவாக்கம்',
        phase: 'பீட்டா வெளியீடு',
        badge: 'பல-களங்கள்',
        summary:
          'தெளிவான தனியுரிமை வரம்புகள் மற்றும் பகிரப்பட்ட உண்மையுடன் மாணவர்கள், குடும்பங்கள், பள்ளித் தலைவர்களுக்கும் சோலையை விரிவுபடுத்துதல்.',
        d1: 'வகுப்பறை, பள்ளி, குடும்பம், கூடம் வெளிகள்',
        d2: 'கண்காணிப்பற்ற ஒருங்கிணைப்பு',
        d3: 'சிங்களம் மற்றும் தமிழ் இருமொழிச் சோதனைகள்',
      },
      y2028: {
        date: 'நாடு தழுவிய திறப்பு',
        phase: 'பொதுச் சோலை',
        badge: 'பொதுச் சொத்து',
        summary:
          'நீடித்த நிறுவன நல்லிணக்கத்தையும் எண்ணிமத் தன்னாட்சியையும் வழங்கும் திறந்த கல்விச் சோலை நாடு தழுவிய அளவில் கிடைக்கும்.',
        d1: 'அனைத்து இலங்கைப் பள்ளிகளுக்கும் திறந்த அணுகல்',
        d2: 'தன்னாட்சி திறந்த உள்கட்டமைப்பு மற்றும் தரவு நெறிமுறைகள்',
        d3: 'சமூக வழிகாட்டுதலுடனான கற்பித்தல் பொறுப்புடைமை',
      },
    },
    supportForm: {
      categoryLabel: 'வகை',
      nameLabel: 'பெயர்',
      optionalHint: '(விருப்பத் தேர்வு)',
      emailLabel: 'மின்னஞ்சல்',
      messageLabel: 'செய்தி',
      submitCta: 'ஆதரவுக் குறிப்பை அனுப்புக ↗',
      sendingCta: 'அனுப்பப்படுகிறது…',
      directEmailTitle: 'நேரடி மின்னஞ்சல் தற்போதைய தொடர்பு வழியாகும்.',
      directEmailBody:
        'எங்கள் படிவம் இன்னும் கட்டமைக்கப்படவில்லை. தயவுசெய்து மின்னஞ்சல் மூலம் தொடர்புகொள்ளுங்கள்.',
      emailSupportCta: 'மின்னஞ்சல் வழி ஆதரவு',
      categories: {
        support: 'பொது ஆதரவும் விசாரணைகளும்',
        explore: 'ஆராய்வு விருந்தினர் வெளி',
        sanctuary: 'பள்ளிச் சோலையும் ஒத்திசைவும்',
        bug: 'வழுவைப் புகாரளிக்கவும்',
        feature: 'புதிய வசதிக்கான பரிந்துரை',
        contribute: 'பங்களிப்பு (நிரல், பாடத்திட்டம், மொழிபெயர்ப்பு)',
        institutional: 'பள்ளி இணைப்பும் முன்னோடி முயற்சியும்',
        feedback: 'பொது அனுபவப் பின்னூட்டம்',
      },
    },
    legal: {
      provenance: {
        version: 'பதிப்பு',
        effectiveDate: 'நடைமுறைத் திகதி',
        regulatoryBasis: 'ஒழுங்குமுறை அடிப்படை',
        stewardship: 'பொறுப்புடைமை',
      },
    },
    workspace: {
      toolsNav: 'களக் கருவிகள் வழிகாட்டி',
      features: {
        attendance: 'தினசரி வருகை',
        qr_scanner: 'QR ஸ்கேனர்',
        timetable: 'கால அட்டவணை',
        notices: 'சுற்றறிக்கைகளும் அறிவிப்புகளும்',
        submissions: 'படைப்புகள் சமர்ப்பிப்பு',
        climate: 'வகுப்பறைச் சூழல்',
        tuition: 'கல்விக் கட்டணங்கள்',
      },
    },
    breathe: {
      badge: 'உடல் ஒழுங்குமுறை',
      title: 'மூச்சுச் சீரமைப்பு',
      inhale: 'ஆழமாக மூச்சை உள்ளிழுக்கவும்',
      hold: 'நிறைவோடு நிறுத்தவும்',
      exhale: 'மெதுவாக மூச்சை வெளியேற்றவும்',
      rest: 'அமைதியில் இளைப்பாறவும்',
      startBtn: 'மூச்சுப் பயிற்சியைத் தொடங்குக',
      stopBtn: 'பயிற்சியை நிறுத்துக',
      restartBtn: 'மீண்டும் தொடங்குக',
      groundedTitle: 'நிகழ்கணத்தில் நிலைத்திருங்கள்',
      groundedText:
        'மூச்சுச் சுழற்சி நிறைவடைந்தது. உங்கள் நரம்பு மண்டலம் அமைதி நிலையை அடைந்துள்ளது.',
      cycleText: 'சுழற்சி {{current}} / {{total}}',
      idleHint:
        'உடல் அழுத்தத்தை விடுவித்து மனதை ஒருமுகப்படுத்த 4-2-6-2 சீர்மையைப் பின்பற்றுங்கள்.',
    },
    fireJournalWeb: {
      arrivalTitle: 'மன அழுத்தத்தை விடுவிக்க ஒரு களம்.',
      arrivalSubtitle:
        'சுதந்திரமாக எழுதுங்கள். நெருப்பில் விடுவித்த பிறகு எந்த உரையும் சேமிக்கப்படாது.',
      safeTryBtn: 'பாதுகாப்பாக முயற்சிக்குக',
      endSafeTryBtn: 'முயற்சியை முடித்து நீக்குக',
      releasePrompt: 'இன்று உங்கள் மனதிலிருந்து விடைபெற வேண்டியது எது?',
      burnBtn: 'நெருப்பில் விடுவிக்க',
      burningBtn: 'நெருப்பில் விடுவிக்கப்படுகிறது…',
    },
    settings: {
      title: 'சோலை அமைப்புகள்',
      subtitle:
        'உங்கள் காட்சிச் சூழல், உணர்ச்சி அசைவுகள், தனியுரிமை மற்றும் மொழி விருப்பங்களை ஒழுங்குபடுத்துங்கள்.',
      atmosphereTitle: 'காட்சிச் சூழலும் வெளிச்சமும்',
      atmosphereDesc:
        'நாள் பொழுதிற்கு ஏற்ப வெளிச்ச அளவையும் நிறங்களையும் மாற்றி அமையுங்கள்.',
      sensoryTitle: 'உணர்ச்சி அசைவுகளும் இசைவும்',
      sensoryDesc:
        'கவனக் கலைப்பைத் தவிர்த்து அமைதியான உணர்வைத் தரும் அசைவுகளைத் தேர்வுசெய்யுங்கள்.',
      soundTitle: 'அமைதி ஓசையும் சூழலும்',
      soundDesc:
        'அமைதியான வாசிப்பு மற்றும் இடைவேளைகளுக்கான மென்மையான ஓசைகள்.',
      quietModeLabel: 'அமைதிச் சோலை முறைமை',
      quietModeDesc:
        'ஆழ்ந்த கற்றல் மற்றும் அமைதியான தருணங்களில் தேவையற்ற ஒலிகளை நிறுத்துகிறது.',
      notifTitle: 'அறிவிப்பு இடைவெளிகள்',
      notifDesc:
        'மன அமைதியைப் பாதுகாக்கும் வகையில் தேவையான அறிவிப்புகளை மட்டும் பெறுங்கள்.',
      privacyTitle: 'தனியுரிமையும் தரவுப் பாதுகாப்பும்',
      privacyDesc:
        'இலங்கை தனிநபர் தரவுப் பாதுகாப்புச் சட்டத்தின்படி உங்கள் தகவல்கள் முழுமையாக பாதுகாக்கப்படுகின்றன.',
      languageTitle: 'மொழி மற்றும் எழுத்துமுறை',
      languageDesc:
        'தெளிவான எழுத்துருக்களுடன் கூடிய இலங்கையின் உத்தியோகபூர்வ மொழியைத் தேர்வுசெய்யுங்கள்.',
      securityTitle: 'சாதன நம்பிக்கையும் பாதுகாப்பும்',
      securityDesc:
        'செயலில் உள்ள சாதனங்கள், பாதுகாப்பு குறியீடுகள் மற்றும் தரவுப் பதிவுகளை நிர்வகியுங்கள்.',
      enabled: 'இயக்கத்தில்',
      muted: 'ஒலி நிறுத்தப்பட்டது',
      active: 'செயலில்',
      off: 'செயலிழப்பில்',
      paused: 'நிறுத்தப்பட்டது',
      saveNotice: 'அமைப்புகள் புதுப்பிக்கப்பட்டன',
    },
    status: {
      eyebrow: 'செயல்பாட்டு நிலை',
      title: 'கட்டமைப்பு நலமும் நேரலைத் தகவல்களும்',
      description:
        'குருதெவி அமைதிச் சோலையின் தரவுத்தளம், சேவைகள் மற்றும் இணைப்புகளின் நேரலை நிலை.',
      allOperational: 'அனைத்து அமைப்புகளும் சீராக இயங்குகின்றன',
      degraded: 'செயல்திறன் சற்று குறைந்துள்ளது',
      checking: 'சரிபார்க்கப்படுகிறது…',
    },
    journal: {
      eyebrow: 'குருதெவி குறிப்பேடு',
      title: 'கல்விச் சோலையின் அனுபவக் குறிப்புகள்.',
      description:
        'கற்றலை சாத்தியமாக்கும் மனிதர்களுக்கான பதிவுகள், கள அனுபவங்கள் மற்றும் சிந்தனைகள்.',
      readEntry: 'பதிவை வாசிக்க',
      allEntries: '← அனைத்துப் பதிவுகளும்',
      minRead: '{{count}} நிமிட வாசிப்பு',
      byAuthor: 'எழுதியவர்:',
      publishedUnder: 'வெளியீட்டு உரிமை:',
      source: 'மூலம்',
      notFoundTitle: 'குறிப்பேட்டுப் பதிவு காணப்படவில்லை',
      returnToJournal: 'மீண்டும் குறிப்பேட்டிற்குச் செல்ல',
    },
    classroom: {
      eyebrow: 'கல்வி மற்றும் கற்றல் சோலை',
      curatedBy: 'வழிகாட்டுதல்: {{name}}',
      returnRollCall: 'வருகைப் பதிவேட்டிற்கு',
      openGradebook: 'மதிப்பெண் ஏட்டிற்கு',
      enrolledStudents: 'பதிவுசெய்த மாணவர்கள்',
      activeLearners: 'செயலில் உள்ள மாணவர்கள்',
      curriculumUnits: 'பாட அலகுகள்',
      completed: 'நிறைவடைந்தது',
      activeAssignments: 'செயலில் உள்ள ஒப்படைப்புகள்',
      dueThisCycle: 'இக்காலப்பகுதியில் சமர்ப்பிக்க வேண்டியவை',
      reflectiveNotes: 'சிந்தனைக் குறிப்புகள்',
      insights: 'வகுப்பறை மனநிலை',
      tabStudents: 'மாணவர்கள்',
      tabLessons: 'பாட அலகுகள்',
      tabAssignments: 'ஒப்படைப்புகள்',
      tabNotes: 'களக் குறிப்புகள்',
      workspaceBreadcrumb: 'களம்',
      classroomsBreadcrumb: 'வகுப்பறைகள்',
    },
    tuition: {
      backToWorkspace: '← வருகைக் களத்திற்குத் திரும்புக',
      title: 'கட்டணங்களும் தவணைக் கொடுப்பனவுகளும்',
      offlineLedger: 'இணைப்பற்ற கணக்கேடு செயலில்',
      liveSync: 'நேரலை இணைப்பு இயங்குகிறது',
      collected: 'இதுவரை பெறப்பட்ட தொகை',
      outstanding: 'நிலுவைத் தொகை',
      filterAll: 'அனைத்துப் பதிவுகளும்',
      filterPaid: 'செலுத்தப்பட்டது',
      filterPending: 'நிலுவை',
      filterOverdue: 'தவணை கடந்தது',
    },
  },
};

/**
 * Deep merge helper to combine core localization JSONs with web UI dictionaries
 */
function mergeDeep(target: any, source: any): any {
  if (!source) return target;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      key in target &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      output[key] = mergeDeep(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

export const MERGED_DICTIONARIES: Record<SupportedLocale, TranslationTree> = {
  en: mergeDeep(coreEn, WEB_DICTIONARIES.en),
  si: mergeDeep(coreSi, WEB_DICTIONARIES.si),
  ta: mergeDeep(coreTa, WEB_DICTIONARIES.ta),
};

/**
 * Dot-notation resolver with parameter interpolation and fallback to English
 */
export function getTranslation(
  locale: SupportedLocale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = MERGED_DICTIONARIES[locale] ?? MERGED_DICTIONARIES.en;
  let value = resolveKey(dict, key);

  if (value === undefined && locale !== 'en') {
    value = resolveKey(MERGED_DICTIONARIES.en, key);
  }

  if (value === undefined) {
    return key;
  }

  if (typeof value !== 'string') {
    return String(value);
  }

  if (params) {
    return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, varName) => {
      return varName in params ? String(params[varName]) : `{{${varName}}}`;
    });
  }

  return value;
}

function resolveKey(obj: any, key: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  if (key in obj) return obj[key];
  const parts = key.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  return current;
}
