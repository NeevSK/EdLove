// Reads subdomain and platform cards: the intent layer of capability conformance.
// Card shape: docs/architecture/domain-design-method.md#the-subdomain-card
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Card {
  module: string;
  path: string;
  status: 'draft' | 'admitted' | 'retired' | 'unknown';
  commands: string[];
  queries: string[];
}

/** Domain modules are `<domain>.<subdomain>`; platform modules have no dot. */
export function cardPath(module: string): string {
  const [domain, subdomain] = module.split('.');
  return subdomain
    ? `docs/architecture/domains/${domain}/${subdomain}.md`
    : `docs/architecture/domains/platform/${module}.md`;
}

function section(text: string, heading: string): string[] {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${heading}\\s*$`, 'i').test(l));
  if (start < 0) return [];
  const end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  return lines
    .slice(start + 1, end < 0 ? undefined : end)
    .flatMap((l) => [...l.matchAll(/^\s*[-*]\s+`([a-z][\w.]*)`/g)].map((m) => m[1] ?? ''));
}

export function parseCard(module: string, path: string, text: string): Card {
  const status = text.match(/^status:\s*"?(draft|admitted|retired)"?\s*$/m)?.[1];
  return {
    module,
    path,
    status:
      status === 'draft' || status === 'admitted' || status === 'retired' ? status : 'unknown',
    commands: section(text, 'commands'),
    queries: section(text, 'queries'),
  };
}

export function readCard(repoRoot: string, module: string): Card | undefined {
  const path = cardPath(module);
  const file = join(repoRoot, path);
  return existsSync(file) ? parseCard(module, path, readFileSync(file, 'utf8')) : undefined;
}
