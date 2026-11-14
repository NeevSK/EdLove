/* biome-ignore-all lint/suspicious/noExplicitAny: test mock */
export const createSupabaseMock = (): Record<string, unknown> => {
  const mockResponse = { data: null, error: null };
  const mockPromise = Promise.resolve(mockResponse);

  const chain: any = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    single: vi.fn(() => mockPromise),
    insert: vi.fn(() => mockPromise),
  };

  return {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => chain),
  };
};
