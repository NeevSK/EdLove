import { execSync } from 'node:child_process';
import fs from 'node:fs';

/**
 * 🚀 Shiny Memory Sink Auditor (Node Edition)
 * Uses ripgrep for speed, but JS for intelligent block parsing.
 */

const TARGET_DIR = process.argv[2] || 'packages/ui/src';
const PATTERNS = ['setInterval', 'setTimeout', 'addEventListener'];

console.log(`🔍 Auditing memory sinks in ${TARGET_DIR}...`);

function auditSinks() {
  const violations = [];

  for (const pattern of PATTERNS) {
    try {
      // Find files containing the pattern within a useEffect
      const output = execSync(
        `rg -l "useEffect" ${TARGET_DIR} --type-add "react:*.{ts,tsx}" -t react`,
        { encoding: 'utf8' },
      );

      const files = output.trim().split('\n');

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');

        // Find all useEffect blocks
        const useEffectRegex =
          /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[([\s\S]*?)\]\s*\)/g;
        let match;

        while ((match = useEffectRegex.exec(content)) !== null) {
          const body = match[1];
          if (body.includes(pattern)) {
            // Check if there is a return statement in the body
            // We need to be careful about nested returns, but usually,
            // a cleanup return is at the top level of the useEffect body.
            if (!body.includes('return')) {
              const linesBefore = content.substring(0, match.index).split('\n').length;
              violations.push({
                file,
                line: linesBefore,
                pattern,
                snippet: `${body.trim().substring(0, 100).replace(/\n/g, ' ')}...`,
              });
            }
          }
        }
      }
    } catch (_e) {
      // Skip if no matches found
    }
  }

  return violations;
}

const results = auditSinks();

if (results.length === 0) {
  console.log('✅ No memory sinks found (with top-level return checks).');
} else {
  console.log(`❌ Found ${results.length} potential memory sinks:`);
  results.forEach((v) => {
    console.log(`  - ${v.file}:${v.line} (${v.pattern}) -> ${v.snippet}`);
  });
  process.exit(1);
}
