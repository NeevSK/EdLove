import { z } from 'zod';

/**
 * oRPC v2 Beta Pilot Contract & Procedure Specification
 *
 * Designed to evaluate modern v2 builder patterns, strongly-typed error maps,
 * and dual-wire routing without breaking active v1.15.7 contracts.
 */

// 1. Zod v4-compatible Input/Output Schemas
export const PilotPingInputSchema = z.strictObject({
  message: z.string().min(1).max(256),
  timestamp: z.number().int().positive().optional(),
});

export const PilotPingOutputSchema = z.strictObject({
  reply: z.string(),
  echo: z.string(),
  latencyMs: z.number().nonnegative(),
  serverTime: z.string(),
});

export const PilotSecureEchoInputSchema = z.strictObject({
  payload: z.string().min(1),
  authority: z.string().default('sovereign-node'),
});

export const PilotSecureEchoOutputSchema = z.strictObject({
  verified: z.boolean(),
  digest: z.string(),
  authority: z.string(),
  epoch: z.number(),
});

export type PilotPingInput = z.infer<typeof PilotPingInputSchema>;
export type PilotPingOutput = z.infer<typeof PilotPingOutputSchema>;
export type PilotSecureEchoInput = z.infer<typeof PilotSecureEchoInputSchema>;
export type PilotSecureEchoOutput = z.infer<typeof PilotSecureEchoOutputSchema>;

export interface PilotProcedureDefinition<TInput, TOutput> {
  name: string;
  route: {
    method: 'GET' | 'POST';
    path: string;
  };
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  meta: {
    policy?: {
      action: string;
      subject: string;
    };
    version: 'v2';
  };
}

/**
 * Declarative v2 contract map for the pilot procedures
 */
export const pilotV2Contract = {
  ping: {
    name: 'pilot.ping',
    route: { method: 'GET', path: '/pilot/ping' },
    inputSchema: PilotPingInputSchema,
    outputSchema: PilotPingOutputSchema,
    meta: { policy: { action: 'read', subject: 'System' }, version: 'v2' },
  } satisfies PilotProcedureDefinition<PilotPingInput, PilotPingOutput>,

  secureEcho: {
    name: 'pilot.secureEcho',
    route: { method: 'POST', path: '/pilot/secure-echo' },
    inputSchema: PilotSecureEchoInputSchema,
    outputSchema: PilotSecureEchoOutputSchema,
    meta: { policy: { action: 'create', subject: 'Echo' }, version: 'v2' },
  } satisfies PilotProcedureDefinition<PilotSecureEchoInput, PilotSecureEchoOutput>,
};

/**
 * Pilot Procedure Execution Engine
 * Evaluates v2 procedure dispatch and validates schemas at runtime.
 */
export async function executePilotProcedure<K extends keyof typeof pilotV2Contract>(
  procedureKey: K,
  rawInput: unknown,
  context?: { user?: { id: string }; now?: number },
): Promise<z.infer<(typeof pilotV2Contract)[K]['outputSchema']>> {
  const def = pilotV2Contract[procedureKey];
  if (!def) {
    throw new Error(`Pilot procedure not found: ${String(procedureKey)}`);
  }

  // 1. Input Validation
  const parsedInput = def.inputSchema.parse(rawInput);
  const now = context?.now ?? Date.now();

  // 2. Procedure Logic Dispatch
  switch (procedureKey) {
    case 'ping': {
      const input = parsedInput as PilotPingInput;
      const sentTime = input.timestamp ?? now;
      const latency = Math.max(0, now - sentTime);
      return def.outputSchema.parse({
        reply: `Pong: ${input.message}`,
        echo: input.message,
        latencyMs: latency,
        serverTime: new Date(now).toISOString(),
      }) as z.infer<(typeof pilotV2Contract)[K]['outputSchema']>;
    }

    case 'secureEcho': {
      const input = parsedInput as PilotSecureEchoInput;
      const crypto = await import('node:crypto');
      const digest = crypto.createHash('sha256').update(input.payload).digest('hex');
      return def.outputSchema.parse({
        verified: true,
        digest,
        authority: input.authority,
        epoch: now,
      }) as z.infer<(typeof pilotV2Contract)[K]['outputSchema']>;
    }

    default:
      throw new Error(`Unhandled pilot procedure: ${String(procedureKey)}`);
  }
}
