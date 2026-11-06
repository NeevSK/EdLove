import { describe, expect, it } from 'vitest';
import * as explore from './index';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

describe('Explore Architecture & Security Firewall (Hexagonal Boundary)', () => {
  it('ensures no explore lib file imports remote auth, session drivers, or database adapters', () => {
    const dir = __dirname;
    const files = readdirSync(dir).filter(
      (f) => f.endsWith('.ts') && !f.endsWith('.test.ts'),
    );

    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf-8');
      // No vendor-specific auth clients
      expect(content).not.toMatch(/@supabase/);
      // No server or browser session factory calls
      expect(content).not.toMatch(/createServerSupabaseClient/);
      expect(content).not.toMatch(/createBrowserSupabaseClient/);
      expect(content).not.toMatch(/refreshSupabaseSession/);
      expect(content).not.toMatch(/refreshSanctuarySession/);
      expect(content).not.toMatch(/sessionSecurity\.adapter/);
    }
  });

  it('guarantees explore storage kinds remain strictly local (memory or local-storage)', () => {
    const memoryStorage = explore.createInMemoryExploreStorage();
    expect(memoryStorage.kind).toBe('memory');

    const storage = explore.createExploreStorage();
    expect(['memory', 'local-storage']).toContain(storage.kind);
  });

  it('verifies explore self reflection adapter writes only locally without production authorization', () => {
    const adapter = explore.createExploreSelfReflectionAdapter();
    expect(['memory', 'local-storage']).toContain(adapter.storageKind);

    const initial = adapter.load();
    expect(initial.schemaVersion).toBe(explore.EXPLORE_STATE_SCHEMA_VERSION);
    expect(initial.baselineVersion).toBe(explore.EXPLORE_BASELINE_VERSION);
  });
});
