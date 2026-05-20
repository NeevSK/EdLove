import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../utils/constants.js';
import { executeSovereignTool, runCommand, runPowerShellScript } from '../utils/execution.js';
import { findSurgicalReport, normalizeTarget, readReport } from '../utils/pathUtils.js';
import type { AnalysisIssue, DocumentService } from './DocumentService.js';

function toText(text: string, isError?: boolean) {
  return {
    content: [{ type: 'text' as const, text }],
    isError: Boolean(isError),
  };
}

function extractTaggedSection(output: string, tag: 'JSON' | 'MARKDOWN') {
  const match = output.match(
    new RegExp(`---BEGIN_${tag}_REPORT---([\\s\\S]*?)---END_${tag}_REPORT---`),
  );
  return match?.[1]?.trim() ?? null;
}

function summarizeCommandFailure(label: string, output: string) {
  return `${label} failed.\n${output}`.trim();
}

export class AuditService {
  constructor(private document: DocumentService) {}

  handleAuditHygiene() {
    console.error('Running Hygiene Audit...');
    runPowerShellScript('scripts/check-hygiene.ps1');

    const circular = readReport('circular_deps.txt');
    const unused = readReport('unused_code.txt');
    const architecture = readReport('architecture.txt');

    return toText(JSON.stringify({ circular, unused, architecture }, null, 2));
  }

  handleAuditA11y(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Auditing accessibility for: ${target}`);

    const result = runPowerShellScript('scripts/audit-accessibility.ps1', ['-Target', target]);
    if (!result.ok) {
      return toText(summarizeCommandFailure('Accessibility audit', result.combined), true);
    }

    const output = result.combined;
    const report = this.document.renderReport({
      title: 'Accessibility Audit',
      scope: target,
      summary: 'Review of accessibility standard compliance across the specified target.',
      stats: [
        {
          label: 'Status',
          value: output.includes('passed') ? 'PASS' : 'VIOLATIONS FOUND',
        },
      ],
      issues: [
        {
          type: 'A11Y',
          file: target,
          message: output.trim(),
          severity: output.includes('passed') ? 'info' : 'error',
        },
      ],
      recommendations: [
        'Ensure all interactive elements have accessibilityLabel.',
        'Verify contrast ratios for all UI components.',
        'Check for proper accessibilityRole assignments.',
      ],
    });

    return toText(report);
  }

  handleAuditHookViolations(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Auditing hook violations for: ${target}`);

    const result = runCommand('node', ['scripts/audit-package-architecture.mjs', target, '--json']);
    if (!result.ok) {
      return toText(summarizeCommandFailure('Hook integrity audit', result.combined), true);
    }

    const jsonSection = extractTaggedSection(result.stdout, 'JSON');
    if (!jsonSection) {
      return toText('Hook integrity audit did not return a JSON report.', true);
    }

    const rawData = JSON.parse(jsonSection);
    const hookIssues = (rawData.violations || []).filter(
      (violation: any) => violation.type === 'HOOK VIOLATION' || violation.type === 'STATE DENSITY',
    );

    const report = this.document.renderReport({
      title: 'React Hook Integrity Audit',
      scope: target,
      summary: `Analysis of React Hook patterns and state management hygiene in ${rawData.packageName}.`,
      stats: [
        { label: 'Hook Violations', value: hookIssues.length },
        { label: 'Files Analyzed', value: rawData.stats?.subpaths ?? 0 },
      ],
      issues: hookIssues.map(
        (violation: any): AnalysisIssue => ({
          type: violation.type,
          file: violation.file,
          message: violation.message,
          severity: 'error',
        }),
      ),
      recommendations: [
        'Avoid useLayoutEffect for better referential stability.',
        'Refactor high-density useState hooks to useReducer.',
        'Ensure all effects have explicit dependency arrays.',
        'Memoize expensive computations with useMemo.',
      ],
    });

