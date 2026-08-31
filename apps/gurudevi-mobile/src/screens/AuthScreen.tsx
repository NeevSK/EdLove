import { ScannerModal } from '@repo/scanner-kit';
import UIAuthScreen from '@repo/ui/screens/AuthScreen';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';
import { signInWithGoogleNative } from '@/lib/googleSignIn';

/**
 * High-End "Assembled" Screen
 *
 * Glues the shared UI AuthScreen to the Scanner package and injects the native
 * Google One-Tap sign-in credential provider so the shared AuthScreen can use
 * native Google sign-in (Credential Manager on Android, Google Sign-In SDK on
 * iOS). On the web this wrapper is never imported; the web app uses UIAuthScreen
 * directly without `onGoogleNative` and keeps the browser OAuth flow.
 *
 * By assembling it here, we keep the packages clean and avoid circular dependencies.
 */
type AuthScreenProps = Omit<ComponentProps<typeof UIAuthScreen>, 'Scanner' | 'onGoogleNative'> & {
  onContinueAsGuest?: () => void | Promise<void>;
};

export default function AuthScreen(props: AuthScreenProps) {
  // Native only. On the off chance this wrapper is imported on web, fall back
  // to the browser OAuth flow by omitting the native provider.
  const onGoogleNative = Platform.OS === 'web' ? undefined : () => signInWithGoogleNative();

  return <UIAuthScreen {...props} Scanner={ScannerModal} onGoogleNative={onGoogleNative} />;
}
