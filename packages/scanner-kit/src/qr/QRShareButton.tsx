import React, { useRef } from 'react';
import { 
  Box, 
  Text, 
  Pressable, 
  HStack, 
  VStack,
} from '@repo/ui';
import QRCodeGenerator from '../QRCodeGenerator';

// Lazy-loaded to avoid hard native deps crashing in environments where
// they may not be linked (e.g. storybook, web preview).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadViewShot = async (): Promise<any> => {
  try {
    // @ts-ignore — optional peer dependency; may not be installed
    return await import('react-native-view-shot');
  } catch {
    return null;
  }
};

// @ts-ignore
const loadSharing = () => import('expo-sharing');
// @ts-ignore
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
  const viewRef = useRef<any>(null);

  const shareUrl = shortUrl ?? value;

  // ── Share as image ────────────────────────────────────────────────────────

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

  // ── Copy link ─────────────────────────────────────────────────────────────

  const handleCopyLink = async () => {
    try {
      const Clipboard = await loadClipboard();
      await Clipboard.setStringAsync(shareUrl);
    } catch (err) {
      console.warn('QRShareButton: copy link failed', err);
    }
  };

  return (
    <Box 
      className="items-center p-4 rounded-2xl" 
      style={{ backgroundColor }}
    >
      {/* QR code — captured by ViewShot */}
      <Box 
        ref={viewRef} 
        collapsable={false} 
        className="p-3 rounded-xl mb-4"
        style={{ backgroundColor }}
      >
        <QRCodeGenerator value={value} size={size} label={label} />
      </Box>

      {/* Action buttons */}
      <HStack className="w-full gap-3">
        <Pressable
          onPress={handleShareImage}
          className="flex-1 border rounded-lg py-[10px] items-center"
          style={{ borderColor: accentColor }}
          accessibilityLabel="Share QR code as image"
        >
          <Text 
            className="text-[13px] font-semibold" 
            style={{ color: accentColor }}
          >
            📤 Share Image
          </Text>
        </Pressable>

        <Pressable
          onPress={handleCopyLink}
          className="flex-1 border rounded-lg py-[10px] items-center"
          style={{ borderColor: accentColor }}
          accessibilityLabel="Copy QR link to clipboard"
        >
          <Text 
            className="text-[13px] font-semibold" 
            style={{ color: accentColor }}
          >
            🔗 Copy Link
          </Text>
        </Pressable>
      </HStack>
    </Box>
  );
}
