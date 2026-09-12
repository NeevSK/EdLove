import { Calendar, MessagesSquare, Sparkles, Users } from '@repo/ui/icons';
import type { MobileDomainRegistry } from './types';

export const communityRegistry: MobileDomainRegistry = {
  domain: 'community',
  title: 'Community Common',
  subtitle: 'Circles, Discussions & School Events',
  items: [
    {
      id: 'comm-feed',
      title: 'School Broadcast Feed',
      description: 'Public announcements, community milestones & achievements',
      route: '/community',
      icon: MessagesSquare,
      defaultSubTab: true,
    },
    {
      id: 'comm-circles',
      title: 'Learning Circles & Clubs',
      description: 'Extracurricular societies, peer study groups and interest circles',
      route: '/community',
      icon: Users,
    },
    {
      id: 'comm-events',
      title: 'Community Calendar & Events',
      description: 'Exhibitions, inter-school meets and community sports schedules',
      route: '/community',
      icon: Calendar,
    },
    {
      id: 'comm-mentorship',
      title: 'Alumni & Mentorship Hub',
      description: 'Guidance corridors connecting senior mentors with learners',
      route: '/community',
      icon: Sparkles,
    },
  ],
};
