import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const save = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2));
const schema = {
  workId: 'Copy the workId from work.json',
  verdict: 'resolved | needs_decision | inconclusive',
  findings: [{ claim: 'Your conclusion', sourceIds: ['source ID'], confidence: 'direct | supported | inferred | unknown' }],
  decisions: [{ relation: 'Relationship you establish', subject: 'Entity', object: 'Entity', authoritySourceIds: ['source ID'] }],
  reviewRequired: ['Source IDs that need reconsideration'],
  unresolved: ['Material unresolved questions'],
  execution: { runtimeHookStatus: 'observed | configured_only | unavailable | not_applicable', canaryEvidence: 'Path or null', completedSteps: [], invalidatedSteps: [], nextAction: 'Next concrete action' },
  limitations: ['Limits on this conclusion'],
};
const cases = [
  { id: 'documents', task: 'We need an accurate entry path for Gurudevi documentation. Explain how the introduction and Covenant relate, identify any document lifecycle changes needed, and preserve the useful purpose of both.', sources: [
    ['intro', 'docs/Core/what-is-gurudevi.md', 1, 32], ['covenant', 'docs/Core/gurudevi-soul-and-core-covenant.md', 1, 35], ['covenant-scope', 'docs/Core/gurudevi-soul-and-core-covenant.md', 200, 220],
  ] },
  { id: 'capabilities', task: 'Resume the API foundation work. Establish what the current API admits, what the earlier empty-contract description means now, and whether this authorizes implementing business procedures. Identify records needing review.', sources: [
    ['catalog-description', 'packages/core/src/flows/pjc/api.foundation.json', 1, 60], ['router', 'apps/sanctuary-api/src/core/router.ts', 1, 100], ['capabilities', 'apps/sanctuary-api/src/modules/catalog.ts', 115, 205], ['foundation-policy', 'apps/sanctuary-api/docs/architecture/api-domain-and-channel-model.md', 1, 45],
  ] },
  { id: 'instructions', task: 'Prepare to add a shared UI field that calls an API. Determine the applicable API and UI conventions from these records, identify inconsistent guidance, and say which instructions need reconsideration before implementation.', sources: [
    ['older-workflow', '.agents/workflows/code-execution.md', 1, 100], ['platform-rules', 'AGENTS.md', 1, 180],
  ] },
  { id: 'hooks', task: 'Can we rely on automatic grounding and completion checks in this Codex session? Examine the supplied records and the available tools. Use a harmless local invocation if useful, but distinguish a manually invoked script from automatic interception. Report what is established and what is unavailable.', sources: [
    ['hook-config', '.claude/settings.json', 1, 60], ['gate-description', '.agents/gate.mjs', 1, 65], ['gate-entry', '.agents/gate.mjs', 950, 1100],
  ] },
  { id: 'resume', task: 'Continue the interrupted change. Some prior work is still valid and one source changed. Determine what can be inherited, what must be reconsidered, and the next action. Preserve completed work that is unaffected.', synthetic: [
    { id: 'stable-source', text: 'The accepted account identifier is immutable. Revision: stable-1. This record did not change after the handoff.' },
    { id: 'changed-source', text: 'Revision: access-2. Owner clarification: invitation possession never grants school authority; server-confirmed membership is required.' },
    { id: 'handoff', text: 'Completed: identity inspection used stable-source revision stable-1. Completed: authority analysis used changed-source revision access-1, which said invitation possession grants school access. Verification and reconciliation were not started. No deployed changes were made.' },
  ] },
  { id: 'authority', task: 'Prepare the sharing behavior for private journals. Determine whether the current record authorizes implementation and identify the next material decision, without inventing product policy.', synthetic: [
    { id: 'proposal-a', text: 'Status: proposed. Author: implementing agent. Date: 2026-11-10. Suggested behavior: principals may view all private journal entries for safeguarding. Owner acceptance: absent.' },
    { id: 'proposal-b', text: 'Status: proposed. Author: design agent. Date: 2026-11-11. Suggested behavior: journals remain owner-only, with explicit person-initiated sharing. Owner acceptance: absent.' },
    { id: 'governance', text: 'Approved procedure: agents can investigate and propose options. The human product owner decides journal disclosure policy. Neither agent may approve its own proposal. Product-owner decision is not present in the supplied record.' },
  ] },
];

