'use client';

import { getMaxPinnedForWorkspace } from '@repo/core/logic/workspace/canvas';
import {
  createSelfAccessContext,
  resolveSelfFeatureManifest,
  type SelfFeatureManifestItem,
} from '@repo/self/features/catalog';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BROWSER_SELF_FEATURES } from '../../app/(sanctuary)/self/browserFeatureRegistry';
import { useBrowserWorkspaceAppearance } from './useBrowserWorkspaceAppearance';

export type SelfCategory = SelfFeatureManifestItem['category'];

export const DEFAULT_SELF_CATEGORIES: readonly SelfCategory[] = [
  'identity',
  'wellbeing',
  'growth',
  'practice',
  'professional',
] as const;

export type ViewportKind = 'mobile' | 'tablet' | 'desktop';
export type SelfLayoutMode = 'overview' | 'master-detail' | 'stream';

const SELF_PIN_STORAGE_KEY = (accountId: string) => `workspace-pinned:self:${accountId}`;
const DEFAULT_PINNED_IDS = ['fire_journal'];
const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

export const SELF_FEATURE_MANIFEST = resolveSelfFeatureManifest(
  createSelfAccessContext({ isExplore: true }),
  {
    customOrder: [],
    hiddenIds: [],
    selectedIds: [],
  },
  'browser',
  { deliveredFeatureIds: Object.keys(BROWSER_SELF_FEATURES) },
);

function readPinnedIds(key: string): string[] {
  if (typeof window === 'undefined') return [...DEFAULT_PINNED_IDS];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [...DEFAULT_PINNED_IDS];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')) {
      return parsed.length > 0 ? parsed : [...DEFAULT_PINNED_IDS];
    }
    return [...DEFAULT_PINNED_IDS];
  } catch {
    return [...DEFAULT_PINNED_IDS];
  }
}

function writePinnedIds(key: string, ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Ignore localStorage write failures in restricted browser environments
  }
}

export function getCircadianPhase(): 'morning' | 'afternoon' | 'night' {
  if (typeof window === 'undefined') return 'morning';
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}

export function isFeatureApplicableToRole(
  feature: SelfFeatureManifestItem,
  role?: string,
): boolean {
  if (!role || role === 'all') return true;
  const weights = feature.roleWeights;
  if (!weights || Object.keys(weights).length === 0) return true;
  const normalized = role.toLowerCase() as keyof typeof weights;
  const weight = weights[normalized];
  return typeof weight === 'number' && weight > 0;
}

export function isUniversalFeature(feature: SelfFeatureManifestItem): boolean {
  // 1. Universal practice domains & core personal reflection
  const universalDomains = ['pulse', 'care', 'reflection', 'journey'];
  if (feature.domain && universalDomains.includes(feature.domain)) return true;

  // 2. Canonical Cedar resources open to any human irrespective of institutional standing
  const universalResources: readonly string[] = [
    'FireJournal',
    'MoodLog',
    'Wellbeing',
    'JoyMoments',
    'GratitudeEntries',
    'EnergyForecasts',
    'LearningReflection',
    'User',
  ];
  const cedarResource = (feature as any).cedar?.resource;
  if (cedarResource && universalResources.includes(cedarResource)) return true;

  // 3. Fallback: if all four major educational capacities (teacher, student, principal, guardian) have weights > 0
  const weights = feature.roleWeights;
  if (!weights || Object.keys(weights).length === 0) return true;
  const primaryRoles = ['teacher', 'student', 'principal', 'guardian'] as const;
  return primaryRoles.every((r) => {
    const w = weights[r];
    return typeof w === 'number' && w > 0;
  });
}

export function isFeatureForCapacity(
  feature: SelfFeatureManifestItem,
  primaryCapacity?: string,
  otherCapacities?: readonly string[],
): boolean {
  // Universal practices are always available to all human beings
  if (isUniversalFeature(feature)) return true;

  const normalizedPrimary = primaryCapacity?.toLowerCase();
  if (normalizedPrimary && normalizedPrimary !== 'all') {
    if (isFeatureApplicableToRole(feature, normalizedPrimary)) return true;
  }

  if (otherCapacities && otherCapacities.length > 0) {
    for (const sec of otherCapacities) {
      if (sec && isFeatureApplicableToRole(feature, sec.toLowerCase())) return true;
    }
  }

  // If no capacity specified at all, default to showing
  if (!normalizedPrimary) return true;

  return false;
}

