import { decodeInstallReferrer, pendingIntentStore } from '@repo/core/logic';
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';

/**
 * Native Cold-Start Deferred Install Referrer Bridge
 *
 * Runs once during first cold start to capture deferred install intents:
 * - On Android: Native Google Play Install Referrer ($0 on-device client API)
 * - On iOS: Safe first-launch clipboard inspection fallback
 *
 * Stashes valid intents in pendingIntentStore so SessionRouteGate can route
 * seamlessly once the user authenticates or onboards.
 */
export async function resolveDeferredInstallIntent(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  // If there is already an active pending intent from +native-intent.tsx, don't overwrite
  if (pendingIntentStore.getState().isPendingIntentActive()) {
    return false;
  }

  try {
    if (Platform.OS === 'android') {
      const rawReferrer = await Application.getInstallReferrerAsync();
      if (!rawReferrer) return false;

      const validated = decodeInstallReferrer(rawReferrer);
      if (validated?.inviteCode) {
        const inviteCode = validated.inviteCode;
        pendingIntentStore.getState().setPendingIntent({
          targetPath: `/community?inviteCode=${encodeURIComponent(inviteCode)}`,
          intentKind: 'classroomInvite',
          params: { inviteCode },
        });
        return true;
      }
    } else if (Platform.OS === 'ios') {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) return false;

      const text = (await Clipboard.getStringAsync())?.trim();
      if (!text) return false;

      // Match vanity link or custom scheme copied from web landing
      const match = text.match(/(?:gurudevi\.app\/c\/|gurudevi:invite:)([A-Za-z0-9_-]{4,32})/i);
      if (match?.[1]) {
        const inviteCode = match[1];
        pendingIntentStore.getState().setPendingIntent({
          targetPath: `/community?inviteCode=${encodeURIComponent(inviteCode)}`,
          intentKind: 'classroomInvite',
          params: { inviteCode },
        });
        // Consume clipboard so it is never re-read
        await Clipboard.setStringAsync('');
        return true;
      }
    }
  } catch (error) {
    console.warn('[InstallReferrerBridge] Deferred check completed with error:', error);
  }

  return false;
}
