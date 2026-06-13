import { describe, expect, it, vi } from 'vitest';
import type { UserContext } from '../../schemas/user.schema';
import type {
  IAnalyticsPort,
  IAuthorizationPort,
  IEntitlementPort,
  IFeatureFlagPort,
  AuthorizationRequest,
  AuthorizationDecision,
  EntitlementSnapshot,
} from '../../index';

describe('Hexagonal Ports Interfaces Compilation & Contract Verification', () => {
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
      subscribeToEntitlementChanges: vi.fn((userId: string, callback: (snapshot: EntitlementSnapshot) => void) => {
        callback({
          pricingTier: 'PRO',
          activeEntitlements: ['ai_report_cards'],
          expirationDate: '2026-12-31T23:59:59Z',
        });
        return () => {};
      }),
    };

    const res = await mockEntitlementPort.getEntitlements('user-1');
    expect(res.pricingTier).toBe('PRO');
    expect(res.activeEntitlements).toContain('ai_report_cards');
    expect(mockEntitlementPort.getEntitlements).toHaveBeenCalledWith('user-1');
  });

  it('verifies IFeatureFlagPort contract behavior with mock implementation', async () => {
    const mockFeatureFlagPort: IFeatureFlagPort = {
      getFlags: vi.fn(async (context: UserContext) => {
        return {
          isAIAssistantEnabled: true,
          modelName: 'claude-3-5-sonnet',
        };
      }),
      subscribeToFlagChanges: vi.fn((context: UserContext, callback: (flags: Record<string, boolean | string>) => void) => {
        callback({ isAIAssistantEnabled: true });
        return () => {};
      }),
      trackExposure: vi.fn((flagKey: string, value: boolean | string) => {}),
    };

    const dummyContext = {
      userId: 'user-1',
      isAnonymous: false,
    } as unknown as UserContext;

    const flags = await mockFeatureFlagPort.getFlags(dummyContext);
    expect(flags.isAIAssistantEnabled).toBe(true);
    expect(flags.modelName).toBe('claude-3-5-sonnet');
    
    mockFeatureFlagPort.trackExposure('isAIAssistantEnabled', true);
    expect(mockFeatureFlagPort.trackExposure).toHaveBeenCalledWith('isAIAssistantEnabled', true);
  });

  it('verifies IAuthorizationPort contract behavior with mock implementation', async () => {
    const mockAuthzPort: IAuthorizationPort = {
      isAuthorized: vi.fn(async (request: AuthorizationRequest): Promise<AuthorizationDecision> => {
        if (request.action === 'generate_report_card') {
          return { permitted: true, reason: 'CedarPolicySchoolTeacherRule' };
        }
        return { permitted: false, reason: 'DefaultDeny' };
      }),
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
