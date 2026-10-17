#!/usr/bin/env node
/**
 * @file post-tool.mjs
 * RN-Terrain Post-Tool Observation Shaper.
 *
 * Intercepts tool execution outputs (Bash, Edit, Write) in Claude Code and Codex.
 * Compresses verbose compiler and build spam into high-signal architectural
 * and deprecation annotations, protecting agent context budget.
 */

async function main() {
  if (process.stdin.isTTY) {
    process.exit(0);
  }

  let rawInput = '';
  try {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    rawInput = Buffer.concat(chunks).toString('utf8').trim();
  } catch {
    process.exit(0);
  }

  if (!rawInput) {
    process.exit(0);
  }

  try {
    const payload = JSON.parse(rawInput);
    const toolName = payload.tool || payload.tool_name || '';
    const output = payload.output || payload.result || '';

    // If Bash command produced output
    if (typeof output === 'string' && output.length > 500) {
      const lines = output.split('\n');
      const warningLines = lines.filter(l => 
        /deprecated|warning|peer dep|incompatible|reanimated|fabric/i.test(l) &&
        !/node_modules/i.test(l)
      );

      if (warningLines.length > 0 && warningLines.length < lines.length) {
        console.error(`\n⚡ [RN-TERRAIN OBSERVATION SHAPER: ${toolName}]`);
        console.error(`Filtered ${lines.length} lines down to ${warningLines.length} architectural signals:`);
        for (const w of warningLines.slice(0, 5)) {
          console.error(`  • ${w.trim()}`);
        }
        if (warningLines.length > 5) {
          console.error(`  ... and ${warningLines.length - 5} more signals.`);
        }
      }
    }
  } catch {}

  process.exit(0);
}

main().catch(() => process.exit(0));
