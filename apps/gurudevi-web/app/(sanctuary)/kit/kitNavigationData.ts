export interface KitComponentEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  badge?: string;
  route?: string;
}

export interface KitCategoryGroup {
  id: string;
  title: string;
  icon: string;
  components: KitComponentEntry[];
}

export const KIT_CATEGORIES: KitCategoryGroup[] = [
  {
    id: 'temporal',
    title: 'Temporal & Circadian',
    icon: '⏳',
    components: [
      {
        id: 'date',
        name: 'Date (Temporal Navigator)',
        description: 'Adaptive 4-tier date control that gracefully degrades: Full Floor Bar -> Medium Bar -> Compact Pill -> Nano Badge.',
        category: 'temporal',
        badge: 'Core · Adaptive',
        route: '/kit/components/temporal-horizon',
      },
      {
        id: 'time',
        name: 'Time',
        description: 'Minimalist ticking analog SVG clock + digital readout with instant 12h/24h toggle.',
        category: 'temporal',
        badge: 'Minimal · Live',
        route: '/kit/components/temporal-horizon#time',
      },
      {
        id: 'date-time-combo',
        name: 'DateTimeCombo',
        description: 'Unified master control integrating Date Horizon and Time with decoupled dismissal.',
        category: 'temporal',
        badge: 'Unified',
        route: '/kit/components/temporal-horizon#date-time-combo',
      },
      {
        id: 'scroll-area',
        name: 'ScrollArea',
        description: 'Owned horizontal scroll area with physical mouse-wheel normalization, canvas grab-to-pan, and luminous hairline tracking.',
        category: 'temporal',
        badge: 'Zero-OS Scrollbar',
        route: '/kit/components/temporal-horizon#scroll-area',
      },
      {
        id: 'temporal-orbit',
        name: 'Temporal Orbit (Spatial Spots)',
        description: 'Celestial diurnal arc visualizing time as circadian spots and habitat loci rather than flat 1D tapes.',
        category: 'temporal',
        badge: 'Spatial',
        route: '/kit/components/temporal-horizon',
      },
      {
        id: 'floor-redesign',
        name: 'Floor & Horizon Redesign (Polished Prototype)',
        description: 'Intentional UI redesign: cohesive frosted glass hero console, de-cluttered temporal dock, and anchored action bars.',
        category: 'temporal',
        badge: 'New Prototype',
        route: '/kit/floor-redesign',
      },
    ],
  },
  {
    id: 'shell',
    title: 'App Shell & Navigation',
    icon: '🧭',
    components: [
      {
        id: 'app-header',
        name: 'AppHeader',
        description: 'Global sanctuary header with identity, perspective switcher, search, and action slots.',
        category: 'shell',
      },
      {
        id: 'task-tabs',
        name: 'TaskTabs (TaskStrip)',
        description: 'Horizontal workbench task strip for multi-tasking sessions with reordering and close actions.',
        category: 'shell',
      },
      {
        id: 'breadcrumb',
        name: 'Breadcrumb',
        description: 'Spatial hierarchy breadcrumbs reflecting current domain floor navigation.',
        category: 'shell',
      },
    ],
  },
  {
    id: 'actions',
    title: 'Actions & Buttons',
    icon: '⚡',
    components: [
      {
        id: 'button',
        name: 'Button',
        description: 'Multi-variant button (Primary, Secondary, Quiet, Danger) with loading spinner states.',
        category: 'actions',
      },
      {
        id: 'icon-button',
        name: 'IconButton',
        description: 'Accessible round or square icon button with tooltip support.',
        category: 'actions',
      },
      {
        id: 'fab-menu',
        name: 'FabMenu & ActionFab',
        description: 'Floating action menu for rapid contextual task creation.',
        category: 'actions',
      },
    ],
  },
  {
    id: 'forms',
    title: 'Forms & Inputs',
    icon: '✍️',
    components: [
      {
        id: 'text-field',
        name: 'TextField',
        description: 'Living input field with floating label, hint, and validation error states.',
        category: 'forms',
      },
      {
        id: 'switch-row',
        name: 'SwitchRow',
        description: 'Accessible binary toggle with title and descriptive subtitle.',
        category: 'forms',
      },
      {
        id: 'checkbox',
        name: 'Checkbox',
        description: 'Accessible check control with indeterminate and selected states.',
        category: 'forms',
      },
      {
        id: 'choice-question',
        name: 'ChoiceQuestion & Scale',
        description: 'Survey, discernment, and pedagogical rubric choice scales.',
        category: 'forms',
      },
    ],
  },
  {
    id: 'collections',
    title: 'Collections & Virtualization',
    icon: '📚',
    components: [
      {
        id: 'message-list',
        name: 'MessageList (LegendList)',
        description: 'High-performance virtualized conversational stream supporting 1,000+ items.',
        category: 'collections',
      },
      {
        id: 'rail',
        name: 'Rail & Carousel',
        description: 'Horizontal snapping cards and virtualized discovery rails.',
        category: 'collections',
      },
      {
        id: 'card',
        name: 'Card & Surface',
        description: 'Tactile elevated containers adhering to the world engine elevation recipes.',
        category: 'collections',
      },
      {
        id: 'practice-cards',
        name: 'Practice & Feature Cards (4 Candidates)',
        description: 'Elite, spacious, minimal feature cards with emoji anchors, micro-meta, accessible tooltips, and ••• orientation popovers across 4 container gears.',
        category: 'collections',
        badge: 'New · 4 Candidates',
      },
      {
        id: 'self-floor-paradigms',
        name: 'Self Floor Reorganization & Progressive Disclosure',
        description: 'Comparative arena exploring 4 spatial paradigms (Hearth Mosaic, Dual-Rail, Sadhana Table, Bento Studio) with live Pebble integration.',
        category: 'collections',
        badge: 'Interactive · 4 Paradigms',
        route: '/kit/self',
      },
    ],
  },
  {
    id: 'overlays',
    title: 'Overlays & Dialogs',
    icon: '🪟',
    components: [
      {
        id: 'dialog',
        name: 'Dialog (Modal)',
        description: 'Accessible dialog overlay with backdrop dismiss, escape trap, and focus lock.',
        category: 'overlays',
      },
      {
        id: 'sheet',
        name: 'Sheet (Bottom Drawer)',
        description: 'Mobile-first bottom sheet drawer for dense contextual workflows.',
        category: 'overlays',
      },
    ],
  },
  {
    id: 'language',
    title: 'Language & Locale',
    icon: '🌐',
    components: [
      {
        id: 'language-exhibition',
        name: 'Language Selectors Exhibition',
        description: 'Side-by-side comparative arena showing all existing language switchers across web, mobile, marketing, and settings.',
        category: 'language',
        badge: 'Audit Arena',
      },
    ],
  },
];
