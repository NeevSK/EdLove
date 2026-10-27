import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { uuidv7 } from '@repo/core/logic/utils/uuid';
import {
  type WorkspaceLayoutIntent,
  WorkspaceLayoutIntentSchema,
} from '@repo/core/logic/workspace/layoutIntent';
import {
  buildWorkspaceLayoutPatchChanges,
  findChangedWorkspaceLayoutPatchGroups,
  projectWorkspaceLayoutPatchValues,
  type WorkspaceLayoutPatch,
  type WorkspaceLayoutPatchGroup,
  type WorkspaceLayoutPatchValues,
} from '@repo/core/logic/workspace/layoutPatch';
import {
  choosePreferredWorkspaceLayout,
  type WorkspaceLayoutSyncIdentity,
} from '@repo/core/logic/workspace/layoutSync';
import { isRetryableWorkspaceSyncError } from '@repo/core/logic/workspace/syncPolicy';
import type { WorkspaceLayout } from '@repo/core/types';

const GROUPS = ['arrangement', 'appearance', 'groups'] as const;

interface LayoutSessionIO {
  readLayout(): Promise<string | null>;
  readIntent(): Promise<string | null>;
  writeLayout(layout: WorkspaceLayout): Promise<void>;
  writeIntent(intent: WorkspaceLayoutIntent): Promise<void>;
  readRemote(): Promise<WorkspaceLayout | null>;
  submit(
    patch: WorkspaceLayoutPatch,
    isCurrent: () => boolean,
  ): Promise<{ serverRevision: number }>;
  enqueue(patch: WorkspaceLayoutPatch): Promise<void>;
}

export interface LayoutSessionSnapshot {
  layout: WorkspaceLayout;
  isInitialLayout: boolean;
  isHydrated: boolean;
  isSyncing: boolean;
  syncError: Error | null;
}

function applyValues(layout: WorkspaceLayout, values: WorkspaceLayoutPatchValues): WorkspaceLayout {
  return {
    ...layout,
    ...values.arrangement,
    zoneBySurface: values.arrangement.zoneBySurface as WorkspaceLayout['zoneBySurface'],
    appearance: values.appearance,
    groupOrder: values.groups,
  };
}

function copyGroups(
  base: WorkspaceLayout,
  draft: WorkspaceLayout,
  groups: ReadonlySet<WorkspaceLayoutPatchGroup>,
): WorkspaceLayout {
  const values = projectWorkspaceLayoutPatchValues(base);
  const edits = projectWorkspaceLayoutPatchValues(draft);
  return applyValues(base, {
    arrangement: groups.has('arrangement') ? edits.arrangement : values.arrangement,
    appearance: groups.has('appearance') ? edits.appearance : values.appearance,
    groups: groups.has('groups') ? edits.groups : values.groups,
  });
}

/** One mounted workspace's draft and durable protocol. Remote data stays in Query. */
export class WorkspaceLayoutSession {
  private snapshot: LayoutSessionSnapshot;
  private baseline: WorkspaceLayout;
  private readonly dirty = new Set<WorkspaceLayoutPatchGroup>();
  private pendingPatch: WorkspaceLayoutPatch | undefined;
  private readonly listeners = new Set<() => void>();
  private writes: Promise<void> = Promise.resolve();
  private generation = 0;
  private running: Promise<void> | null = null;
  private blocked = false;
  private localReady = false;
  private remoteReadPending = true;
  private active = false;

  constructor(
    private readonly identity: WorkspaceLayoutSyncIdentity,
    initial: WorkspaceLayout,
    private readonly remoteEnabled: boolean,
    private readonly io: LayoutSessionIO,
  ) {
    this.baseline = initial;
    this.snapshot = {
      layout: initial,
      isInitialLayout: true,
      isHydrated: false,
      isSyncing: false,
      syncError: null,
    };
  }

