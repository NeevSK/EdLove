import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { ProcedureContract } from '@orpc/contract';
import { API_V1_PREFIX } from '../../../packages/core/src/api/v1/client';
import { appContract } from '../../../packages/core/src/api/v1/contract';

const { values } = parseArgs({
  options: { stdout: { type: 'boolean' }, output: { type: 'string' } },
});
if (values.stdout && values.output !== undefined)
  throw new Error('Use --stdout or --output, not both');
if (values.output !== undefined && !values.output.trim())
  throw new Error('Output path must not be empty');

function inspect(node: unknown, segments: string[] = []): string[] {
  if (node instanceof ProcedureContract) return [segments.join('.')];
  if (typeof node !== 'object' || node === null || Array.isArray(node)) {
    throw new Error(`Non-native contract at ${segments.join('.') || '<root>'}`);
  }
  const record = Object.entries(node);
  if (record.some(([key]) => ['method', 'path', 'request', 'responses'].includes(key))) {
    throw new Error(`Legacy declaration at ${segments.join('.') || '<root>'}`);
  }
  return record.flatMap(([key, child]) => inspect(child, [...segments, key]));
}

const procedures = inspect(appContract).sort();
const report = {
  schemaVersion: 3,
  scope: 'canonical-v1-native-contract',
  prefix: API_V1_PREFIX,
  procedures,
  count: procedures.length,
  limitations: [
    'Declaration inventory only; no runtime, authorization or persistence proof.',
    'An empty foundation is not application feature coverage.',
  ],
};
const json = `${JSON.stringify(report, null, 2)}\n`;
if (values.output) writeFileSync(values.output, json, { flag: 'wx' });
else process.stdout.write(json);
