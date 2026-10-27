import { orpcClient } from '@repo/core/api/orpcClient';
import {
  type ChatSendCommand,
  ChatSendCommandSchema,
  ChatSendReceiptSchema,
} from '@repo/core/logic/schemas/chat-command.schema';

export async function replayChatSendCommand(input: unknown, principalId: string | undefined) {
  const command = ChatSendCommandSchema.parse(input);
  if (!principalId || command.principalId !== principalId)
    throw new Error('Chat command owner does not match the queued account.');
  return sendChatCommand(command);
}

/** A queue acceptance is never returned here as a successful delivery. */
export async function sendChatCommand(command: ChatSendCommand) {
  const body = ChatSendCommandSchema.parse(command);
  const result =
    body.channel.kind === 'group'
      ? await orpcClient.community.sendMessageCommand({ body })
      : await orpcClient.messaging.sendMessageCommand({ body });
  const receipt = ChatSendReceiptSchema.parse(result);
  if (receipt.operationId !== body.operationId || receipt.messageId !== body.operationId)
    throw new Error('Chat receipt does not match the pending operation.');
  return receipt;
}
