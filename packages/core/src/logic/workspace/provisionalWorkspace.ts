import type { CreateTuitionBatchInput } from '@repo/core/adapters/supabase/tuitionBatchRepository';
import type { GuardianLinkProvisionInput } from '@repo/core/api/workspaceProvisioning';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import type { GuardianIdentity } from '@repo/core/logic/schemas/guardian.schema';
import { uuidv7 } from '@repo/core/logic/utils/uuid';
import type { CommercialPerspective, GuardianBondPerspective } from '@repo/core/types/Perspective';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ProvisionalWorkspaceCommand =
  | {
      readonly id: string;
      readonly idempotencyKey: string;
      readonly principalId: string;
      readonly kind: 'commercial-batch';
      readonly input: CreateTuitionBatchInput;
      readonly createdAt: number;
      readonly status: 'queued' | 'dispatching' | 'receipt_check' | 'rejected' | 'reconciled';
      readonly lastError?: string;
      readonly resolvedPerspective?: CommercialPerspective;
    }
  | {
      readonly id: string;
      readonly idempotencyKey: string;
      readonly principalId: string;
      readonly kind: 'guardian-link';
      readonly input: {
        wardUserId: string;
        relationship: GuardianIdentity['relationship_type'];
        schoolId?: string;
        wardName: string;
      };
      readonly createdAt: number;
      readonly status: 'queued' | 'dispatching' | 'receipt_check' | 'rejected' | 'reconciled';
      readonly lastError?: string;
      readonly resolvedPerspective?: GuardianBondPerspective;
    };

interface ProvisionalWorkspaceQueueState {
  readonly commands: readonly ProvisionalWorkspaceCommand[];
  enqueue: (command: ProvisionalWorkspaceCommand) => Promise<ProvisionalWorkspaceCommand>;
  claim: (id: string, principalId: string) => Promise<boolean>;
  resolve: (
    id: string,
    principalId: string,
    perspective: CommercialPerspective | GuardianBondPerspective,
  ) => Promise<void>;
  reject: (id: string, principalId: string, error: string) => Promise<void>;
  recoverInterrupted: (principalId: string, commandId?: string) => Promise<void>;
}

const unacknowledgedCommandIds = new Set<string>();
const activeDispatchCommandIds = new Set<string>();

/**
 * Durable intent for workspace provisioning. These commands deliberately do
 * not feed the active-scope store: a local draft cannot authorize a tenant,
 * a Bond, or a workspace capability before the server returns a receipt.
 */
