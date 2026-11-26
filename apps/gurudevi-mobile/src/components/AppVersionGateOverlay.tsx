import { useVersionGatingStore } from '@repo/core/lib/sync/versionGating.store';
import { Button, Surface, Text } from '@repo/ui/components/native';
import { useWorld } from '@repo/ui/theme/native';
import { Linking, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * AppVersionGateOverlay, worn by the world.
 *
 * 1. HARD_BLOCK: a full-screen page that cannot be dismissed (update required).
 * 2. SOFT_NUDGE: a quiet card under the status bar (an update is recommended).
 */
export function AppVersionGateOverlay() {
  const t = useWorld().tokens;
  const insets = useSafeAreaInsets();
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

  if (isBlocked || status === 'HARD_BLOCK') {
    return (
      <Modal
        visible
        transparent={false}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => undefined}
      >
        <ScrollView
          style={{ backgroundColor: t.ground }}
          contentContainerStyle={[
            styles.block,
            { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
          ]}
        >
          <Surface tone="raised" style={styles.card}>
            <Text kind="title" align="center" role="heading">
              Update Gurudevi to continue
            </Text>
            <Text kind="body" tone="soft" align="center">
              This version (v{currentInstalledVersion}) is no longer supported. To keep your data
              safe, please update to v{minSupportedVersion} or newer.
            </Text>
            {releaseNotes ? (
              <View style={[styles.notes, { backgroundColor: t.sunken }]}>
                <Text kind="caption">{releaseNotes}</Text>
              </View>
            ) : null}
            <Button label="Update Gurudevi" variant="primary" fullWidth onPress={handleOpenStore} />
          </Surface>
        </ScrollView>
      </Modal>
    );
  }

  if (status === 'SOFT_NUDGE' && !hasDismissedSoftNudge) {
    return (
      <View pointerEvents="box-none" style={[styles.nudgeWrap, { top: insets.top + 8 }]}>
        <Surface tone="raised" style={styles.nudge} accessibilityLiveRegion="polite">
          <View style={styles.nudgeText}>
            <Text kind="label">Update available</Text>
            <Text kind="caption" tone="soft">
              A newer version of Gurudevi is ready for you.
            </Text>
          </View>
          <Button label="Later" variant="quiet" size="sm" onPress={dismissSoftNudge} />
          <Button label="Update" variant="primary" size="sm" onPress={handleOpenStore} />
        </Surface>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  block: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: 16, padding: 24 },
  notes: { padding: 12, borderRadius: 10 },
  nudgeWrap: { position: 'absolute', left: 12, right: 12, zIndex: 100, alignItems: 'center' },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 520,
    padding: 12,
  },
  nudgeText: { flex: 1, minWidth: 0, gap: 2 },
});
