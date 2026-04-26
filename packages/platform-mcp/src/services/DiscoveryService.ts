import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { ROOT_DIR } from "../utils/constants.js";
import { normalizeTarget } from "../utils/pathUtils.js";
import { executeSovereignTool } from "../utils/execution.js";


export class DiscoveryService {
  handleGrepCode(args: {
    query: string;
    isRegex?: boolean;
    include?: string;
    target?: string;
    includeNodeModules?: boolean;
    summaryOnly?: boolean;
    context?: number;
    fileType?: string;
    richText?: boolean;
  }) {
    const target = normalizeTarget(args.target || '.');
    const context = args.context ?? 0;
    console.error(`Sovereign Grepping: ${args.query} in ${target} (Context: ${context})`);
    
    const regexFlag = args.isRegex ? '' : '--fixed-strings';
    const globFlag = args.include ? `-g "${args.include}"` : '';
    const typeFlag = args.fileType ? `-t ${args.fileType}` : '';
    const contextFlag = context > 0 ? `-C ${context}` : '';
    
    // Proper exclusions for a shiny monorepo
    const exclusions = args.includeNodeModules 
      ? '' 
      : "-g '!**/node_modules/*' -g '!**/dist/*' -g '!**/.turbo/*' -g '!**/.git/*' -g '!**/build/*' -g '!**/.expo/*'";

    const command = `rg --line-number --column --smart-case --heading --color=never ${regexFlag} ${globFlag} ${typeFlag} ${contextFlag} ${exclusions} "${args.query}" "${target}"`;
    
    try {
      let output = execSync(command, { cwd: ROOT_DIR, encoding: 'utf-8' });
      
      if (args.summaryOnly) {
        // Run count command for summary only
        const countCmd = `rg --count --smart-case ${regexFlag} ${globFlag} ${typeFlag} ${exclusions} "${args.query}" "${target}"`;
        try {
          const counts = execSync(countCmd, { cwd: ROOT_DIR, encoding: 'utf-8' });
          return { content: [{ type: 'text' as const, text: `Summary Counts:\n${counts}` }] };
        } catch (e) {
          return { content: [{ type: 'text' as const, text: 'No matches found for summary.' }] };
        }
      }

      if (args.richText) {
        // Use bat to format the output string into a "rich" textual representation
        try {
          // We write to a temp file and read it back with bat styling
          const tempFile = path.join(ROOT_DIR, '.grep_result_temp.txt');
          fs.writeFileSync(tempFile, output);
          output = execSync(`bat --style=full --color=never "${tempFile}"`, { encoding: 'utf-8' });
          fs.unlinkSync(tempFile);
        } catch (batError) {
          console.error("Bat formatting failed, falling back to raw.");
        }
      }

      // Add a small heatmap summary to the end of the results
      const lines = output.split('\n');
      const filesAffected = new Set<string>();
      lines.forEach(l => {
        // Simple heuristic to find file paths in multi-file rg output (contains slashes, doesn't start with space/digit)
        if (l && !l.startsWith(' ') && !l.match(/^\d+[:-]/) && (l.includes('\\') || l.includes('/'))) {
          filesAffected.add(l.trim());
        }
      });

      const summaryText = `\n--- 📊 Sovereign Search Summary ---\nFound matches in ${filesAffected.size} files.\n`;
      
      return { 
        content: [
          { type: 'text' as const, text: output + summaryText }
        ] 
      };
    } catch (e: any) {
      if (e.status === 1) {
        return { content: [{ type: 'text' as const, text: 'No matches found.' }] };
      }
      return { content: [{ type: 'text' as const, text: `ripgrep failed: ${e.message}` }], isError: true };
    }
  }

