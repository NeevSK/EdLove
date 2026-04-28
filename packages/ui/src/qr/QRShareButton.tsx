/**
 * QRShareButton — QR code display + share controls
 *
 * Wraps QRCodeGenerator and adds:
 *   - "Share Image" → captures QR as PNG via react-native-view-shot → expo-sharing
 *   - "Copy Link"   → copies the QR URL to clipboard via expo-clipboard
 *
 * Optional `shortUrl` prop: if provided, the copied/shared URL is the short URL
 * rather than the full gurudevi://qr?... scheme URL.
 *
 * Used in: InviteManager, SchoolCreationScreen (success), IdentityCard.
 */

import { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCodeGenerator from '../components/QRCodeGenerator';

// Lazy-loaded to avoid hard native deps crashing in environments where
// they may not be linked (e.g. storybook, web preview).
// react-native-view-shot is an optional peer dependency.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadViewShot = async (): Promise<any> => {
  try {
    // @ts-expect-error — optional peer dependency; may not be installed
    return await import('react-native-view-shot');
  } catch {
    return null;
  }
};
const loadSharing = () => import('expo-sharing');
const loadClipboard = () => import('expo-clipboard');

interface QRShareButtonProps {
  /** Canonical gurudevi://qr?... URI produced by QRBuilder */
  value: string;
  /** Human-readable label shown below the QR code */
  label?: string;
  /** QR code size in pixels */
  size?: number;
  /** If provided, this URL is copied/shared instead of the scheme URI */
  shortUrl?: string;
  /** Background color for the QR + share block */
  backgroundColor?: string;
  /** Text color for buttons */
  accentColor?: string;
}

export default function QRShareButton({
  value,
  label,
  size = 200,
  shortUrl,
  backgroundColor = '#1a1a2e',
  accentColor = '#f5a623',
}: QRShareButtonProps) {
  const viewRef = useRef<View>(null);

  const shareUrl = shortUrl ?? value;

  // ── Share as image ────────────────────────────────────────────────────────────

  const handleShareImage = async () => {
    try {
      const viewShot = await loadViewShot();
      if (!viewShot) {
        console.warn('QRShareButton: react-native-view-shot not available');
        return;
      }
      const Sharing = await loadSharing();
      if (!viewRef.current) return;

      const uri = await viewShot.captureRef(viewRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: label ? `Share ${label} QR Code` : 'Share QR Code',
        });
      }
    } catch (err) {
      console.warn('QRShareButton: share image failed', err);
    }
  };

  // ── Copy link ─────────────────────────────────────────────────────────────────

  const handleCopyLink = async () => {
    try {
      const Clipboard = await loadClipboard();
      await Clipboard.setStringAsync(shareUrl);
    } catch (err) {
      console.warn('QRShareButton: copy link failed', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* QR code — captured by ViewShot */}
      <View ref={viewRef} collapsable={false} style={[styles.qrWrapper, { backgroundColor }]}>
        <QRCodeGenerator value={value} size={size} label={label} />
      </View>

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={handleShareImage}
          style={[styles.button, { borderColor: accentColor }]}
          accessibilityLabel="Share QR code as image"
        >
          <Text style={[styles.buttonText, { color: accentColor }]}>📤 Share Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCopyLink}
          style={[styles.button, { borderColor: accentColor }]}
          accessibilityLabel="Copy QR link to clipboard"
        >
          <Text style={[styles.buttonText, { color: accentColor }]}>🔗 Copy Link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
  },
  qrWrapper: {
    padding: 12,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