export function scoreFeatureForRoles(
  feature: SelfFeatureManifestItem,
  roles: readonly string[],
  phase: 'morning' | 'afternoon' | 'night',
  usageInfo?: { lastUsedAt?: number | string; count?: number; isPinned?: boolean },
  primaryRole?: string,
): number {
  const activeRoles = roles.length > 0 ? roles : ['teacher'];

  // 1. Time-of-day alignment: +50 priority if it matches current circadian phase
  const isTimeMatch = feature.timing?.preferredPhase === phase;
  const timeBonus = isTimeMatch ? 50 : 0;

  // 2. Role membership:
  // Primary capacity focus (>= 80): +30
  // Primary capacity affinity (> 0): +20
  // Secondary capacity focus (>= 80): +15
  // Secondary capacity affinity (> 0): +10
  // Universal practice baseline: +10
  let roleBonus = 0;
  if (primaryRole) {
    const pw = feature.roleWeights?.[primaryRole.toLowerCase() as keyof typeof feature.roleWeights];
    if (typeof pw === 'number') {
      if (pw >= 80) roleBonus = Math.max(roleBonus, 30);
      else if (pw > 0) roleBonus = Math.max(roleBonus, 20);
    }
  }

  for (const r of activeRoles) {
    if (primaryRole && r.toLowerCase() === primaryRole.toLowerCase()) continue;
    const w = feature.roleWeights?.[r.toLowerCase() as keyof typeof feature.roleWeights];
    if (typeof w === 'number') {
      if (w >= 80) roleBonus = Math.max(roleBonus, 15);
      else if (w > 0) roleBonus = Math.max(roleBonus, 10);
    }
  }

  if (isUniversalFeature(feature)) {
    roleBonus = Math.max(roleBonus, 10);
  }

  // 3. Pinned & recent usage priority
  let usageBonus = 0;
  if (usageInfo?.isPinned) usageBonus += 15;
  if (usageInfo?.lastUsedAt) {
    const time =
      typeof usageInfo.lastUsedAt === 'number'
        ? usageInfo.lastUsedAt
        : Date.parse(usageInfo.lastUsedAt) || 0;
    const hoursAgo = (Date.now() - time) / (1000 * 60 * 60);
    if (hoursAgo < 24) usageBonus += 10;
  }
  if (usageInfo?.count && usageInfo.count > 0) {
    usageBonus += Math.min(usageInfo.count, 5);
  }

  return timeBonus + roleBonus + usageBonus;
}

export interface UseSelfCanvasOptions {
  readonly accountId?: string;
  readonly enableRemoteSync?: boolean;
  readonly activeFeatureId?: string | null;
  readonly role?: string;
  readonly roles?: readonly string[];
}

