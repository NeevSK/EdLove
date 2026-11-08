// Evidence per capability: a test names the capabilities it proves with capabilityTag() in its
// describe or test title, and its suite's level comes from the report file name
// (reports/evidence/<level>.<run>.json, written by the package's test scripts).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { type EvidenceLevel, evidenceOrder } from '../modules/catalog';

export interface EvidenceRecord {
  capability: string;
  level: EvidenceLevel;
  passed: boolean;
  test: string;
  run: string;
  at: string;
}

export const capabilityTag = (...names: string[]) => `[cap:${names.join(',')}]`;

const TAG = /\[cap:([a-z][\w.,]*)\]/g;

const vitestReport = z.object({
  startTime: z.number(),
  testResults: z.array(
    z.object({
      assertionResults: z.array(
        z.object({ ancestorTitles: z.array(z.string()), title: z.string(), status: z.string() }),
      ),
    }),
  ),
});

export function parseVitestReport(
  run: string,
  level: EvidenceLevel,
  json: unknown,
): EvidenceRecord[] {
  const report = vitestReport.parse(json);
  const at = new Date(report.startTime).toISOString();
  return report.testResults.flatMap((file) =>
    file.assertionResults.flatMap((result) => {
      const test = [...result.ancestorTitles, result.title].join(' > ');
      const names = [...test.matchAll(TAG)].flatMap((m) => (m[1] ?? '').split(','));
      return [...new Set(names)].map((capability) => ({
        capability,
        level,
        passed: result.status === 'passed',
        test,
        run,
        at,
      }));
    }),
  );
}

const reportFile = /^(G[0-5]|R1)\.(.+)\.json$/;

/** Reads every `<level>.<run>.json` in the directory; any other file there is an error. */
export function readEvidence(dir: string): EvidenceRecord[] {
  let files: string[];
  try {
    files = readdirSync(dir);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }
  return files.flatMap((file) => {
    const match = file.match(reportFile);
    const level = evidenceOrder.find((l) => l === match?.[1]);
    if (!match || !level)
      throw new Error(`Unexpected evidence file ${file}; name it <level>.<run>.json`);
    return parseVitestReport(
      match[2] ?? file,
      level,
      JSON.parse(readFileSync(join(dir, file), 'utf8')),
    );
  });
}

export function bestPassing(
  records: readonly EvidenceRecord[],
  capability: string,
): EvidenceRecord | undefined {
  return records
    .filter((r) => r.capability === capability && r.passed)
    .sort(
      (a, b) =>
        evidenceOrder.indexOf(b.level) - evidenceOrder.indexOf(a.level) || b.at.localeCompare(a.at),
    )[0];
}
