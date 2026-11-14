import { CITIZENSHIP, sanctuaryFeature } from '@repo/core/logic/permissions/sanctuaryFeature';
import type { SanctuaryEvaluationContext } from '@repo/core/logic/permissions/sanctuaryFeature';
import { describe, expect, it } from 'vitest';

const signedInWithoutSnapshot = {
  userId: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b2',
  isLocalOnly: false,
  citizenship: CITIZENSHIP.SECOND_CLASS,
  cedarDecision: 'no_decision',
  cedarSnapshotLoaded: false,
  flagActive: true,
} as unknown as SanctuaryEvaluationContext;
const guest = {
  ...signedInWithoutSnapshot,
  isLocalOnly: true,
  citizenship: CITIZENSHIP.THIRD_CLASS,
} as SanctuaryEvaluationContext;
const self = {
  action: 'read',
  subject: 'InnerPulse',
  citizenshipRequired: CITIZENSHIP.THIRD_CLASS,
};

describe('Self lets everyone in', () => {
  it.each([
    ['a signed-in person with no snapshot yet', signedInWithoutSnapshot],
    ['a guest', guest],
  ])('permits on-device Self work for %s', (_name, context) => {
    expect(sanctuaryFeature(context, self).permitted).toBe(true);
    expect(sanctuaryFeature(context, { ...self, action: 'create' }).permitted).toBe(true);
  });

  it('keeps a Cedar deny from blocking on-device Self work once access is loaded', () => {
    const ready = {
      ...signedInWithoutSnapshot,
      cedarDecision: 'deny',
    } as SanctuaryEvaluationContext;
    expect(sanctuaryFeature(ready, self).permitted).toBe(true);
  });

  it('still requires Cedar for anything outside Self', () => {
    for (const subject of ['Gradebook', 'Attendance', 'CommunityPost']) {
      const result = sanctuaryFeature(signedInWithoutSnapshot, {
        action: 'create',
        subject,
        citizenshipRequired: CITIZENSHIP.THIRD_CLASS,
      });
      expect(result.permitted).toBe(false);
    }
  });

  it('never lets someone with no identity through', () => {
    const nobody = { ...guest, userId: null } as unknown as SanctuaryEvaluationContext;
    expect(sanctuaryFeature(nobody, self).permitted).toBe(false);
  });
});
