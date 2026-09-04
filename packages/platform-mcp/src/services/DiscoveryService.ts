import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../utils/constants.js';
import {
  executeSovereignTool,
  quoteShellArg,
  runCommand,
  runPowerShellScript,
  runShellCommand,
} from '../utils/execution.js';
import { normalizeTarget } from '../utils/pathUtils.js';
import { IngestService } from './JinaService.js';

function toText(text: string, isError?: boolean) {
  return {
    content: [{ type: 'text' as const, text }],
    isError: Boolean(isError),
  };
}

interface GrepArgs {
  query: string;
  isRegex?: boolean;
  include?: string;
  target?: string;
  includeNodeModules?: boolean;
  summaryOnly?: boolean;
  context?: number;
  fileType?: string;
  richText?: boolean;
}

function buildRgArgs(args: GrepArgs, target: string): string[] {
  return [
    '--line-number',
    '--column',
    '--smart-case',
    '--heading',
    '--color=never',
    ...(args.isRegex ? [] : ['--fixed-strings']),
    ...(args.include ? ['-g', args.include] : []),
    ...(args.fileType ? ['-t', args.fileType] : []),
    ...(args.context && args.context > 0 ? ['-C', String(args.context)] : []),
    ...(!args.includeNodeModules
      ? [
          '-g',
          '!**/node_modules/*',
          '-g',
          '!**/dist/*',
          '-g',
          '!**/.turbo/*',
          '-g',
          '!**/.git/*',
          '-g',
          '!**/build/*',
          '-g',
          '!**/.expo/*',
        ]
      : []),
    args.query,
    target,
  ];
}

export class DiscoveryService {
  private ingest = new IngestService();

  handleGrepCode(args: GrepArgs) {
    const target = normalizeTarget(args.target || '.');
    const context = args.context ?? 0;
    console.error(`Sovereign Grepping: ${args.query} in ${target} (Context: ${context})`);

    const searchResult = runCommand('rg', buildRgArgs(args, target));
    if (!searchResult.ok && searchResult.exitCode !== 1) {
      return toText(`ripgrep failed: ${searchResult.combined}`, true);
    }
    if (searchResult.exitCode === 1) {
      return toText(args.summaryOnly ? 'No matches found for summary.' : 'No matches found.');
    }

    if (args.summaryOnly) {
      const countResult = runCommand('rg', [
        '--count',
        '--smart-case',
        ...buildRgArgs({ ...args, context: 0 }, target),
      ]);
      return toText(`Summary Counts:\n${countResult.stdout || 'No matches found for summary.'}`);
    }

    let output = searchResult.stdout;
    if (args.richText) {
      const tempFile = path.join(ROOT_DIR, '.grep_result_temp.txt');
      try {
        fs.writeFileSync(tempFile, output, 'utf-8');
        const batResult = runCommand('bat', ['--style=full', '--color=never', tempFile]);
        if (batResult.ok) output = batResult.stdout;
      } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    }

    const filesAffected = new Set<string>();
    for (const line of output.split('\n')) {
      if (
        line &&
        !line.startsWith(' ') &&
        !line.match(/^\d+[:-]/) &&
        (line.includes('\\') || line.includes('/'))
      ) {
        filesAffected.add(line.trim());
      }
    }

    return toText(
      `${output}\n--- Sovereign Search Summary ---\nFound matches in ${filesAffected.size} files.\n`,
    );
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

    const result = runPowerShellScript('scripts/search-docs.ps1', [
      '-Query',
      args.query,
      '-Target',
      target,
      ...(args.includeNodeModules ? ['-IncludeNodeModules'] : []),
      ...(args.summaryOnly ? ['-SummaryOnly'] : []),
      ...(args.hybrid ? ['-Hybrid'] : []),
    ]);

    return toText(result.combined, !result.ok);
  }

