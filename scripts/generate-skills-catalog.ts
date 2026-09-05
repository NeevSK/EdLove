#!/usr/bin/env node
/**
 * withSkills 1-line catalog generator
 * Agent-side only — no runtime deps, no mobile installs.
 * Outputs: .agents/skills/CATALOG.md (one line per skill: name | when-to-load)
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SKILLS_ROOT = resolve(process.cwd(), '.agents', 'skills');
const OUTPUT_FILE = resolve(SKILLS_ROOT, 'CATALOG.md');

function extractWhenToLoad(skillDir: string): string {
  const skillPath = join(skillDir, 'SKILL.md');
  try {
    const content = readFileSync(skillPath, 'utf8');
    const descMatch = content.match(/^description:\s*(.+)$/m);
    if (descMatch) return descMatch[1].trim();
    const firstLine = content
      .split('\n')
      .find(
        (l) => l.trim() && !l.startsWith('#') && !l.startsWith('---') && !l.startsWith('name:'),
      );
    return firstLine?.trim() || 'General purpose skill';
  } catch {
    return 'No description available';
  }
}

function main() {
  const entries = readdirSync(SKILLS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const name = d.name;
      const when = extractWhenToLoad(join(SKILLS_ROOT, name));
      return { name, when };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const lines = [
    '# Agent Skills Catalog',
    '',
    '> Auto-generated from `.agents/skills/*/SKILL.md` — do not hand-edit.',
    '> Run `npx tsx scripts/generate-skills-catalog.ts` to refresh.',
    '',
    '| Skill | When to Load |',
    '|-------|--------------|',
    ...entries.map((e) => `| \`${e.name}\` | ${e.when} |`),
    '',
    `*Generated: ${new Date().toISOString()}*`,
  ];

  const output = lines.join('\n');
  writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`✅ Generated ${entries.length} skills → ${OUTPUT_FILE}`);
}

main();
