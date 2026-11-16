import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const study = path.resolve(here, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(study, 'trial-manifest.json'), 'utf8'));
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const frozenHash = sha(fs.readFileSync(path.join(here, 'controller.frozen.mjs')));
const rows = [];
const signatures = new Map();
for (const trial of manifest.trials) {
  const packet = JSON.parse(fs.readFileSync(trial.packetFile, 'utf8'));
  const signature = JSON.stringify({ request: packet.request, sources: packet.sources.map(({ id, sha256 }) => ({ id, sha256 })), outputShape: packet.outputShape, toolActionLimit: packet.toolActionLimit });
  const previous = signatures.get(trial.caseId);
  signatures.set(trial.caseId, signature);
  const sourcesIntact = packet.sources.every((source) => sha(fs.readFileSync(path.join(trial.directory, source.file))) === source.sha256);
  const controllerIntact = sha(fs.readFileSync(path.join(trial.directory, 'tools/controller.mjs'))) === frozenHash;
  let outputValid = null;
  let hasRawFinal = false;
  if (trial.output) {
    const output = JSON.parse(fs.readFileSync(trial.output, 'utf8'));
    outputValid = output.workId === packet.workId;
    hasRawFinal = fs.existsSync(path.join(path.dirname(trial.output), 'raw-final.txt'));
  }
  rows.push({ trialId: trial.trialId, matchedCasePacket: previous === undefined || previous === signature, sourcesIntact, controllerIntact, outputValid, hasRawFinal, model: trial.model, effort: trial.reasoningEffort, withinToolLimit: Number.isInteger(trial.toolActionsObserved) ? trial.toolActionsObserved <= 20 : null });
}
const caseModels = [...new Set(manifest.trials.map((trial) => trial.caseId))].map((caseId) => ({ caseId, models: [...new Set(manifest.trials.filter((trial) => trial.caseId === caseId && trial.model).map((trial) => `${trial.model}@${trial.reasoningEffort}`))] }));
const result = { observedAt: new Date().toISOString(), rows, caseModels, guarantees: 'File integrity, matching case inputs, observed model settings and model-visible invocation counts only. Not semantic truth, sandbox isolation or measured discovery recall.' };
fs.writeFileSync(path.join(study, 'artifact-audit.json'), JSON.stringify(result, null, 2));
const violations = rows.filter((row) => !row.matchedCasePacket || !row.sourcesIntact || !row.controllerIntact || row.outputValid === false || row.withinToolLimit === false);
console.log(JSON.stringify({ cases: caseModels, prepared: rows.length, responsesReceived: rows.filter((row) => row.outputValid !== null).length, matchingWorkIds: rows.filter((row) => row.outputValid === true).length, violations }, null, 2));
if (violations.length || caseModels.some((row) => row.models.length > 1)) process.exitCode = 1;
