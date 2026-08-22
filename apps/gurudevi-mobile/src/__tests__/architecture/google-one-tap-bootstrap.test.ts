import { beforeEach, describe, expect, it, vi } from 'vitest';

const configure = vi.fn();

vi.mock('react-native-nitro-google-signin', () => ({
  GoogleOneTapSignIn: { configure },
  isCancelledResponse: vi.fn(),
  isErrorWithCode: vi.fn(),
  isNoSavedCredentialFoundResponse: vi.fn(),
  isSuccessResponse: vi.fn(),
  statusCodes: {},
}));

describe('Google One-Tap startup configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    configure.mockClear();
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  });

  it('remains disabled without a public client ID and does not touch the native module', async () => {
    const { configureGoogleOneTap } = await import('@/lib/googleSignIn');

    expect(configureGoogleOneTap()).toBe(false);
    expect(configure).not.toHaveBeenCalled();
  });

  it('configures native One-Tap once after boot and remains safe for a later sign-in attempt', async () => {
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = 'web-client-id';
    const { configureGoogleOneTap } = await import('@/lib/googleSignIn');

    expect(configureGoogleOneTap()).toBe(true);
    expect(configureGoogleOneTap()).toBe(true);
    expect(configure).toHaveBeenCalledTimes(1);
    expect(configure).toHaveBeenCalledWith({
      webClientId: 'web-client-id',
      iosClientId: 'web-client-id',
    });
  });
});
