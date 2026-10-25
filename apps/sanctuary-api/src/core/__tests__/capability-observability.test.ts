import { describe, expect, it, vi } from 'vitest';
import type { CapabilityDescriptor } from '@repo/core/api/capabilityFoundation';
import {
  capabilityEmissionPolicy,
  recordCapabilityAudit,
} from '../capabilityObservability';

const descriptor: CapabilityDescriptor = {
  id: 'test.capability',
  lifecycle: 'commit',
  privacy: 'sensitive',
  idempotency: 'required',
  receipt: 'required',
  audit: 'minimal',
  activity: { kind: 'none' },
  telemetry: { kind: 'operational', allowedFields: ['capability', 'outcome'] },
  effect: { kind: 'none' },
};

describe('capability observability boundary', () => {
  it('records a durable audit without treating it as product activity', async () => {
    const create = vi.fn(async () => undefined);

    await recordCapabilityAudit({ sentinelAuditLog: { create } }, descriptor, {
      action: 'test_recorded',
      actorId: 'actor',
      resourceType: 'test',
      resourceId: 'resource',
      details: { operationId: 'operation' },
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'test_recorded',
        details: { capability: 'test.capability', operationId: 'operation' },
      }),
    });
    expect(capabilityEmissionPolicy(descriptor)).toEqual({
      productActivity: false,
      telemetry: true,
      telemetryFields: ['capability', 'outcome'],
      deferredEffect: false,
    });
  });

  it('does not create an audit row when a capability has no audit policy', async () => {
    const create = vi.fn(async () => undefined);
    await recordCapabilityAudit(
      { sentinelAuditLog: { create } },
      { ...descriptor, audit: 'none' },
      {
        action: 'unlogged',
        actorId: 'actor',
        resourceType: 'test',
        resourceId: 'resource',
        details: {},
      },
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('keeps the descriptor capability authoritative over caller details', async () => {
    const create = vi.fn(async () => undefined);
    await recordCapabilityAudit({ sentinelAuditLog: { create } }, descriptor, {
      action: 'test_recorded',
      actorId: 'actor',
      resourceType: 'test',
      resourceId: 'resource',
      details: { capability: 'forged.capability' },
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        details: { capability: 'test.capability' },
      }),
    });
  });
});
