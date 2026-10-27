import { z } from 'zod';

export const CHAT_SEND_COMMAND = 'community.message.send';
export const ChatChannelSchema = z.strictObject({
  kind: z.enum(['group', 'direct']),
  id: z.uuid(),
});
export const ChatSendCommandSchema = z.strictObject({
  operationId: z.uuid(),
  principalId: z.uuid(),
  channel: ChatChannelSchema,
  content: z.string().trim().min(1).max(4000),
});
export const ChatMessageResultSchema = z.strictObject({ messageId: z.uuid() });
export const ChatSendReceiptSchema = ChatMessageResultSchema.extend({
  operationId: z.uuid(),
  receiptId: z.uuid(),
  status: z.literal('completed'),
});
export type ChatChannel = z.infer<typeof ChatChannelSchema>;
export type ChatSendCommand = z.infer<typeof ChatSendCommandSchema>;
export type ChatSendReceipt = z.infer<typeof ChatSendReceiptSchema>;