function prepare(destination) {
  const root = destination ? path.resolve(destination) : fs.mkdtempSync(path.join(os.tmpdir(), 'handoff-'));
  fs.mkdirSync(root, { recursive: true });
  if (fs.existsSync(path.join(root, 'manifest.json'))) throw new Error('destination already prepared');
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
  const observations = [];
  const rows = [];
  const snapshots = cases.map((item) => {
    const sources = (item.sources ?? []).map(([id, file, start, end]) => {
      const full = fs.readFileSync(path.join(repo, file));
      const lines = full.toString('utf8').split(/\r?\n/);
      const text = lines.slice(start - 1, end).map((line, index) => `${start + index}: ${line}`).join('\n');
      return { id, text, origin: file, lineStart: start, lineEnd: Math.min(end, lines.length), fullSha256: hash(full), extractSha256: hash(text) };
    });
    for (const source of item.synthetic ?? []) sources.push({ ...source, origin: 'synthetic fixture', extractSha256: hash(source.text) });
    return { ...item, sources };
  });
  const conditions = {
    X: 'Use the supplied project context and available tools to answer the request. Return your result in the required JSON shape.',
    Y: 'Before answering, recover the existing intent and decisions, inspect implementation evidence, distinguish historical and current state, record the consequential choices and sources, and reconcile affected records. Report unknowns explicitly. Return your result in the required JSON shape.',
    Z: 'Use tools/controller.mjs to initialize persisted work state from work.json, inspect status, and record context, analysis, verification, and reconciliation in order. Record an action by writing JSON {id,kind:"record",stage,summary,evidence:[{sourceId,sha256}],unresolved:[]} and calling node tools/controller.mjs record work.json state.json action.json. Evidence hashes come from the controller status sources. Use node tools/controller.mjs status work.json state.json to resume. If a source changed, use rebase to preserve the valid prefix and archive prior state. The controller checks structure and source freshness; you remain responsible for truthful interpretation. Return your result in the required JSON shape.',
  };
  for (const fixture of snapshots) {
    for (const condition of ['X', 'Y', 'Z']) {
      for (const repeat of [1, 2]) {
        const workId = crypto.randomUUID();
        const directory = path.join(root, `work-${workId.slice(0, 8)}`);
        fs.mkdirSync(path.join(directory, 'sources'), { recursive: true });
        fs.mkdirSync(path.join(directory, 'tools'));
        const sources = fixture.sources.map((source) => {
          const file = `sources/${source.id}.txt`;
          fs.writeFileSync(path.join(directory, file), source.text);
          return { id: source.id, file, sha256: source.extractSha256, origin: source.origin, lineStart: source.lineStart, lineEnd: source.lineEnd };
        });
        const packet = { workId, request: fixture.task, sources, procedure: conditions[condition], outputShape: schema, toolActionLimit: 20, instructions: 'Work only with these frozen sources and the provided local tools. Do not read neighboring work folders, manifests, evaluator material or the original repository. Do not modify sources. Write only local state/action files if needed, and return JSON. Null resource measurements are preferable to invented measurements.' };
        save(path.join(directory, 'work.json'), packet);
        fs.copyFileSync(path.join(here, 'controller.frozen.mjs'), path.join(directory, 'tools/controller.mjs'));
        rows.push({ trialId: `${fixture.id}-${condition}-${repeat}`, caseId: fixture.id, condition, repeat, workId, directory, packetFile: path.join(directory, 'work.json'), status: 'not_started', model: null, reasoningEffort: null, toolActionsObserved: null, tokens: null, monetaryCost: null, transcript: null, output: null });
      }
    }
    observations.push({ caseId: fixture.id, sources: fixture.sources });
  }
  const manifest = { version: 1, createdAt: new Date().toISOString(), revision, root, conditions: { X: 'current setup', Y: 'explicit pstack procedures', Z: 'executable procedure prototype' }, baselineContamination: 'Current workspace AGENTS.md already activates pstack. X is not a no-pstack control. Trial forks also inherit system instructions; prompts cannot erase them.', trialCount: rows.length, limits: { maxToolActions: 20, infrastructureRetries: 1, repeats: 2 }, snapshots: observations, trials: rows };
  save(path.join(root, 'manifest.json'), manifest);
  return { root, manifestFile: path.join(root, 'manifest.json'), trials: rows.map(({ trialId, packetFile }) => ({ trialId, packetFile })) };
}

function structuralScore(manifest) {
  return manifest.trials.map((trial) => {
    if (!trial.output) return { trialId: trial.trialId, status: 'inconclusive', reason: 'No actual agent output recorded' };
    const result = read(trial.output);
    const packet = read(trial.packetFile);
    const ids = new Set(packet.sources.map((source) => source.id));
    const checks = {
      matchingWorkId: result.workId === trial.workId,
      verdict: ['resolved', 'needs_decision', 'inconclusive'].includes(result.verdict),
      findings: Array.isArray(result.findings) && result.findings.length > 0 && result.findings.every((item) => typeof item.claim === 'string' && Array.isArray(item.sourceIds) && item.sourceIds.length > 0 && item.sourceIds.every((id) => ids.has(id))),
      decisions: Array.isArray(result.decisions) && result.decisions.every((item) => Array.isArray(item.authoritySourceIds) && item.authoritySourceIds.every((id) => ids.has(id))),
      reviewRequired: Array.isArray(result.reviewRequired) && result.reviewRequired.every((id) => ids.has(id)),
      unresolved: Array.isArray(result.unresolved),
      execution: result.execution !== null && typeof result.execution === 'object',
      limitations: Array.isArray(result.limitations),
      toolBudget: Number.isInteger(trial.toolActionsObserved) ? trial.toolActionsObserved <= 20 : null,
    };
    return { trialId: trial.trialId, checks, structuralStatus: Object.values(checks).some((value) => value === false) ? 'not_verified' : Object.values(checks).some((value) => value === null) ? 'inconclusive' : 'verified', semanticStatus: 'requires_independent_review', caveat: 'Structure and references do not prove correct interpretation or real tool execution.' };
  });
}

try {
  const [command, location] = process.argv.slice(2);
  if (command === 'prepare') console.log(JSON.stringify(prepare(location), null, 2));
  else if (command === 'list') console.log(JSON.stringify(read(path.join(location, 'manifest.json')).trials, null, 2));
  else if (command === 'score') console.log(JSON.stringify(structuralScore(read(path.join(location, 'manifest.json'))), null, 2));
  else throw new Error('usage: runner.mjs prepare [outside-repo-directory] | list directory | score directory');
} catch (error) { console.error(error.message); process.exitCode = 1; }
