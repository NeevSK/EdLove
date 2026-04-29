import path from 'path';
import { runCommand, runPowerShellScript } from '../utils/execution.js';
import { normalizeTarget } from '../utils/pathUtils.js';
import type { DocumentService, ReportData } from './DocumentService.js';

/**
 * --- The Sovereign Scout: Orchestrated Intelligence ---
 * A high-level orchestrator that combines file scouting, documentation mining,
 * and codebase grepping into a single, actionable intelligence dossier.
 */
export class ScoutService {
  constructor(private document: DocumentService) {}

  async handleSovereignScout(args: { query: string; target?: string }) {
    const target = normalizeTarget(args.target || '.');
    const query = args.query;

    console.error(`Sovereign Scout Mission: "${query}" in ${target}`);

    const report: ReportData = {
      title: `Sovereign Scout Report: "${query}"`,
      scope: target,
      summary: `Found matches and assets related to "${query}" across the specified scope.`,
      stats: [],
      issues: [],
      heatmap: [],
      highlights: [],
    };

    try {
      const fileScout = runCommand('fd', ['-t', 'f', '-i', '-g', `*${query}*`, '--max-results', '5', target]);
      const files = fileScout.stdout.trim();
      if (files) {
        const fileList = files
          .split('\n')
          .map((file) => `- [${path.basename(file)}](${file.replace(/\\/g, '/')})`)
          .join('\n');

        report.highlights?.push({
          title: 'File Scouts Found Assets',
          content: fileList,
        });
      }
    } catch {
      // No files found by name
    }

    try {
      const docsResult = runPowerShellScript('scripts/search-docs.ps1', [
        '-Query',
        query,
        '-Target',
        '.',
        '-SummaryOnly',
      ]);
      const docs = docsResult.combined.trim();
      if (docs && !docs.includes('No matching documentation')) {
        report.highlights?.push({
          title: 'Knowledge Scout Results',
          content: docs,
        });
      }
    } catch {
      // Doc search failed
    }

    try {
      const grepResult = runCommand('rg', [
        '--line-number',
        '--column',
        '--smart-case',
        '--heading',
        '--color=never',
        '--max-count',
        '10',
        '--fixed-strings',
        query,
        target,
      ]);
      const rawGrep = grepResult.stdout.trim();

      if (rawGrep) {
        report.highlights?.push({
          title: 'Content Scout Highlights (Top 10)',
          content: rawGrep,
          language: 'typescript',
        });

        const heatmapResult = runCommand('rg', ['--count-matches', '--fixed-strings', query, target]);
        const heatmapRaw = heatmapResult.stdout.trim();

        if (heatmapRaw) {
          report.heatmap = this.document.parseGrepHeatmap(heatmapRaw);
          report.stats.push({
            label: 'Total Matches',
            value: report.heatmap.reduce((acc, entry) => acc + entry.count, 0),
          });
          report.stats.push({ label: 'Files Affected', value: report.heatmap.length });
        }
      }
    } catch {
      // Grep failed
    }

    if (report.highlights?.length === 0 && (!report.heatmap || report.heatmap.length === 0)) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Sovereign Scout found no traces of "${query}" in the specified scope.`,
          },
        ],
      };
    }

    report.recommendations = [
      `Review content highlights for "${query}" usage patterns.`,
      'Evaluate the high-density areas identified in the heatmap.',
      "Use 'sovereign_audit:architecture' on the most affected packages for compliance checks.",
    ];

    return { content: [{ type: 'text' as const, text: this.document.renderReport(report) }] };
  }
}
