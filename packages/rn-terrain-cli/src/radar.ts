import fs from 'node:fs';
import path from 'node:path';
import type { RadarRecord, RadarVerdict } from '@rn-terrain/core';

const root = path.resolve(import.meta.dirname, '../../..');
const recordsDir = path.resolve(root, 'docs/RN Terrain/radar/records');

function ensureRecordsDir() {
  fs.mkdirSync(recordsDir, { recursive: true });
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function recordPath(subject: string) {
  return path.join(recordsDir, `${slug(subject)}.json`);
}

export function saveRadarRecord(record: RadarRecord) {
  ensureRecordsDir();
  fs.writeFileSync(recordPath(record.subject), `${JSON.stringify(record, null, 2)}\n`, 'utf8');
}

export function listRadarRecords() {
  ensureRecordsDir();
  return fs
    .readdirSync(recordsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(recordsDir, file), 'utf8')) as RadarRecord)
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

export function loadRadarRecord(subject: string) {
  const target = recordPath(subject);
  return fs.existsSync(target)
    ? (JSON.parse(fs.readFileSync(target, 'utf8')) as RadarRecord)
    : undefined;
}

export function updateRadarRecord(subject: string, changes: Partial<RadarRecord>) {
  const current = loadRadarRecord(subject);
  if (!current) return undefined;
  const updated = { ...current, ...changes, updated_at: new Date().toISOString() };
  saveRadarRecord(updated);
  return updated;
}

export function createRadarRecord(subject: string, options: Record<string, unknown>): RadarRecord {
  const now = new Date().toISOString();
  const evidenceKind = (options.kind as RadarRecord['subject_type'] | undefined) ?? 'package';
  const verdict = (options.verdict as RadarVerdict | undefined) ?? 'ASSESS';
  return {
    id: slug(subject),
    subject,
    subject_type: evidenceKind,
    verdict,
    confidence: 'low',
    category: String(options.category ?? 'unclassified'),
    use_case: String(options.useCase ?? 'Not yet defined'),
    problem: String(options.problem ?? 'Candidate captured for evaluation'),
    current_stack: String(options.currentStack ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    compatibility: {
      expo: String(options.expo ?? 'Expo 57 — unverified'),
      react_native: String(options.reactNative ?? 'React Native 0.86 — unverified'),
      new_architecture: 'unknown',
      web: 'unknown',
    },
    risks: [],
    alternatives: [],
    evidence: options.evidence ? [{ kind: evidenceKind, value: String(options.evidence) }] : [],
    decision: String(
      options.decision ??
        'Do not install until the problem, compatibility, and migration cost are verified.',
    ),
    revisit_when: String(
      options.revisitWhen ?? 'A concrete product requirement cannot be met by the current stack.',
    ),
    created_at: now,
    updated_at: now,
  };
}
