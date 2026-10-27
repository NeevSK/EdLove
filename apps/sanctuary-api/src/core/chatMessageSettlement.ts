import { ORPCError } from '@orpc/server';
import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import {
  CHAT_SEND_COMMAND,
  ChatMessageResultSchema,
  type ChatSendCommand,
  ChatSendCommandSchema,
  type ChatSendReceipt,
} from '@repo/core/logic/schemas/chat-command.schema';
import { assertDatabase } from './apiErrors';
import { createOperationReceiptPort } from './operationReceiptStore';
import type { ORPCContext } from './orpc';

type ChatRepository = Pick<
  NonNullable<ORPCContext['db']>,
  'groupMember' | 'directConversation' | 'userBlock' | 'groupMessage' | 'directMessage'
>;

async function assertChatAuthority(db: ChatRepository, command: ChatSendCommand): Promise<void> {
  const { principalId, channel } = command;
  if (channel.kind === 'group') {
    const membership = await db.groupMember.findFirst({
      where: { group_id: channel.id, user_id: principalId, status: 'active' },
      select: { id: true },
    });
    if (!membership)
      throw new ORPCError('FORBIDDEN', { message: 'Active circle membership is required.' });
    return;
  }
  const conversation = await db.directConversation.findUnique({
    where: { id: channel.id },
    select: { user1_id: true, user2_id: true },
  });
  if (
    !conversation ||
    (conversation.user1_id !== principalId && conversation.user2_id !== principalId)
  )
    throw new ORPCError('NOT_FOUND', { message: 'Conversation not found.' });
  const otherId =
    conversation.user1_id === principalId ? conversation.user2_id : conversation.user1_id;
  const block = await db.userBlock.findFirst({
    where: {
      OR: [
        { blocker_id: principalId, blocked_id: otherId },
        { blocker_id: otherId, blocked_id: principalId },
      ],
    },
    select: { id: true },
  });
  if (block) throw new ORPCError('FORBIDDEN', { message: 'This conversation is paused.' });
}

async function createMessage(db: ChatRepository, command: ChatSendCommand) {
  const data = {
    id: command.operationId,
    author_id: command.principalId,
    content: command.content,
  };
  const message =
    command.channel.kind === 'group'
      ? await db.groupMessage.create({
          data: { ...data, group_id: command.channel.id },
          select: { id: true },
        })
      : await db.directMessage.create({
          data: { ...data, conversation_id: command.channel.id },
          select: { id: true },
        });
  return { messageId: message.id };
}

/** Message and payload-bound receipt commit together; a lost response replays the receipt. */
export async function settleChatMessage(
  context: ORPCContext,
  input: ChatSendCommand,
): Promise<ChatSendReceipt> {
  const command = ChatSendCommandSchema.parse(input);
  if (command.principalId !== context.user.id)
    throw new ORPCError('FORBIDDEN', { message: 'Chat command belongs to another account.' });
  assertDatabase(context);
  const payloadHash = await getConsistentIdempotencyKey(
    {
      principalId: command.principalId,
      channel: command.channel,
      content: command.content,
    },
    CHAT_SEND_COMMAND,
  );
  return context.db.$transaction(async (tx) => {
    await tx.$executeRaw`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`;
    await tx.$executeRaw`SET LOCAL statement_timeout = '8s'`;
    await tx.$executeRaw`SET LOCAL lock_timeout = '2s'`;
    const receipts = createOperationReceiptPort<{ messageId: string }>(tx, command.principalId);
    const claim = await receipts.claim({
      capability: CHAT_SEND_COMMAND,
      principalId: command.principalId,
      idempotencyKey: command.operationId,
      payloadHash,
    });
    if (claim.kind === 'payload-conflict' || claim.kind === 'conflict')
      throw new ORPCError('CONFLICT', {
        message: 'Chat operation ID was used for another message.',
      });
    if (claim.kind === 'failed' || claim.kind === 'in-progress')
      throw new ORPCError('SERVICE_UNAVAILABLE', {
        message: 'Chat outcome is not committed. Retry the same operation.',
      });
    let result: { messageId: string };
    if (claim.kind === 'replay') result = ChatMessageResultSchema.parse(claim.receipt.result);
    else {
      await assertChatAuthority(tx, command);
      result = await createMessage(tx, command);
      await tx.sentinelAuditLog.create({
        data: {
          action: 'chat_message_sent',
          actor_id: command.principalId,
          resource_type: command.channel.kind === 'group' ? 'group_message' : 'direct_message',
          resource_id: result.messageId,
          details: { channelId: command.channel.id, operationId: command.operationId },
        },
      });
      await receipts.complete({ operationId: claim.receipt.operationId, payloadHash, result });
    }
    return {
      ...result,
      operationId: command.operationId,
      receiptId: claim.receipt.operationId,
      status: 'completed',
    };
  });
}
