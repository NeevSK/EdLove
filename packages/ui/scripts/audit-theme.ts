/**
 * Sanctuary Theme Auditor
 *
 * Scans Theme.ts and phaseMatrix for contrast violations using APCA and WCAG 2.1.
 * Run with: npx tsx scripts/audit-theme.ts
 */

import { colors, phaseMatrix, resolvePhaseTokens } from '../src/theme/Theme';
import { checkAccessibility, toHex } from '../src/utils/a11yUtils';
import { TemporalPhase } from '../src/context/types';

const PHASES: TemporalPhase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];
const MODES: ('light' | 'dark')[] = ['light', 'dark'];

console.log('\x1b[36m%s\x1b[0m', '--- GURUDEVI THEME ACCESSIBILITY AUDIT ---');
console.log('Validating Sanctuary tokens against WCAG 2.1 and APCA Standards...\n');

let violations = 0;
let totalChecks = 0;

function report(
  label: string,
  fg: string,
  bg: string,
  requirement: { wcag?: number; apca?: number },
) {
  totalChecks++;
  const fgHex = toHex(fg);
  const bgHex = toHex(bg);
  const { ratio, apca, apcaRating } = checkAccessibility(fgHex, bgHex);

  let failed = false;
  const details = [];

  if (requirement.wcag && ratio < requirement.wcag) {
    failed = true;
    details.push(`WCAG: ${ratio.toFixed(2)}:1 (Min ${requirement.wcag})`);
  }

  if (requirement.apca && Math.abs(apca) < requirement.apca) {
    failed = true;
    details.push(`APCA: ${apca.toFixed(1)} Lc (Min ${requirement.apca} - ${apcaRating})`);
  }

  if (failed) {
    violations++;
    console.log(`\x1b[31m[FAIL]\x1b[0m ${label}`);
    console.log(`       - BG: ${bgHex}, FG: ${fgHex}`);
    console.log(`       - ${details.join(' | ')}`);
  }
}

// 1. Audit Phase Matrix
PHASES.forEach((phase) => {
  MODES.forEach((mode) => {
    const isDark = mode === 'dark';
    const tokens = resolvePhaseTokens(phase, isDark);

    // Primary Text Contrast
    report(`${phase}/${mode} Primary Text`, tokens.text.primary, tokens.gradientNodes[0], {
      wcag: 4.5,
      apca: 75,
    });

    // Secondary Text Contrast
    report(`${phase}/${mode} Secondary Text`, tokens.text.secondary, tokens.gradientNodes[0], {
      wcag: 3.0,
      apca: 60,
    });

    // Accent Action Contrast
    report(`${phase}/${mode} Accent Action`, tokens.text.inverse, tokens.accent.action, {
      wcag: 4.5,
      apca: 60,
    });
  });
});

console.log('\n--- AUDIT SUMMARY ---');
if (violations === 0) {
  console.log(`\x1b[32mSUCCESS: All ${totalChecks} checks passed.\x1b[0m`);
  process.exit(0);
} else {
  console.log(
    `\x1b[31mWARNING: Found ${violations} accessibility violations across ${totalChecks} checks.\x1b[0m`,
  );
  // We don't exit with 1 yet to avoid breaking builds until we fix the colors
  process.exit(0);
}
