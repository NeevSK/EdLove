import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const workspaceRoot = resolve(__dirname, '../../../../..');
const read = (relativePath: string) => readFileSync(resolve(workspaceRoot, relativePath), 'utf8');

describe('efficiency policy boundaries', () => {
  it("keeps operational entry points behind the shared policy: verger's admission", () => {
    const backgroundSync = read('apps/gurudevi-mobile/src/lib/backgroundSync.ts');
    const retentionScheduler = read('apps/gurudevi-mobile/src/storage/retention-scheduler.ts');
    // Accept either single or double quotes for the import
    const admission = /from\s+["']@\/runtime\/backgroundAdmission["']/;
    expect(backgroundSync).toMatch(admission);
    expect(retentionScheduler).toMatch(admission);
    expect(backgroundSync).toMatch(/admitBackgroundWork\(['"]sync['"]\)/);
    expect(retentionScheduler).toMatch(/admitBackgroundWork\(['"]storage-eviction['"]\)/);
    // R12: what the job records about the network is verger's reading, not a field expo-network
    // does not have (it read `isMetered` through `any`, so metered was always false).
    expect(retentionScheduler).toMatch(/readBackgroundSnapshot\(\)/);
    expect(retentionScheduler).not.toMatch(/isMetered\b/);
    expect(retentionScheduler).not.toMatch(/(import\(|from\s+)['"]expo-network['"]/);
    expect(backgroundSync).toMatch(/getActiveAccountId/);
    expect(backgroundSync).toMatch(/planMutationReplay\(\s*queue,\s*activeUserId,/);
    const replayPolicy = read('packages/core/src/lib/sync/replayPolicy.ts');
    expect(replayPolicy).toMatch(/item\.userId\s*!==\s*principalId/);
    expect(backgroundSync).toMatch(/tryAcquireMutationLease/);
  });

  it('does not retain retired device heuristics or component-level PixelRatio policy', () => {
    expect(existsSync(resolve(workspaceRoot, 'packages/ui/src/utils/DeviceUtils.ts'))).toBe(false);
    const visualSources = [
      'packages/ui/src/components/CelebrationOverlay.tsx',
      'packages/ui/src/components/SkiaGlowAura.tsx',
      'packages/ui/src/components/FireflyMascot.tsx',
    ];
    for (const source of visualSources) {
      expect(read(source)).not.toMatch(/PixelRatio|PerformanceTier|DeviceUtils/);
    }
  });
});
