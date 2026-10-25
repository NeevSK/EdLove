import type { CapabilityDescriptor } from '@repo/core/api/capabilityFoundation';

export type CapabilityAuditInput = Readonly<{
  action: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
}>;

/**
 * Durable audit is an in-transaction accountability record. It is neither a
 * product activity feed nor analytics telemetry; those channels are admitted
 * separately by the capability descriptor.
 */
export async function recordCapabilityAudit(
  tx: { sentinelAuditLog: { create(input: unknown): Promise<unknown> } },
  descriptor: CapabilityDescriptor,
  input: CapabilityAuditInput,
): Promise<void> {
  if (descriptor.audit === 'none') return;
  await tx.sentinelAuditLog.create({
    data: {
      action: input.action,
      actor_id: input.actorId,
      resource_type: input.resourceType,
      resource_id: input.resourceId,
      details: { ...input.details, capability: descriptor.id },
    },
  });
}

export function capabilityEmissionPolicy(descriptor: CapabilityDescriptor): Readonly<{
  productActivity: boolean;
  telemetry: boolean;
  telemetryFields: readonly string[];
  deferredEffect: boolean;
}> {
  return {
    productActivity: descriptor.activity.kind === 'product-activity',
    telemetry: descriptor.telemetry.kind === 'operational',
    telemetryFields:
      descriptor.telemetry.kind === 'operational' ? descriptor.telemetry.allowedFields : [],
    deferredEffect: descriptor.effect.kind === 'deferred-effect',
  };
}
