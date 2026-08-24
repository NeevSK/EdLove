import { ROOT_DIR } from '../utils/constants.js';

/**
 * --- The Sovereign Document Service ---
 * A centralized engine for transforming raw codebase analysis into
 * premium, highly-structured engineering dossiers.
 */

export interface AnalysisIssue {
  type: string;
  file: string;
  line?: number | string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  reference?: string;
}

export interface AnalysisStats {
  label: string;
  value: number | string;
}

export interface HeatmapEntry {
  path: string;
  count: number;
}

export interface ReportSection {
  title: string;
  content: string;
  language?: string;
}

export interface ChartEntry {
  label: string;
  value: number; // 0-100
  suffix?: string;
}

export interface ReportData {
  title: string;
  scope: string;
  summary: string;
  stats: AnalysisStats[];
  issues: AnalysisIssue[];
  heatmap?: HeatmapEntry[];
  highlights?: ReportSection[];
  charts?: ChartEntry[];
  recommendations?: string[];
  metadata?: Record<string, any>;
}

function renderStats(sections: string[], data: ReportData) {
  if (data.stats.length === 0) return;
  sections.push('### 📈 Key Metrics');
  sections.push('| Metric | Value |');
  sections.push('| :--- | :--- |');
  data.stats.forEach((s) => {
    sections.push(`| **${s.label}** | ${s.value} |`);
  });
  sections.push('');
}

function renderHeatmap(sections: string[], data: ReportData) {
  if (!data.heatmap || data.heatmap.length === 0) return;
  sections.push('### 🔥 Deployment Heatmap');

  // Calculate top packages
  const topPackages = new Map<string, number>();
  data.heatmap.forEach((h) => {
    const match = h.path.match(/packages[\\/]([^\\/]+)/) || h.path.match(/apps[\\/]([^\\/]+)/);
    const pkg = match ? `@repo/${match[1]}` : 'Root/Misc';
    topPackages.set(pkg, (topPackages.get(pkg) || 0) + h.count);
  });

  const sortedPkgs = Array.from(topPackages.entries()).sort((a, b) => b[1] - a[1]);
  sections.push('| Package | Density |');
  sections.push('| :--- | :--- |');
  sortedPkgs.forEach(([pkg, count]) => {
    sections.push(`| ${pkg} | ${count} matches |`);
  });
  sections.push('');

  if (data.heatmap.length > 10) {
    sections.push(`*Total files affected: ${data.heatmap.length}*`);
    sections.push('');
  }
}

function renderHighlights(sections: string[], highlights: ReportSection[]) {
  highlights.forEach((h) => {
    sections.push(`## ${h.title}`);
    if (h.language) {
      sections.push(`\`\`\`${h.language}`);
      sections.push(h.content);
      sections.push('```');
    } else {
      sections.push(h.content);
    }
    sections.push('');
  });
}

function renderIssues(sections: string[], issues: AnalysisIssue[]) {
  if (issues.length === 0) {
    sections.push('## ✅ Conclusion');
    sections.push('No critical issues detected. The architecture remains compliant and pristine.');
    return;
  }

  sections.push('## 🔍 Detailed Findings');

  // Group by Issue Type
  const categories = new Map<string, AnalysisIssue[]>();
  issues.forEach((i) => {
    const list = categories.get(i.type) || [];
    list.push(i);
    categories.set(i.type, list);
  });

  for (const [type, items] of categories.entries()) {
    const icon = items.some((i) => i.severity === 'error') ? '❌' : '⚠️';
    sections.push(`### ${icon} ${type}`);
    sections.push('| File | Issue | Documentation |');
    sections.push('| :--- | :--- | :--- |');

    items.forEach((item) => {
      const fileLink = `\`${item.file}\``;
      const docLink =
        item.reference && item.reference !== 'N/A' ? `[Guide](${item.reference})` : 'N/A';
      const lineInfo = item.line ? ` (L${item.line})` : '';
      sections.push(`| ${fileLink}${lineInfo} | ${item.message} | ${docLink} |`);
    });
    sections.push('');
  }
}

function renderCharts(sections: string[], charts: ChartEntry[]) {
  if (charts.length === 0) return;
  sections.push('## 📊 Analysis Charts');
  charts.forEach((c) => {
    const barWidth = 20;
    const filled = Math.round((c.value / 100) * barWidth);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    sections.push(`**${c.label}**`);
    sections.push(`\`${bar}\` ${c.value}% ${c.suffix || ''}`);
    sections.push('');
  });
}

function renderRecommendations(sections: string[], recommendations: string[]) {
  if (recommendations.length === 0) return;
  sections.push('## 🚀 Recommended Next Steps');
  recommendations.forEach((r) => {
    sections.push(`- [ ] ${r}`);
  });
  sections.push('');
}

function renderMetadata(sections: string[], metadata: Record<string, any> | undefined) {
  if (!metadata) return;
  sections.push('---');
  sections.push('<details>');
  sections.push('<summary>🛠️ Secondary Intelligence (Metadata)</summary>');
  sections.push('');
  sections.push('```json');
  sections.push(JSON.stringify(metadata, null, 2));
  sections.push('```');
  sections.push('</details>');
}

export class DocumentService {
  /**
   * Renders a comprehensive Markdown report from analysis data.
   */
  renderReport(data: ReportData): string {
    const timestamp = new Date().toISOString();
    const sections: string[] = [];

    const scopeStr = String(data.scope || '/');
    const rootPath = String(ROOT_DIR || '').toLowerCase();
    const scopeLower = scopeStr.toLowerCase();

    // Case-insensitive removal of root path for cleaner reports
    let displayScope = scopeStr;
    if (scopeLower.startsWith(rootPath)) {
      displayScope = scopeStr.substring(rootPath.length);
    }

    sections.push(`# ${data.title}`);
    sections.push(`> **Timestamp:** ${timestamp}`);
    sections.push(`> **Scope:** \`${displayScope.replace(/^[\\/]/, '') || '/'}\``);
    sections.push('');

    // 2. Executive Summary
    sections.push('## 📊 Executive Summary');
    sections.push(data.summary);
    sections.push('');

    renderStats(sections, data);
    renderHeatmap(sections, data);
    renderHighlights(sections, data.highlights ?? []);
    renderIssues(sections, data.issues);
    renderCharts(sections, data.charts ?? []);
    renderRecommendations(sections, data.recommendations ?? []);
    renderMetadata(sections, data.metadata);

    return sections.join('\n');
  }

  /**
   * Helper to parse 'rg --count' output into HeatmapEntry array.
   */
  parseGrepHeatmap(raw: string): HeatmapEntry[] {
    return raw
      .split('\n')
      .filter((line) => line.includes(':'))
      .map((line) => {
        const [filePath, count] = line.split(':');
        const path = filePath ?? '';
        const parsedCount = parseInt(count ?? '', 10);
        return { path, count: parsedCount };
      })
      .filter((h) => h.path.length > 0 && !Number.isNaN(h.count));
  }
}