export function useSelfCanvas({
  accountId = 'anonymous',
  enableRemoteSync = true,
  activeFeatureId = null,
  role,
  roles,
}: UseSelfCanvasOptions = {}) {
  const pinCap = getMaxPinnedForWorkspace('self');
  const [viewport, setViewport] = useState<ViewportKind>('desktop');
  const [phase, setPhase] = useState<'morning' | 'afternoon' | 'night'>('morning');
  useEffect(() => setPhase(getCircadianPhase()), []);
  const activeRoles = useMemo(() => {
    if (roles && roles.length > 0) return roles;
    if (role) return [role];
    return ['teacher'];
  }, [role, roles]);

  const accessContext = useMemo(
    () =>
      createSelfAccessContext({
        userId: accountId,
        role: role ?? activeRoles[0],
        roles: activeRoles,
        capacities: activeRoles as string[],
        isExplore:
          !accountId ||
          accountId === 'explore-guest' ||
          accountId === 'explore' ||
          accountId === 'anonymous',
      }),
    [accountId, role, activeRoles],
  );

  const manifest = useMemo(
    () =>
      resolveSelfFeatureManifest(
        accessContext,
        {
          customOrder: [],
          hiddenIds: [],
          selectedIds: [],
        },
        'browser',
        { deliveredFeatureIds: Object.keys(BROWSER_SELF_FEATURES) },
      ),
    [accessContext],
  );

  const appearanceHook = useBrowserWorkspaceAppearance({
    accountId,
    defaultGroupOrder: DEFAULT_SELF_CATEGORIES,
    defaultPinnedIds: DEFAULT_PINNED_IDS,
    enableRemoteSync,
    workspaceId: 'self',
  });

  const pinnedIds =
    appearanceHook.pinnedIds.length > 0 ? appearanceHook.pinnedIds : [...DEFAULT_PINNED_IDS];

  // Track responsive viewport
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < TABLET_BREAKPOINT) {
        setViewport('mobile');
      } else if (width < DESKTOP_BREAKPOINT) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const togglePin = useCallback(
    (featureId: string) => {
      let updated: string[];
      if (pinnedIds.includes(featureId)) {
        // If unpinning leaves none, retain default fire_journal
        updated = pinnedIds.filter((id) => id !== featureId);
        if (updated.length === 0) {
          updated = [...DEFAULT_PINNED_IDS];
        }
      } else {
        // Pin up to pinCap
        if (pinnedIds.length >= pinCap) {
          updated = [...pinnedIds.slice(1), featureId];
        } else {
          updated = [...pinnedIds, featureId];
        }
      }
      void appearanceHook.setPinnedIds(updated);
    },
    [appearanceHook, pinCap, pinnedIds],
  );

  // Group features by category and sort them dynamically by role & circadian phase
  const featuresByCategory = useMemo(() => {
    const map = new Map<SelfCategory, SelfFeatureManifestItem[]>();
    for (const cat of DEFAULT_SELF_CATEGORIES) {
      map.set(cat, []);
    }
    for (const feature of manifest.all) {
      const list = map.get(feature.category);
      if (list) {
        list.push(feature);
      }
    }
    for (const [, list] of map) {
      list.sort((a, b) => {
        const diff =
          scoreFeatureForRoles(b, activeRoles, phase, undefined, role) -
          scoreFeatureForRoles(a, activeRoles, phase, undefined, role);
        if (diff !== 0) return diff;
        return a.defaultOrder - b.defaultOrder;
      });
    }
    return map;
  }, [activeRoles, manifest.all, phase, role]);

  const sortedManifestAll = useMemo(() => {
    return [...manifest.all].sort((a, b) => {
      const diff =
        scoreFeatureForRoles(b, activeRoles, phase, undefined, role) -
        scoreFeatureForRoles(a, activeRoles, phase, undefined, role);
      if (diff !== 0) return diff;
      return a.defaultOrder - b.defaultOrder;
    });
  }, [activeRoles, manifest.all, phase, role]);

  // Resolve pinned features
  const pinnedFeatures = useMemo(() => {
    const resolved: SelfFeatureManifestItem[] = [];
    for (const id of pinnedIds) {
      const feature = manifest.all.find((f) => f.id === id);
      if (feature) resolved.push(feature);
    }
    return resolved;
  }, [manifest.all, pinnedIds]);

  // Resolve layout mode based on viewport and active feature
  const layoutMode: SelfLayoutMode = useMemo(() => {
    if (!activeFeatureId) {
      return 'overview';
    }
    if (viewport === 'mobile') {
      return 'stream';
    }
    return 'master-detail';
  }, [activeFeatureId, viewport]);

  // Normalized group order
  const groupOrder = useMemo<readonly SelfCategory[]>(() => {
    const raw = appearanceHook.groupOrder;
    const valid = raw.filter((cat): cat is SelfCategory =>
      (DEFAULT_SELF_CATEGORIES as readonly string[]).includes(cat),
    );
    const missing = DEFAULT_SELF_CATEGORIES.filter((cat) => !valid.includes(cat));
    return [...valid, ...missing];
  }, [appearanceHook.groupOrder]);

  return {
    viewport,
    layoutMode,
    groupOrder,
    featuresByCategory,
    sortedManifestAll,
    manifest,
    pinnedIds,
    pinnedFeatures,
    togglePin,
    appearance: appearanceHook.appearance,
    storedAppearance: appearanceHook.stored,
    setAppearance: appearanceHook.setAppearance,
    resetAppearance: appearanceHook.resetAppearance,
    status: appearanceHook.status,
    setGroupOrder: appearanceHook.setGroupOrder,
    phase,
  };
}
