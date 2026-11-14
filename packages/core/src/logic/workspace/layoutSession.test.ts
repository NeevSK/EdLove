import type { WorkspaceLayout } from '@repo/core/types';
import { describe, expect, it, vi } from 'vitest';
import type { WorkspaceLayoutIntent } from './layoutIntent';
import type { WorkspaceLayoutPatch } from './layoutPatch';
import { projectWorkspaceLayoutPatchValues } from './layoutPatch';
import { WorkspaceLayoutSession } from './layoutSession';

const identity = {
  userId: '11111111-1111-8111-8111-111111111111',
  workspaceId: 'self',
  layoutTarget: 'mobile' as const,
};
const initial: WorkspaceLayout = {
  userId: identity.userId,
  workspaceId: 'self',
  order: [],
  hidden: [],
  pinned: [],
  zoneBySurface: {},
  appearance: { preset: 'default', motion: 'off' },
  updatedAt: '2026-10-26T00:00:00Z',
  revision: 4,
};

function fixture() {
  const io = {
    readLayout: vi.fn(async (): Promise<string | null> => null),
    readIntent: vi.fn(async (): Promise<string | null> => null),
    writeLayout: vi.fn(async (_layout: WorkspaceLayout) => undefined),
    writeIntent: vi.fn(async (_intent: WorkspaceLayoutIntent) => undefined),
    readRemote: vi.fn(async (): Promise<WorkspaceLayout | null> => initial),
    submit: vi.fn(async (_patch: WorkspaceLayoutPatch, _isCurrent: () => boolean) => ({
      serverRevision: 5,
    })),
    enqueue: vi.fn(async () => undefined),
  };
  return { io, session: new WorkspaceLayoutSession(identity, initial, true, io) };
}

