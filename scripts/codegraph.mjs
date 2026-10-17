#!/usr/bin/env node
/**
 * Sovereign CodeGraph Engine (2026)
 * High-performance structural AST symbol indexer and relational graph engine.
 * Computes:
 *   1. Symbol Definitions & Signatures (Interface, Type, Function, Class, Hook, Component)
 *   2. Relational Edges (Imports, Exports, References)
 *   3. Transitive Blast Radius (1-hop & 2-hop dependents)
 *   4. Compact Repo-Maps for Subgraph Context Assembly
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const TARGET_DIRS = ['apps', 'packages'];
const EXCLUDE_DIRS = new Set([
  'node_modules', 'dist', 'build', '.turbo', '.expo', '.next', '.git',
  '.agents', '.vscode', '.astro', 'out', 'coverage', '.system_generated',
  'artifacts', 'dist-dev', 'dist-debug', 'output', 'reports'
]);

const CACHE_DIR = path.join(ROOT_DIR, '.tmp');
const CACHE_FILE = path.join(CACHE_DIR, 'codegraph-cache.json');

export class CodeGraph {
  constructor() {
    this.files = new Map(); // filePath -> { mtime, symbols, imports, exports }
    this.symbolIndex = new Map(); // symbolName -> [ { name, kind, file, line, signature } ]
    this.importGraph = new Map(); // file -> Set<file> (files this file imports)
    this.dependentGraph = new Map(); // file -> Set<file> (files that import this file)
    this.symbolCallers = new Map(); // symbolName -> Set<file> (files that import this symbol)
  }

  normalizePath(p) {
    return path.relative(ROOT_DIR, p).replace(/\\/g, '/');
  }

  parseFile(fullPath, relPath) {
    let content;
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {
      return null;
    }

    const lines = content.split('\n');
    const symbols = [];
    const imports = [];
    const exportedSymbols = new Set();

    // 1. Extract Symbol Definitions & Exports
    // Matches: export [default] (function|class|interface|type|const|enum) Name
    const symbolRegex = /^export\s+(?:default\s+)?(?:async\s+)?(function|class|interface|type|const|enum)\s+([A-Za-z0-9_$]+)/;
    // Also matches React component or hook declarations: export const useSomething = ...
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(symbolRegex);
      if (match) {
        const kind = match[1];
        const name = match[2];
        const signature = line.length > 120 ? line.slice(0, 117) + '...' : line;
        symbols.push({
          name,
          kind: name.startsWith('use') && (kind === 'function' || kind === 'const') ? 'hook' : kind,
          file: relPath,
          line: i + 1,
          signature
        });
        exportedSymbols.add(name);
      }

      // 2. Extract Imports
      // Matches: import { A, B } from 'specifier' or import A from 'specifier'
      const importMatch = line.match(/^import\s+(?:type\s+)?(?:(\*\s+as\s+[A-Za-z0-9_$]+)|([A-Za-z0-9_$]+)|(?:\{([^}]+)\}))?\s*(?:from\s+)?['"]([^'"]+)['"]/);
      if (importMatch) {
        const defaultImport = importMatch[2];
        const namedImports = importMatch[3] ? importMatch[3].split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean) : [];
        const specifier = importMatch[4];
        
        const importedNames = [];
        if (defaultImport) importedNames.push(defaultImport);
        if (namedImports.length > 0) importedNames.push(...namedImports);

        imports.push({
          specifier,
          names: importedNames
        });
      }
    }

    return {
      symbols,
      imports,
      exportedSymbols: Array.from(exportedSymbols)
    };
  }

  loadCache() {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      }
    } catch {
      // Ignore cache load failure
    }
    return null;
  }

  saveCache(cacheData) {
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData), 'utf8');
    } catch {
      // Ignore cache save failure
    }
  }

  build() {
    const startTime = Date.now();
    let totalScanned = 0;
    let cacheHits = 0;
    const oldCache = this.loadCache() || {};
    const newCache = {};

    const traverse = (dir) => {
      let entries = [];
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

      for (const entry of entries) {
        if (EXCLUDE_DIRS.has(entry.name) || entry.isSymbolicLink()) continue;
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            totalScanned++;
            const relPath = this.normalizePath(fullPath);
            let mtimeMs = 0;
            try { mtimeMs = fs.statSync(fullPath).mtimeMs; } catch {}

            let parsed = null;
            if (oldCache[relPath] && oldCache[relPath].mtime === mtimeMs) {
              parsed = oldCache[relPath].data;
              cacheHits++;
            } else {
              parsed = this.parseFile(fullPath, relPath);
            }

            if (parsed) {
              newCache[relPath] = { mtime: mtimeMs, data: parsed };
              this.files.set(relPath, parsed);

              // Index symbols
              for (const sym of parsed.symbols) {
                if (!this.symbolIndex.has(sym.name)) {
                  this.symbolIndex.set(sym.name, []);
                }
                this.symbolIndex.get(sym.name).push(sym);
              }

              // Index symbol callers
              for (const imp of parsed.imports) {
                for (const name of imp.names) {
                  if (!this.symbolCallers.has(name)) {
                    this.symbolCallers.set(name, new Set());
                  }
                  this.symbolCallers.get(name).add(relPath);
                }
              }
            }
          }
        }
      }
    };

    for (const target of TARGET_DIRS) {
      const p = path.join(ROOT_DIR, target);
      if (fs.existsSync(p)) traverse(p);
    }

    // Resolve inter-file dependency edges
    for (const [file, data] of this.files.entries()) {
      for (const imp of data.imports) {
        const resolved = this.resolveImport(file, imp.specifier);
        if (resolved && this.files.has(resolved)) {
          // file -> resolved
          if (!this.importGraph.has(file)) this.importGraph.set(file, new Set());
          this.importGraph.get(file).add(resolved);

          // resolved -> file (dependent)
          if (!this.dependentGraph.has(resolved)) this.dependentGraph.set(resolved, new Set());
          this.dependentGraph.get(resolved).add(file);
        }
      }
    }

    this.saveCache(newCache);

    return {
      filesIndexed: this.files.size,
      symbolsIndexed: Array.from(this.symbolIndex.values()).reduce((a, b) => a + b.length, 0),
      durationMs: Date.now() - startTime,
      cacheHits
    };
  }

  resolveImport(fromFile, specifier) {
    if (specifier.startsWith('.')) {
      const dir = path.dirname(path.join(ROOT_DIR, fromFile));
      const target = path.resolve(dir, specifier);
      const candidates = [
        target,
        `${target}.ts`,
        `${target}.tsx`,
        `${target}.js`,
        `${target}/index.ts`,
        `${target}/index.tsx`
      ];
      for (const c of candidates) {
        const norm = this.normalizePath(c);
        if (this.files.has(norm)) return norm;
      }
    } else if (specifier.startsWith('@repo/')) {
      const parts = specifier.split('/');
      const pkgName = parts[1];
      const subPath = parts.slice(2).join('/');
      const baseDir = path.join(ROOT_DIR, 'packages', pkgName, 'src');
      const target = subPath ? path.join(baseDir, subPath) : path.join(baseDir, 'index.ts');
      const candidates = [
        target,
        `${target}.ts`,
        `${target}.tsx`,
        `${target}/index.ts`,
        `${target}/index.tsx`
      ];
      for (const c of candidates) {
        const norm = this.normalizePath(c);
        if (this.files.has(norm)) return norm;
      }
    } else if (specifier.startsWith('@/')) {
      // Resolve app-level @/ alias (maps to apps/<app>/src/*)
      if (fromFile.startsWith('apps/')) {
        const parts = fromFile.split('/');
        const appRoot = `${parts[0]}/${parts[1]}`;
        const subPath = specifier.slice(2);
        const target = path.join(ROOT_DIR, appRoot, 'src', subPath);
        const candidates = [
          target,
          `${target}.ts`,
          `${target}.tsx`,
          `${target}.js`,
          `${target}/index.ts`,
          `${target}/index.tsx`
        ];
        for (const c of candidates) {
          const norm = this.normalizePath(c);
          if (this.files.has(norm)) return norm;
        }
      }
    } else if (specifier.startsWith('@') && !specifier.startsWith('@repo/')) {
      // Resolve package shortcuts like @community/*, @library/*, etc.
      const match = specifier.match(/^@([a-zA-Z0-9_-]+)(?:\/(.*))?$/);
      if (match) {
        const pkgName = match[1];
        const subPath = match[2] || 'index.ts';
        const target = path.join(ROOT_DIR, 'packages', pkgName, 'src', subPath);
        const candidates = [
          target,
          `${target}.ts`,
          `${target}.tsx`,
          `${target}/index.ts`
        ];
        for (const c of candidates) {
          const norm = this.normalizePath(c);
          if (this.files.has(norm)) return norm;
        }
      }
    }
    return null;
  }

  // --- QUERY APIS ---

  findSymbol(name) {
    const hits = this.symbolIndex.get(name) || [];
    return hits;
  }

  getCallers(name) {
    const callers = this.symbolCallers.get(name) || new Set();
    return Array.from(callers);
  }

  getCallees(fileOrSymbol) {
    // If it's a file
    const norm = this.normalizePath(fileOrSymbol);
    if (this.files.has(norm)) {
      const fileData = this.files.get(norm);
      return fileData.imports.flatMap(imp => imp.names.map(name => ({ symbol: name, from: imp.specifier })));
    }
    // If it's a symbol
    const syms = this.findSymbol(fileOrSymbol);
    if (syms.length > 0) {
      const parentFile = syms[0].file;
      return this.getCallees(parentFile);
    }
    return [];
  }

  getBlastRadius(target) {
    const norm = this.normalizePath(target);
    const affected = new Set();
    const queue = [];

    // Target can be a file or a symbol name
    if (this.files.has(norm)) {
      queue.push({ file: norm, hop: 0 });
    } else {
      const symHits = this.findSymbol(target);
      for (const hit of symHits) {
        queue.push({ file: hit.file, hop: 0 });
      }
      const directCallers = this.getCallers(target);
      for (const c of directCallers) {
        queue.push({ file: c, hop: 1 });
      }
    }

    const visited = new Set();
    while (queue.length > 0) {
      const { file, hop } = queue.shift();
      if (visited.has(file) || hop > 2) continue; // Cap at 2 hops
      visited.add(file);
      if (hop > 0) affected.add({ file, hop });

      const dependents = this.dependentGraph.get(file) || new Set();
      for (const dep of dependents) {
        queue.push({ file: dep, hop: hop + 1 });
      }
    }

    return Array.from(affected);
  }

  getRepoMap(scopeTarget = '') {
    const norm = scopeTarget ? this.normalizePath(scopeTarget) : '';
    const map = [];

    // Filter and sort files by dependent count (in-degree PageRank centrality)
    const fileEntries = Array.from(this.files.entries()).filter(([file]) => {
      return !norm || file.startsWith(norm);
    });

    fileEntries.sort((a, b) => {
      const depCountA = (this.dependentGraph.get(a[0]) || new Set()).size;
      const depCountB = (this.dependentGraph.get(b[0]) || new Set()).size;
      return depCountB - depCountA;
    });

    for (const [file, data] of fileEntries) {
      if (data.symbols.length === 0) continue;

      const dependents = (this.dependentGraph.get(file) || new Set()).size;
      const rankTag = dependents > 0 ? ` [Used by ${dependents} files]` : '';
      const fileSymbols = data.symbols.map(s => `  • [${s.kind}] ${s.name} (L${s.line})`).join('\n');
      map.push(`${file}${rankTag}:\n${fileSymbols}`);
    }

    return map.join('\n\n');
  }

  getStats() {
    return {
      totalFiles: this.files.size,
      totalSymbols: Array.from(this.symbolIndex.values()).reduce((a, b) => a + b.length, 0),
      totalDependencies: Array.from(this.importGraph.values()).reduce((a, b) => a + b.size, 0)
    };
  }
}

// CLI Runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rawArgs = process.argv.slice(2);
  const isJson = rawArgs.includes('--json');
  const args = rawArgs.filter(a => a !== '--json');
  const command = args[0] || 'stats';
  const query = args[1];

  const graph = new CodeGraph();
  const buildInfo = graph.build();

  switch (command) {
    case 'stats': {
      const stats = { ...buildInfo, ...graph.getStats() };
      if (isJson) {
        console.log(JSON.stringify(stats, null, 2));
      } else {
        console.log(`\n🏛️  Sovereign CodeGraph Engine (Built in ${buildInfo.durationMs}ms, ${buildInfo.cacheHits || 0} cache hits)`);
        console.log(`  - Indexed Files: ${buildInfo.filesIndexed}`);
        console.log(`  - Indexed Symbols: ${buildInfo.symbolsIndexed}`);
        console.log(`  - Dependency Edges: ${graph.getStats().totalDependencies}\n`);
      }
      break;
    }

    case 'symbol': {
      if (!query) { console.error('Please specify a symbol name: node codegraph.mjs symbol <name>'); process.exit(1); }
      const syms = graph.findSymbol(query);
      if (isJson) {
        console.log(JSON.stringify(syms, null, 2));
      } else {
        console.log(`\n🔍 Symbol search for "${query}" (${syms.length} matches):`);
        for (const s of syms) {
          console.log(`  • [${s.kind}] ${s.name} in ${s.file}:${s.line}\n    ${s.signature}`);
        }
      }
      break;
    }

    case 'callers': {
      if (!query) { console.error('Please specify a symbol name: node codegraph.mjs callers <name>'); process.exit(1); }
      const callers = graph.getCallers(query);
      if (isJson) {
        console.log(JSON.stringify(callers, null, 2));
      } else {
        console.log(`\n📞 Callers / Importers of "${query}" (${callers.length} files):`);
        for (const c of callers) console.log(`  • ${c}`);
      }
      break;
    }

    case 'callees': {
      if (!query) { console.error('Please specify a symbol/file: node codegraph.mjs callees <query>'); process.exit(1); }
      const callees = graph.getCallees(query);
      if (isJson) {
        console.log(JSON.stringify(callees, null, 2));
      } else {
        console.log(`\n📥 Dependencies / Callees for "${query}" (${callees.length} items):`);
        for (const c of callees) console.log(`  • ${c.symbol} (from ${c.from})`);
      }
      break;
    }

    case 'blast-radius': {
      if (!query) { console.error('Please specify a target: node codegraph.mjs blast-radius <file|symbol>'); process.exit(1); }
      const radius = graph.getBlastRadius(query);
      if (isJson) {
        console.log(JSON.stringify(radius, null, 2));
      } else {
        console.log(`\n💥 Blast Radius for "${query}" (${radius.length} affected files):`);
        for (const r of radius) console.log(`  • [Hop ${r.hop}] ${r.file}`);
      }
      break;
    }

    case 'repo-map': {
      const map = graph.getRepoMap(query || '');
      if (isJson) {
        console.log(JSON.stringify({ repoMap: map, scope: query || 'root' }, null, 2));
      } else {
        console.log(`\n🗺️  Repo Map for "${query || 'root'}":\n`);
        console.log(map.slice(0, 3000));
        if (map.length > 3000) console.log(`\n... (truncated ${map.length - 3000} characters)`);
      }
      break;
    }

    default:
      console.log(`Usage: node scripts/codegraph.mjs [stats | symbol <name> | callers <name> | callees <target> | blast-radius <target> | repo-map <scope>] [--json]`);
  }
}
