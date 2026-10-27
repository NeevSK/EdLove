import type { ChatSendCommand } from '@repo/core/logic/schemas/chat-command.schema';
import { createZenStackDb } from '@repo/database/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { settleChatMessage } from '../core/chatMessageSettlement';
import type { ORPCContext } from '../core/orpc';

const fixture = vi.hoisted(() => {
  type Receipt = {
    operation_id: string;
    payload_hash: string;
    status: string;
    result: unknown;
    error_code: null;
  };
  const accountId = '123e4567-e89b-8101-8000-426614174000';
  const otherId = '123e4567-e89b-8101-8000-426614174009';
  const state: {
    receipt: Receipt | null;
    member: boolean;
    participant: boolean;
    blocked: boolean;
    failReceipt: boolean;
    failAudit: boolean;
  } = {
    receipt: null,
    member: true,
    participant: true,
    blocked: false,
    failReceipt: false,
    failAudit: false,
  };
  const messages: string[] = [];
  const tx = {
    sentinelAuditLog: {
      create: vi.fn(async () => {
        if (state.failAudit) throw new Error('audit unavailable');
        return { id: 'audit' };
      }),
    },
    groupMember: { findFirst: vi.fn(async () => (state.member ? { id: 'membership' } : null)) },
    directConversation: {
      findUnique: vi.fn(async () => ({
        user1_id: state.participant ? accountId : otherId,
        user2_id: otherId,
      })),
    },
    userBlock: { findFirst: vi.fn(async () => (state.blocked ? { id: 'block' } : null)) },
    groupMessage: {
      create: vi.fn(async (args: { data: { id: string } }) => {
        messages.push('group');
        return { id: args.data.id };
      }),
    },
    directMessage: {
      create: vi.fn(async (args: { data: { id: string } }) => {
        messages.push('direct');
        return { id: args.data.id };
      }),
    },
    $queryRaw: vi.fn(async (parts: TemplateStringsArray, ...values: unknown[]) => {
      if (parts.join('?').includes('INSERT INTO')) {
        if (state.receipt) return [];
        state.receipt = {
          operation_id: String(values[0]),
          payload_hash: String(values[4]),
          status: 'pending',
          result: null,
          error_code: null,
        };
        return [{ operation_id: state.receipt.operation_id }];
      }
      return state.receipt ? [state.receipt] : [];
    }),
    $executeRaw: vi.fn(async (parts: TemplateStringsArray, ...values: unknown[]) => {
      if (!parts.join('?').includes('UPDATE public.operation_receipts')) return 0;
      if (state.failReceipt || !state.receipt) return 0;
      state.receipt.status = 'committed';
      state.receipt.result = JSON.parse(String(values[0]));
      return 1;
    }),
  };
  const db = {
    $transaction: vi.fn(async <T>(work: (transaction: typeof tx) => Promise<T>) => {
      const before = structuredClone(state.receipt);
      const count = messages.length;
      try {
        return await work(tx);
      } catch (error) {
        state.receipt = before;
        messages.length = count;
        throw error;
      }
    }),
  };
  return { accountId, otherId, state, tx, db, messages };
});

vi.mock('@repo/database/client', () => ({ createZenStackDb: () => fixture.db }));

const command: ChatSendCommand = {
  operationId: '123e4567-e89b-8101-8000-426614174001',
  principalId: fixture.accountId,
  channel: { kind: 'group', id: '123e4567-e89b-8101-8000-426614174002' },
  content: 'Retained message',
};
const context: ORPCContext = {
  db: createZenStackDb({ id: fixture.accountId }),
  user: { id: fixture.accountId },
  requestId: 'chat-fixture',
};

describe('chat message settlement with a substituted transactional database', () => {
  beforeEach(() => {
    fixture.state.receipt = null;
    fixture.state.member = true;
    fixture.state.participant = true;
    fixture.state.blocked = false;
    fixture.state.failReceipt = false;
    fixture.state.failAudit = false;
    fixture.messages.length = 0;
    vi.clearAllMocks();
  });

  it('rejects another principal before starting the transaction', async () => {
    await expect(
      settleChatMessage(context, { ...command, principalId: fixture.otherId }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(fixture.db.$transaction).not.toHaveBeenCalled();
  });

  it('returns the same receipt after response loss without creating another message', async () => {
    const first = await settleChatMessage(context, command);
    const replay = await settleChatMessage(context, command);
    expect(replay).toEqual(first);
    expect(first).toMatchObject({ operationId: command.operationId, status: 'completed' });
    expect(fixture.tx.groupMessage.create).toHaveBeenCalledTimes(1);
    expect(fixture.tx.sentinelAuditLog.create).toHaveBeenCalledTimes(1);
    expect(fixture.state.receipt?.status).toBe('committed');
  });

  it('binds the operation ID to content and channel rather than accepting a changed replay', async () => {
    await settleChatMessage(context, command);
    await expect(
      settleChatMessage(context, { ...command, content: 'Different message' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
    await expect(
      settleChatMessage(context, { ...command, channel: { ...command.channel, kind: 'direct' } }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
    expect(fixture.messages).toEqual(['group']);
  });

  it('refuses inactive circle membership before a message write', async () => {
    fixture.state.member = false;
    await expect(settleChatMessage(context, command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(fixture.tx.groupMessage.create).not.toHaveBeenCalled();
    expect(fixture.state.receipt).toBeNull();
  });

  it('refuses a direct conversation outsider', async () => {
    fixture.state.participant = false;
    await expect(
      settleChatMessage(context, { ...command, channel: { ...command.channel, kind: 'direct' } }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(fixture.tx.directMessage.create).not.toHaveBeenCalled();
  });

  it('respects either-direction conversation blocking', async () => {
    fixture.state.blocked = true;
    await expect(
      settleChatMessage(context, { ...command, channel: { ...command.channel, kind: 'direct' } }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(fixture.tx.userBlock.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { blocker_id: fixture.accountId, blocked_id: fixture.otherId },
          { blocker_id: fixture.otherId, blocked_id: fixture.accountId },
        ],
      },
      select: { id: true },
    });
    expect(fixture.tx.directMessage.create).not.toHaveBeenCalled();
  });

  it('writes an authorized direct message once', async () => {
    const direct = { ...command, channel: { ...command.channel, kind: 'direct' as const } };
    await settleChatMessage(context, direct);
    await settleChatMessage(context, direct);
    expect(fixture.messages).toEqual(['direct']);
  });

  it('does not resolve delivery when the receipt cannot commit', async () => {
    fixture.state.failReceipt = true;
    await expect(settleChatMessage(context, command)).rejects.toThrow(
      'receipt could not be committed',
    );
    expect(fixture.messages).toEqual([]);
    expect(fixture.state.receipt).toBeNull();
  });

  it('does not commit a message without its audit record', async () => {
    fixture.state.failAudit = true;
    await expect(settleChatMessage(context, command)).rejects.toThrow('audit unavailable');
    expect(fixture.messages).toEqual([]);
    expect(fixture.state.receipt).toBeNull();
  });
});