export const useProvisionalWorkspaceQueue = create<ProvisionalWorkspaceQueueState>()(
  persist(
    (set, get) => ({
      commands: [],
      enqueue: async (command) => {
        const retryable = get().commands.find(
          (existing) =>
            unacknowledgedCommandIds.has(existing.id) &&
            existing.principalId === command.principalId &&
            existing.kind === command.kind &&
            JSON.stringify(existing.input) === JSON.stringify(command.input),
        );
        if (retryable) {
          const acknowledgement = set((state) => state);
          const snapshotIds = get()
            .commands.filter((candidate) => unacknowledgedCommandIds.has(candidate.id))
            .map((candidate) => candidate.id);
          await acknowledgement;
          snapshotIds.forEach((id) => unacknowledgedCommandIds.delete(id));
          return retryable;
        }

        unacknowledgedCommandIds.add(command.id);
        const acknowledgement = set((state) => ({
          commands: [...state.commands, command],
        }));
        const snapshotIds = get()
          .commands.filter((candidate) => unacknowledgedCommandIds.has(candidate.id))
          .map((candidate) => candidate.id);
        await acknowledgement;
        snapshotIds.forEach((id) => unacknowledgedCommandIds.delete(id));
        return command;
      },
      claim: async (id, principalId) => {
        const command = get().commands.find(
          (candidate) =>
            candidate.id === id &&
            candidate.principalId === principalId &&
            (candidate.status === 'queued' || candidate.status === 'receipt_check') &&
            !unacknowledgedCommandIds.has(candidate.id),
        );
        if (!command) return false;
        activeDispatchCommandIds.add(command.id);
        try {
          await set((state) => ({
            commands: state.commands.map((candidate) =>
              candidate.id === id
                ? { ...candidate, status: 'dispatching' as const, lastError: undefined }
                : candidate,
            ),
          }));
        } catch (error) {
          activeDispatchCommandIds.delete(command.id);
          set((state) => ({
            commands: state.commands.map((candidate) =>
              candidate.id === id && candidate.principalId === principalId ? command : candidate,
            ),
          }));
          throw error;
        }
        return true;
      },
      resolve: async (id, principalId, perspective) => {
        const command = get().commands.find(
          (candidate) => candidate.id === id && candidate.principalId === principalId,
        );
        if (
          !command ||
          (command.kind === 'commercial-batch' && perspective.kind !== 'commercial') ||
          (command.kind === 'guardian-link' && perspective.kind !== 'guardian')
        ) {
          return;
        }
        if (command.kind === 'commercial-batch' && perspective.kind === 'commercial') {
          try {
            await set((state) => ({
              commands: state.commands.map((candidate) =>
                candidate.id === id &&
                candidate.principalId === principalId &&
                candidate.kind === 'commercial-batch'
                  ? {
                      ...candidate,
                      status: 'reconciled' as const,
                      resolvedPerspective: perspective,
                    }
                  : candidate,
              ),
            }));
          } catch (error) {
            activeDispatchCommandIds.delete(command.id);
            set((state) => ({
              commands: state.commands.map((candidate) =>
                candidate.id === id && candidate.principalId === principalId ? command : candidate,
              ),
            }));
            throw error;
          }
          activeDispatchCommandIds.delete(command.id);
          return;
        }
        if (command.kind === 'guardian-link' && perspective.kind === 'guardian') {
          try {
            await set((state) => ({
              commands: state.commands.map((candidate) =>
                candidate.id === id &&
                candidate.principalId === principalId &&
                candidate.kind === 'guardian-link'
                  ? {
                      ...candidate,
                      status: 'reconciled' as const,
                      resolvedPerspective: perspective,
                    }
                  : candidate,
              ),
            }));
          } catch (error) {
            activeDispatchCommandIds.delete(command.id);
            set((state) => ({
              commands: state.commands.map((candidate) =>
                candidate.id === id && candidate.principalId === principalId ? command : candidate,
              ),
            }));
            throw error;
          }
          activeDispatchCommandIds.delete(command.id);
        }
      },
      reject: async (id, principalId, error) => {
        const command = get().commands.find(
          (candidate) => candidate.id === id && candidate.principalId === principalId,
        );
        if (!command) return;
        try {
          await set((state) => ({
            commands: state.commands.map((candidate) =>
              candidate.id === id && candidate.principalId === principalId
                ? {
                    ...candidate,
                    status: 'rejected' as const,
                    lastError: error,
                  }
                : candidate,
            ),
          }));
        } catch (persistenceError) {
          activeDispatchCommandIds.delete(command.id);
          set((state) => ({
            commands: state.commands.map((candidate) =>
              candidate.id === id && candidate.principalId === principalId ? command : candidate,
            ),
          }));
          throw persistenceError;
        }
        activeDispatchCommandIds.delete(command.id);
      },
      recoverInterrupted: async (principalId, commandId) => {
        const interruptedCommands = get().commands.filter(
          (candidate) =>
            candidate.principalId === principalId &&
            candidate.status === 'dispatching' &&
            (commandId !== undefined
              ? candidate.id === commandId
              : !activeDispatchCommandIds.has(candidate.id)),
        );
        if (interruptedCommands.length === 0) return;
        interruptedCommands.forEach((candidate) => activeDispatchCommandIds.delete(candidate.id));
        try {
          await set((state) => ({
            commands: state.commands.map((candidate) =>
              candidate.principalId === principalId &&
              candidate.status === 'dispatching' &&
              (commandId === undefined || candidate.id === commandId)
                ? { ...candidate, status: 'receipt_check' as const }
                : candidate,
            ),
          }));
        } catch (persistenceError) {
          const originalById = new Map(
            interruptedCommands.map((candidate) => [candidate.id, candidate]),
          );
          set((state) => ({
            commands: state.commands.map(
              (candidate) => originalById.get(candidate.id) ?? candidate,
            ),
          }));
          throw persistenceError;
        }
      },
    }),
    {
      name: 'gurudevi-provisional-workspace-queue',
      storage: createJSONStorage(() => SafeZustandStorage),
      version: 2,
      migrate: (persisted: unknown) => {
        const state = persisted as { commands?: Array<Record<string, unknown>> };
        return {
          ...state,
          commands: (state.commands ?? []).map((command) => ({
            ...command,
            idempotencyKey:
              typeof command.idempotencyKey === 'string' ? command.idempotencyKey : command.id,
            status: command.status === 'retry_scheduled' ? 'receipt_check' : command.status,
          })),
        } as unknown as ProvisionalWorkspaceQueueState;
      },
    },
  ),
);

