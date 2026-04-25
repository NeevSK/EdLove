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
  }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Shiny Grepping: ${args.query} in ${target}`);
    
    const regexFlag = args.isRegex ? '' : '--fixed-strings';
    const globFlag = args.include ? `-g "${args.include}"` : '';
    const nodeModulesFlag = args.includeNodeModules ? '' : '--exclude-node-modules'; // rg excludes by default usually, but we want to be explicit if needed
    // rg doesn't have a direct "summary only" that matches the old script exactly, 
    // but --count can give counts, or we just let itrip.
    
    const command = `rg --line-number --column --smart-case --heading --color=never ${regexFlag} ${globFlag} "${args.query}" "${target}"`;
    
    try {
      const output = execSync(command, { cwd: ROOT_DIR, encoding: 'utf-8' });
      return { content: [{ type: 'text' as const, text: output }] };
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

  handleStructuralSearch(args: { query: string, target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Structural search for: ${args.query} in ${target}`);
    try {
      const output = execSync(`npx biome search "${args.query.replace(/"/g, '\\"')}" "${target}"`, {
        cwd: ROOT_DIR,
      }).toString();
      return { content: [{ type: 'text' as const, text: output }] };
    } catch (e: any) {
      return { 
        content: [{ type: 'text' as const, text: `Biome search failed: ${e.message}` }], 
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



