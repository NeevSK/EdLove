import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const study = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(study, 'trial-manifest.json'), 'utf8'));
const ordered = [...manifest.trials].sort((left, right) => crypto.createHash('sha256').update(left.workId).digest('hex').localeCompare(crypto.createHash('sha256').update(right.workId).digest('hex')));
const rows = [];
const mapping = [];
for (const [index, trial] of ordered.entries()) {
  if (!trial.output) throw new Error(`Missing response ${trial.trialId}`);
  const label = `entry-${String(index + 1).padStart(2, '0')}`;
  const packet = JSON.parse(fs.readFileSync(trial.packetFile, 'utf8'));
  const output = JSON.parse(fs.readFileSync(trial.output, 'utf8'));
  const { workId, execution, ...semanticOutput } = output;
  rows.push({ label, caseId: trial.caseId, request: packet.request, sources: packet.sources.map((source) => ({ id: source.id, text: fs.readFileSync(path.join(trial.directory, source.file), 'utf8') })), response: semanticOutput });
  mapping.push({ label, trialId: trial.trialId });
}
fs.writeFileSync(path.join(study, 'review-material.json'), JSON.stringify({ instructions: 'Evaluate fidelity to the supplied sources and approved criteria. Labels hide model and condition. Response text may reveal methods, so blinding is partial. Do not infer success from style or claimed completion.', rows }, null, 2));
fs.writeFileSync(path.join(study, 'review-map.json'), JSON.stringify(mapping, null, 2));
console.log(JSON.stringify({ entries: rows.length, packet: path.join(study, 'review-material.json') }));