  handleGetComponentApi(args: { name: string }) {
    console.error(`Fetching API for component: ${args.name}`);
    const findResult = runCommand('fd', [
      '-t',
      'f',
      '-g',
      `${args.name}.tsx`,
      '--max-results',
      '1',
      ROOT_DIR,
    ]);
    const filePath = findResult.stdout.trim();

    if (!filePath) {
      return toText(`Component ${args.name} not found.`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/(?:interface|type)\s+(\w*Props)\s*=\{?([\s\S]*?)\};?/);
    const api = match ? match[0] : 'Props interface not found in file.';

    return {
      content: [
        {
          type: 'text' as const,
          text: `File: ${String(filePath || '').replace(ROOT_DIR || '', '')}`,
        },
        { type: 'text' as const, text: api },
      ],
    };
  }

  handleGetInventory(args: {
    target?: string;
    depth?: number;
    format?: 'text' | 'markdown';
    verbose?: boolean;
  }) {
    const target = normalizeTarget(args.target || '.');
    const depth = args.depth || 2;
    const format = args.format || 'text';
    const verbose = args.verbose !== false;

    console.error(`Generating shiny inventory for: ${target} (depth: ${depth})`);

    if (format === 'markdown' || format === 'text') {
      const ezaResult = runCommand('eza', [
        '--tree',
        `--level=${depth}`,
        '--icons=always',
        '--color=always',
        target,
      ]);
      if (ezaResult.ok) {
        return toText(ezaResult.stdout);
      }
    }

    const scriptResult = runCommand('node', [
      'scripts/generate-inventory.mjs',
      target,
      String(depth),
      format,
      String(verbose),
    ]);
    return toText(scriptResult.combined, !scriptResult.ok);
  }

  handleShinyView(args: { path: string; range?: string }) {
    console.error(`Shiny View: ${args.path}`);
    const range = args.range ? `--line-range ${args.range}` : '';
    const output = runShellCommand(
      `bat --color=always --style=full ${range} ${quoteShellArg(args.path)}`,
    );
    return toText(output.combined, !output.ok);
  }

  handleShinyFind(args: { query: string; target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Shiny Find: ${args.query} in ${target}`);
    const output = runCommand('fd', [
      '--type',
      'f',
      '--hidden',
      '--exclude',
      '.git',
      args.query,
      target,
    ]);
    return toText(output.combined, !output.ok);
  }

  handleStructuralSearch(args: { query: string; target?: string; include?: string }) {
    const target = normalizeTarget(args.target || '.');
    const glob = args.include ? `--include "${args.include}"` : '';
    console.error(`Sovereign Structural search (Biome): ${args.query} in ${target}`);
    const output = runShellCommand(
      `npx biome search ${quoteShellArg(String(args.query || ''))} ${quoteShellArg(target)} ${glob}`,
    );
    if (!output.ok) {
      return toText(
        `Biome search failed: ${output.combined}\nTry simpler grep if structural patterns fail.`,
        true,
      );
    }
    return toText(output.combined);
  }

  handleAuditImports() {
    return toText(runCommand('node', ['scripts/audit-imports.mjs']).combined);
  }

  handleAuditUIComponents() {
    return toText(runCommand('node', ['scripts/audit-ui-api.mjs']).combined);
  }

  handleFindNativeLeaks() {
    return toText(runCommand('node', ['scripts/find-native-leaks.mjs']).combined);
  }

  handleDebugMetro() {
    return toText(runCommand('node', ['scripts/debug-metro-id.mjs']).combined);
  }

  handleScaffoldFeatureContext(args: { keyword: string }) {
    const result = executeSovereignTool(
      'scaffold_feature_context',
      `node scripts/scaffold-feature-context.mjs ${quoteShellArg(args.keyword)}`,
      { keyword: args.keyword },
    );
    return toText(result.output, result.status !== 'success');
  }

  handleGetCodeStats(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Shiny Stats: ${target}`);
    const output = runCommand('tokei', [target]);
    return toText(output.combined, !output.ok);
  }

  handleCheckSpelling(args: { target?: string }) {
    const target = normalizeTarget(args.target || '.');
    console.error(`Shiny Spellcheck: ${target}`);
    const output = runCommand('typos', [target]);
    return toText(output.combined || 'No typos found.', false);
  }

  handleDiskUsage(args: { target?: string; depth?: number }) {
    const target = normalizeTarget(args.target || '.');
    const depth = args.depth || 1;
    console.error(`Shiny Disk Usage: ${target} (depth: ${depth})`);
    const output = runCommand('dust', ['-d', String(depth), target]);
    return toText(output.combined, !output.ok);
  }

  handleGetLens(args: { type: 'skeleton' | 'debt'; target?: string }) {
    const target = normalizeTarget(args.target || '.');
    if (args.type === 'skeleton') {
      console.error(`Generating Skeleton Lens...`);
      const output = runCommand('node', ['scripts/generate-skeleton-lens.mjs']);
      return toText(output.combined, !output.ok);
    }
    if (args.type === 'debt') {
      console.error(`Generating Debt Lens...`);
      const output = runCommand('node', ['scripts/generate-debt-lens.mjs']);
      return toText(output.combined, !output.ok);
    }
    if (args.type === 'luminosity') {
      console.error(`Generating Luminosity Lens...`);
      const output = runCommand('node', ['scripts/generate-luminosity-lens.mjs', target]);
      return toText(output.combined, !output.ok);
    }
    return toText(
      `Unknown lens type: ${args.type || 'none'}. Use 'skeleton', 'debt', or 'luminosity'.`,
      true,
    );
  }

  handleSimulateImpact(args: { symbol: string }) {
    console.error(`Simulating Impact for: ${args.symbol}`);
    const output = runCommand('node', ['scripts/simulate-impact.mjs', args.symbol]);
    return toText(output.combined, !output.ok);
  }

  handleTraceDeletionImpact(args: { symbol: string }) {
    const result = executeSovereignTool(
      'trace_deletion_impact',
      `node scripts/trace-deletion-impact.mjs ${quoteShellArg(args.symbol)}`,
      { symbol: args.symbol },
    );
    return toText(result.output, result.status !== 'success');
  }

  async handleJinaReader(args: { url: string; apiKey?: string }) {
    console.error(`Jina AI Reader fetching: ${args.url}`);
    try {
      const markdown = await this.ingest.fetchMarkdown(args.url, {
        apiKey: args.apiKey,
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: `--- Jina AI Reader Results (${args.url}) ---\n`,
          },
          { type: 'text' as const, text: markdown },
        ],
      };
    } catch (e: any) {
      return toText(`Jina Reader failed: ${e.message}`, true);
    }
  }

