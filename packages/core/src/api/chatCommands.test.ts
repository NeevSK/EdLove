import { beforeEach, describe, expect, it, vi } from 'vitest';
import { replayChatSendCommand } from './chatCommands';

const transport = vi.hoisted(() => ({ group: vi.fn(), direct: vi.fn() }));
vi.mock('@repo/core/api/orpcClient', () => ({
  orpcClient: {
    community: { sendMessageCommand: transport.group },
    messaging: { sendMessageCommand: transport.direct },
  },
}));
const principalId = '123e4567-e89b-8101-8000-426614174000';
const command = {
  operationId: '123e4567-e89b-8101-8000-426614174001',
  principalId,
  channel: { kind: 'group', id: '123e4567-e89b-8101-8000-426614174002' },
  content: 'Retained message',
};
const receipt = {
  operationId: command.operationId,
  receiptId: '123e4567-e89b-8101-8000-426614174003',
  messageId: command.operationId,
  status: 'completed',
};

describe('chat command replay transport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transport.group.mockResolvedValue(receipt);
    transport.direct.mockResolvedValue(receipt);
  });
  it('refuses an unbound or different account before transport', async () => {
    await expect(replayChatSendCommand(command, undefined)).rejects.toThrow('owner');
    await expect(replayChatSendCommand(command, 'another-account')).rejects.toThrow('owner');
    expect(transport.group).not.toHaveBeenCalled();
  });
  it('retains exact command identity on repeated transport', async () => {
    await replayChatSendCommand(command, principalId);
    await replayChatSendCommand(command, principalId);
    expect(transport.group).toHaveBeenNthCalledWith(1, { body: command });
    expect(transport.group).toHaveBeenNthCalledWith(2, { body: command });
  });
  it('routes direct messages through their own authorization boundary', async () => {
    await replayChatSendCommand(
      { ...command, channel: { ...command.channel, kind: 'direct' } },
      principalId,
    );
    expect(transport.direct).toHaveBeenCalledTimes(1);
    expect(transport.group).not.toHaveBeenCalled();
  });
  it('does not mistake an unrelated or pending response for delivery', async () => {
    transport.group.mockResolvedValueOnce({ ...receipt, operationId: receipt.receiptId });
    await expect(replayChatSendCommand(command, principalId)).rejects.toThrow('does not match');
    transport.group.mockResolvedValueOnce({ ...receipt, status: 'pending' });
    await expect(replayChatSendCommand(command, principalId)).rejects.toThrow();
  });
});
