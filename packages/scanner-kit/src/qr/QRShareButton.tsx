import { Box, HStack, Pressable, Text } from '@repo/ui/primitives';

import { useRef } from 'react';
import QRCodeGenerator from '@scanner-kit/QRCodeGenerator';

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
const loadMediaLibrary = () => optionalImport<any>('expo-media-library');

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
  const viewRef = useRef<any>(null);
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

  const handleSaveToGallery = async () => {
    try {
      const viewShot = await loadViewShot();
      if (!viewShot) {
        console.warn('QRShareButton: react-native-view-shot not available');
        return;
      }

      const MediaLibrary = await loadMediaLibrary();
      if (!MediaLibrary) {
        console.warn('QRShareButton: expo-media-library not available');
        return;
      }
      if (!viewRef.current) return;

      const uri = await viewShot.captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
      }
    } catch (err) {
      console.warn('QRShareButton: save to gallery failed', err);
    }
  };

  return (
    <Box className="items-center p-4 rounded-2xl" style={{ backgroundColor }}>
      <Box
        ref={viewRef}
        collapsable={false}
        className="p-3 rounded-xl mb-4"
        style={{ backgroundColor }}
      >
        <QRCodeGenerator value={value} size={size} label={label} />
      </Box>

      <HStack className="w-full gap-2">
        <Pressable
          onPress={handleShareImage}
          className="flex-1 border rounded-lg py-[10px] items-center"
          style={{ borderColor: accentColor }}
          accessibilityLabel="Share QR code as image"
        >
          <Text className="text-[12px] font-semibold" style={{ color: accentColor }}>
            Share
          </Text>
        </Pressable>

        <Pressable
          onPress={handleCopyLink}
          className="flex-1 border rounded-lg py-[10px] items-center"
          style={{ borderColor: accentColor }}
          accessibilityLabel="Copy QR link to clipboard"
        >
          <Text className="text-[12px] font-semibold" style={{ color: accentColor }}>
            Copy Link
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSaveToGallery}
          className="flex-1 border rounded-lg py-[10px] items-center"
          style={{ borderColor: accentColor }}
          accessibilityLabel="Save QR badge to photo gallery"
        >
          <Text className="text-[12px] font-semibold" style={{ color: accentColor }}>
            Save
          </Text>
        </Pressable>
      </HStack>
    </Box>
  );
}
