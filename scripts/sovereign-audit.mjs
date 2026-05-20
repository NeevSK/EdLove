import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Sovereign Audit Sentinel (Node.js version)
 * Cross-platform, memory-safe, and robust monorepo auditing.
 */

const args = process.argv.slice(2);
const cmdIndex = args.indexOf('--cmd');
const logIndex = args.indexOf('--log');

if (cmdIndex === -1 || !args[cmdIndex + 1]) {
  console.error('Usage: node sovereign-audit.mjs --cmd "command to run" [--log "report-path.md"]');
  process.exit(1);
}

const command = args[cmdIndex + 1];
const logPath = logIndex !== -1 ? args[logIndex + 1] : 'reports/audit-summary.md';
const filterIndex = args.indexOf('--filter');
const filterRegex =
  filterIndex !== -1 ? new RegExp(args[filterIndex + 1], 'i') : /warn|error|TS\d+|!!!|ERR_/i;

console.log(`>>> Starting Sovereign Audit: ${new Date().toISOString()}`);
console.log(`>>> Command: ${command}`);
if (filterIndex !== -1) console.log(`>>> Filter: ${args[filterIndex + 1]}`);
console.log('-'.repeat(80));

const startTime = Date.now();
const rawLines = [];
let exitCode = 0;

// Execute the command
const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
const shellArgs = process.platform === 'win32' ? ['-Command', command] : ['-c', command];

// Increase memory limit for node-based tools in the command string if needed
// Actually, it's better to set environment variables
const env = { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' };

const child = spawn(shell, shellArgs, {
  env,
  stdio: ['inherit', 'pipe', 'pipe'],
});

child.stdout.on('data', (data) => {
  const str = data.toString();
  process.stdout.write(str);
  rawLines.push(...str.split('\n'));
});

child.stderr.on('data', (data) => {
  const str = data.toString();
  process.stderr.write(str);
  rawLines.push(...str.split('\n'));
});

child.on('close', async (code) => {
  exitCode = code ?? 0;
  await generateReport();
});

async function generateReport() {
  const findings = [];
  const groups = {};

  // Simple categorization
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (filterRegex.test(trimmed)) {
      findings.push(trimmed);

      // Categorize by package
      const pkgMatch = trimmed.match(/((?:apps|packages)\/[^/]+)/);
      const category = pkgMatch ? pkgMatch[1] : 'General';

      if (!groups[category]) groups[category] = [];
      groups[category].push(trimmed);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const categories = Object.keys(groups).sort();

  let report = `# Sovereign Monorepo Hygiene Audit Report\n\n`;
  report += `> **Generated:** ${new Date().toLocaleString()}\n`;
  report += `> **Command:** ${command}\n`;
  report += `> **Duration:** ${duration}s\n`;
  report += `> **Status:** ${exitCode === 0 ? '✅ Passed' : '❌ Failed'}\n\n`;

  report += `## Executive Summary\n\n`;
  report += `| Category | Findings |\n`;
  report += `| :--- | :---: |\n`;

  if (categories.length > 0) {
    for (const cat of categories) {
      report += `| ${cat} | ${groups[cat].length} |\n`;
    }
  } else {
    report += `| All Categories | 0 Findings |\n`;
  }
  report += `\n`;

  report += `## Detailed Findings\n\n`;
  if (categories.length > 0) {
    for (const cat of categories) {
      report += `### Category: ${cat}\n`;
      for (const line of groups[cat]) {
        report += `- ${line}\n`;
      }
      report += `\n`;
    }
  } else {
    report += `No high-priority findings identified.\n\n`;
  }

  report += `## Raw Output\n\n\`\`\`text\n${rawLines.join('\n')}\n\`\`\`\n`;

  try {
    await mkdir(dirname(logPath), { recursive: true });
    await writeFile(logPath, report, 'utf8');
  } catch (err) {
    console.error(`!!! Failed to write log file: ${err.message}`);
  }

  console.log('\n' + '-'.repeat(80));
  console.log('AUDIT SUMMARY');
  console.log(`Duration: ${duration}s`);
  console.log(`Findings: ${findings.length}`);
  console.log(`Log File: ${logPath}`);
  console.log('-'.repeat(80));

  process.exit(exitCode);
}
