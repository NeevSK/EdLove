/**
 * QRShareButton - QR code display + share controls.
 *
 * Wraps QRCodeGenerator and adds:
 * - Share Image: captures the QR as PNG via react-native-view-shot, then uses expo-sharing
 * - Copy Link: copies the QR URL to the clipboard via expo-clipboard
 *
 * Optional `shortUrl` prop: if provided, the copied/shared URL is the short URL
 * rather than the full gurudevi://qr?... scheme URL.
 */

import QRCodeGenerator from '@repo/ui/components/QRCodeGenerator';
import { View as PrimitiveView, Text } from '@repo/ui/primitives';
import { useRef } from 'react';
import { StyleSheet, TouchableOpacity, type View } from 'react-native';

const optionalImport = async <T = any>(moduleName: string): Promise<T | null> => {
  try {
    const importer = new Function('moduleName', 'return import(moduleName)') as (
      name: string,
    ) => Promise<T>;
    return await importer(moduleName);
  } catch {
    return null;
  }
};

// Lazy-load optional native integrations so unsupported environments do not crash.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadViewShot = async (): Promise<any> => {
  return optionalImport('react-native-view-shot');
};

const loadSharing = () => optionalImport<any>('expo-sharing');
const loadClipboard = () => optionalImport<any>('expo-clipboard');

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

  const handleShareImage = async () => {
    try {
      const viewShot = await loadViewShot();
      if (!viewShot) {
        console.warn('QRShareButton: react-native-view-shot not available');
        return;
      }

      const Sharing = await loadSharing();
      if (!Sharing) {
        console.warn('QRShareButton: expo-sharing not available');
        return;
      }
      if (!viewRef.current) return;

      const uri = await viewShot.captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });
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

  const handleCopyLink = async () => {
    try {
      const Clipboard = await loadClipboard();
      if (!Clipboard) {
        console.warn('QRShareButton: expo-clipboard not available');
        return;
      }
      await Clipboard.setStringAsync(shareUrl);
    } catch (err) {
      console.warn('QRShareButton: copy link failed', err);
    }
  };

  return (
    <PrimitiveView style={[styles.container, { backgroundColor }]}>
      <PrimitiveView
        ref={viewRef}
        collapsable={false}
        style={[styles.qrWrapper, { backgroundColor }]}
      >
        <QRCodeGenerator value={value} size={size} label={label} />
      </PrimitiveView>

      <PrimitiveView style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => {
            void handleShareImage();
          }}
          style={[styles.button, { borderColor: accentColor }]}
          accessibilityLabel="Share QR code as image"
        >
          <Text style={[styles.buttonText, { color: accentColor }]}>Share Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            void handleCopyLink();
          }}
          style={[styles.button, { borderColor: accentColor }]}
          accessibilityLabel="Copy QR link to clipboard"
        >
          <Text style={[styles.buttonText, { color: accentColor }]}>Copy Link</Text>
        </TouchableOpacity>
      </PrimitiveView>
    </PrimitiveView>
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
