'use client';

import { getMaxPinnedForWorkspace } from '@repo/core/logic/workspace/canvas';
import {
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
  null,
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

export function scoreFeatureForRoles(
  feature: SelfFeatureManifestItem,
  roles: readonly string[],
  phase: 'morning' | 'afternoon' | 'night',
): number {
  const activeRoles = roles.length > 0 ? roles : ['teacher'];
  const maxRoleWeight = Math.max(
    ...activeRoles.map((r) => {
      const w = feature.roleWeights?.[r as keyof typeof feature.roleWeights];
      return typeof w === 'number' ? w : 50;
    }),
  );
  const timingBonus = feature.timing?.preferredPhase === phase ? 25 : 0;
  return maxRoleWeight + timingBonus - (feature.defaultOrder * 0.01);
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
  const phase = useMemo(() => getCircadianPhase(), []);
  const activeRoles = useMemo(() => {
    if (roles && roles.length > 0) return roles;
    if (role) return [role];
    return ['teacher'];
  }, [role, roles]);

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
    for (const feature of SELF_FEATURE_MANIFEST.all) {
      const list = map.get(feature.category);
      if (list) {
        list.push(feature);
      }
    }
    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          scoreFeatureForRoles(b, activeRoles, phase) -
          scoreFeatureForRoles(a, activeRoles, phase),
      );
    }
    return map;
  }, [activeRoles, phase]);

  const sortedManifestAll = useMemo(() => {
    return [...SELF_FEATURE_MANIFEST.all].sort(
      (a, b) =>
        scoreFeatureForRoles(b, activeRoles, phase) -
        scoreFeatureForRoles(a, activeRoles, phase),
    );
  }, [activeRoles, phase]);

  // Resolve pinned features
  const pinnedFeatures = useMemo(() => {
    const resolved: SelfFeatureManifestItem[] = [];
    for (const id of pinnedIds) {
      const feature = SELF_FEATURE_MANIFEST.all.find((f) => f.id === id);
      if (feature) resolved.push(feature);
    }
    return resolved;
  }, [pinnedIds]);

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
    pinnedIds,
    pinnedFeatures,
    togglePin,
    appearance: appearanceHook.appearance,
    setAppearance: appearanceHook.setAppearance,
    resetAppearance: appearanceHook.resetAppearance,
    status: appearanceHook.status,
    setGroupOrder: appearanceHook.setGroupOrder,
    phase,
  };
}
