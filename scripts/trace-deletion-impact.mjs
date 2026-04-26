#!/usr/bin/env node
import { execSync } from 'node:child_process';
import path from 'node:path';

const symbol = process.argv[2];
if (!symbol) {
  console.error('Usage: node trace-deletion-impact.mjs <symbol>');
  process.exit(1);
}

console.log(`💀 Tracing deletion impact for: "${symbol}"`);

try {
  // We use a simple grep to find the symbol usage
  // We exclude the definition itself if it's an export
  const output = execSync(
    `git grep -n "${symbol}" -- ":(exclude)node_modules" ":(exclude)dist" ":(exclude)build"`,
    { encoding: 'utf8' },
  );

  const lines = output.split('\n').filter(Boolean);
  const consumers = {};

  lines.forEach((line) => {
    const [file, lineNo, ...content] = line.split(':');
    const domain = file.split('/')[0] === 'packages' ? file.split('/')[1] : file.split('/')[0];

    if (!consumers[domain]) consumers[domain] = [];
    consumers[domain].push({ file, lineNo, content: content.join(':').trim() });
  });

  console.log(
    `\nFound ${lines.length} total occurrences across ${Object.keys(consumers).length} domains.\n`,
  );

  Object.entries(consumers).forEach(([domain, usages]) => {
    console.log(`## Domain: ${domain} (${usages.length} hits)`);
    usages.slice(0, 3).forEach((u) => {
      console.log(
        `  - ${u.file}:${u.lineNo} -> ${u.content.slice(0, 50)}${u.content.length > 50 ? '...' : ''}`,
      );
    });
    if (usages.length > 3) console.log(`  ... and ${usages.length - 3} more.`);
  });

  const riskLevel = lines.length > 20 ? 'EXTREME' : lines.length > 5 ? 'MODERATE' : 'LOW';
  console.log(`\n⚠️ Deletion Risk Assessment: ${riskLevel}`);
} catch (e) {
  console.log(`✅ Symbol "${symbol}" appears to be unused. Safe to delete!`);
}
