import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from '../utils/constants.js';
import { executeSovereignTool } from '../utils/execution.js';
import { findSurgicalReport, normalizeTarget, readReport } from '../utils/pathUtils.js';
import { DocumentService } from './DocumentService.js';

export class AuditService {
  constructor(private document: DocumentService) {}

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
    
    try {
      const output = execSync(
        `powershell -ExecutionPolicy Bypass -File scripts/audit-accessibility.ps1 -Target "${target}"`,
        { cwd: ROOT_DIR },
      ).toString();

      const report = this.document.renderReport({
        title: '♿ Accessibility Audit',
        scope: target,
        summary: 'Review of accessibility standard compliance across the specified target.',
        stats: [{ label: 'Status', value: output.includes('passed') ? '✅ PASS' : '❌ VIOLATIONS FOUND' }],
        issues: [{ type: 'A11Y', file: target, message: output.trim(), severity: output.includes('passed') ? 'info' : 'error' }],
        recommendations: [
          'Ensure all interactive elements have accessibilityLabel.',
          'Verify contrast ratios for all UI components.',
          'Check for proper accessibilityRole assignments.'
        ]
      });

      return { content: [{ type: 'text' as const, text: report }] };
    } catch (e: any) {
      return { 
        content: [{ type: 'text' as const, text: `Accessibility audit failed:\n${e.message}` }],
        isError: true 
      };
    }
  }

  handleAuditHookViolations(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Auditing hook violations for: ${target}`);
    
    try {
      // We leverage the logic in the architecture script for consistency
      const output = execSync(`node scripts/audit-package-architecture.mjs "${target}" --json`, {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
      });

      const jsonMatch = output.match(/---BEGIN_JSON_REPORT---([\s\S]*?)---END_JSON_REPORT---/);
      if (jsonMatch && jsonMatch[1]) {
        const rawData = JSON.parse(jsonMatch[1]);
        const hookIssues = rawData.violations.filter((v: any) => v.type === 'HOOK VIOLATION' || v.type === 'STATE DENSITY');

        const report = this.document.renderReport({
          title: '🪝 React Hook Integrity Audit',
          scope: target,
          summary: `Analysis of React Hook patterns and state management hygiene in ${rawData.packageName}.`,
          stats: [
            { label: 'Hook Violations', value: hookIssues.length },
            { label: 'Files Analyzed', value: rawData.stats.subpaths }
          ],
          issues: hookIssues.map((v: any) => ({
            type: v.type,
            file: v.file,
            message: v.message,
            severity: 'error' as const,
          })),
          recommendations: [
            'Avoid useLayoutEffect for better referential stability.',
            'Refactor high-density useState hooks to useReducer.',
            'Ensure all effects have explicit dependency arrays.',
            'Memoize expensive computations with useMemo.'
          ]
        });

        return { content: [{ type: 'text' as const, text: report }] };
      }

      return { content: [{ type: 'text' as const, text: 'Failed to parse hook violations from architecture report.' }] };
    } catch (e: any) {
      return { 
        content: [{ type: 'text' as const, text: `Hook integrity audit failed:\n${e.message}` }],
        isError: true 
      };
    }
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

  handleAuditPackageArchitecture(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`🔍 Auditing package architecture for: ${target}`);
    
    try {
      // Ensure we are targeting a directory for the audit script
      const stats = fs.statSync(target);
      const targetDir = stats.isDirectory() ? target : path.dirname(target);

      const output = execSync(`node scripts/audit-package-architecture.mjs "${targetDir}" --json`, {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
      });

      // Extract JSON report
      const jsonMatch = output.match(/---BEGIN_JSON_REPORT---([\s\S]*?)---END_JSON_REPORT---/);
      if (jsonMatch && jsonMatch[1]) {
        const rawData = JSON.parse(jsonMatch[1]);
        
        // Transform to DocumentService format
        const report = this.document.renderReport({
          title: `🏛️ Architectural Audit: ${rawData.packageName}`,
          scope: rawData.target,
          summary: `The architectural audit for **${rawData.packageName}** reveals **${rawData.stats.violationCount}** violations and **${rawData.stats.warningCount}** hygiene warnings.`,
          stats: [
            { label: 'Total Violations', value: rawData.stats.violationCount },
            { label: 'Hygiene Warnings', value: rawData.stats.warningCount },
            { label: 'Subpath Exports', value: rawData.stats.subpaths },
          ],
          issues: [
            ...rawData.warnings.map((w: string) => ({
              type: 'Hygiene',
              file: 'Package Metadata',
              message: w,
              severity: 'warning' as const,
            })),
            ...rawData.violations.map((v: any) => ({
              type: v.type,
              file: v.file,
              line: v.line,
              message: v.message,
              severity: 'error' as const,
              reference: v.ref,
            })),
          ],
          recommendations: [
            'Remediate LOGIC -> UI violations by moving UI logic to components.',
            'Resolve NATIVE POLLUTION by using @repo/ui primitives.',
            'Refactor high-density useState hooks to useReducer state machines.',
            'Fix A11Y violations by adding accessibilityLabel to interactive components.',
            'Ensure all imports use canonical subpath entry points.',
            'Simplify complex effects and avoid useLayoutEffect for better stability.',
          ],
        });

        return {
          content: [{ type: 'text' as const, text: report }],
        };
      }

      // Fallback to Markdown if JSON fails
      const match = output.match(/---BEGIN_MARKDOWN_REPORT---([\s\S]*?)---END_MARKDOWN_REPORT---/);
      if (match && match[1]) {
        return {
          content: [
            { type: 'text' as const, text: match[1].trim() },
          ],
        };
      }

      return { content: [{ type: 'text' as const, text: output }] };
    } catch (e: any) {
      console.error(`❌ Audit execution failed: ${e.message}`);
      return {
        content: [{ 
          type: 'text' as const, 
          text: `Audit failed for ${target}:\n${e.message}\n\nSTDOUT: ${e.stdout || ''}\nSTDERR: ${e.stderr || ''}` 
        }],
        isError: true,
      };
    }
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

    const report = this.document.renderReport({
      title: '🌐 Sovereign i18n Audit',
      scope: 'packages/i18n',
      summary: 'Analysis of localization coverage and fallback policies across the platform.',
      stats: [
        { label: 'Status', value: 'Review Required' }
      ],
      issues: [
        { type: 'COVERAGE', file: 'i18n-assets', message: coverage.trim(), severity: 'info' },
        { type: 'FALLBACK', file: 'i18n-policy', message: fallbacks.trim(), severity: 'warning' }
      ]
    });

    return {
      content: [
        { type: 'text' as const, text: report },
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
    // Elegant removal of prefixes using a clearer pattern
    const cleanTarget = rawTarget.replace(/^(@repo\/|@app\/|\/|\.\\|\.\/)/, '');

    if (cleanTarget) {
      const rootSummary = path.join(ROOT_DIR, `audit-${cleanTarget}-summary.md`);
      if (fs.existsSync(rootSummary)) fs.unlinkSync(rootSummary);

      try {
        const output = execSync(
          `powershell -ExecutionPolicy Bypass -File scripts/audit-errors.ps1 -Target "${cleanTarget}" -LocalOnly`,
          { cwd: ROOT_DIR },
        ).toString();

        // Prioritize .md report, fallback to .txt
        let summary = findSurgicalReport(`audit-${cleanTarget}-summary.md`, cleanTarget);
        if (summary.startsWith('Discovery failed')) {
          summary = findSurgicalReport(`audit-${cleanTarget}-summary.txt`, cleanTarget);
        }

        return {
          content: [
            { type: 'text' as const, text: output },
            { type: 'text' as const, text: summary },
          ],
        };
      } catch (e: any) {
        let summary = findSurgicalReport(`audit-${cleanTarget}-summary.md`, cleanTarget);
        if (summary.startsWith('Discovery failed')) {
          summary = findSurgicalReport(`audit-${cleanTarget}-summary.txt`, cleanTarget);
        }
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
          `powershell -ExecutionPolicy Bypass -File scripts/audit-wrapper.ps1 -Cmd "pnpm turbo run check-types" -Log "reports/check-types.md"`,
          { cwd: ROOT_DIR },
        ).toString();

        let report = readReport('check-types.md');
        if (report === 'Report not found.') {
          report = readReport('check-types.txt');
        }

        return {
          content: [
            { type: 'text' as const, text: output },
            { type: 'text' as const, text: report },
          ],
        };
      } catch (e: any) {
        let report = readReport('check-types.md');
        if (report === 'Report not found.') {
          report = readReport('check-types.txt');
        }
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