  handleSearchDocs(args: {
    query: string;
    target?: string;
    includeNodeModules?: boolean;
    summaryOnly?: boolean;
    hybrid?: boolean;
  }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Searching documentation for: ${args.query} in ${target}`);
    const includeNodeModules = args.includeNodeModules ? '-IncludeNodeModules' : '';
    const summaryOnly = args.summaryOnly ? '-SummaryOnly' : '';
    const hybrid = args.hybrid ? '-Hybrid' : '';

    const output = execSync(
      `powershell -ExecutionPolicy Bypass -File scripts/search-docs.ps1 -Query "${args.query}" -Target "${target}" ${includeNodeModules} ${summaryOnly} ${hybrid}`,
      { cwd: ROOT_DIR },
    ).toString();
    return { content: [{ type: 'text' as const, text: output }] };
  }

  handleGetComponentApi(args: { name: string }) {
    console.error(`Fetching API for component: ${args.name} (using fd)`);
    try {
      // Use fd for lightning fast file location
      const findCmd = `fd -t f -g "${args.name}.tsx" --max-results 1 "${ROOT_DIR}"`;
      const filePath = execSync(findCmd, { cwd: ROOT_DIR, encoding: 'utf-8' }).trim();

      if (!filePath) {
        return { content: [{ type: 'text' as const, text: `Component ${args.name} not found.` }] };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const match = content.match(/(?:interface|type)\s+(\w*Props)\s*=\{?([\s\S]*?)\};?/);
      const api = match ? match[0] : 'Props interface not found in file.';

      return {
        content: [
          { type: 'text' as const, text: `File: ${filePath.replace(ROOT_DIR, '')}` },
          { type: 'text' as const, text: api },
        ],
      };
    } catch (e: any) {
      return {
        content: [{ type: 'text' as const, text: `Error finding component: ${e.message}` }],
        isError: true,
      };
    }
  }

  handleGetInventory(args: { target?: string; depth?: number; format?: 'text' | 'markdown'; verbose?: boolean }) {
    const target = normalizeTarget(args.target || '.');
    const depth = args.depth || 2;
    const format = args.format || 'text';
    const verbose = args.verbose !== false;
    
    console.error(`Generating shiny inventory for: ${target} (depth: ${depth})`);
    
    if (format === 'markdown' || format === 'text') {
      try {
        // Use eza for a beautiful tree view if requested or as default improvement
        const ezaCmd = `eza --tree --level=${depth} --icons=always --color=always "${target}"`;
        const output = execSync(ezaCmd, { cwd: ROOT_DIR, encoding: 'utf-8' });
        return {
          content: [{ type: 'text' as const, text: output }],
        };
      } catch (e) {
        // Fallback to legacy script if eza fails for some reason
        const output = execSync(`node scripts/generate-inventory.mjs "${target}" ${depth} ${format} ${verbose}`, {
          cwd: ROOT_DIR,
        }).toString();
        return { content: [{ type: 'text' as const, text: output }] };
      }
    }
    
    const output = execSync(`node scripts/generate-inventory.mjs "${target}" ${depth} ${format} ${verbose}`, {
      cwd: ROOT_DIR,
    }).toString();
    
    return {
      content: [{ type: 'text' as const, text: output }],
    };
  }

  handleShinyView(args: { path: string; range?: string }) {
    console.error(`Shiny View: ${args.path}`);
    const range = args.range ? `--line-range ${args.range}` : '';
    try {
      const output = execSync(`bat --color=always --style=full ${range} "${args.path}"`, {
        cwd: ROOT_DIR,
        encoding: 'utf-8'
      });
      return { content: [{ type: 'text' as const, text: output }] };
    } catch (e: any) {
      return { content: [{ type: 'text' as const, text: `bat failed: ${e.message}` }], isError: true };
    }
  }

  handleShinyFind(args: { query: string; target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Shiny Find: ${args.query} in ${target}`);
    try {
      const output = execSync(`fd --type f --hidden --exclude .git "${args.query}" "${target}"`, {
        cwd: ROOT_DIR,
        encoding: 'utf-8'
      });
      return { content: [{ type: 'text' as const, text: output }] };
    } catch (e: any) {
      return { content: [{ type: 'text' as const, text: `fd failed: ${e.message}` }], isError: true };
    }
  }

  handleStructuralSearch(args: { query: string, target?: string, include?: string }) {
    const target = normalizeTarget(args.target || '.');
    const glob = args.include ? `--include "${args.include}"` : '';
    console.error(`Sovereign Structural search (Biome): ${args.query} in ${target}`);
    try {
      // Biome search is great for finding code patterns (e.g. "import { $X } from '$Y'")
      const output = execSync(`npx biome search "${args.query.replace(/"/g, '\\"')}" "${target}" ${glob}`, {
        cwd: ROOT_DIR,
      }).toString();
      return { content: [{ type: 'text' as const, text: output }] };
    } catch (e: any) {
      return { 
        content: [{ type: 'text' as const, text: `Biome search failed: ${e.message}\nTry simpler grep if structural patterns fail.` }], 
        isError: true 
      };
    }
  }

  handleAuditImports() {
    console.error("Auditing imports...");
    const output = execSync("node scripts/audit-imports.mjs", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }




  handleAuditUIComponents() {
    console.error("Auditing all UI component APIs...");
    const output = execSync("node scripts/audit-ui-api.mjs", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }

  handleFindNativeLeaks() {
    console.error("Finding native leaks...");
    const output = execSync("node scripts/find-native-leaks.mjs", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }

  handleDebugMetro() {
    console.error("Debugging Metro resolution...");
    const output = execSync("node scripts/debug-metro-id.mjs", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }

  handleScaffoldFeatureContext(args: { keyword: string }) {
    const result = executeSovereignTool(
      "scaffold_feature_context",
      `node scripts/scaffold-feature-context.mjs "${args.keyword}"`,
      { keyword: args.keyword }
    );
    return { content: [{ type: "text" as const, text: result.output }] };
  }

  handleGetCodeStats(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Shiny Stats: ${target}`);
    try {
      const output = execSync(`tokei "${target}"`, { cwd: ROOT_DIR, encoding: 'utf-8' });
      return { content: [{ type: 'text' as const, text: output }] };
    } catch (e: any) {
      return { content: [{ type: 'text' as const, text: `tokei failed: ${e.message}` }], isError: true };
    }
  }

  handleCheckSpelling(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Shiny Spellcheck: ${target}`);
    try {
      const output = execSync(`typos "${target}"`, { cwd: ROOT_DIR, encoding: 'utf-8' });
      return { content: [{ type: 'text' as const, text: output || 'No typos found.' }] };
    } catch (e: any) {
      // typos returns exit code 1 if it finds typos
      return { content: [{ type: 'text' as const, text: e.stdout || e.message }] };
    }
  }

  handleDiskUsage(args: { target?: string; depth?: number }) {
    const target = normalizeTarget(args.target || '.');
    const depth = args.depth || 1;
    console.error(`Shiny Disk Usage: ${target} (depth: ${depth})`);
    try {
      const output = execSync(`dust -d ${depth} "${target}"`, { cwd: ROOT_DIR, encoding: 'utf-8' });
      return { content: [{ type: 'text' as const, text: output }] };
    } catch (e: any) {
      return { content: [{ type: 'text' as const, text: `dust failed: ${e.message}` }], isError: true };
    }
  }

  handleMapArchitecture(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Mapping Architecture: ${target}`);
    try {
      const output = execSync(`node scripts/architect-mapper.mjs "${target}"`, { cwd: ROOT_DIR, encoding: 'utf-8' });
      return { content: [{ type: 'text' as const, text: output }] };
    } catch (e: any) {
      return { content: [{ type: 'text' as const, text: `Mapper failed: ${e.message}` }], isError: true };
    }
  }

  handleTraceDeletionImpact(args: { symbol: string }) {
    const result = executeSovereignTool(
      "trace_deletion_impact",
      `node scripts/trace-deletion-impact.mjs "${args.symbol}"`,
      { symbol: args.symbol }
    );
    return { content: [{ type: "text" as const, text: result.output }] };
  }
}



