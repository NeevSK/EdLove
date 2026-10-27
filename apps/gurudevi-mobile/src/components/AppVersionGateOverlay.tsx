import { useVersionGatingStore } from '@repo/core/lib/sync/versionGating';
import { BrandPulse, tokens } from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';
import React from 'react';
import { Linking, Modal, StyleSheet, Text, View } from 'react-native';

/**
 * AppVersionGateOverlay
 *
 * Renders:
 * 1. An un-dismissible full-screen modal when `status === 'HARD_BLOCK'` (Force Update).
 * 2. A non-blocking banner at top of the screen when `status === 'SOFT_NUDGE'` (Recommended Update).
 */
export function AppVersionGateOverlay() {
  const isBlocked = useVersionGatingStore((state) => state.isBlocked);
  const status = useVersionGatingStore((state) => state.status);
  const updateUrl = useVersionGatingStore((state) => state.updateUrl);
  const minSupportedVersion = useVersionGatingStore((state) => state.minSupportedVersion);
  const currentInstalledVersion = useVersionGatingStore((state) => state.currentInstalledVersion);
  const releaseNotes = useVersionGatingStore((state) => state.releaseNotes);
  const hasDismissedSoftNudge = useVersionGatingStore((state) => state.hasDismissedSoftNudge);
  const dismissSoftNudge = useVersionGatingStore((state) => state.dismissSoftNudge);

  const handleOpenStore = () => {
    if (updateUrl) {
      void Linking.openURL(updateUrl).catch((err) => {
        console.warn('[VersionGate] Could not open store URL:', err);
      });
    }
  };

  // 1. HARD_BLOCK: Fullscreen un-dismissible blocking modal
  if (isBlocked || status === 'HARD_BLOCK') {
    return (
      <Modal visible={true} transparent={false} animationType="fade" statusBarTranslucent>
        <View style={styles.hardBlockContainer}>
          <BrandPulse size={48} tintColor={tokens.colors.primary} />
          <Text style={styles.hardBlockTitle}>Critical Update Required</Text>
          <Text style={styles.hardBlockMessage}>
            Your installed version (v{currentInstalledVersion}) is no longer supported. To protect
            your data and security, you must update to at least v{minSupportedVersion} to continue.
          </Text>
          {releaseNotes ? (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{releaseNotes}</Text>
            </View>
          ) : null}
          <Pressable
            style={styles.primaryButton}
            onPress={handleOpenStore}
            className="active:opacity-85"
          >
            <Text style={styles.primaryButtonText}>Update Gurudevi</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  // 2. SOFT_NUDGE: Non-blocking top notification banner
  if (status === 'SOFT_NUDGE' && !hasDismissedSoftNudge) {
    return (
      <View style={styles.softNudgeBanner}>
        <View style={styles.softNudgeContent}>
          <Text style={styles.softNudgeTitle}>Update Available</Text>
          <Text style={styles.softNudgeSubtitle}>
            A newer version of Gurudevi is ready for you.
          </Text>
        </View>
        <View style={styles.softNudgeActions}>
          <Pressable onPress={handleOpenStore} style={styles.updateActionBtn}>
            <Text style={styles.updateActionText}>Update</Text>
          </Pressable>
          <Pressable onPress={dismissSoftNudge} style={styles.dismissActionBtn}>
            <Text style={styles.dismissActionText}>Later</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  hardBlockContainer: {
    flex: 1,
    backgroundColor: tokens.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  hardBlockTitle: {
    color: tokens.colors.background,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    textAlign: 'center',
  },
  hardBlockMessage: {
    color: tokens.colors.toastTextMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
  },
  notesContainer: {
    backgroundColor: tokens.colors.primary + '1A',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    maxWidth: 320,
    borderWidth: 1,
    borderColor: tokens.colors.primary + '33',
  },
  notesText: {
    color: tokens.colors.loading,
    fontSize: 13,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: tokens.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 280,
  },
  primaryButtonText: {
    color: tokens.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  softNudgeBanner: {
    backgroundColor: tokens.colors.ink,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.primary + '40',
  },
  softNudgeContent: {
    flex: 1,
    marginRight: 12,
  },
  softNudgeTitle: {
    color: tokens.colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
  softNudgeSubtitle: {
    color: tokens.colors.toastTextMuted,
    fontSize: 11,
    marginTop: 2,
  },
  softNudgeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateActionBtn: {
    backgroundColor: tokens.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  updateActionText: {
    color: tokens.colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  dismissActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dismissActionText: {
    color: tokens.colors.textMuted,
    fontSize: 12,
  },
});
