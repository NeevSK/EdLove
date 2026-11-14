import { defineFeatureLifecycle } from '@repo/core/logic/registry/domainEntry';
import { TIMELESS, timeProfile } from '@repo/core/logic/registry/timeProfile';
import type { DomainFeature } from '@repo/core/types';

const REGISTRY_LIFECYCLE = defineFeatureLifecycle({
  owner: 'profile',
  createdAt: '2026-11-14',
  reviewAt: '2027-02-14',
  permanentJustification: 'Stable catalog capability governed by the AppCatalog owner.',
});

/**
 * Profile is who you are across every bond: the same room for everyone. The
 * card first, then your places, your journey, and the account's care. Every
 * entry reads the person's own profile, which stays readable while the
 * server's capabilities load.
 */
const own = {
  ownerPackage: 'profile',
  citizenshipRequired: 3,
  mobileSupport: true,
  webSupport: false,
  state: 'live',
  lifecycle: REGISTRY_LIFECYCLE,
  tabDomain: 'profile',
  common: true,
  capabilityRequirement: { action: 'read', subject: 'OwnProfile' },
} as const;

export const PROFILE_REGISTRY: Record<string, DomainFeature> = {
  'profile-card': {
    ...own,
    id: 'profile-card',
    surfaceId: 'profile-card',
    defaultZone: 'today',
    defaultOrder: 10,
    floor: { group: 'you', shape: 'card', lit: true },
    time: TIMELESS,
    label: 'Your card',
    analyticsKey: 'profile.card',
  },
  'profile-bonds': {
    ...own,
    id: 'profile-bonds',
    surfaceId: 'profile-bonds',
    defaultOrder: 20,
    floor: { group: 'bonds', shape: 'list' },
    time: TIMELESS,
    label: 'Schools and roles',
    description: 'Every place you belong and the role you hold there',
    analyticsKey: 'profile.bonds',
  },
  'profile-invite': {
    ...own,
    id: 'profile-invite',
    surfaceId: 'profile-invite',
    defaultOrder: 30,
    floor: { group: 'bonds', shape: 'row', task: true },
    time: TIMELESS,
    label: 'Join with a code',
    analyticsKey: 'profile.invite',
  },
  'profile-achievements': {
    ...own,
    id: 'profile-achievements',
    surfaceId: 'profile-achievements',
    defaultOrder: 40,
    floor: { group: 'journey', shape: 'rail' },
    time: timeProfile('review', ['review'], 'sealed'),
    label: 'Achievements',
    analyticsKey: 'profile.achievements',
  },
  'profile-record': {
    ...own,
    id: 'profile-record',
    surfaceId: 'profile-record',
    defaultOrder: 50,
    floor: { group: 'journey', shape: 'card', urgency: 'anytime' },
    time: timeProfile('review', ['review'], 'sealed'),
    label: 'Your record',
    analyticsKey: 'profile.record',
  },
  'profile-security': {
    ...own,
    id: 'profile-security',
    surfaceId: 'profile-security',
    defaultOrder: 60,
    floor: { group: 'account', shape: 'row' },
    time: TIMELESS,
    label: 'Sign-in and devices',
    analyticsKey: 'profile.security',
  },
  'profile-privacy': {
    ...own,
    id: 'profile-privacy',
    surfaceId: 'profile-privacy',
    defaultOrder: 70,
    floor: { group: 'account', shape: 'row' },
    time: TIMELESS,
    label: 'Privacy',
    analyticsKey: 'profile.privacy',
  },
  'profile-settings': {
    ...own,
    id: 'profile-settings',
    surfaceId: 'profile-settings',
    defaultOrder: 80,
    floor: { group: 'account', shape: 'row' },
    time: TIMELESS,
    label: 'Settings',
    routes: { mobile: '/settings' },
    analyticsKey: 'profile.settings',
  },
};
