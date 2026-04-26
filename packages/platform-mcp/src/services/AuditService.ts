import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from '../utils/constants.js';
import { executeSovereignTool } from '../utils/execution.js';
import { findSurgicalReport, normalizeTarget, readReport } from '../utils/pathUtils.js';

export class AuditService {
  handleAuditHygiene() {
    console.error('Running Hygiene Audit...');
    try {
      execSync('powershell -ExecutionPolicy Bypass -File scripts/check-hygiene.ps1', {
        cwd: ROOT_DIR,
      });
    } catch (e) {
      console.error('Hygiene script reported errors (expected result).');
    }

    const circular = readReport('circular_deps.txt');
    const unused = readReport('unused_code.txt');
    const architecture = readReport('architecture.txt');

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ circular, unused, architecture }, null, 2),
        },
      ],
    };
  }

  handleAuditA11y(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Auditing accessibility for: ${target}`);
    const output = execSync(
      `powershell -ExecutionPolicy Bypass -File scripts/audit-accessibility.ps1 -Target "${target}"`,
      { cwd: ROOT_DIR },
    ).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleCheckContrast(args: { fg: string; bg: string }) {
    console.error(`Checking contrast: ${args.fg} vs ${args.bg}`);
    const output = execSync(`node scripts/analyze-contrast.mjs "${args.fg}" "${args.bg}"`, {
      cwd: ROOT_DIR,
    }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleLintPackage(args: { target?: string; fix?: boolean }) {
    const target = normalizeTarget(args.target || '.');
    const fixFlag = args.fix ? '--fix' : '';
    console.error(`Biome linting for: ${target} ${fixFlag}`);
    const output = execSync(
      `powershell -ExecutionPolicy Bypass -File scripts/biome-audit.ps1 -Target "${target}" ${fixFlag}`,
      { cwd: ROOT_DIR },
    ).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleBiomeCheck(args: { target?: string; write?: boolean }) {
    const target = normalizeTarget(args.target || '.');
    const writeFlag = args.write ? '--write' : '';
    console.error(`Biome check for: ${target} ${writeFlag}`);
    const output = execSync(`npx biome check ${writeFlag} "${target}"`, {
      cwd: ROOT_DIR,
    }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleAuditLegacyUI(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Auditing legacy UI for: ${target}`);
    const output = execSync(
      `powershell -ExecutionPolicy Bypass -File scripts/audit-legacy-ui.ps1 -Target "${target}"`,
      { cwd: ROOT_DIR },
    ).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleAuditPackageArchitecture(args: { target: string }) {
    const target = normalizeTarget(args.target);
    console.error(`Auditing package architecture for: ${target}`);
    const output = execSync(`node scripts/audit-package-architecture.mjs "${target}"`, {
      cwd: ROOT_DIR,
    }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleAuditColors() {
    console.error('Auditing design system colors...');
    const output = execSync('node scripts/audit-colors.js', { cwd: ROOT_DIR }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleCheckClassroomBoundaries() {
    console.error('Checking classroom package boundaries...');
    const output = execSync('node scripts/check-classroom-boundaries.mjs', {
      cwd: ROOT_DIR,
    }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleCheckSelfBoundaries() {
    console.error('Checking self package boundaries...');
    const output = execSync('node scripts/check-self-boundaries.mjs', { cwd: ROOT_DIR }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleAuditFeatureFlags() {
    console.error('Auditing feature flags (stale detection)...');
    const output = execSync('node scripts/audit-feature-flags.mjs', { cwd: ROOT_DIR }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleReportCognitiveLoad(args: { target?: string }) {
    const target = args.target || 'packages';
    console.error(`Reporting cognitive load for: ${target}`);
    const output = execSync(`node scripts/report-cognitive-load.mjs "${target}"`, {
      cwd: ROOT_DIR,
    }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleAuditI18n() {
    console.error('Auditing i18n assets...');
    const coverage = execSync('node scripts/i18n-key-coverage-check.mjs', {
      cwd: ROOT_DIR,
    }).toString();
    const fallbacks = execSync('node scripts/i18n-fallback-policy-check.mjs', {
      cwd: ROOT_DIR,
    }).toString();
    return {
      content: [
        { type: 'text' as const, text: '## Key Coverage' },
        { type: 'text' as const, text: coverage },
        { type: 'text' as const, text: '## Fallback Policy' },
        { type: 'text' as const, text: fallbacks },
      ],
    };
  }

  handleAuditExportIntegrity() {
    const result = executeSovereignTool(
      'audit_export_integrity',
      'node scripts/audit-export-integrity.mjs',
    );
    return { content: [{ type: 'text' as const, text: result.output }] };
  }

  handleAuditBundleLeak() {
    const result = executeSovereignTool('audit_bundle_leak', 'node scripts/audit-bundle-leak.mjs');
    return { content: [{ type: 'text' as const, text: result.output }] };
  }

  handleAuditFeatureFidelity(args: { includeArchives?: boolean }) {
    const includeArchives = args.includeArchives ?? true;
    const result = executeSovereignTool(
      'audit_feature_fidelity',
      `node scripts/audit-feature-fidelity.mjs ${includeArchives ? '--includeArchives' : ''}`,
    );
    return { content: [{ type: 'text' as const, text: result.output }] };
  }

  handleSyncpackFix() {
    console.error('Fixing dependency mismatches (syncpack)...');
    const output = execSync('pnpm exec syncpack fix-mismatches', { cwd: ROOT_DIR }).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleCheckTypes(args: { package?: string }) {
    const rawTarget = args.package || '';
    const cleanTarget = rawTarget.replace(/^@repo\/|^@app\/|^\/|^\.\\|^.\//, '');

    if (cleanTarget) {
      const rootSummary = path.join(ROOT_DIR, `audit-${cleanTarget}-summary.txt`);
      if (fs.existsSync(rootSummary)) fs.unlinkSync(rootSummary);

      try {
        const output = execSync(
          `powershell -ExecutionPolicy Bypass -File scripts/audit-errors.ps1 -Target "${cleanTarget}" -LocalOnly`,
          { cwd: ROOT_DIR },
        ).toString();
        const summary = findSurgicalReport(`audit-${cleanTarget}-summary.txt`, cleanTarget);
        return {
          content: [
            { type: 'text' as const, text: output },
            { type: 'text' as const, text: summary },
          ],
        };
      } catch (e: any) {
        const summary = findSurgicalReport(`audit-${cleanTarget}-summary.txt`, cleanTarget);
        return {
          content: [
            { type: 'text' as const, text: e.message },
            { type: 'text' as const, text: summary },
          ],
          isError: true,
        };
      }
    } else {
      try {
        const output = execSync(
          `powershell -ExecutionPolicy Bypass -File scripts/audit-wrapper.ps1 -Cmd "pnpm turbo run check-types" -Log "reports/check-types.txt"`,
          { cwd: ROOT_DIR },
        ).toString();
        const report = readReport('check-types.txt');
        return {
          content: [
            { type: 'text' as const, text: output },
            { type: 'text' as const, text: report },
          ],
        };
      } catch (e: any) {
        const report = readReport('check-types.txt');
        return {
          content: [
            { type: 'text' as const, text: e.message },
            { type: 'text' as const, text: report },
          ],
          isError: true,
        };
      }
    }
  }
}
