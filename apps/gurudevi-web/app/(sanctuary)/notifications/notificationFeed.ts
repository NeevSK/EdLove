export type NotificationItem = {
  id: string;
  category: 'classrooms' | 'mentors' | 'system' | 'achievements';
  title: string;
  message: string;
  time: string;
  unread: boolean;
  symbol: string;
};

const accountNotifications: readonly NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'classrooms',
    title: 'Attendance marked for Forest Learning Circle',
    message: 'All 3 students have been marked present for today’s integrated morning circle.',
    time: '10m ago',
    unread: true,
    symbol: '◇',
  },
  {
    id: 'notif-2',
    category: 'mentors',
    title: 'Pedagogical feedback on Gradebook assessment',
    message: 'Mrs. Perera published updated competencies for Integrated Mathematics Unit 3.',
    time: '1h ago',
    unread: true,
    symbol: '📊',
  },
  {
    id: 'notif-3',
    category: 'achievements',
    title: 'Mindfulness streak milestone reached',
    message:
      'Your classroom circle maintained a 5-day continuous morning breath reflection streak.',
    time: 'Yesterday',
    unread: false,
    symbol: '♥',
  },
  {
    id: 'notif-4',
    category: 'system',
    title: 'Diurnal rhythm sync: Night atmosphere',
    message:
      'Sanctuary floor has shifted to Night appearance with high-contrast APCA charcoal mode.',
    time: '2d ago',
    unread: false,
    symbol: '⚙',
  },
];

const exploreNotifications: readonly NotificationItem[] = [
  {
    id: 'guest-1',
    category: 'system',
    title: 'Welcome to Gurudevi Guest House',
    message:
      'Explore contemplative learning circles, the wisdom library, and personal journal sandbox with zero registration.',
    time: 'Just now',
    unread: true,
    symbol: '🪷',
  },
  {
    id: 'guest-2',
    category: 'system',
    title: 'Local-First PDPA Privacy Invariant',
    message:
      'Under Sri Lanka PDPA No. 9 of 2022, all guest exploration entries and reflections remain strictly in your browser.',
    time: '5m ago',
    unread: true,
    symbol: '🛡️',
  },
  {
    id: 'guest-3',
    category: 'classrooms',
    title: 'Attendance marked for Forest Learning Circle',
    message:
      'All 3 students have been marked present for today’s integrated morning circle in your local sandbox.',
    time: '12m ago',
    unread: true,
    symbol: '◇',
  },
  {
    id: 'guest-4',
    category: 'classrooms',
    title: 'Gradebook competencies ready for review',
    message:
      'Integrated Science Unit 2 contemplative inquiry rubrics have been populated with sample marks.',
    time: '45m ago',
    unread: true,
    symbol: '▥',
  },
  {
    id: 'guest-5',
    category: 'mentors',
    title: 'Pedagogical inquiry from Elder Somaratne',
    message: '“Notice how the children settle when the morning bell sounds twice instead of once.”',
    time: '2h ago',
    unread: true,
    symbol: '📊',
  },
  {
    id: 'guest-6',
    category: 'mentors',
    title: 'Mentorship circle gathering at Dawn',
    message:
      'Weekly reflection on balancing quiet focus with playful exploration in primary classrooms.',
    time: 'Yesterday',
    unread: false,
    symbol: '🧭',
  },
  {
    id: 'guest-7',
    category: 'achievements',
    title: 'Mindfulness streak milestone reached',
    message:
      'Your classroom circle maintained a 5-day continuous morning breath reflection streak.',
    time: 'Yesterday',
    unread: false,
    symbol: '♥',
  },
  {
    id: 'guest-8',
    category: 'achievements',
    title: 'Sanctuary Gateway Ready',
    message:
      'Ready to join live accredited classroom circles with synchronized records? Enter Sanctuary anytime.',
    time: '1h ago',
    unread: false,
    symbol: '🎓',
  },
];

/** The notifications a surface shows. Both lists are samples until the notification service lands. */
export function notificationFeed(surface: 'explore' | 'sanctuary'): readonly NotificationItem[] {
  return surface === 'explore' ? exploreNotifications : accountNotifications;
}

export function unreadCount(feed: readonly NotificationItem[]): number {
  return feed.filter((item) => item.unread).length;
}
