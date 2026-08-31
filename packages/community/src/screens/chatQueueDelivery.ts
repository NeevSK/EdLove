export type QueueDeliveryResult =
  | {
      status: 'delivered';
      deliveredCount: number;
      remainingMessages: [];
    }
  | {
      status: 'stopped';
      deliveredCount: number;
      remainingMessages: string[];
      error: unknown;
    };

/**
 * Preserves message order and stops at the first failure so a later message
 * cannot overtake one that still needs delivery.
 */
export async function deliverQueuedMessages<TMessage>(
  messages: readonly string[],
  send: (content: string) => Promise<TMessage>,
): Promise<QueueDeliveryResult> {
  for (const [index, content] of messages.entries()) {
    try {
      await send(content);
    } catch (error) {
      return {
        status: 'stopped',
        deliveredCount: index,
        remainingMessages: messages.slice(index),
        error,
      };
    }
  }

  return {
    status: 'delivered',
    deliveredCount: messages.length,
    remainingMessages: [],
  };
}
