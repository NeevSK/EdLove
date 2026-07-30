import { describe, expect, it, vi } from 'vitest';
import type {
  AuthorizationDecision,
  AuthorizationRequest,
  EntitlementSnapshot,
  IAnalyticsPort,
  IAuthorizationPort,
  IEntitlementPort,
} from '../../index';
import { satisfiesEntitlementRequirement } from '../entitlement.port';

describe('Hexagonal Ports Interfaces Compilation & Contract Verification', () => {
  it('evaluates subscription tiers and add-on modules independently', () => {
    const snapshot: EntitlementSnapshot = {
      pricingTier: 'PRO',
      activeEntitlements: ['attendance_management'],
      expirationDate: null,
    };

    expect(
      satisfiesEntitlementRequirement(snapshot, {
        tierAtLeast: 'PRO',
        modulesAllOf: ['attendance_management'],
      }),
    ).toBe(true);
    expect(
      satisfiesEntitlementRequirement(snapshot, {
        tierAtLeast: 'INSTITUTIONAL',
      }),
    ).toBe(false);
  });

  it('keeps institutional grants scoped to the active bond', () => {
    const snapshot: EntitlementSnapshot = {
      pricingTier: 'FREE',
      activeEntitlements: [],
      expirationDate: null,
      grants: [
        {
          id: 'school-grant',
          scope: 'active_bond',
          scopeId: 'bond-school-1',
          tier: 'INSTITUTIONAL',
          modules: ['attendance_management'],
          expiresAt: null,
          status: 'ACTIVE',
        },
      ],
    };

    expect(
      satisfiesEntitlementRequirement(snapshot, {
        scope: 'active_bond',
        tierAtLeast: 'INSTITUTIONAL',
        modulesAllOf: ['attendance_management'],
      }),
    ).toBe(true);
    expect(
      satisfiesEntitlementRequirement(snapshot, {
        tierAtLeast: 'PRO',
        modulesAllOf: ['attendance_management'],
      }),
    ).toBe(false);
  });

  it('verifies IEntitlementPort contract behavior with mock implementation', async () => {
    const mockEntitlementPort: IEntitlementPort = {
      getEntitlements: vi.fn(async (userId: string): Promise<EntitlementSnapshot> => {
        return {
          pricingTier: 'PRO',
          activeEntitlements: ['ai_report_cards'],
          expirationDate: '2026-12-31T23:59:59Z',
        };
      }),
      syncPurchases: vi.fn(async (userId: string): Promise<EntitlementSnapshot> => {
        return {
          pricingTier: 'PRO',
          activeEntitlements: ['ai_report_cards'],
          expirationDate: '2026-12-31T23:59:59Z',
        };
      }),
      subscribeToEntitlementChanges: vi.fn(
        (userId: string, callback: (snapshot: EntitlementSnapshot) => void) => {
          callback({
            pricingTier: 'PRO',
            activeEntitlements: ['ai_report_cards'],
            expirationDate: '2026-12-31T23:59:59Z',
          });
          return () => {};
        },
      ),
    };

    const res = await mockEntitlementPort.getEntitlements('user-1');
    expect(res.pricingTier).toBe('PRO');
    expect(res.activeEntitlements).toContain('ai_report_cards');
    expect(mockEntitlementPort.getEntitlements).toHaveBeenCalledWith('user-1');
  });

  it('verifies IAuthorizationPort contract behavior with mock implementation', async () => {
    const mockAuthzPort: IAuthorizationPort = {
      isAuthorized: vi.fn(async (request: AuthorizationRequest): Promise<AuthorizationDecision> => {
        if (request.action === 'generate_report_card') {
          return { permitted: true, reason: 'CedarPolicySchoolTeacherRule' };
        }
        return { permitted: false, reason: 'DefaultDeny' };
      }),
      issueCapabilityToken: vi.fn(async () => ({
        tokenId: 'token-1',
        principalId: 'teacher-1',
        tenantId: 'school-1',
        operationContext: 'generate_report_card',
        deviceId: 'device-1',
        issuedAt: 0,
        expiresAt: 1,
        policyVersionHash: 'test-policy',
      })),
    };

    const request: AuthorizationRequest = {
      principalId: 'teacher-1',
      action: 'generate_report_card',
      resourceType: 'Classroom',
      resourceId: 'class-A',
    };

    const decision = await mockAuthzPort.isAuthorized(request);
    expect(decision.permitted).toBe(true);
    expect(decision.reason).toBe('CedarPolicySchoolTeacherRule');
  });

  it('verifies IAnalyticsPort contract behavior with mock implementation', () => {
    const mockAnalyticsPort: IAnalyticsPort = {
      identify: vi.fn((userId: string, properties?: Record<string, any>) => {}),
      capture: vi.fn((event: string, properties?: Record<string, any>) => {}),
      screen: vi.fn((screenName: string, properties?: Record<string, any>) => {}),
      reset: vi.fn(() => {}),
    };

    mockAnalyticsPort.identify('user-1', { role: 'teacher' });
    expect(mockAnalyticsPort.identify).toHaveBeenCalledWith('user-1', { role: 'teacher' });

    mockAnalyticsPort.capture('app_booted');
    expect(mockAnalyticsPort.capture).toHaveBeenCalledWith('app_booted');

    mockAnalyticsPort.screen('Home');
    expect(mockAnalyticsPort.screen).toHaveBeenCalledWith('Home');
  });
});
