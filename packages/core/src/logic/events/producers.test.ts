import { sendSyncMutationQueued } from '@repo/core/logic/events/producers';
import type { DomainEvent, IEventBusPort } from '@repo/core/logic/ports/eventBus.port';

describe('sendSyncMutationQueued', () => {
  it('preserves the command identity as broker metadata', async () => {
    const published: DomainEvent[] = [];
    const bus: IEventBusPort = {
      async publish(event) {
        published.push(event);
      },
    };

    await sendSyncMutationQueued(bus, {
      mutationId: 'mutation-42',
      action: 'saveDecision',
      actorId: 'actor-7',
      payload: { decision: 'continue' },
      eventId: 'mutation-42',
    });

    expect(published).toHaveLength(1);
    expect(published[0]).toMatchObject({
      name: 'sync/mutation-queued',
      metadata: { eventId: 'mutation-42' },
    });
  });
});