  handleParsePdf(args: { target: string; maxPages?: number; extractTables?: boolean }) {
    const rawTarget = args.target;
    if (!rawTarget) {
      return toText('Missing required argument: "target" (path to PDF file).', true);
    }

    const resolvedTarget = normalizeTarget(rawTarget);
    if (!fs.existsSync(resolvedTarget)) {
      return toText(`PDF file not found at: ${resolvedTarget}`, true);
    }

    const maxPages = args.maxPages ?? 300;
    const extractTables = args.extractTables !== false;

    console.error(`Parsing PDF: ${resolvedTarget} (maxPages: ${maxPages}, tables: ${extractTables})`);

    const pythonScript = `
import sys
import json
import pdfplumber

target_path = sys.argv[1]
max_pages = int(sys.argv[2])
extract_tables = sys.argv[3].lower() == 'true'

try:
    with pdfplumber.open(target_path) as pdf:
        total_pages = len(pdf.pages)
        # Dynamically only process up to what actually exists in the document
        pages_to_process = min(total_pages, max_pages) if max_pages > 0 else total_pages
        output_sections = []
        
        output_sections.append(f"# PDF Extraction: {target_path}\\n")
        output_sections.append(f"> **Total Pages in Document:** {total_pages} | **Processed Pages:** {pages_to_process}\\n")
        
        for i in range(pages_to_process):
            page = pdf.pages[i]
            page_num = i + 1
            output_sections.append(f"## Page {page_num} of {total_pages}\\n")
            
            text = (page.extract_text() or '').strip()
            if text:
                output_sections.append(text + "\\n")
            else:
                output_sections.append("*(No extractable text on this page)*\\n")
                
            if extract_tables:
                tables = page.extract_tables()
                if tables:
                    for t_idx, table in enumerate(tables):
                        output_sections.append(f"### Table {t_idx + 1} (Page {page_num})\\n")
                        table_rows = []
                        for row in table:
                            clean_row = [str(c or '').replace('|', '\\\\|').replace('\\n', ' ') for c in row]
                            table_rows.append("| " + " | ".join(clean_row) + " |")
                        if len(table_rows) > 0:
                            header = table_rows[0]
                            col_count = header.count('|') - 1
                            separator = "| " + " | ".join(["---"] * col_count) + " |"
                            table_md = [header, separator] + table_rows[1:]
                            output_sections.append("\\n".join(table_md) + "\\n")
                            
        print("\\n".join(output_sections))
except Exception as e:
    print(f"Error parsing PDF: {e}", file=sys.stderr)
    sys.exit(1)
`;

    const result = runCommand('python', [
      '-c',
      pythonScript,
      resolvedTarget,
      String(maxPages),
      String(extractTables),
    ]);

    if (!result.ok) {
      return toText(`PDF extraction failed: ${result.combined}`, true);
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: result.stdout || 'PDF parsed successfully (no output generated).',
        },
      ],
    };
  }
}

