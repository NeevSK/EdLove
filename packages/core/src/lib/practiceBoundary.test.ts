import { describe, expect, it } from 'vitest';
import {
  createAccountPracticeScope,
  deriveAccountPracticeKey,
  resolveAccountPracticeWriteDecision,
} from './practiceBoundary';
import { createPracticeController } from './practiceContract';
import {
  declaredPracticeCapability,
  resolvePracticeAvailability,
} from '../logic/registry/capabilityManifest';

describe('account practice boundary contracts (G0)', () => {
  it('isolates storage by account, feature, and practice workspace', () => {
    const first = createAccountPracticeScope({
      accountId: 'account-17',
      featureId: 'attendance',
      workspaceId: 'daily-roll-call',
    });
    const sameScope = createAccountPracticeScope({
      accountId: 'account-17',
      featureId: 'attendance',
      workspaceId: 'daily-roll-call',
    });
    const otherAccount = createAccountPracticeScope({
      accountId: 'account-18',
      featureId: 'attendance',
      workspaceId: 'daily-roll-call',
    });
    const otherFeature = createAccountPracticeScope({
      accountId: 'account-17',
      featureId: 'fire_journal',
      workspaceId: 'daily-roll-call',
    });
    const otherWorkspace = createAccountPracticeScope({
      accountId: 'account-17',
      featureId: 'attendance',
      workspaceId: 'another-roll-call',
    });
    const key = deriveAccountPracticeKey(first, 'marks-by-date');

    expect(first.identity.experience).toBe('sandbox');
    expect(deriveAccountPracticeKey(sameScope, 'marks-by-date')).toBe(key);
    expect(deriveAccountPracticeKey(otherAccount, 'marks-by-date')).not.toBe(key);
    expect(deriveAccountPracticeKey(otherFeature, 'marks-by-date')).not.toBe(key);
    expect(deriveAccountPracticeKey(otherWorkspace, 'marks-by-date')).not.toBe(key);
  });

  it('encodes key segments and rejects empty scope and record segments', () => {
    const scope = createAccountPracticeScope({
      accountId: 'account:17',
      featureId: 'attendance',
      workspaceId: 'daily roll call',
    });
    const key = deriveAccountPracticeKey(scope, 'marks:by-date');

    expect(key).toContain('account%3A17');
    expect(key).toContain('sandbox');
    expect(key).not.toContain('daily roll call');
    expect(() => createAccountPracticeScope({ accountId: 'a', featureId: ' ', workspaceId: 'w' })).toThrow(
      'Practice feature id must not be empty.',
    );
    expect(() => createAccountPracticeScope({ accountId: 'a', featureId: 'f', workspaceId: ' ' })).toThrow(
      'Practice workspace id must not be empty.',
    );
    expect(() => deriveAccountPracticeKey(scope, ' ')).toThrow('Practice key must not be empty.');
  });

  it('allows device-local writes and denies production writes', () => {
    const scope = createAccountPracticeScope({
      accountId: 'account-17',
      featureId: 'attendance',
      workspaceId: 'daily-roll-call',
    });

    expect(resolveAccountPracticeWriteDecision(scope, 'local')).toEqual({
      allowed: true,
      target: 'local',
    });
    expect(resolveAccountPracticeWriteDecision(scope, 'production')).toEqual({
      allowed: false,
      target: 'production',
      reason: 'sandbox-local-only',
    });
  });

  it('declares browser attendance practice as fictional, local-only, discard-only', () => {
    expect(declaredPracticeCapability('attendance', 'browser')).toEqual({
      platforms: ['browser'],
      fixture: 'fictional',
      effects: 'local-only',
      reset: 'feature-workspace',
      keep: 'disabled',
      capacities: [
        'teacher',
        'gradeHead',
        'sectionHead',
        'principal',
        'assistantPrincipal',
        'admin',
      ],
    });
    expect(declaredPracticeCapability('attendance', 'native')).toBeNull();
  });

  it('keeps the Safe Try affordance within the declared capacity and scope', () => {
    expect(
      resolvePracticeAvailability({
        featureId: 'attendance',
        platform: 'browser',
        capacity: 'teacher',
        hasSelectedScope: true,
      }),
    ).toEqual({ available: true });
    expect(
      resolvePracticeAvailability({
        featureId: 'attendance',
        platform: 'browser',
        capacity: 'student',
        hasSelectedScope: true,
      }),
    ).toEqual({ available: false, reason: 'capacity-unsupported' });
    expect(
      resolvePracticeAvailability({
        featureId: 'attendance',
        platform: 'browser',
        capacity: 'teacher',
        hasSelectedScope: false,
      }),
    ).toEqual({ available: false, reason: 'scope-required' });
  });

  it('controls the shared adapter lifecycle and blocks work after discard', async () => {
    const scope = createAccountPracticeScope({
      accountId: 'account-17',
      featureId: 'attendance',
      workspaceId: 'daily-roll-call',
    });
    const calls: string[] = [];
    const controller = createPracticeController({
      scope,
      adapter: {
        load: () => ({ value: 'fixture' }),
        save: () => {
          calls.push('save');
        },
        reset: () => {
          calls.push('reset');
        },
        discard: () => {
          calls.push('discard');
        },
      },
    });

    expect(controller.load()).toEqual({ value: 'fixture' });
    await controller.save({ value: 'changed' });
    await controller.reset();
    await controller.discard();
    expect(calls).toEqual(['save', 'reset', 'discard']);
    expect(() => controller.load()).toThrow('workspace has ended');
    expect(() => controller.save({ value: 'after-discard' })).toThrow('workspace has ended');
  });
});
