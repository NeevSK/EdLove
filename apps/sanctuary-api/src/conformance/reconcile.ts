// Joins the four layers per capability (intent, symbol, code, practice) and names every gap
// with a fixed code. Pure: the script reads the files, this decides.
// Plan: apps/sanctuary-api/docs/implementation/2026-11-08-capability-conformance-plan.md
import { type CapabilityManifest, type CatalogChannel, evidenceOrder } from '../modules/catalog';
import type { Card } from './cards.adapter';
import type { Consumer } from './consumers.adapter';
import type { DocDrift } from './docTables.adapter';
import { bestPassing, type EvidenceRecord } from './evidence';

export const gapCodes = [
  'INTENT_NO_CARD',
  'INTENT_UNLISTED',
  'INTENT_UNCONFIRMED',
  'INTENT_ONLY',
  'SYMBOL_UNDECLARED',
  'SYMBOL_NO_CONTRACT',
  'DOC_DRIFT',
  'CODE_NO_HANDLER',
  'CODE_NO_POLICY',
  'PRACTICE_NO_EVIDENCE',
  'PRACTICE_BELOW_BAR',
  'PRACTICE_STALE',
  'PRACTICE_NO_CONSUMER',
  'CHANNEL_UNPROVEN',
] as const;
export type GapCode = (typeof gapCodes)[number];

/** `n/a` where no Cedar action applies (platform modules); `unmeasured` until one can be checked. */
export type PolicyState = boolean | 'n/a' | 'unmeasured';

export interface ChannelRun {
  capability: string;
  channel: CatalogChannel;
  passed: boolean;
}

export interface ReconcileInput {
  capabilities: readonly CapabilityManifest[];
  contractPaths: readonly string[];
  implementedPaths: readonly string[];
  cards: Partial<Record<string, Card>>;
  docDrift: readonly DocDrift[];
  evidence: readonly EvidenceRecord[];
  consumers: readonly Consumer[];
  channelRuns: readonly ChannelRun[];
  /** When the code behind each capability last changed (ISO time). */
  changedAt: Partial<Record<string, string>>;
  policy: Partial<Record<string, PolicyState>>;
}

export interface ConformanceRow {
  capability: string;
  module: string;
  kind: CapabilityManifest['kind'] | 'unknown';
  status: CapabilityManifest['status'] | 'undeclared' | 'intended';
  intent: { card?: string; cardStatus?: Card['status']; listed: boolean };
  symbol: { declared: boolean; contract: boolean; docDrift: DocDrift[] };
  code: { handler: boolean; policy: PolicyState };
  practice: {
    required?: CapabilityManifest['requiredEvidence'];
    best?: EvidenceRecord;
    consumers: Consumer[];
    channels: { channel: CatalogChannel; proven: boolean }[];
  };
  gaps: GapCode[];
}

const moduleOf = (name: string) => name.split('.').slice(0, -1).join('.');

export function reconcile(input: ReconcileInput): ConformanceRow[] {
  const rows: ConformanceRow[] = input.capabilities.map((cap) => {
    const card = input.cards[cap.module];
    const listedKind = cap.kind === 'command' ? card?.commands : card?.queries;
    const inContract = input.contractPaths.includes(cap.name);
    const handler = input.implementedPaths.includes(cap.name);
    const policy = input.policy[cap.name] ?? 'unmeasured';
    const drift = input.docDrift.filter((d) => d.module === cap.module);
    const best = bestPassing(input.evidence, cap.name);
    const consumers = input.consumers.filter((c) => c.capability === cap.name);
    const channels = cap.channels.map((channel) => ({
      channel,
      proven: input.channelRuns.some(
        (r) => r.capability === cap.name && r.channel === channel && r.passed,
      ),
    }));
    const changed = input.changedAt[cap.name];
    const admitted = cap.status === 'admitted';

    const gaps: GapCode[] = [];
    if (admitted && !card) gaps.push('INTENT_NO_CARD');
    if (card && !listedKind?.includes(cap.name)) gaps.push('INTENT_UNLISTED');
    if (admitted && card && card.status !== 'admitted') gaps.push('INTENT_UNCONFIRMED');
    if (admitted && !inContract) gaps.push('SYMBOL_NO_CONTRACT');
    if (drift.length > 0) gaps.push('DOC_DRIFT');
    if (inContract && !handler) gaps.push('CODE_NO_HANDLER');
    if (policy === false) gaps.push('CODE_NO_POLICY');
    if (admitted) {
      if (!best) gaps.push('PRACTICE_NO_EVIDENCE');
      else {
        if (evidenceOrder.indexOf(best.level) < evidenceOrder.indexOf(cap.requiredEvidence))
          gaps.push('PRACTICE_BELOW_BAR');
        if (changed && best.at < changed) gaps.push('PRACTICE_STALE');
      }
      if (consumers.length === 0) gaps.push('PRACTICE_NO_CONSUMER');
      if (channels.some((c) => !c.proven)) gaps.push('CHANNEL_UNPROVEN');
    }

    return {
      capability: cap.name,
      module: cap.module,
      kind: cap.kind,
      status: cap.status,
      intent: {
        card: card?.path,
        cardStatus: card?.status,
        listed: Boolean(listedKind?.includes(cap.name)),
      },
      symbol: { declared: true, contract: inContract, docDrift: drift },
      code: { handler, policy },
      practice: { required: cap.requiredEvidence, best, consumers, channels },
      gaps,
    };
  });

  const declared = new Set<string>(input.capabilities.map((c) => c.name));
  const extra = (
    capability: string,
    status: ConformanceRow['status'],
    gap: GapCode,
  ): ConformanceRow => ({
    capability,
    module: moduleOf(capability),
    kind: 'unknown',
    status,
    intent: { listed: gap === 'INTENT_ONLY' },
    symbol: { declared: false, contract: input.contractPaths.includes(capability), docDrift: [] },
    code: { handler: input.implementedPaths.includes(capability), policy: 'unmeasured' },
    practice: { consumers: [], channels: [] },
    gaps: [gap],
  });
  for (const path of input.contractPaths)
    if (!declared.has(path)) rows.push(extra(path, 'undeclared', 'SYMBOL_UNDECLARED'));
  for (const card of Object.values(input.cards))
    for (const name of [...(card?.commands ?? []), ...(card?.queries ?? [])])
      if (!declared.has(name) && !input.contractPaths.includes(name))
        rows.push(extra(name, 'intended', 'INTENT_ONLY'));

  return rows.sort((a, b) => a.capability.localeCompare(b.capability));
}

export function countGaps(rows: readonly ConformanceRow[]): { code: GapCode; count: number }[] {
  return gapCodes.map((code) => ({
    code,
    count: rows.filter((r) => r.gaps.includes(code)).length,
  }));
}
