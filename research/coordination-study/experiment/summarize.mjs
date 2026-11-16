import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const study = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(study, file), 'utf8').replace(/^\uFEFF/, ''));
const manifest = read('trial-manifest.json');
const structural = new Map(read('structural-results.json').map((row) => [row.trialId, row]));
const reviewFile = path.join(study, 'semantic-review.json');
const review = fs.existsSync(reviewFile) ? read('semantic-review.json') : null;
const mapping = new Map(read('review-map.json').map((row) => [row.label, row.trialId]));
const reviewRows = review ? Array.isArray(review) ? review : review.rows ?? review.results ?? review.reviews ?? [] : [];
const semantic = new Map(reviewRows.map((row) => [mapping.get(row.label), row]));
const groups = [];
for (const caseId of [...new Set(manifest.trials.map((trial) => trial.caseId))]) {
  for (const condition of ['X', 'Y', 'Z']) {
    const trials = manifest.trials.filter((trial) => trial.caseId === caseId && trial.condition === condition);
    groups.push({ caseId, condition, models: [...new Set(trials.map((trial) => `${trial.model}@${trial.reasoningEffort}`))], returned: trials.filter((trial) => trial.output).length, structuralVerified: trials.filter((trial) => structural.get(trial.trialId)?.structuralStatus === 'verified').length, structuralIssues: trials.flatMap((trial) => Object.entries(structural.get(trial.trialId)?.checks ?? {}).filter(([, value]) => value === false).map(([check]) => ({ trialId: trial.trialId, check }))), semantic: trials.map((trial) => ({ trialId: trial.trialId, review: semantic.get(trial.trialId) ?? null })), toolCalls: trials.map((trial) => trial.toolActionsObserved), tokens: trials.map((trial) => trial.tokens), monetaryCost: null });
  }
}
const result = { observedAt: new Date().toISOString(), responses: manifest.trials.filter((trial) => trial.output).length, required: 36, structuralVerified: [...structural.values()].filter((row) => row.structuralStatus === 'verified').length, semanticReviews: semantic.size, groups, limitations: ['Hand-selected cases with two repetitions per condition do not support general performance or causal superiority claims.', 'Baseline already includes pstack; Y is a bounded procedure reminder rather than the complete suite.', 'Models differ between case groups following user instruction; compare within case only.', 'Structural status reflects limited shape and source-ID checks, not complete schema enforcement or semantic truth.', 'Runtime token usage includes cached input and infrastructure attempts. Monetary cost is unknown.'] };
fs.writeFileSync(path.join(study, 'comparison.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ responses: result.responses, required: result.required, structuralVerified: result.structuralVerified, semanticReviews: result.semanticReviews, groups: groups.map(({ caseId, condition, returned, structuralVerified, structuralIssues }) => ({ caseId, condition, returned, structuralVerified, structuralIssues })) }, null, 2));
