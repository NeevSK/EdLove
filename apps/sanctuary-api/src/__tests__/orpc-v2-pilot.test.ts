import { adminORPCContract } from '@repo/core/api/admin.orpc.contract';
import { executePilotProcedure, pilotV2Contract } from '@repo/core/api/pilot.orpc.v2';
import { describe, expect, it } from 'vitest';

describe('oRPC v2 Beta Pilot Contract & Coexistence Spike', () => {
  it('executes ping procedure with schema validation and latency computation', async () => {
    const now = 1760000000000;
    const result = await executePilotProcedure(
      'ping',
      {
        message: 'Hello Sovereign Mesh',
        timestamp: now - 45,
      },
      { now },
    );

    expect(result.reply).toBe('Pong: Hello Sovereign Mesh');
    expect(result.echo).toBe('Hello Sovereign Mesh');
    expect(result.latencyMs).toBe(45);
    expect(result.serverTime).toBe(new Date(now).toISOString());
  });

  it('rejects invalid ping inputs conforming to Zod strict schema rules', async () => {
    await expect(executePilotProcedure('ping', { message: '' })).rejects.toThrow();
    await expect(executePilotProcedure('ping', { message: 123 as any })).rejects.toThrow();
    await expect(
      executePilotProcedure('ping', { message: 'valid', unexpectedKey: 'slop' } as any),
    ).rejects.toThrow();
  });

  it('executes secureEcho procedure calculating SHA-256 digests', async () => {
    const result = await executePilotProcedure('secureEcho', {
      payload: 'student-learning-assessment-record',
      authority: 'sanctuary-node-alpha',
    });

    expect(result.verified).toBe(true);
    expect(result.digest.length).toBe(64); // 32-byte hex hash
    expect(result.authority).toBe('sanctuary-node-alpha');
    expect(result.epoch).toBeGreaterThan(0);
  });

  it('verifies v1 contracts and v2 pilot contracts coexist in memory without collision', () => {
    // 1. Verify v1 contract shape is intact
    expect(adminORPCContract).toBeDefined();
    expect(adminORPCContract.getStaffPresence.method).toBe('get');
    expect(adminORPCContract.getStaffPresence.metadata.policy.subject).toBe('Staff');

    // 2. Verify v2 pilot contract shape is intact
    expect(pilotV2Contract).toBeDefined();
    expect(pilotV2Contract.ping.meta.version).toBe('v2');
    expect(pilotV2Contract.secureEcho.route.path).toBe('/pilot/secure-echo');
  });
});
