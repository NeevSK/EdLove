/* biome-ignore-all lint/suspicious/noExplicitAny: test mock */
export const createSupabaseMock = () => {
  const mockResponse = { data: null, error: null };
  const mockPromise = Promise.resolve(mockResponse);

  const chain: any = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(() => mockPromise),
    insert: jest.fn(() => mockPromise),
  };

  return {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithOtp: jest.fn(),
      verifyOtp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => chain),
  };
};
