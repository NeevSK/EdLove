import { cleanup, render } from '@testing-library/react-native';
import { createElement } from 'react';

const mockFixture = {
  subject: 'supabase-subject-a',
  resolvedSubject: 'supabase-subject-a',
  account: '01234567-89ab-8101-8000-010203040506',
  entitlementQuery: jest.fn(() => ({ error: null, isLoading: false, refetch: jest.fn() })),
};
jest.mock('@repo/core/providers/AuthProvider', () => ({
  useAuth: () => ({
    loading: false,
    identityAvailability: 'active',
    resolvedAuthSubjectId: mockFixture.resolvedSubject,
    session: { user: { id: mockFixture.subject, is_anonymous: false } },
  }),
}));
jest.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: (select: (state: { user: { id: string } }) => unknown) =>
    select({ user: { id: mockFixture.account } }),
}));
jest.mock('@repo/core/store/scopeSession', () => ({
  useScopeSessionStore: (select: (state: { snapshot: { activeBond: null } | null }) => unknown) =>
    select({ snapshot: null }),
}));
jest.mock('@repo/core/hooks/useEntitlementQuery', () => ({
  useEntitlementQuery: mockFixture.entitlementQuery,
}));

import { CapabilityHydrationProvider } from '@repo/core/providers/CapabilityHydrationProvider';

describe('canonical account capability hydration', () => {
  beforeEach(() => {
    mockFixture.subject = mockFixture.resolvedSubject = 'supabase-subject-a';
    mockFixture.entitlementQuery.mockClear();
  });
  afterEach(cleanup);

  it('hydrates the canonical account when the resolved credential subject matches', async () => {
    await render(createElement(CapabilityHydrationProvider, { children: null }));
    expect(mockFixture.entitlementQuery).toHaveBeenCalledWith(mockFixture.account, {
      activeBondId: null,
      activeEntityId: null,
      activeEntityType: null,
    }, true);
    expect(mockFixture.account).not.toBe(mockFixture.subject);
  });

  it('does not hydrate an account resolved for an outgoing credential session', async () => {
    mockFixture.subject = 'supabase-subject-b';
    await render(createElement(CapabilityHydrationProvider, { children: null }));
    expect(mockFixture.entitlementQuery).toHaveBeenCalledWith(mockFixture.account, {
      activeBondId: null,
      activeEntityId: null,
      activeEntityType: null,
    }, false);
  });
});
