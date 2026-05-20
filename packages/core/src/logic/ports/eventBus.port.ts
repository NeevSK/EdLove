import { z } from 'zod';

/**
 * IEventBusPort
 *
 * Framework-agnostic port for publishing domain events.
 * Decouples the core from Inngest, RabbitMQ, or any specific message bus.
 */

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  tenantId?: string;
}

export interface DomainEvent<T = any> {
  name: string;
  data: T;
  metadata?: EventMetadata;
}

export interface IEventBusPort {
  /**
   * Publish a domain event.
   */
  publish<T>(event: DomainEvent<T>): Promise<void>;
}

/**
 * Standardized Payloads (Pure Zod)
 */
export const UserCreatedEventSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string(),
});
