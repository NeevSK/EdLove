import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { ROOT_DIR } from "../utils/constants.js";
import { normalizeTarget } from "../utils/pathUtils.js";

/**
 * --- The Sovereign Scout: Orchestrated Intelligence ---
 * A high-level orchestrator that combines file scouting, documentation mining,
 * and codebase grepping into a single, actionable intelligence dossier.
 */
export class ScoutService {
  async handleSovereignScout(args: { query: string; target?: string }) {
    const target = normalizeTarget(args.target || ".");
    const query = args.query;
    
    console.error(`🛰️ Sovereign Scout Mission: "${query}" in ${target}`);

    const results: string[] = [];
    results.push(`# 🛰️ Sovereign Scout Report: "${query}"`);
    results.push(`**Scope:** \`${target.replace(ROOT_DIR, "") || "/"}\`\n`);

    // 1. PHASE ONE: File Scout (Scouting for the file itself)
    try {
      const fileScoutCmd = `fd -t f -i -g "*${query}*" --max-results 5 "${target}"`;
      const files = execSync(fileScoutCmd, { cwd: ROOT_DIR, encoding: "utf-8" }).trim();
      if (files) {
        results.push(`## 📄 File Scouts Found Assets:`);
        results.push(files.split("\n").map(f => `- 📂 [${path.basename(f)}](${f.replace(ROOT_DIR, "")})`).join("\n"));
        results.push("");
      }
    } catch (e) {
      // No files found by name
    }

    // 2. PHASE TWO: Knowledge Scout (Documentation Mining)
    try {
      // Extract numeric query if it's an ID or just use raw query
      const docSearchCmd = `powershell -ExecutionPolicy Bypass -File scripts/search-docs.ps1 -Query "${query}" -Target "." -SummaryOnly`;
      const docs = execSync(docSearchCmd, { cwd: ROOT_DIR, encoding: "utf-8" }).trim();
      if (docs && !docs.includes("No matching documentation")) {
        results.push(`## 📖 Knowledge Scout Results:`);
        results.push(docs);
        results.push("");
      }
    } catch (e) {
      // Doc search failed or script missing
    }

    // 3. PHASE THREE: Content Scout (Grep Heatmap)
    try {
      // Use the improved grep logic for the heatmap
      const grepCmd = `rg --line-number --column --smart-case --heading --color=never --max-count 10 --fixed-strings "${query}" "${target}"`;
      const rawGrep = execSync(grepCmd, { cwd: ROOT_DIR, encoding: "utf-8" }).trim();
      
      if (rawGrep) {
        results.push(`## 🔍 Content Scout Highlights (Top 10):`);
        results.push("```typescript");
        results.push(rawGrep);
        results.push("```\n");

        // Generate Heatmap Data
        const heatmapCmd = `rg --count-matches --fixed-strings "${query}" "${target}"`;
        const heatmapRaw = execSync(heatmapCmd, { cwd: ROOT_DIR, encoding: "utf-8" }).trim();
        
        if (heatmapRaw) {
          const counts = heatmapRaw.split("\n").map(line => {
             const parts = line.split(":");
             const filePath = parts[0];
             const count = parseInt(parts[1], 10);
             return { path: filePath, count };
          }).sort((a, b) => b.count - a.count);

          results.push(`### 🔥 Deployment Heatmap:`);
          const topPackages = new Set<string>();
          counts.forEach(c => {
             const match = c.path.match(/packages[\\\/]([^\\\/]+)/);
             if (match) topPackages.add(`\`@repo/${match[1]}\``);
          });
          
          results.push(`Affected Areas: ${Array.from(topPackages).join(", ") || "Root/Misc"}`);
          results.push(`Total Files with Matches: ${counts.length}`);
        }
      }
    } catch (e) {
      // Grep failed (likely no matches)
    }

    if (results.length <= 3) {
      return { content: [{ type: "text" as const, text: `Sovereign Scout found no traces of "${query}" in the specified scope.` }] };
    }

    return { content: [{ type: "text" as const, text: results.join("\n") }] };
  }
}
