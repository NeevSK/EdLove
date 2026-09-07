import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const entryShellPath = resolve(import.meta.dirname, '../../entry/EntryShell.tsx');
const entryShell = readFileSync(entryShellPath, 'utf8');

describe('entry shell service recovery', () => {
  it('mounts exactly one deep-link listener and authenticated runtime host beneath GlobalProvider', () => {
    expect(entryShell.match(/<GlobalProvider>/g)).toHaveLength(1);
    expect(entryShell.match(/<DeepLinkProvider>/g)).toHaveLength(1);
    expect(entryShell.match(/<AuthenticatedSyncService\s*\/>/g)).toHaveLength(1);
    expect(entryShell.indexOf('<GlobalProvider>')).toBeLessThan(entryShell.indexOf('<DeepLinkProvider>'));
  });

  it('does not revive the legacy SanctuaryProvider', () => {
    expect(entryShell).not.toContain('SanctuaryProvider');
    expect(existsSync(resolve(import.meta.dirname, '../../providers/SanctuaryProvider.tsx'))).toBe(false);
  });

  it('provides and renders the shared FAB contract for registered workspace actions', () => {
    expect(entryShell).toContain('<FABProvider>');
    expect(entryShell).toContain('<LotusPetalFAB />');
  });
});
