import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = path.join(root, 'apps', 'gurudevi-mobile', 'supabase', 'migrations');
const cutoff = '20261001000000';
const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql'));
const violations = [];

for (const name of files) {
  const migrationId = name.match(/^(\d{14})_/)?.[1];
  if (!migrationId || migrationId < cutoff) continue;

  const source = fs
    .readFileSync(path.join(migrationsDir, name), 'utf8')
    .replace(/--[^\r\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const decisions = [
    ...source.matchAll(
      /\b(?:GRANT|REVOKE)\b[\s\S]*?\bON\s+(?:TABLE\s+)?([\s\S]*?)\s+\b(?:TO|FROM)\b[\s\S]*?;/gi,
    ),
  ]
    .flatMap((match) => match[1].split(','))
    .map((part) =>
      part
        .trim()
        .replace(/^ONLY\s+/i, '')
        .replace(/^(?:public\.)?/i, '')
        .replaceAll('"', '')
        .toLowerCase(),
    );
  const creates = [
    ...source.matchAll(
      /\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:([a-z_][a-z0-9_]*)\.)?([a-z_][a-z0-9_]*)/gi,
    ),
  ];

  for (const create of creates) {
    const schema = create[1]?.toLowerCase() ?? 'public';
    if (schema !== 'public') continue;
    const table = create[2].toLowerCase();
    if (!decisions.includes(table))
      violations.push(`${name}: public.${table} has no explicit table GRANT/REVOKE decision`);
  }
}

if (violations.length) {
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `PASS: public tables created in migrations dated ${cutoff.slice(0, 8)} or later have explicit GRANT/REVOKE decisions.`,
  );
}