  getSnapshot = (): LayoutSessionSnapshot => this.snapshot;
  seedInitialPins(pinned: readonly string[]): void {
    if (!this.snapshot.isInitialLayout) return;
    const current = this.snapshot.layout.pinned;
    if (current.length === pinned.length && current.every((id, index) => id === pinned[index]))
      return;
    this.baseline = { ...this.baseline, pinned: [...pinned] };
    this.publish({ layout: { ...this.snapshot.layout, pinned: [...pinned] } });
  }
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private publish(change: Partial<LayoutSessionSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...change };
    for (const listener of this.listeners) listener();
  }

  stop(): void {
    this.active = false;
    this.generation += 1;
  }

  private report(error: unknown): void {
    this.publish({ syncError: error instanceof Error ? error : new Error(String(error)) });
  }

  private matches(layout: WorkspaceLayout): boolean {
    return (
      layout.userId === this.identity.userId && layout.workspaceId === this.identity.workspaceId
    );
  }

  private restoreIntent(raw: string | null): WorkspaceLayoutIntent | null {
    if (!raw) return null;
    const parsed = WorkspaceLayoutIntentSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      throw new Error('Stored workspace intent is invalid; original record retained.');
    const intent = parsed.data;
    if (
      intent.userId !== this.identity.userId ||
      intent.workspaceId !== this.identity.workspaceId ||
      intent.layoutTarget !== this.identity.layoutTarget
    )
      throw new Error('Stored workspace intent belongs to another owner.');
    return intent;
  }

  private async hydrateLocal(generation: number) {
    const [rawLayout, rawIntent] = await Promise.all([this.io.readLayout(), this.io.readIntent()]);
    if (generation !== this.generation) return null;
    const local: WorkspaceLayout | null = rawLayout ? JSON.parse(rawLayout) : null;
    if (local && !this.matches(local))
      throw new Error('Cached workspace layout belongs to another owner.');
    const intent = this.restoreIntent(rawIntent);
    const beforeLocalRead = this.snapshot.layout;
    const localEdits = new Set(this.dirty);
    const localBase = local ?? this.baseline;
    const restoredLocal = intent ? applyValues(localBase, intent.values) : localBase;
    intent?.dirtyGroups.forEach((group) => this.dirty.add(group));
    this.pendingPatch = intent?.pendingPatch;
    this.publish({
      layout: copyGroups(restoredLocal, beforeLocalRead, localEdits),
      isInitialLayout: !local && !intent && localEdits.size === 0,
      isHydrated: true,
    });
    this.localReady = true;
    return { local, intent };
  }

  private async readRemote(generation: number): Promise<WorkspaceLayout | null> {
    if (!this.remoteEnabled) return null;
    try {
      return await this.io.readRemote();
    } catch (error) {
      if (generation === this.generation) this.report(error);
      return null;
    }
  }

  private async reconcileRemote(
    generation: number,
    local: WorkspaceLayout | null,
    intent: WorkspaceLayoutIntent | null,
  ): Promise<void> {
    const remote = await this.readRemote(generation);
    if (generation !== this.generation) return;
    if (remote && !this.matches(remote))
      throw new Error('Remote workspace layout belongs to another owner.');
    this.baseline = remote ?? local ?? this.baseline;
    let restored = intent
      ? copyGroups(
          this.baseline,
          applyValues(this.baseline, intent.values),
          new Set(intent.dirtyGroups),
        )
      : (choosePreferredWorkspaceLayout({ local, remote }) ?? this.baseline);
    const changed =
      intent?.dirtyGroups ?? (await findChangedWorkspaceLayoutPatchGroups(this.baseline, restored));
    if (generation !== this.generation) return;
    const editedDuringRead = this.snapshot.layout;
    const editedGroups = new Set(this.dirty);
    changed.forEach((group) => this.dirty.add(group));
    restored = copyGroups(restored, editedDuringRead, editedGroups);
    this.remoteReadPending = false;
    this.publish({
      layout: restored,
      isInitialLayout: !remote && !local && !intent && this.dirty.size === 0,
      isHydrated: true,
    });
    if (this.dirty.size > 0 || this.pendingPatch) void this.flush().catch(() => undefined);
  }

  async start(): Promise<void> {
    this.active = true;
    const generation = ++this.generation;
    try {
      const restored = await this.hydrateLocal(generation);
      if (!restored) return;
      await this.reconcileRemote(generation, restored.local, restored.intent);
    } catch (error) {
      if (generation !== this.generation) return;
      this.blocked = true;
      this.report(error);
      this.publish({ isHydrated: true });
    }
  }

  edit(
    update: (current: WorkspaceLayout) => WorkspaceLayout,
    groups: readonly WorkspaceLayoutPatchGroup[],
  ): Promise<void> {
    const layout = update(this.snapshot.layout);
    groups.forEach((group) => this.dirty.add(group));
    this.publish({
      layout,
      isInitialLayout: false,
      syncError: this.localReady ? null : this.snapshot.syncError,
    });
    // Enqueue persistence synchronously with the edit, not from a later render effect.
    const persistence = this.localReady ? this.persist() : Promise.resolve();
    void persistence.catch((error: unknown) => this.report(error));
    if (this.snapshot.isHydrated && !this.blocked) void this.flush().catch(() => undefined);
    return persistence;
  }

  async saveEdit(
    update: (current: WorkspaceLayout) => WorkspaceLayout,
    groups: readonly WorkspaceLayoutPatchGroup[],
  ): Promise<void> {
    if (!this.localReady) throw new Error('Workspace layout is not locally hydrated.');
    const alreadySyncing = this.running !== null;
    await this.edit(update, groups);
    if (alreadySyncing) return;
    await this.flush();
    if (this.snapshot.syncError) throw this.snapshot.syncError;
  }

  private persist(): Promise<void> {
    const layout = this.snapshot.layout;
    const intent = this.remoteEnabled
      ? WorkspaceLayoutIntentSchema.parse({
          version: 2,
          ...this.identity,
          values: projectWorkspaceLayoutPatchValues(layout),
          dirtyGroups: [...this.dirty],
          pendingPatch: this.pendingPatch,
        })
      : null;
    const result = this.writes.then(async () => {
      if (intent) await this.io.writeIntent(intent);
      await this.io.writeLayout(layout);
    });
    this.writes = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private async preparePatch(): Promise<WorkspaceLayoutPatch> {
    const operationId = uuidv7();
    const changes = await buildWorkspaceLayoutPatchChanges(
      this.baseline,
      this.snapshot.layout,
      new Set(this.dirty),
    );
    const body = {
      ...this.identity,
      operationId,
      baseRevision: this.baseline.revision ?? 0,
      changes,
    };
    return {
      ...body,
      idempotencyKey: operationId,
      inputHash: await getConsistentIdempotencyKey(body, 'workspace-layout-patch'),
    };
  }

  private async settle(patch: WorkspaceLayoutPatch, serverRevision: number): Promise<void> {
    const baseValues = projectWorkspaceLayoutPatchValues(this.baseline);
    const sentValues: WorkspaceLayoutPatchValues = {
      arrangement: patch.changes.arrangement?.value ?? baseValues.arrangement,
      appearance: patch.changes.appearance?.value ?? baseValues.appearance,
      groups: patch.changes.groups?.value ?? baseValues.groups,
    };
    this.baseline = { ...applyValues(this.baseline, sentValues), revision: serverRevision };
    const current = projectWorkspaceLayoutPatchValues(this.snapshot.layout);
    for (const group of GROUPS) {
      if (
        patch.changes[group] &&
        JSON.stringify(current[group]) === JSON.stringify(sentValues[group])
      )
        this.dirty.delete(group);
    }
    this.pendingPatch = undefined;
    this.publish({ layout: { ...this.snapshot.layout, revision: serverRevision } });
    await this.persist();
  }

  private async dispatch(patch: WorkspaceLayoutPatch, generation: number) {
    try {
      return await this.io.submit(patch, () => generation === this.generation);
    } catch (error) {
      if (generation !== this.generation) return null;
      if (isRetryableWorkspaceSyncError(error)) await this.io.enqueue(patch);
      throw error;
    }
  }

  private async drain(generation: number): Promise<void> {
    while (generation === this.generation && (this.pendingPatch || this.dirty.size > 0)) {
      const patch = this.pendingPatch ?? (await this.preparePatch());
      if (generation !== this.generation) return;
      this.pendingPatch = patch;
      await this.persist();
      if (generation !== this.generation) return;
      const receipt = await this.dispatch(patch, generation);
      if (generation !== this.generation || !receipt) return;
      await this.settle(patch, receipt.serverRevision);
    }
  }

  flush = (): Promise<void> => {
    if (this.running) return this.running;
    if (
      !this.active ||
      !this.localReady ||
      this.remoteReadPending ||
      !this.remoteEnabled ||
      this.blocked
    )
      return this.writes;
    const generation = this.generation;
    this.publish({ isSyncing: true, syncError: null });
    this.running = this.drain(generation)
      .catch((error: unknown) => {
        if (generation !== this.generation) return;
        this.blocked = true;
        this.report(error);
      })
      .finally(() => {
        this.running = null;
        if (generation === this.generation) this.publish({ isSyncing: false });
        else if (this.active && !this.blocked && (this.pendingPatch || this.dirty.size > 0)) {
          void this.flush();
        }
      });
    return this.running;
  };

  reapply = (): Promise<void> => {
    if (!this.localReady)
      return Promise.reject(
        this.snapshot.syncError ?? new Error('Workspace layout is not locally hydrated.'),
      );
    this.blocked = false;
    return this.flush();
  };

  async refresh(): Promise<void> {
    const generation = this.generation;
    const remote = await this.io.readRemote();
    if (generation !== this.generation || !remote) return;
    if (!this.matches(remote)) throw new Error('Remote workspace layout belongs to another owner.');
    if (this.running || this.pendingPatch) return;
    this.baseline = remote;
    this.publish({
      layout: copyGroups(remote, this.snapshot.layout, this.dirty),
      isInitialLayout: false,
    });
  }
}
