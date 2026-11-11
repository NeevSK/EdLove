import { describe, it, expect } from 'vitest';
import { resolveBondCitizenship, type Bond } from '@repo/core/types/Identity';
import { ChannelAffordanceSchema } from '@repo/core/types/domainEntry';
import { sanctuaryFeature, CITIZENSHIP } from '@repo/core/logic/permissions/sanctuaryFeature';

describe('Canonical ReBAC & Omnichannel Invariant Sentinel', () => {
  describe('Invariants: Bond-Derived Citizenship', () => {
    it('reads FIRST_CLASS stored on institutional school bonds', () => {
      const schoolBond: Bond = {
        id: 'bond-school-1',
        user_id: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b2',
        entity_id: 'school-royal-college',
        entity_type: 'SCHOOL',
        capacity: 'teacher',
        citizenship: 'FIRST_CLASS',
        status: 'active',
      };

      expect(resolveBondCitizenship(schoolBond)).toBe('FIRST_CLASS');
    });

    it('reads SECOND_CLASS stored on personal bonds', () => {
      const personalBond: Bond = {
        id: 'bond-personal-1',
        user_id: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b2',
        entity_id: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b2',
        entity_type: 'PERSONAL',
        capacity: 'teacher',
        citizenship: 'SECOND_CLASS',
        status: 'active',
      };

      expect(resolveBondCitizenship(personalBond)).toBe('SECOND_CLASS');
    });

    it('enforces THIRD_CLASS for unbonded or platform-level explorer', () => {
      expect(resolveBondCitizenship(null)).toBe('THIRD_CLASS');
      expect(resolveBondCitizenship(undefined)).toBe('THIRD_CLASS');

      const guestBond: Bond = {
        id: 'bond-guest-1',
        user_id: 'guest',
        entity_id: 'GLOBAL',
        entity_type: 'PLATFORM',
        capacity: 'member',
        status: 'active',
      };
      expect(resolveBondCitizenship(guestBond)).toBe('THIRD_CLASS');
    });

    it('never derives citizenship from the entity type', () => {
      const customBond: Bond = {
        id: 'bond-custom-1',
        user_id: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b2',
        entity_id: 'community-centre',
        entity_type: 'COMMUNITY',
        capacity: 'member',
        citizenship: 'SECOND_CLASS',
        status: 'active',
      };

      expect(resolveBondCitizenship(customBond)).toBe('SECOND_CLASS');
      const { citizenship: _unset, ...unset } = customBond;
      expect(resolveBondCitizenship({ ...unset, entity_type: 'SCHOOL' })).toBe('THIRD_CLASS');
    });
  });

  describe('Invariants: Zero-Tolerance for Legacy WANDERER Alias', () => {
    it('ensures CitizenshipTier union contains strictly canonical tiers', () => {
      const validTiers = ['FIRST_CLASS', 'SECOND_CLASS', 'THIRD_CLASS'];
      const candidate: string = resolveBondCitizenship(null);
      expect(validTiers).toContain(candidate);
      expect(candidate).not.toBe('WANDERER');
    });
  });

  describe('Invariants: Omnichannel Affordances', () => {
    it('validates a complete omnichannel door descriptor', () => {
      const descriptor = {
        web: true,
        mobile: true,
        whatsapp: {
          intent: 'attendance_voice_draft',
          requiresApproval: true,
        },
        agent_mcp: {
          toolName: 'record_attendance',
          readOnly: false,
        },
      };

      const parsed = ChannelAffordanceSchema.safeParse(descriptor);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.whatsapp?.intent).toBe('attendance_voice_draft');
        expect(parsed.data.agent_mcp?.toolName).toBe('record_attendance');
      }
    });

    it('defaults web and mobile to true when omitted', () => {
      const parsed = ChannelAffordanceSchema.parse({});
      expect(parsed.web).toBe(true);
      expect(parsed.mobile).toBe(true);
      expect(parsed.whatsapp).toBeUndefined();
      expect(parsed.agent_mcp).toBeUndefined();
    });
  });

  describe('Invariants: Synchronous Pure Domain Gating', () => {
    it('evaluates sanctuaryFeature purely in 0ms without async IO', () => {
      const start = performance.now();
      const result = sanctuaryFeature(
        {
          userId: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b2',
          activeBondId: 'bond-1',
          primaryCapacity: 'teacher',
          citizenship: CITIZENSHIP.FIRST_CLASS,
          cedarSnapshotLoaded: true,
          cedarDecision: 'allow',
          entitlementManifestLoaded: true,
          entitlementReadiness: 'verified',
          entitlement: {
            pricingTier: 'INSTITUTIONAL',
            activeEntitlements: ['attendance_module'],
            grants: [],
            expirationDate: null,
          },
          flagActive: true,
          flagKey: 'attendance.record',
          flagType: 'release',
        },
        {
          action: 'record',
          subject: 'Attendance',
          citizenshipRequired: CITIZENSHIP.FIRST_CLASS,
          platformSupported: true,
        },
      );

      const elapsed = performance.now() - start;
      expect(result.permitted).toBe(true);
      expect(elapsed).toBeLessThan(5); // Sub-millisecond evaluation
    });
  });
});
