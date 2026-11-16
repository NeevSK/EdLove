import type { PipelineStateType, ScaffoldingContract } from '../types/state.js';

export async function scaffoldNode(state: PipelineStateType): Promise<Partial<PipelineStateType>> {
  // If a declarative 4-layer flow is present, construct a flow-grounded typed contract
  if (state.flowDefinition) {
    const flow = state.flowDefinition;
    const cleanId = flow.metadata.id.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const states = Object.keys(flow.states);
    const terminals = Object.keys(flow.terminals);

    const schemaText = `import { z } from 'zod';

/**
 * 4-Layer Flow Scaffolding Contract: ${flow.metadata.id}
 * Version: ${flow.metadata.version} | Risk Tier: ${flow.metadata.riskTier}
 * Domain: ${flow.metadata.domain}
 */

export const ${cleanId}_States = ${JSON.stringify(states)} as const;
export type ${cleanId}_State = (typeof ${cleanId}_States)[number];

export const ${cleanId}_Terminals = ${JSON.stringify(terminals)} as const;
export type ${cleanId}_Terminal = (typeof ${cleanId}_Terminals)[number];

export const ${cleanId}_Invariants = {
  rlsPolicy: "${flow.invariants.rlsPolicy.replace(/"/g, '\\"')}",
  softDeleteField: "${flow.invariants.softDeleteField}",
  tenantIsolationField: "${flow.invariants.tenantIsolationField}",
  forbiddenDialects: ${JSON.stringify(flow.invariants.forbiddenDialects)},
} as const;

export const ${cleanId}_InputSchema = z.object({
  journeyId: z.literal('${flow.metadata.id}'),
  version: z.literal('${flow.metadata.version}'),
  ingressVector: z.enum([${flow.ingress.supportedVectors.map((v) => `'${v.type}'`).join(', ')}]),
  payload: z.record(z.unknown()),
});

export const ${cleanId}_OutputSchema = z.object({
  status: z.enum(['success', 'failure', 'cancelled']),
  terminalNode: z.enum([${terminals.map((t) => `'${t}'`).join(', ')}]),
  payload: z.record(z.unknown()),
});

export type ${cleanId}_Input = z.infer<typeof ${cleanId}_InputSchema>;
export type ${cleanId}_Output = z.infer<typeof ${cleanId}_OutputSchema>;
`;

    const contract: ScaffoldingContract = {
      path: `contracts/${cleanId}.contract.ts`,
      contractType: 'zod',
      schemaText,
    };

    return { contract };
  }

  // Fallback: construct a basic typed contract for arbitrary intents
  const contractName = state.intent.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const contract: ScaffoldingContract = {
    path: `contracts/${contractName}.contract.ts`,
    contractType: 'zod',
    schemaText: `import { z } from 'zod';

export const ${contractName}InputSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number().int(),
});

export const ${contractName}OutputSchema = z.object({
  success: z.boolean(),
  payload: z.record(z.unknown()),
});

export type ${contractName}Input = z.infer<typeof ${contractName}InputSchema>;
export type ${contractName}Output = z.infer<typeof ${contractName}OutputSchema>;
`,
  };

  return {
    contract,
  };
}