    return toText(report);
  }

  handleCheckContrast(args: { fg: string; bg: string }) {
    console.error(`Checking contrast: ${args.fg} vs ${args.bg}`);
    const result = runCommand('node', ['scripts/analyze-contrast.mjs', args.fg, args.bg]);
    return toText(result.combined, !result.ok);
  }

  handleLintPackage(args: { target?: string; fix?: boolean }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Biome linting for: ${target}`);
    const result = runPowerShellScript('scripts/biome-audit.ps1', [
      '-Target',
      target,
      ...(args.fix ? ['--fix'] : []),
    ]);
    return toText(result.combined, !result.ok);
  }

  handleBiomeCheck(args: { target?: string; write?: boolean }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Biome check for: ${target}`);
    const result = runCommand(
      'npx',
      ['biome', 'check', ...(args.write ? ['--write'] : []), target],
      {
        shell: process.platform === 'win32',
      },
    );
    return toText(result.combined, !result.ok);
  }

  handleAuditLegacyUI(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Auditing legacy UI for: ${target}`);
    const result = runPowerShellScript('scripts/audit-legacy-ui.ps1', ['-Target', target]);
    return toText(result.combined, !result.ok);
  }

  handleAuditPackageArchitecture(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    const targetDir = fs.statSync(target).isDirectory() ? target : path.dirname(target);
    console.error(`Auditing package architecture for: ${targetDir}`);

    const result = runCommand('node', [
      'scripts/audit-package-architecture.mjs',
      targetDir,
      '--json',
    ]);
    if (!result.ok) {
      return toText(
        summarizeCommandFailure(`Architecture audit for ${targetDir}`, result.combined),
        true,
      );
    }

    const jsonSection = extractTaggedSection(result.stdout, 'JSON');
    if (jsonSection) {
      const rawData = JSON.parse(jsonSection);
      const report = this.document.renderReport({
        title: `Architectural Audit: ${String(rawData.packageName || 'Unknown')}`,
        scope: String(rawData.target || targetDir),
        summary: `The architectural audit for **${String(rawData.packageName || 'this package')}** reveals **${rawData.stats?.violationCount ?? 0}** violations and **${rawData.stats?.warningCount ?? 0}** hygiene warnings.`,
        stats: [
          {
            label: 'Total Violations',
            value: rawData.stats?.violationCount ?? 0,
          },
          {
            label: 'Hygiene Warnings',
            value: rawData.stats?.warningCount ?? 0,
          },
          { label: 'Subpath Exports', value: rawData.stats?.subpaths ?? 0 },
        ],
        issues: [
          ...((rawData.warnings || []).map(
            (warning: string): AnalysisIssue => ({
              type: 'Hygiene',
              file: 'Package Metadata',
              message: warning,
              severity: 'warning',
            }),
          ) as AnalysisIssue[]),
          ...((rawData.violations || []).map(
            (violation: any): AnalysisIssue => ({
              type: violation.type,
              file: violation.file,
              line: violation.line,
              message: violation.message,
              severity: 'error',
              reference: violation.ref,
            }),
          ) as AnalysisIssue[]),
        ],
        recommendations: [
          'Remediate LOGIC -> UI violations by moving UI logic to components.',
          'Resolve native pollution by using @repo/ui primitives.',
          'Refactor high-density useState hooks to useReducer state machines.',
          'Fix accessibility violations by adding accessibility labels to interactive components.',
          'Ensure all imports use canonical subpath entry points.',
          'Simplify complex effects and avoid useLayoutEffect for better stability.',
        ],
      });

      return toText(report);
    }

    const markdownSection = extractTaggedSection(result.stdout, 'MARKDOWN');
    if (markdownSection) {
      return toText(markdownSection);
    }

    return toText(result.stdout);
  }

  handleAuditColors() {
    const result = runCommand('node', ['scripts/audit-colors.js']);
    return toText(result.combined, !result.ok);
  }

  handleCheckClassroomBoundaries() {
    const result = runCommand('node', ['scripts/check-classroom-boundaries.mjs']);
    return toText(result.combined, !result.ok);
  }

  handleCheckSelfBoundaries() {
    const result = runCommand('node', ['scripts/check-self-boundaries.mjs']);
    return toText(result.combined, !result.ok);
  }

  handleAuditFeatureFlags() {
    const result = runCommand('node', ['scripts/audit-feature-flags.mjs']);
    return toText(result.combined, !result.ok);
  }

  handleReportCognitiveLoad(args: { target?: string }) {
    const target = normalizeTarget(args.target || 'packages');
    const result = runCommand('node', ['scripts/report-cognitive-load.mjs', target]);
    return toText(result.combined, !result.ok);
  }

  handleAuditI18n() {
    const coverage = runCommand('node', ['scripts/i18n-key-coverage-check.mjs']);
    const fallbacks = runCommand('node', ['scripts/i18n-fallback-policy-check.mjs']);
    const report = this.document.renderReport({
      title: 'Sovereign i18n Audit',
      scope: 'packages/i18n',
      summary: 'Analysis of localization coverage and fallback policies across the platform.',
      stats: [{ label: 'Status', value: 'Review Required' }],
      issues: [
        {
          type: 'COVERAGE',
          file: 'i18n-assets',
          message: coverage.combined.trim(),
          severity: coverage.ok ? 'info' : 'warning',
        },
        {
          type: 'FALLBACK',
          file: 'i18n-policy',
          message: fallbacks.combined.trim(),
          severity: fallbacks.ok ? 'info' : 'warning',
        },
      ],
    });
    return toText(report);
  }

  handleAuditExportIntegrity() {
    const result = executeSovereignTool(
      'audit_export_integrity',
      'node scripts/audit-export-integrity.mjs',
    );
    return toText(result.output, result.status !== 'success');
  }

  handleAuditBundleLeak() {
    const result = executeSovereignTool('audit_bundle_leak', 'node scripts/audit-bundle-leak.mjs');
    return toText(result.output, result.status !== 'success');
  }

  handleAuditFeatureFidelity(args: { includeArchives?: boolean }) {
    const includeArchives = args.includeArchives ?? true;
    const result = executeSovereignTool(
      'audit_feature_fidelity',
      `node scripts/audit-feature-fidelity.mjs ${includeArchives ? '--includeArchives' : ''}`,
    );
    return toText(result.output, result.status !== 'success');
  }

  handleSyncpackFix() {
    const result = runCommand('pnpm', ['exec', 'syncpack', 'fix-mismatches'], {
      shell: process.platform === 'win32',
    });
    return toText(result.combined, !result.ok);
  }

  handleCheckTypes(args: { package?: string }) {
    const rawTarget = String(args?.package || '');
    const cleanTarget = rawTarget
      .replace(/^(@repo\/|@app\/|packages\/|apps\/|[/\\]|\.\/|\.\\)/, '')
      .replace(/[\\/]$/, '')
      .replace(/[\\/]/g, '-');

    if (cleanTarget) {
      const reportPath = path.join(ROOT_DIR, 'reports', `audit-${cleanTarget}-summary.md`);
      if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);

      const result = runPowerShellScript('scripts/audit-errors.ps1', [
        '-Target',
        cleanTarget,
        '-LocalOnly',
      ]);

      let summary = findSurgicalReport(`audit-${cleanTarget}-summary.md`, cleanTarget);
      if (summary.startsWith('Discovery failed') || summary === 'Report not found.') {
        summary = findSurgicalReport(`audit-${cleanTarget}-summary.txt`, cleanTarget);
      }

      const reportFound =
        summary && !summary.startsWith('Discovery failed') && summary !== 'Report not found.';

      return toText(
        [
          reportFound
            ? `Type audit report for ${cleanTarget}:`
            : `Type audit completed for ${cleanTarget}, but no surgical report was found.`,
          result.combined,
          summary,
        ]
          .filter(Boolean)
          .join('\n\n'),
        !reportFound || !result.ok,
      );
    }

    const result = runPowerShellScript('scripts/audit-wrapper.ps1', [
      '-Cmd',
      'pnpm turbo run check-types',
      '-Log',
      'reports/check-types.md',
    ]);

    let report = readReport('check-types.md');
    if (report === 'Report not found.') {
      report = readReport('check-types.txt');
    }

    const reportFound = report && report !== 'Report not found.';
    return toText(
      [
        reportFound ? 'Type audit report across monorepo:' : 'Global type audit failed.',
        result.combined,
        report,
      ]
        .filter(Boolean)
        .join('\n\n'),
      !reportFound || !result.ok,
    );
  }

  handlePushAudit() {
    const auditCmd =
      'pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check';
    console.error('Running Sovereign Push Audit...');

    const result = runCommand('node', [
      'scripts/sovereign-audit.mjs',
      '--cmd',
      auditCmd,
      '--log',
      'reports/push_audit.md',
    ]);

    const report = readReport('push_audit.md');
    const reportFound = report && report !== 'Report not found.';

    return toText(
      [
        reportFound
          ? 'Sovereign Push Audit Report:'
          : 'Push audit completed, but no report was found.',
        result.combined,
        reportFound ? report : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
      !result.ok,
    );
  }
  handleAuditDeprecations(args: { target?: string }) {
    const target = normalizeTarget(args.target || 'packages apps');
    console.error(`Auditing deprecations for: ${target}`);
    const result = runPowerShellScript('scripts/audit-deprecations.ps1', [
      '-Path',
      target,
      '-JSON',
    ]);
    return toText(result.combined, !result.ok);
  }

  handleCheckMemorySinks() {
    console.error('Auditing memory sinks...');
    const result = runPowerShellScript('scripts/check-memory-sinks.ps1');
    return toText(result.combined, !result.ok);
  }
}
