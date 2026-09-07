import React from 'react';
import { View, Text, TouchableOpacity, Linking, Modal, StyleSheet } from 'react-native';
import { useVersionGatingStore } from '@repo/core/lib/sync/versionGating';
import { BrandPulse } from '@repo/ui';

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
          <BrandPulse size={48} tintColor="#D4843A" />
          <Text style={styles.hardBlockTitle}>Critical Update Required</Text>
          <Text style={styles.hardBlockMessage}>
            Your installed version (v{currentInstalledVersion}) is no longer supported. To protect your data and security, you must update to at least v{minSupportedVersion} to continue.
          </Text>
          {releaseNotes ? (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{releaseNotes}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenStore} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Update Gurudevi</Text>
          </TouchableOpacity>
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
          <Text style={styles.softNudgeSubtitle}>A newer version of Gurudevi is ready for you.</Text>
        </View>
        <View style={styles.softNudgeActions}>
          <TouchableOpacity onPress={handleOpenStore} style={styles.updateActionBtn}>
            <Text style={styles.updateActionText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={dismissSoftNudge} style={styles.dismissActionBtn}>
            <Text style={styles.dismissActionText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  hardBlockContainer: {
    flex: 1,
    backgroundColor: '#20140E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  hardBlockTitle: {
    color: '#F5EDD6',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    textAlign: 'center',
  },
  hardBlockMessage: {
    color: '#D8C8B8',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
  },
  notesContainer: {
    backgroundColor: 'rgba(212, 132, 58, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(212, 132, 58, 0.2)',
  },
  notesText: {
    color: '#E8A76B',
    fontSize: 13,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#D4843A',
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
    color: '#20140E',
    fontSize: 16,
    fontWeight: '700',
  },
  softNudgeBanner: {
    backgroundColor: '#2B1B14',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#D4843A40',
  },
  softNudgeContent: {
    flex: 1,
    marginRight: 12,
  },
  softNudgeTitle: {
    color: '#F5EDD6',
    fontSize: 13,
    fontWeight: '700',
  },
  softNudgeSubtitle: {
    color: '#D8C8B8',
    fontSize: 11,
    marginTop: 2,
  },
  softNudgeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateActionBtn: {
    backgroundColor: '#D4843A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  updateActionText: {
    color: '#20140E',
    fontSize: 12,
    fontWeight: '700',
  },
  dismissActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dismissActionText: {
    color: '#A09080',
    fontSize: 12,
  },
});
