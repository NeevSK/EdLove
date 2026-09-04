import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import type { MutationOutcome } from '@repo/core/lib/sync/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AuditEntry {
  id: string; // Same UUID as QueuedMutation.id
  idempotencyKey: string;
  scope: string;
  name: string;
  status: MutationOutcome;
  attempts: number;
  queuedAt: number; // Unix ms
  updatedAt: number; // Last status change
  summary?: string;
  syncedAt?: number;
  lastError?: string;
}

interface MutationAuditLogState {
  entries: AuditEntry[];
  logEntry: (entry: Omit<AuditEntry, 'updatedAt'>) => void;
  updateEntry: (id: string, status: MutationOutcome, error?: string) => void;
  clearLog: () => void;
}

const MAX_ENTRIES = 200;

/**
 * useMutationAuditLog
 *
 * Persistent "Temporal Memory" of all mutations.
 * Implements a ring-buffer to keep the last 200 entries.
 */
export const useMutationAuditLog = create<MutationAuditLogState>()(
  persist(
    (set, _get) => ({
      entries: [],

      logEntry: (entry) => {
        const newEntry: AuditEntry = {
          ...entry,
          updatedAt: Date.now(),
        };

        set((state) => {
          const newEntries = [newEntry, ...state.entries];
          return {
            entries: newEntries.slice(0, MAX_ENTRIES),
          };
        });
      },

      updateEntry: (id, status, error) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status,
                  lastError: error || e.lastError,
                  updatedAt: Date.now(),
                  syncedAt: status === 'success' ? Date.now() : e.syncedAt,
                  attempts: status === 'retrying' ? e.attempts + 1 : e.attempts,
                }
              : e,
          ),
        }));
      },

      clearLog: () => {
        set({ entries: [] });
      },
    }),
    {
      name: 'gurudevi-mutation-audit-log',
      storage: createJSONStorage(() => SafeZustandStorage),
    },
  ),
);
