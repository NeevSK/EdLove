// Finds where clients call each capability: the "is it used" half of the practice layer.
// Parsed with the TypeScript AST, so names in strings and comments never count.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Node } from 'typescript/ast';
import * as ts from 'typescript/ast/is';
import { API } from 'typescript/sync';
import type { CatalogChannel } from '../modules/catalog';

export interface Consumer {
  capability: string;
  client: 'web' | 'mobile' | 'core';
  channel: CatalogChannel;
  file: string;
  line: number;
}

export interface SourceFile {
  path: string;
  text: string;
}

// Every client today reaches the API through the app channel. A bot or MCP adapter folder
// gets its own entry here when that channel is admitted.
const clients: { prefix: string; client: Consumer['client']; channel: CatalogChannel }[] = [
  { prefix: 'apps/gurudevi-web/', client: 'web', channel: 'app' },
  { prefix: 'apps/gurudevi-mobile/', client: 'mobile', channel: 'app' },
  { prefix: 'packages/core/src/', client: 'core', channel: 'app' },
];

const accessPath = (node: Node): string[] | undefined => {
  if (ts.isIdentifier(node)) return [node.text];
  if (ts.isPropertyAccessExpression(node)) {
    const parent = accessPath(node.expression);
    return parent ? [...parent, node.name.text] : undefined;
  }
  return undefined;
};

export function findConsumers(names: readonly string[], files: readonly SourceFile[]): Consumer[] {
  const lastSegments = new Set(names.map((n) => n.split('.').at(-1)));
  // Parse only files that could contain a call; the AST then decides.
  const candidates = files.filter((f) =>
    [...lastSegments].some((s) => s && new RegExp(`\\b${s}\\s*\\(`).test(f.text)),
  );
  if (candidates.length === 0) return [];

  const found: Consumer[] = [];
  const api = new API();
  try {
    for (const file of candidates) {
      const owner = clients.find((c) => file.path.startsWith(c.prefix));
      if (!owner) continue;
      const lease = api.createSourceFile(file.path, file.text);
      try {
        const visit = (node: Node) => {
          if (ts.isCallExpression(node)) {
            const path = accessPath(node.expression)?.join('.');
            const capability = path && names.find((n) => path === n || path.endsWith(`.${n}`));
            if (capability)
              found.push({
                capability,
                client: owner.client,
                channel: owner.channel,
                file: file.path,
                line: file.text.slice(0, node.expression.end).split('\n').length,
              });
          }
          node.forEachChild(visit);
        };
        visit(lease.sourceFile);
      } finally {
        lease.dispose();
      }
    }
  } finally {
    api.close();
  }
  return found;
}

const skip =
  /(^|\/)(node_modules|dist|build|\.next|\.expo|android|ios|__tests__|NUL)(\/|$)|\.(test|spec)\.tsx?$/;

/** Client source files: the web and mobile apps and @repo/core, without tests and without v1 itself. */
export function readClientSources(repoRoot: string): SourceFile[] {
  const out: SourceFile[] = [];
  const walk = (dir: string) => {
    // Dot folders (.agents, .expo …) hold no client source; links are not followed.
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
      const full = join(dir, entry.name);
      const path = relative(repoRoot, full).replaceAll('\\', '/');
      if (skip.test(path) || path.startsWith('packages/core/src/api/v1/')) continue;
      if (entry.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts'))
        out.push({ path, text: readFileSync(full, 'utf8') });
    }
  };
  for (const root of ['apps/gurudevi-web', 'apps/gurudevi-mobile', 'packages/core/src'])
    walk(join(repoRoot, root));
  return out;
}
