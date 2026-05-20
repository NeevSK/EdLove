import type { Inngest } from 'inngest';
import type { DomainEvent, IEventBusPort } from '../../logic/ports/eventBus.port';

/**
 * InngestEventBusAdapter
 *
 * Concrete implementation of IEventBusPort for Inngest.
 */
export const createInngestEventBusAdapter = (client: Inngest<any>): IEventBusPort => ({
  async publish(event: DomainEvent) {
    await client.send({
      name: event.name as any,
      data: {
        ...event.data,
        correlationId: event.metadata?.correlationId,
        causationId: event.metadata?.causationId,
        tenantId: event.metadata?.tenantId,
      },
    });
  },
});
