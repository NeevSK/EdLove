// apps/gurudevi-web/lib/tutii/content/headerControlsStory.ts

export type HeaderControlId = 'search' | 'theme' | 'support' | 'notifications' | 'profile';

export interface HeaderControlInfo {
  id: HeaderControlId;
  label: string;
  iconName: string; // 'search' | 'sun' | 'help' | 'bell' | 'user'
  badgeText?: string;
  tutiiSentence: string;
  previewTitle: string;
  previewDetail: string;
}

export const HEADER_CONTROLS: Record<HeaderControlId, HeaderControlInfo> = {
  search: {
    id: 'search',
    label: 'Search',
    iconName: 'search',
    badgeText: 'Ctrl+K',
    tutiiSentence:
      'Search is your instant teleporter. Press Ctrl+K anytime to jump straight to any student, gradebook, or room in half a second.',
    previewTitle: 'Omni Command Palette',
    previewDetail:
      'Jump to students • Find attendance sheets • Switch terms without clicking through menus',
  },
  theme: {
    id: 'theme',
    label: 'Day & Night Rhythm',
    iconName: 'sun',
    tutiiSentence:
      'This shifts your visual rhythm. Warm dawn tones for early mornings, soft dusk and quiet dark mode so your eyes never hurt.',
    previewTitle: 'Diurnal Atmosphere Engine',
    previewDetail:
      'Auto-adapts with sunrise & sunset • 11 Cultural Worlds • APCA high-contrast text comfort',
  },
  support: {
    id: 'support',
    label: 'Help & Whisper Lines',
    iconName: 'help',
    tutiiSentence:
      'Whenever you have a question or notice an error, tap Help. You can chat with our team, see guides, or call tutii back.',
    previewTitle: 'Sanctuary Help Desk',
    previewDetail:
      'Direct teacher lines • Offline recovery guidance • Instant answers to everyday questions',
  },
  notifications: {
    id: 'notifications',
    label: 'Notifications',
    iconName: 'bell',
    badgeText: '3',
    tutiiSentence:
      'Your clean bell. Only essential school circulars and grade receipts land here—no spam, no constant pinging.',
    previewTitle: 'Quiet Attention Feed',
    previewDetail:
      'Exam lockdown notices • Term sign-off receipts • School circulars delivered in peace',
  },
  profile: {
    id: 'profile',
    label: 'Identity & Roles',
    iconName: 'user',
    tutiiSentence:
      'This is your verified identity. Check your active teaching credentials, switch school roles, or manage your personal vault.',
    previewTitle: 'Account & Sovereign Key',
    previewDetail:
      'EdLove canonical identity • Multi-school bond switcher • Passkey & session security',
  },
};

export const HEADER_CONTROL_ORDER: HeaderControlId[] = [
  'search',
  'theme',
  'support',
  'notifications',
  'profile',
];
