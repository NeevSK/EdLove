import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const entryShellPath = resolve(import.meta.dirname, '../../entry/EntryShell.tsx');
const entryShell = readFileSync(entryShellPath, 'utf8');

describe('entry shell service recovery', () => {
  it('mounts one deep-link listener without mounting retired API mutation replay', () => {
    expect(entryShell.match(/<GlobalProvider\b/g)).toHaveLength(1);
    expect(entryShell.match(/<DeepLinkProvider>/g)).toHaveLength(1);
    expect(entryShell).not.toContain('AuthenticatedSyncService');
    expect(entryShell.indexOf('<GlobalProvider>')).toBeLessThan(
      entryShell.indexOf('<DeepLinkProvider>'),
    );
  });

  it('does not revive the legacy SanctuaryProvider', () => {
    expect(entryShell).not.toContain('SanctuaryProvider');
    expect(existsSync(resolve(import.meta.dirname, '../../providers/SanctuaryProvider.tsx'))).toBe(
      false,
    );
  });

  it('provides the shared FAB contract, drawn by the rooms shell for every room', () => {
    expect(entryShell).toContain('<FABProvider>');
    const tabsLayout = readFileSync(
      resolve(import.meta.dirname, '../../../app/(tabs)/_layout.tsx'),
      'utf8',
    );
    expect(tabsLayout).toContain('<RoomFab');
  });

  it('registers development diagnostics routes and persists the first shell frame marker', () => {
    expect(entryShell).toContain('<Stack.Screen name="verger-lab" />');
    expect(entryShell).toContain('<Stack.Screen name="verger-diagnostics" />');
    expect(entryShell).toContain("task: 'first-shell-frame'");
  });
});