let hydrationPromise: Promise<void> | undefined;

async function ensureProvisionalWorkspaceHydrated(): Promise<void> {
  if (useProvisionalWorkspaceQueue.persist.hasHydrated()) return;
  hydrationPromise ??= Promise.resolve(useProvisionalWorkspaceQueue.persist.rehydrate()).finally(
    () => {
      hydrationPromise = undefined;
    },
  );
  await hydrationPromise;
}

export async function queueCommercialWorkspace(
  principalId: string,
  input: CreateTuitionBatchInput,
): Promise<ProvisionalWorkspaceCommand> {
  await ensureProvisionalWorkspaceHydrated();
  const command: ProvisionalWorkspaceCommand = {
    id: uuidv7(),
    idempotencyKey: uuidv7(),
    principalId,
    kind: 'commercial-batch',
    input,
    createdAt: Date.now(),
    status: 'queued',
  };
  return useProvisionalWorkspaceQueue.getState().enqueue(command);
}

export async function queueGuardianWorkspace(
  principalId: string,
  input: Extract<ProvisionalWorkspaceCommand, { kind: 'guardian-link' }>['input'],
): Promise<ProvisionalWorkspaceCommand> {
  await ensureProvisionalWorkspaceHydrated();
  const command: ProvisionalWorkspaceCommand = {
    id: uuidv7(),
    idempotencyKey: uuidv7(),
    principalId,
    kind: 'guardian-link',
    input,
    createdAt: Date.now(),
    status: 'queued',
  };
  return useProvisionalWorkspaceQueue.getState().enqueue(command);
}

export async function reconcileProvisionalWorkspaces(input: {
  principalId: string;
  createCommercialBatch: (
    request: CreateTuitionBatchInput,
    idempotencyKey: string,
  ) => Promise<CommercialPerspective>;
  createGuardianLink: (
    request: GuardianLinkProvisionInput,
    idempotencyKey: string,
  ) => Promise<GuardianBondPerspective>;
  isStillCurrent?: () => boolean;
}): Promise<Array<CommercialPerspective | GuardianBondPerspective>> {
  await ensureProvisionalWorkspaceHydrated();
  await useProvisionalWorkspaceQueue.getState().recoverInterrupted(input.principalId);
  const candidates = useProvisionalWorkspaceQueue
    .getState()
    .commands.filter(
      (command) =>
        command.principalId === input.principalId &&
        (command.status === 'queued' || command.status === 'receipt_check'),
    );
  const reconciled: Array<CommercialPerspective | GuardianBondPerspective> = [];

  for (const command of candidates) {
    if (input.isStillCurrent && !input.isStillCurrent()) break;
    if (!(await useProvisionalWorkspaceQueue.getState().claim(command.id, input.principalId))) {
      continue;
    }
    if (input.isStillCurrent && !input.isStillCurrent()) {
      await useProvisionalWorkspaceQueue
        .getState()
        .recoverInterrupted(input.principalId, command.id);
      break;
    }

    let perspective: CommercialPerspective | GuardianBondPerspective;
    try {
      // The provisioning endpoint resolves a prior committed receipt when called
      // with the same key; no separate receipt-by-key endpoint exists for this capability.
      perspective =
        command.kind === 'commercial-batch'
          ? await input.createCommercialBatch(command.input, command.idempotencyKey)
          : await input.createGuardianLink(command.input, command.idempotencyKey);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' &&
              error !== null &&
              'message' in error &&
              typeof error.message === 'string'
            ? error.message
            : 'Workspace provisioning failed.';
      // A timed out response is intentionally left for same-key receipt recovery;
      // validation/conflict failures are surfaced as terminal intent records.
      if (
        /timeout|network|service unavailable|503|not yet readable|not yet available|not committed|receipt could not be committed/i.test(
          message,
        )
      ) {
        await useProvisionalWorkspaceQueue
          .getState()
          .recoverInterrupted(input.principalId, command.id);
      } else {
        await useProvisionalWorkspaceQueue
          .getState()
          .reject(command.id, input.principalId, message);
      }
      continue;
    }

    if (input.isStillCurrent && !input.isStillCurrent()) {
      await useProvisionalWorkspaceQueue
        .getState()
        .recoverInterrupted(input.principalId, command.id);
      break;
    }
    await useProvisionalWorkspaceQueue
      .getState()
      .resolve(command.id, input.principalId, perspective);
    reconciled.push(perspective);
  }
  return reconciled;
}
