'use client';

import { createSupabaseWorkspaceLayoutRepository } from '@repo/core/adapters/supabase/workspaceLayoutRepository';
import {
  createDefaultWorkspaceLayout,
  setWorkspaceAppearance,
} from '@repo/core/logic/workspace/canvas';
import {
  appearanceForSync,
  mergeSavedGround,
  WORLD_GROUND_ID,
} from '@repo/core/logic/workspace/ground';
import {
  toWorkspaceLayoutRecord,
  toWorkspaceLayoutUpsert,
} from '@repo/core/logic/workspace/layoutSync';
import type { WorkspaceAppearance } from '@repo/core/types';
import { useSyncExternalStore } from 'react';
import { createBrowserSupabaseClient } from '../supabase/browser';

/**
 * The world's look: one store for the whole app. Every screen (rooms, profile, settings,
 * notifications, a book in the reader) reads it and any of them can change it, so a change shows
 * everywhere at once. It is saved on this browser and, for a signed-in account, with the account
 * (the `shared` layout, so the phone gets it too).
 *
 * Whose look it is: the account a floor names. Screens that name no account use the last one this
 * browser used (stored by id only), so an inner screen opened directly still shows that look.
 */

export const THIS_BROWSER = 'this-browser';
const OWNER_KEY = 'gurudevi_world_look_owner';
const TARGETS = ['shared', 'web', 'mobile'] as const;

export interface WorldLookSnapshot {
  readonly owner: string;
  readonly look: WorkspaceAppearance | null;
  /** Whether a screen-wide ground is drawn (the app shell), so floors need not draw their own. */
  readonly shellGround: boolean;
}

function storageKey(owner: string, target: string): string {
  // Same key shape as the per-room looks (`useBrowserWorkspaceAppearance`), so earlier saves count.
  return `workspace-appearance:${WORLD_GROUND_ID}:${target}:${owner}`;
}

function isSyncedOwner(owner: string): boolean {
  return (
    owner !== THIS_BROWSER &&
    owner !== 'explore' &&
    owner !== 'explore-guest' &&
    owner !== 'guest-explorer'
  );
}

function readLook(owner: string): WorkspaceAppearance | null {
  if (typeof window === 'undefined') return null;
  let best: WorkspaceAppearance | null = null;
  for (const target of TARGETS) {
    try {
      const raw = window.localStorage.getItem(storageKey(owner, target));
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') continue;
      const look = parsed as WorkspaceAppearance;
      if (typeof look.preset !== 'string' || typeof look.motion !== 'string') continue;
      best = mergeSavedGround(best, look);
    } catch {
      // A broken copy is skipped; the others still count.
    }
  }
  return best;
}

function writeLook(owner: string, look: WorkspaceAppearance): void {
  try {
    window.localStorage.setItem(storageKey(owner, 'shared'), JSON.stringify(look));
  } catch {
    // Storage full or blocked: the look still shows for this visit.
  }
}

function readOwner(): string {
  if (typeof window === 'undefined') return THIS_BROWSER;
  try {
    return window.localStorage.getItem(OWNER_KEY) || THIS_BROWSER;
  } catch {
    return THIS_BROWSER;
  }
}

const SERVER: WorldLookSnapshot = { owner: THIS_BROWSER, look: null, shellGround: false };
let snapshot: WorldLookSnapshot | null = null;
let shellGrounds = 0;
const pulled = new Set<string>();
const listeners = new Set<() => void>();

function current(): WorldLookSnapshot {
  if (!snapshot) {
    const owner = readOwner();
    snapshot = { owner, look: readLook(owner), shellGround: shellGrounds > 0 };
  }
  return snapshot;
}

function emit(next: WorldLookSnapshot): void {
  snapshot = next;
  for (const listener of listeners) listener();
}

async function pullRemote(owner: string): Promise<void> {
  if (!isSyncedOwner(owner)) return;
  const client = createBrowserSupabaseClient();
  if (!client) return;
  try {
    const repository = createSupabaseWorkspaceLayoutRepository(client);
    const record = await repository.getLayout(owner, WORLD_GROUND_ID, 'shared');
    const remote = record ? toWorkspaceLayoutRecord(record).appearance : undefined;
    const state = current();
    if (state.owner !== owner || !remote) return;
    const merged = mergeSavedGround(state.look, remote);
    if (merged && merged !== state.look) {
      writeLook(owner, merged);
      emit({ ...state, look: merged });
    }
  } catch {
    // Offline: this browser's copy stands.
  }
}

async function pushRemote(owner: string, look: WorkspaceAppearance): Promise<void> {
  if (!isSyncedOwner(owner)) return;
  const client = createBrowserSupabaseClient();
  if (!client) return;
  try {
    const repository = createSupabaseWorkspaceLayoutRepository(client);
    const existing = await repository.getLayout(owner, WORLD_GROUND_ID, 'shared');
    const layout = existing
      ? toWorkspaceLayoutRecord(existing)
      : createDefaultWorkspaceLayout({ workspaceId: WORLD_GROUND_ID, userId: owner, surfaces: [] });
    await repository.upsertLayout(
      toWorkspaceLayoutUpsert(setWorkspaceAppearance(layout, appearanceForSync(look)), {
        userId: owner,
        workspaceId: WORLD_GROUND_ID,
        layoutTarget: 'shared',
      }),
    );
  } catch {
    // Offline: saved on this browser; the next change carries it.
  }
}

export const worldLookStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key?.startsWith(`workspace-appearance:${WORLD_GROUND_ID}:`)) {
        const state = current();
        emit({ ...state, look: readLook(state.owner) });
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
    };
  },
  getSnapshot: current,
  getServerSnapshot: (): WorldLookSnapshot => SERVER,

  /** A screen names whose look it shows (a floor knows its account). */
  useOwner(owner: string | undefined): void {
    if (!owner) return;
    const state = current();
    if (state.owner === owner) {
      if (!pulled.has(owner)) {
        pulled.add(owner);
        void pullRemote(owner);
      }
      return;
    }
    pulled.add(owner);
    try {
      window.localStorage.setItem(OWNER_KEY, owner);
    } catch {
      // Not remembered for next time; fine for this visit.
    }
    emit({ ...state, owner, look: readLook(owner) });
    void pullRemote(owner);
  },

  set(look: WorkspaceAppearance): void {
    const state = current();
    writeLook(state.owner, look);
    emit({ ...state, look });
    void pushRemote(state.owner, look);
  },

  /** The app shell says it draws the ground for every screen while mounted. */
  holdShellGround(): () => void {
    shellGrounds += 1;
    emit({ ...current(), shellGround: true });
    return () => {
      shellGrounds -= 1;
      emit({ ...current(), shellGround: shellGrounds > 0 });
    };
  },

  /** Tests only: forget everything in memory. */
  reset(): void {
    snapshot = null;
    shellGrounds = 0;
    pulled.clear();
  },
};

export function useWorldLook(): WorldLookSnapshot {
  return useSyncExternalStore(
    worldLookStore.subscribe,
    worldLookStore.getSnapshot,
    worldLookStore.getServerSnapshot,
  );
}
