import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  isConfirmedProfileFieldUpdate,
  type ProfileFieldUpdateResult,
} from '@repo/profile/hooks/profileFieldUpdateResult';
import { describe, expect, it } from 'vitest';

const profileScreen = readFileSync(resolve(import.meta.dirname, 'ProfileScreen.web.tsx'), 'utf8');

describe('profile web save recovery', () => {
  it('does not treat a queued or failed field update as a confirmed save', () => {
    const queued: ProfileFieldUpdateResult = {
      status: 'queued',
      error: 'Profile update is waiting to sync',
    };
    const failed: ProfileFieldUpdateResult = { status: 'failed', error: 'Profile update failed' };

    expect(isConfirmedProfileFieldUpdate({ status: 'confirmed' })).toBe(true);
    expect(isConfirmedProfileFieldUpdate(queued)).toBe(false);
    expect(isConfirmedProfileFieldUpdate(failed)).toBe(false);
  });

  it('reports previously persisted fields when a later field cannot save', () => {
    expect(profileScreen).toContain("if (isConfirmedProfileFieldUpdate(result))");
    expect(profileScreen).toContain("if (result.status === 'queued')");
    expect(profileScreen).toContain('setQueuedFields((current) => new Set(current).add(field));');
    expect(profileScreen).toContain('const savedFields: string[] = [];');
    expect(profileScreen).toContain("savedFields.push(field.replace('_', ' '));");
    expect(profileScreen).toContain('Try saving again to finish the remaining fields.');
    expect(profileScreen).toContain('is waiting to sync and has not been confirmed yet.');
    expect(profileScreen).toContain('!queuedFields.has(field)');
  });

  it('does not silently swallow clipboard failures', () => {
    expect(profileScreen).toContain(
      "console.error('[ProfileScreenWeb] could not copy profile link', copyFailure);",
    );
    expect(profileScreen).toContain(
      "setCopyError(t('profile.copyFailed', 'The profile link could not be copied.'));",
    );
  });

  it('surfaces avatar upload failures through the accessible profile error region', () => {
    expect(profileScreen).toContain("t('profile.avatarUploadFailed', 'Your profile photo could not be updated. Please try again.')");
    expect(profileScreen).toContain('{(error || saveError) && (');
    expect(profileScreen).toContain('role="alert"');
  });
});
