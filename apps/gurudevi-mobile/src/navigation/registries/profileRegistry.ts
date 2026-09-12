import { RefreshCw, Settings, ShieldCheck, User, Users } from '@repo/ui/icons';
import type { MobileDomainRegistry } from './types';

export const profileRegistry: MobileDomainRegistry = {
  domain: 'profile',
  title: 'Identity & Sanctuary Hub',
  subtitle: 'Personal Profile, Preferences & Security',
  items: [
    {
      id: 'prof-identity',
      title: 'Identity & Credentials',
      description: 'Account security, verified school bonds & profile details',
      route: '/profile',
      icon: User,
      defaultSubTab: true,
    },
    {
      id: 'prof-perspectives',
      title: 'Sanctuary Perspectives',
      description: 'Switch between Personal, Institutional and Guardian personas',
      route: '/profile',
      icon: Users,
    },
    {
      id: 'prof-settings',
      title: 'App Settings & Navigation',
      description: 'Header style, active sub-tabs, theme, language & preferences',
      route: '/settings',
      icon: Settings,
    },
    {
      id: 'prof-sync',
      title: 'Offline Sync & Diagnostics',
      description: 'Local database health, pending sync queue & storage state',
      route: '/profile',
      icon: RefreshCw,
    },
    {
      id: 'prof-security',
      title: 'Privacy & Data Protection',
      description: 'Audit logs, security keys and data retention policies',
      route: '/profile',
      icon: ShieldCheck,
    },
  ],
};
