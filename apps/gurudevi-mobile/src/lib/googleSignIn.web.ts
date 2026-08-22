/**
 * Google One-Tap Sign-In — Web Stub
 *
 * Web apps use the browser OAuth flow (via AuthScreen's `onGoogle` prop) rather
 * than the native One-Tap / Credential Manager SDK. This stub preserves the
 * shared export surface so the mobile AuthScreen wrapper can import uniformly.
 */

export interface NativeGoogleResult {
  idToken: string;
  accessToken: string | null;
}

export function configureGoogleOneTap(): boolean {
  console.warn(
    '[GoogleSignIn] Native One-Tap is not available on the web platform; routing to browser OAuth flow.',
  );
  return false;
}

export function signInWithGoogleNative(): Promise<NativeGoogleResult> {
  console.error(
    '[GoogleSignIn] signInWithGoogleNative called on Web; route to the browser OAuth flow instead.',
  );
  return Promise.reject(new Error('Google One-Tap is not available on the web platform'));
}

export default { configureGoogleOneTap, signInWithGoogleNative };