describe('workspace layout durable session', () => {
  it('keeps initial pins through another kind of first edit and stops accepting bootstrap updates afterward', async () => {
    const { session, io } = fixture();
    io.readRemote.mockResolvedValue(null);
    await session.start();
    session.seedInitialPins(['journal', 'mood']);
    expect(session.getSnapshot().isInitialLayout).toBe(true);
    await session.edit(
      (current) => ({ ...current, appearance: { preset: 'night', motion: 'off' } }),
      ['appearance'],
    );
    session.seedInitialPins(['sleep']);
    expect(session.getSnapshot().layout.pinned).toEqual(['journal', 'mood']);
    expect(session.getSnapshot().isInitialLayout).toBe(false);
    session.stop();
  });

  it('distinguishes an initial layout from stored empty data and edits without relying on isDefault', async () => {
    const fresh = fixture();
    fresh.io.readRemote.mockResolvedValue(null);
    await fresh.session.start();
    expect(fresh.session.getSnapshot().isInitialLayout).toBe(true);
    await fresh.session.edit((current) => ({ ...current, pinned: [] }), ['arrangement']);
    expect(fresh.session.getSnapshot().isInitialLayout).toBe(false);
    fresh.session.stop();
    const stored = fixture();
    stored.io.readLayout.mockResolvedValue(JSON.stringify({ ...initial, isDefault: true }));
    stored.io.readRemote.mockResolvedValue(null);
    await stored.session.start();
    expect(stored.session.getSnapshot().isInitialLayout).toBe(false);
    stored.session.stop();
  });

  it('restores only dirty groups over a newer remote layout', async () => {
    const { session, io } = fixture();
    io.readIntent.mockResolvedValue(
      JSON.stringify({
        version: 2,
        ...identity,
        values: projectWorkspaceLayoutPatchValues({ ...initial, groupOrder: ['draft-group'] }),
        dirtyGroups: ['groups'],
      }),
    );
    io.readRemote.mockResolvedValue({ ...initial, order: ['remote-task'] });
    await session.start();
    await session.flush();
    expect(session.getSnapshot().layout.order).toEqual(['remote-task']);
    expect(session.getSnapshot().layout.groupOrder).toEqual(['draft-group']);
    expect(io.submit.mock.calls[0]?.[0].changes).not.toHaveProperty('arrangement');
    session.stop();
  });

  it('never enqueues transport after a failed local intent acknowledgement', async () => {
    const { session, io } = fixture();
    await session.start();
    io.writeIntent.mockRejectedValue(new TypeError('local storage unavailable'));
    await expect(
      session.saveEdit((layout) => ({ ...layout, groupOrder: ['draft-group'] }), ['groups']),
    ).rejects.toThrow('local storage unavailable');
    await session.flush();
    expect(io.submit).not.toHaveBeenCalled();
    expect(io.enqueue).not.toHaveBeenCalled();
    session.stop();
  });

  it('never dispatches before acknowledged local intent completion', async () => {
    const { session, io } = fixture();
    await session.start();
    const persistence = Promise.withResolvers<void>();
    io.writeIntent.mockImplementation(() => persistence.promise);
    session.edit((layout) => ({ ...layout, groupOrder: ['research'] }), ['groups']);
    await Promise.resolve();
    expect(io.submit).not.toHaveBeenCalled();
    persistence.resolve();
    await session.flush();
    expect(io.submit).toHaveBeenCalledOnce();
    expect(session.getSnapshot().layout.groupOrder).toEqual(['research']);
    expect(session.getSnapshot().layout.revision).toBe(5);
    session.stop();
  });

  it('retains edits made during local hydration without overwriting unread durable work', async () => {
    const { session, io } = fixture();
    const localRead = Promise.withResolvers<string | null>();
    io.readLayout.mockReturnValue(localRead.promise);
    const startup = session.start();
    await session.edit((layout) => ({ ...layout, groupOrder: ['new-group'] }), ['groups']);
    expect(io.writeIntent).not.toHaveBeenCalled();
    localRead.resolve(JSON.stringify({ ...initial, order: ['existing-task'] }));
    await startup;
    await session.flush();
    expect(session.getSnapshot().layout.order).toEqual(['existing-task']);
    expect(session.getSnapshot().layout.groupOrder).toEqual(['new-group']);
    session.stop();
  });

  it('does not apply or persist an old receipt after its owner ends', async () => {
    const { session, io } = fixture();
    const receipt = Promise.withResolvers<{ serverRevision: number }>();
    io.submit.mockReturnValue(receipt.promise);
    await session.start();
    session.edit((layout) => ({ ...layout, groupOrder: ['research'] }), ['groups']);
    await vi.waitFor(() => expect(io.submit).toHaveBeenCalledOnce());
    const writesAtStop = io.writeIntent.mock.calls.length;
    const transportIsCurrent = io.submit.mock.calls[0]?.[1];
    session.stop();
    expect(transportIsCurrent?.()).toBe(false);
    receipt.resolve({ serverRevision: 5 });
    await session.flush();
    expect(session.getSnapshot().layout.revision).toBe(4);
    expect(io.writeIntent).toHaveBeenCalledTimes(writesAtStop);
  });

  it('resumes the same persisted operation when an effect owner restarts during transport', async () => {
    const { session, io } = fixture();
    let intent: string | null = null;
    io.writeIntent.mockImplementation(async (value) => {
      intent = JSON.stringify(value);
    });
    io.readIntent.mockImplementation(async () => intent);
    const firstReceipt = Promise.withResolvers<{ serverRevision: number }>();
    io.submit.mockImplementationOnce(() => firstReceipt.promise);
    await session.start();
    session.edit((layout) => ({ ...layout, groupOrder: ['draft-group'] }), ['groups']);
    await vi.waitFor(() => expect(io.submit).toHaveBeenCalledTimes(1));
    const firstPatch = io.submit.mock.calls[0]?.[0];
    session.stop();
    await session.start();
    firstReceipt.resolve({ serverRevision: 5 });
    await vi.waitFor(() => expect(io.submit).toHaveBeenCalledTimes(2));
    await session.flush();
    expect(io.submit.mock.calls[1]?.[0]).toEqual(firstPatch);
    expect(session.getSnapshot().layout.groupOrder).toEqual(['draft-group']);
    expect(session.getSnapshot().isSyncing).toBe(false);
    session.stop();
  });

  it('preserves a foreign cached record without adopting it or rewriting its key', async () => {
    const { session, io } = fixture();
    io.readLayout.mockResolvedValue(JSON.stringify({ ...initial, userId: 'other-account' }));
    await session.start();
    await session.edit((layout) => ({ ...layout, groupOrder: ['research'] }), ['groups']);
    await expect(session.reapply()).rejects.toThrow('another owner');
    expect(io.readRemote).not.toHaveBeenCalled();
    expect(io.writeLayout).not.toHaveBeenCalled();
    expect(io.writeIntent).not.toHaveBeenCalled();
    expect(io.submit).not.toHaveBeenCalled();
    session.stop();
  });
});
