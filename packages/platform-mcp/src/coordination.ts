import { createHash } from 'node:crypto';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  readAllChanges,
  readChange,
  readEvents,
  transaction,
  withStore,
} from './coordinationStore.js';

const text = z.string().trim().min(1).max(4000);
const identifier = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/);
export type CoordinationImpact =
  | 'product'
  | 'architecture'
  | 'database'
  | 'api'
  | 'web'
  | 'native'
  | 'dependencies'
  | 'integration'
  | 'security';

export interface DomainCapacity {
  readonly maxWip: number;
  readonly targetVerificationMs: number;
}

export const DOMAIN_CAPACITIES: Record<CoordinationImpact, DomainCapacity> = {
  api: { maxWip: 4, targetVerificationMs: 15_000 },
  native: { maxWip: 3, targetVerificationMs: 30_000 },
  web: { maxWip: 4, targetVerificationMs: 15_000 },
  database: { maxWip: 2, targetVerificationMs: 45_000 },
  security: { maxWip: 2, targetVerificationMs: 30_000 },
  dependencies: { maxWip: 3, targetVerificationMs: 20_000 },
  architecture: { maxWip: 3, targetVerificationMs: 25_000 },
  product: { maxWip: 5, targetVerificationMs: 10_000 },
  integration: { maxWip: 3, targetVerificationMs: 30_000 },
};

export interface CoordinationWip {
  readonly globalActiveCount: number;
  readonly domainCounts: Record<CoordinationImpact, number>;
  readonly saturatedDomains: readonly CoordinationImpact[];
  readonly activeCount: number;
  readonly maxWip: number;
  readonly saturated: boolean;
  readonly warning?: string;
}

