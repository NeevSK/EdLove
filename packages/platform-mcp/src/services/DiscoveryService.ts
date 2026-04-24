import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { ROOT_DIR } from "../utils/constants.js";
import { normalizeTarget } from "../utils/pathUtils.js";

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
    console.error(`Grepping codebase for: ${args.query} in ${target}`);
    const isRegex = args.isRegex ? '-IsRegex' : '';
    const include = args.include ? `-Include "${args.include}"` : '';
    const includeNodeModules = args.includeNodeModules ? '-IncludeNodeModules' : '';
    const summaryOnly = args.summaryOnly ? '-SummaryOnly' : '';

    const output = execSync(
      `powershell -ExecutionPolicy Bypass -File scripts/grep-code.ps1 -Query "${args.query}" -Target "${target}" ${isRegex} ${include} ${includeNodeModules} ${summaryOnly}`,
      { cwd: ROOT_DIR },
    ).toString();
    return { content: [{ type: 'text' as const, text: output }] };
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
    console.error(`Fetching API for component: ${args.name}`);
    try {
      const findCmd = `powershell -Command "Get-ChildItem -Path packages/ui/src,apps/*/src -Recurse -Filter '${args.name}.tsx' -File | Select-Object -First 1 -ExpandProperty FullName"`;
      const filePath = execSync(findCmd, { cwd: ROOT_DIR }).toString().trim();

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
    
    console.error(`Generating inventory for: ${target} (depth: ${depth}, format: ${format}, verbose: ${verbose})`);
    const output = execSync(`node scripts/generate-inventory.mjs "${target}" ${depth} ${format} ${verbose}`, {
      cwd: ROOT_DIR,
    }).toString();
    
    return {
      content: [{ type: 'text' as const, text: output }],
    };
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
    console.error("Auditing external imports for native leaks...");
    const output = execSync("node scripts/audit-imports.mjs", { cwd: ROOT_DIR }).toString();
    return { content: [{ type: "text" as const, text: output }] };
  }
}
