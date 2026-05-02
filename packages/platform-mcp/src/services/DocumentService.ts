import { ROOT_DIR } from "../utils/constants.js";

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
	severity: "error" | "warning" | "info";
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

export class DocumentService {
	/**
	 * Renders a comprehensive Markdown report from analysis data.
	 */
	renderReport(data: ReportData): string {
		const timestamp = new Date().toISOString();
		const sections: string[] = [];

		const scopeStr = String(data.scope || "/");
		const rootPath = String(ROOT_DIR || "").toLowerCase();
		const scopeLower = scopeStr.toLowerCase();

		// Case-insensitive removal of root path for cleaner reports
		let displayScope = scopeStr;
		if (scopeLower.startsWith(rootPath)) {
			displayScope = scopeStr.substring(rootPath.length);
		}

		sections.push(`# ${data.title}`);
		sections.push(`> **Timestamp:** ${timestamp}`);
		sections.push(
			`> **Scope:** \`${displayScope.replace(/^[\\/]/, "") || "/"}\``,
		);
		sections.push("");

		// 2. Executive Summary
		sections.push("## 📊 Executive Summary");
		sections.push(data.summary);
		sections.push("");

		// 3. Key Metrics (Stats Table)
		if (data.stats.length > 0) {
			sections.push("### 📈 Key Metrics");
			sections.push("| Metric | Value |");
			sections.push("| :--- | :--- |");
			data.stats.forEach((s) =>
				sections.push(`| **${s.label}** | ${s.value} |`),
			);
			sections.push("");
		}

		// 4. Heatmap (Distribution)
		if (data.heatmap && data.heatmap.length > 0) {
			sections.push("### 🔥 Deployment Heatmap");

			// Calculate top packages
			const topPackages = new Map<string, number>();
			data.heatmap.forEach((h) => {
				const match =
					h.path.match(/packages[\\/]([^\\/]+)/) ||
					h.path.match(/apps[\\/]([^\\/]+)/);
				const pkg = match ? `@repo/${match[1]}` : "Root/Misc";
				topPackages.set(pkg, (topPackages.get(pkg) || 0) + h.count);
			});

			const sortedPkgs = Array.from(topPackages.entries()).sort(
				(a, b) => b[1] - a[1],
			);
			sections.push("| Package | Density |");
			sections.push("| :--- | :--- |");
			sortedPkgs.forEach(([pkg, count]) =>
				sections.push(`| ${pkg} | ${count} matches |`),
			);
			sections.push("");

			if (data.heatmap.length > 10) {
				sections.push(`*Total files affected: ${data.heatmap.length}*`);
				sections.push("");
			}
		}

		// 5. Highlights (Code Snippets / Previews)
		if (data.highlights && data.highlights.length > 0) {
			data.highlights.forEach((h) => {
				sections.push(`## ${h.title}`);
				if (h.language) {
					sections.push(`\`\`\`${h.language}`);
					sections.push(h.content);
					sections.push("```");
				} else {
					sections.push(h.content);
				}
				sections.push("");
			});
		}

		// 6. Categorized Findings
		if (data.issues.length > 0) {
			sections.push("## 🔍 Detailed Findings");

			// Group by Issue Type
			const categories = new Map<string, AnalysisIssue[]>();
			data.issues.forEach((i) => {
				const list = categories.get(i.type) || [];
				list.push(i);
				categories.set(i.type, list);
			});

			for (const [type, items] of categories.entries()) {
				const icon = items.some((i) => i.severity === "error") ? "❌" : "⚠️";
				sections.push(`### ${icon} ${type}`);
				sections.push("| File | Issue | Documentation |");
				sections.push("| :--- | :--- | :--- |");

				items.forEach((item) => {
					const fileLink = `\`${item.file}\``;
					const docLink =
						item.reference && item.reference !== "N/A"
							? `[Guide](${item.reference})`
							: "N/A";
					const lineInfo = item.line ? ` (L${item.line})` : "";
					sections.push(
						`| ${fileLink}${lineInfo} | ${item.message} | ${docLink} |`,
					);
				});
				sections.push("");
			}
		} else {
			sections.push("## ✅ Conclusion");
			sections.push(
				"No critical issues detected. The architecture remains compliant and pristine.",
			);
		}

		// 7. Visual Charts (ASCII Progress Bars)
		if (data.charts && data.charts.length > 0) {
			sections.push("## 📊 Analysis Charts");
			data.charts.forEach((c) => {
				const barWidth = 20;
				const filled = Math.round((c.value / 100) * barWidth);
				const bar = "█".repeat(filled) + "░".repeat(barWidth - filled);
				sections.push(`**${c.label}**`);
				sections.push(`\`${bar}\` ${c.value}% ${c.suffix || ""}`);
				sections.push("");
			});
		}

		// 8. Recommendations (Next Steps)
		if (data.recommendations && data.recommendations.length > 0) {
			sections.push("## 🚀 Recommended Next Steps");
			data.recommendations.forEach((r) => sections.push(`- [ ] ${r}`));
			sections.push("");
		}

		// 9. Structured Metadata (Agent-Only / Secondary Intel)
		if (data.metadata) {
			sections.push("---");
			sections.push("<details>");
			sections.push("<summary>🛠️ Secondary Intelligence (Metadata)</summary>");
			sections.push("");
			sections.push("```json");
			sections.push(JSON.stringify(data.metadata, null, 2));
			sections.push("```");
			sections.push("</details>");
		}

		return sections.join("\n");
	}

	/**
	 * Helper to parse 'rg --count' output into HeatmapEntry array.
	 */
	parseGrepHeatmap(raw: string): HeatmapEntry[] {
		return raw
			.split("\n")
			.filter((line) => line.includes(":"))
			.map((line) => {
				const [filePath, count] = line.split(":");
				return { path: filePath, count: parseInt(count, 10) };
			})
			.filter((h) => !Number.isNaN(h.count));
	}
}