const impacts = z.enum([
  'product',
  'architecture',
  'database',
  'api',
  'web',
  'native',
  'dependencies',
  'integration',
  'security',
]);
const source = z.strictObject({ path: text, scope: text });
const link = z.strictObject({
  subject: text,
  predicate: text,
  object: text,
  sourcePath: text,
  classification: z.enum(['declared', 'mechanically-extracted', 'inferred', 'unresolved']),
});
export const coordinationRequestSchema = z.discriminatedUnion('action', [
  z.strictObject({
    action: z.literal('create'),
    id: identifier,
    goal: text,
    impacts: z.array(impacts).min(1).max(9),
    sources: z.array(source).min(1).max(100),
    links: z.array(link).max(500).optional(),
    force: z.boolean().optional(),
    bypassWipCheck: z.boolean().optional(),
  }),
  z.strictObject({ action: z.literal('status'), id: identifier }),
  z.strictObject({
    action: z.literal('record'),
    id: identifier,
    actionId: identifier,
    stage: z.enum(['analysis', 'reconciliation']),
    notes: text,
    evidencePaths: z.array(text).min(1).max(100),
    unresolved: z.array(text).max(100),
  }),
  z.strictObject({
    action: z.literal('check'),
    id: identifier,
    actionId: identifier,
    checkId: identifier,
  }),
]);
const changeSchema = z.strictObject({
  id: identifier,
  goal: text,
  impacts: z.array(impacts),
  sources: z.array(source.extend({ sha256: z.string() })),
  links: z.array(link),
  requiredChecks: z.array(identifier),
  procedureVersion: z.literal('1'),
  procedureRevision: text,
});
const checkResultSchema = z.strictObject({
  ok: z.boolean(),
  stdout: z.string(),
  stderr: z.string(),
  exitCode: z.number().nullable(),
  error: z.string().optional(),
});
const eventSchema = z.strictObject({
  actionId: identifier,
  payload: z.string(),
  observedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().optional(),
  stage: z.enum(['analysis', 'reconciliation', 'check']),
  evidencePaths: z.array(z.string()),
  unresolved: z.array(z.string()),
  checkId: identifier.optional(),
  result: checkResultSchema.optional(),
  state: z.enum(['recorded', 'pending', 'finished', 'stale']),
});
type Change = z.infer<typeof changeSchema>;
type Event = z.infer<typeof eventSchema>;
type Options = {
  root: string;
  databasePath: string;
  procedureRevision?: string;
  maxWip?: number;
  checks: readonly { id: string; impacts: readonly string[] }[];
  runCheck: (id: string) => {
    ok: boolean;
    stdout: string;
    stderr: string;
    exitCode: number | null;
    error?: string;
  };
};
const hash = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
export function fingerprint(root: string, file: string): string {
  if (
    path.isAbsolute(file) ||
    file
      .split(/[\\/]/)
      .some(
        (part) =>
          part === '..' ||
          /^\.env(?:\.|$)/i.test(part) ||
          /^(?:secrets?|credentials?)$/i.test(part),
      ) ||
    /\.(?:pem|key|p12|pfx)$/i.test(file)
  )
    throw new Error('invalid_source_path');
  const base = realpathSync(root);
  const resolved = realpathSync(path.resolve(base, file));
  const relative = path.relative(base, resolved);
  if (
    !relative ||
    relative.startsWith('..') ||
    path.isAbsolute(relative) ||
    relative
      .split(/[\\/]/)
      .some(
        (part) =>
          /^\.env(?:\.|$)/i.test(part) ||
          /^(?:\.git|node_modules|secrets?|credentials?|\.doppler)$/i.test(part),
      ) ||
    /\.(?:pem|key|p12|pfx)$/i.test(relative) ||
    !statSync(resolved).isFile()
  )
    throw new Error('invalid_source_path');
  return hash(readFileSync(resolved));
}
function staleSources(change: Change, root: string): string[] {
  return change.sources
    .filter((item) => {
      try {
        return fingerprint(root, item.path) !== item.sha256;
      } catch {
        return true;
      }
    })
    .map((item) => item.path);
}
function revision(options: Options): string {
  const modulePath = fileURLToPath(import.meta.url);
  const storePath = path.join(
    path.dirname(modulePath),
    `coordinationStore${path.extname(modulePath)}`,
  );
  const checks = [...options.checks]
    .map((item) => ({ id: item.id, impacts: [...item.impacts].sort() }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return hash(
    JSON.stringify({
      core: hash(readFileSync(modulePath)),
      store: hash(readFileSync(storePath)),
      checks,
      external: options.procedureRevision ?? null,
    }),
  );
}
function computeDomainCounts(changes: readonly Change[]): Record<CoordinationImpact, number> {
  const counts: Record<CoordinationImpact, number> = {
    api: 0,
    native: 0,
    web: 0,
    database: 0,
    security: 0,
    dependencies: 0,
    architecture: 0,
    product: 0,
    integration: 0,
  };
  for (const c of changes) {
    for (const impact of c.impacts) {
      counts[impact] = (counts[impact] ?? 0) + 1;
    }
  }
  return counts;
}

function getSaturatedDomains(
  domainCounts: Record<CoordinationImpact, number>,
  customMaxWip?: number,
): CoordinationImpact[] {
  const domains = Object.keys(DOMAIN_CAPACITIES) as CoordinationImpact[];
  return domains.filter((domain) => {
    const cap = customMaxWip ?? DOMAIN_CAPACITIES[domain].maxWip;
    return domainCounts[domain] >= cap;
  });
}

function state(
  change: Change,
  events: Event[],
  root: string,
  currentRevision: string,
  wip?: CoordinationWip,
) {
  const stale = staleSources(change, root);
  const unresolved = [...new Set(events.flatMap((event) => event.unresolved))];
  const analysis = events.some((event) => event.stage === 'analysis');
  const passed = change.requiredChecks.filter((id) => {
    const event = [...events]
      .reverse()
      .find((item) => item.stage === 'check' && item.checkId === id);
    return (
      event?.state === 'finished' &&
      event.result?.ok === true &&
      event.result.exitCode === 0 &&
      !event.result.error
    );
  });
  const missingChecks = change.requiredChecks.filter((id) => !passed.includes(id));
  const lastReconciliation = events.map((event) => event.stage).lastIndexOf('reconciliation');
  const lastWork = events.reduce(
    (index, event, current) =>
      event.stage === 'analysis' || event.stage === 'check' ? current : index,
    -1,
  );
  const reconciled = lastReconciliation > lastWork;
  const readiness =
    currentRevision !== change.procedureRevision ||
    stale.length ||
    unresolved.length ||
    !analysis ||
    missingChecks.length ||
    !reconciled
      ? 'blocked'
      : 'ready-for-review';
  return {
    change,
    events,
    staleSources: stale,
    procedureChanged: currentRevision !== change.procedureRevision,
    unresolved,
    missingChecks,
    readiness,
    feedback: readiness === 'ready-for-review' ? 'verified' : 'pending_verification',
    wip,
    limitation:
      'Local records are not authenticated, tamper-proof, or proof of product completion. Source changes require a new change ID and reconsideration; no automatic rebase.',
  };
}
export function handleCoordination(input: unknown, options: Options) {
  const request = coordinationRequestSchema.parse(input);
  return withStore(options.databasePath, (db) => {
    if (request.action === 'create')
      return transaction(db, () => {
        if (
          new Set(request.sources.map((item) => item.path)).size !== request.sources.length ||
          new Set(request.impacts).size !== request.impacts.length
        )
          throw new Error('duplicate_input');
        const sources = request.sources.map((item) => ({
          ...item,
          sha256: fingerprint(options.root, item.path),
        }));
        if (
          (request.links ?? []).some(
            (item) => !sources.some((entry) => entry.path === item.sourcePath),
          )
        )
          throw new Error('unknown_link_source');
        if (
          request.impacts.some(
            (impact) => !options.checks.some((check) => check.impacts.includes(impact)),
          )
        )
          throw new Error('uncovered_impact');
        const requiredChecks = options.checks
          .filter((check) =>
            check.impacts.some((impact) => request.impacts.includes(impacts.parse(impact))),
          )
          .map((check) => identifier.parse(check.id));
        if (new Set(requiredChecks).size !== requiredChecks.length)
          throw new Error('duplicate_check');
        const bypassWip = Boolean(request.force || request.bypassWipCheck);
        const existingChanges = readAllChanges(db).map((c) => changeSchema.parse(c));
        const activeUnverified = existingChanges.filter((c) => {
          const ev = readEvents(db, c.id).map((e) => eventSchema.parse(e));
          return state(c, ev, options.root, revision(options)).readiness !== 'ready-for-review';
        });

        if (!bypassWip) {
          for (const domain of request.impacts) {
            const domainMaxWip = options.maxWip ?? DOMAIN_CAPACITIES[domain].maxWip;
            const activeInDomain = activeUnverified.filter((c) => c.impacts.includes(domain));
            const domainChanges = existingChanges.filter((c) => c.impacts.includes(domain));
            const latestChangeInDomain = domainChanges.at(-1);
            let latestHasUnresolvedChecks = false;
            if (latestChangeInDomain) {
              const prevEvents = readEvents(db, latestChangeInDomain.id).map((e) =>
                eventSchema.parse(e),
              );
              const prevState = state(
                latestChangeInDomain,
                prevEvents,
                options.root,
                revision(options),
              );
              latestHasUnresolvedChecks = prevState.missingChecks.length > 0;
            }

            if (activeInDomain.length >= domainMaxWip || latestHasUnresolvedChecks) {
              throw new Error(
                `WIP_SATURATION: Domain '${domain}' verification capacity saturated (R_gen > R_ver); resolve or reconcile pending changes in '${domain}' before initiating new changes`,
              );
            }
          }
        }
        const change = changeSchema.parse({
          id: request.id,
          goal: request.goal,
          impacts: request.impacts,
          sources,
          links: request.links ?? [],
          requiredChecks,
          procedureVersion: '1',
          procedureRevision: revision(options),
        });
        db.prepare('INSERT INTO changes(id, data) VALUES (?, ?)').run(
          request.id,
          JSON.stringify(change),
        );
        const allActive = [...activeUnverified, change];
        const globalActiveCount = allActive.length;
        const domainCounts = computeDomainCounts(allActive);
        const saturatedDomains = getSaturatedDomains(domainCounts, options.maxWip);
        const saturated = saturatedDomains.length > 0;
        const warning = saturated
          ? `WIP_SATURATION: Domain '${saturatedDomains.join(', ')}' verification capacity saturated (R_gen > R_ver); resolve or reconcile pending changes in '${saturatedDomains.join(', ')}' before initiating new changes`
          : undefined;

        return state(change, [], options.root, revision(options), {
          globalActiveCount,
          domainCounts,
          saturatedDomains,
          activeCount: globalActiveCount,
          maxWip: options.maxWip ?? 5,
          saturated,
          ...(warning ? { warning } : {}),
        });
      });
    const get = () => ({
      change: changeSchema.parse(readChange(db, request.id)),
      events: readEvents(db, request.id).map((event) => eventSchema.parse(event)),
    });
    if (request.action === 'status') {
      const { change, events } = get();
      const existingChanges = readAllChanges(db).map((c) => changeSchema.parse(c));
      const activeUnverified = existingChanges.filter((c) => {
        const ev = readEvents(db, c.id).map((e) => eventSchema.parse(e));
        return state(c, ev, options.root, revision(options)).readiness !== 'ready-for-review';
      });
      const globalActiveCount = activeUnverified.length;
      const domainCounts = computeDomainCounts(activeUnverified);
      const saturatedDomains = getSaturatedDomains(domainCounts, options.maxWip);
      const saturated = saturatedDomains.length > 0;
      const warning = saturated
        ? `WIP_SATURATION: Domain '${saturatedDomains.join(', ')}' verification capacity saturated (R_gen > R_ver); resolve or reconcile pending changes in '${saturatedDomains.join(', ')}' before initiating new changes`
        : undefined;

      return state(change, events, options.root, revision(options), {
        globalActiveCount,
        domainCounts,
        saturatedDomains,
        activeCount: globalActiveCount,
        maxWip: options.maxWip ?? 5,
        saturated,
        ...(warning ? { warning } : {}),
      });
    }
    const payload = JSON.stringify(request);
    const prepared = transaction(db, () => {
      const { change, events } = get();
      const existing = events.find((event) => event.actionId === request.actionId);
      if (existing) {
        if (existing.payload !== payload) throw new Error('action_id_conflict');
        return { change, events, duplicate: true };
      }
      const current = state(change, events, options.root, revision(options));
      if (current.staleSources.length) throw new Error('stale_sources');
      if (current.procedureChanged) throw new Error('procedure_changed');
      if (request.action === 'record') {
        if (
          request.evidencePaths.some((file) => !change.sources.some((entry) => entry.path === file))
        )
          throw new Error('unknown_evidence');
        if (
          request.stage === 'reconciliation' &&
          (!events.some((event) => event.stage === 'analysis') ||
            current.missingChecks.length ||
            current.unresolved.length ||
            request.unresolved.length)
        )
          throw new Error('missing_prerequisite');
        const event: Event = {
          actionId: request.actionId,
          payload,
          observedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          stage: request.stage,
          evidencePaths: request.evidencePaths,
          unresolved: request.unresolved,
          state: 'recorded',
        };
        db.prepare('INSERT INTO events(change_id, action_id, data) VALUES (?, ?, ?)').run(
          request.id,
          event.actionId,
          JSON.stringify(event),
        );
        return { change, events: [...events, event], duplicate: false };
      }
      if (
        !events.some((event) => event.stage === 'analysis') ||
        !change.requiredChecks.includes(request.checkId)
      )
        throw new Error('missing_prerequisite');
      if (!options.checks.some((check) => check.id === request.checkId))
        throw new Error('check_unavailable');
      const event: Event = {
        actionId: request.actionId,
        payload,
        observedAt: new Date().toISOString(),
        stage: 'check',
        checkId: request.checkId,
        evidencePaths: [],
        unresolved: [],
        state: 'pending',
      };
      db.prepare('INSERT INTO events(change_id, action_id, data) VALUES (?, ?, ?)').run(
        request.id,
        event.actionId,
        JSON.stringify(event),
      );
      return { change, events: [...events, event], duplicate: false };
    });
    if (request.action !== 'check' || prepared.duplicate)
      return {
        ...state(prepared.change, prepared.events, options.root, revision(options)),
        duplicate: prepared.duplicate,
      };
    const result = checkResultSchema.parse(options.runCheck(request.checkId));
    return transaction(db, () => {
      const { change, events } = get();
      const pending = events.find((event) => event.actionId === request.actionId);
      if (!pending || pending.state !== 'pending') throw new Error('check_state_conflict');
      const event: Event = {
        ...pending,
        result,
        finishedAt: new Date().toISOString(),
        state:
          staleSources(change, options.root).length ||
          revision(options) !== change.procedureRevision
            ? 'stale'
            : 'finished',
      };
      db.prepare('UPDATE events SET data = ? WHERE change_id = ? AND action_id = ?').run(
        JSON.stringify(event),
        request.id,
        request.actionId,
      );
      return {
        ...state(
          change,
          events.map((item) => (item.actionId === event.actionId ? event : item)),
          options.root,
          revision(options),
        ),
        duplicate: false,
      };
    });
  });
}
