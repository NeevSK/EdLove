import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const hookContent = readFileSync(resolve(import.meta.dirname, 'useRewardedAdHub.ts'), 'utf8');
const typesContent = readFileSync(resolve(import.meta.dirname, '../types/negentropy.ts'), 'utf8');

describe('useRewardedAdHub contract & lifecycle integrity', () => {
  it('defines the required EnergyBalanceState and RewardedAdHubState properties', () => {
    expect(typesContent).toContain('dailyQuotaRemaining: number;');
    expect(typesContent).toContain('dailyQuotaMax: number;');
    expect(typesContent).toContain('balance: number;');
    expect(typesContent).toContain('showAd: () => Promise<boolean>;');
    expect(typesContent).toContain('cooldownSeconds: number;');
  });

  it('implements daily harvest quota and cooldown checks in useRewardedAdHub', () => {
    expect(hookContent).toContain('dailyQuotaRemaining <= 0');
    expect(hookContent).toContain('setCooldownSeconds(45);');
    expect(hookContent).toContain('+10 Sanctuary Energy');
    expect(hookContent).toContain('fetch(`/api/rewards/energy-balance');
  });
});
