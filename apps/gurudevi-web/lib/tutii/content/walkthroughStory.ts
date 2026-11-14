// apps/gurudevi-web/lib/tutii/content/walkthroughStory.ts

export type MainNavId = 'self' | 'workspace' | 'community' | 'library';

export interface NavTabContent {
  id: MainNavId;
  label: string;
  icon: string;
  sublabel: string;
  tutiiTip: string;
  previewDetail: string;
}

export interface WalkthroughBeatContent {
  id: string;
  tutiiSays: string;
  tutiiMood: 'greeting' | 'explaining' | 'excited' | 'proud';
  cardTitle?: string;
  cardDescription?: string;
  buttonLabel?: string;
}

export interface WalkthroughContentSchema {
  introBeat: WalkthroughBeatContent;
  appManifestBeat: WalkthroughBeatContent;
  navTabsBeat: {
    instruction: string;
    advanceButtonLabel: string;
    tabs: NavTabContent[];
  };
  superpowersBeat: {
    title: string;
    eyebrow: string;
    advanceButtonLabel: string;
    offlineTitle: string;
    offlineDropPrompt: string;
    offlineRestorePrompt: string;
    diurnalTitle: string;
    diurnalDescription: string;
    tutiiOnlineTip: string;
    tutiiOfflineTip: string;
  };
  conclusionBeat: {
    title: string;
    eyebrow: string;
    tutiiSays: string;
    doorways: {
      id: string;
      icon: string;
      title: string;
      detail: string;
      actionLabel: string;
      href: string;
    }[];
  };
}

export const DEFAULT_WALKTHROUGH_CONTENT: WalkthroughContentSchema = {
  introBeat: {
    id: 'intro',
    tutiiSays: 'Hey there! Let’s take a quick walk through Gurudevi together.',
    tutiiMood: 'greeting',
    cardTitle: 'Opening the sanctuary doors…',
  },
  appManifestBeat: {
    id: 'app-manifest',
    tutiiSays: 'This is the app. Clean, simple, and built for real school days.',
    tutiiMood: 'explaining',
    cardTitle: 'Gurudevi Sanctuary',
    cardDescription:
      'A unified space for attendance, grades, study routines, and quiet mindfulness.',
    buttonLabel: 'Walk through the main tabs',
  },
  navTabsBeat: {
    instruction: 'Click a tab to explore what it does',
    advanceButtonLabel: 'Check out the special superpowers',
    tabs: [
      {
        id: 'self',
        label: 'Self',
        icon: '💗',
        sublabel: 'Personal Sanctuary',
        tutiiTip:
          'This is your private space. Your daily reflections, mood lotus, and quiet goals live here—never visible to schools or admins.',
        previewDetail:
          'Includes your private Fire Journal, Mood Lotus, and 2-minute harmonic singing bowl breathing breaks.',
      },
      {
        id: 'workspace',
        label: 'Workspace',
        icon: '🏫',
        sublabel: 'Classroom & School',
        tutiiTip:
          'This is where real school work happens. Fast attendance roll calls, grading, and term timetables in seconds.',
        previewDetail:
          'Includes 1-tap roll call, offline-first grade records, academic cycle calendars, and term pacing.',
      },
      {
        id: 'community',
        label: 'Community',
        icon: '🤝',
        sublabel: 'School Circles',
        tutiiTip:
          'Connect with other teachers, circulars, and classroom announcements without WhatsApp spam.',
        previewDetail:
          'Quiet announcements, staff notices, and circulars with zero phone number exposure.',
      },
      {
        id: 'library',
        label: 'Library',
        icon: '📚',
        sublabel: 'Curated Knowledge',
        tutiiTip:
          'Verified pedagogical resources, textbooks, and curriculum materials shared across schools.',
        previewDetail:
          'Curated ministry guidelines, verified lesson plans, and textbooks indexed by grade level.',
      },
    ],
  },
  superpowersBeat: {
    title: 'Offline Vault & Natural Rhythm',
    eyebrow: 'Built For Real Conditions',
    advanceButtonLabel: 'Finish Walkthrough',
    offlineTitle: 'Offline Device Vault',
    offlineDropPrompt: 'Cut Signal (Simulate Drop)',
    offlineRestorePrompt: 'Restore Wi-Fi',
    diurnalTitle: 'Diurnal Visual Rhythm',
    diurnalDescription: 'Colors shift with sunrise, noon, dusk, and night.',
    tutiiOnlineTip: 'Try flipping the Wi-Fi switch or changing day/night rhythm below.',
    tutiiOfflineTip:
      'Notice that? No signal, but your app never halts. Everything saves to your device memory.',
  },
  conclusionBeat: {
    title: 'You know the flow now.',
    eyebrow: 'Walkthrough Complete',
    tutiiSays: 'That’s the whole flow! You’re ready to step into your school day.',
    doorways: [
      {
        id: 'workspace-doorway',
        icon: '🏫',
        title: 'Open Workspace',
        detail: 'Try the real classroom attendance desk.',
        actionLabel: 'Enter Workspace',
        href: '/workspace?task=attendance',
      },
      {
        id: 'self-doorway',
        icon: '💗',
        title: 'Open Self Sanctuary',
        detail: 'Your personal space for calm & study.',
        actionLabel: 'Enter Self',
        href: '/self',
      },
    ],
  },
};
