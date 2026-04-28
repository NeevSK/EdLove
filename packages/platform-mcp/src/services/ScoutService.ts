import { execSync } from 'child_process';
import path from 'path';
import { ROOT_DIR } from '../utils/constants.js';
import { normalizeTarget } from '../utils/pathUtils.js';
import { DocumentService, ReportData } from './DocumentService.js';

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

    console.error(`🛰️ Sovereign Scout Mission: "${query}" in ${target}`);

    const report: ReportData = {
      title: `🛰️ Sovereign Scout Report: "${query}"`,
      scope: target,
      summary: `Found matches and assets related to "${query}" across the specified scope.`,
      stats: [],
      issues: [],
      heatmap: [],
      highlights: [],
    };

    // 1. PHASE ONE: File Scout (Scouting for the file itself)
    try {
      const fileScoutCmd = `fd -t f -i -g "*${query}*" --max-results 5 "${target}"`;
      const files = execSync(fileScoutCmd, { cwd: ROOT_DIR, encoding: 'utf-8' }).trim();
      if (files) {
        const fileList = files.split('\n').map(f => {
          const rel = f.replace(ROOT_DIR, '').replace(/^[\\\/]/, '');
          return `- 📂 [${path.basename(f)}](${rel})`;
        }).join('\n');
        
        report.highlights?.push({
          title: '📄 File Scouts Found Assets',
          content: fileList
        });
      }
    } catch (e) {
      // No files found by name
    }

    // 2. PHASE TWO: Knowledge Scout (Documentation Mining)
    try {
      const docSearchCmd = `powershell -ExecutionPolicy Bypass -File scripts/search-docs.ps1 -Query "${query}" -Target "." -SummaryOnly`;
      const docs = execSync(docSearchCmd, { cwd: ROOT_DIR, encoding: 'utf-8' }).trim();
      if (docs && !docs.includes('No matching documentation')) {
        report.highlights?.push({
          title: '📖 Knowledge Scout Results',
          content: docs
        });
      }
    } catch (e) {
      // Doc search failed
    }

    // 3. PHASE THREE: Content Scout (Grep Heatmap & Highlights)
    try {
      // Highlights (Top 10 code matches)
      const grepCmd = `rg --line-number --column --smart-case --heading --color=never --max-count 10 --fixed-strings "${query}" "${target}"`;
      const rawGrep = execSync(grepCmd, { cwd: ROOT_DIR, encoding: 'utf-8' }).trim();

      if (rawGrep) {
        report.highlights?.push({
          title: '🔍 Content Scout Highlights (Top 10)',
          content: rawGrep,
          language: 'typescript'
        });

        // Heatmap Data (Count matches in all files)
        const heatmapCmd = `rg --count-matches --fixed-strings "${query}" "${target}"`;
        const heatmapRaw = execSync(heatmapCmd, { cwd: ROOT_DIR, encoding: 'utf-8' }).trim();

        if (heatmapRaw) {
          report.heatmap = this.document.parseGrepHeatmap(heatmapRaw);
          report.stats.push({ label: 'Total Matches', value: report.heatmap.reduce((acc, h) => acc + h.count, 0) });
          report.stats.push({ label: 'Files Affected', value: report.heatmap.length });
        }
      }
    } catch (e) {
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

    // Add actionable next steps
    report.recommendations = [
      `Review content highlights for "${query}" usage patterns.`,
      `Evaluate the high-density areas identified in the Heatmap.`,
      `Use 'sovereign_audit:architecture' on the most affected packages for compliance checks.`
    ];

    return { content: [{ type: 'text' as const, text: this.document.renderReport(report) }] };
  }
}
