import { Platform } from 'react-native';
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
  statusCodes,
} from 'react-native-nitro-google-signin';

export interface NativeGoogleResult {
  idToken: string;
  accessToken: string | null;
}

function resolveClientIds(): { webClientId: string; iosClientId?: string } {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error(
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set; native Google One-Tap is disabled.',
    );
  }
  const iosClientId =
    Platform.OS === 'ios'
      ? (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? webClientId)
      : undefined;
  return { webClientId, iosClientId };
}

export function configureGoogleOneTap(): void {
  if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
    console.warn(
      '[GoogleSignIn] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is not set; native Google One-Tap is disabled.',
    );
    return;
  }
  const { webClientId, iosClientId } = resolveClientIds();
  GoogleOneTapSignIn.configure({ webClientId, iosClientId });
}

export async function signInWithGoogleNative(): Promise<NativeGoogleResult> {
  const { webClientId, iosClientId } = resolveClientIds();
  GoogleOneTapSignIn.configure({ webClientId, iosClientId });

  try {
    await GoogleOneTapSignIn.checkPlayServices();
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.warn('[GoogleSignIn] Google Play Services is unavailable on this Android device.');
    }
    throw e;
  }

  let response = await GoogleOneTapSignIn.signIn();

  // No saved credential found, or the user dismissed the One-Tap prompt.
  // Fall back to the full account picker.
  if (isNoSavedCredentialFoundResponse(response) || isCancelledResponse(response)) {
    response = await GoogleOneTapSignIn.createAccount();
    if (isCancelledResponse(response)) {
      throw new Error('Google Sign-In was cancelled');
    }
  }

  if (!isSuccessResponse(response) || !response.data) {
    throw new Error('Google Sign-In failed');
  }

  // Refresh tokens (the initial response.idToken can be stale; getTokens
  // also yields the OAuth accessToken needed by some backends).
  const tokens = await GoogleOneTapSignIn.getTokens();
  return { idToken: tokens.idToken, accessToken: tokens.accessToken ?? null };
}

export default { configureGoogleOneTap, signInWithGoogleNative };
