import QRCodeGenerator from './QRCodeGenerator';
import { Check, Copy, Download, Share2 } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticSelection, hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useRef, useState } from 'react';
import type { View } from 'react-native';

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

const loadViewShot = async (): Promise<any> => optionalImport('react-native-view-shot');
const loadSharing = () => optionalImport<any>('expo-sharing');
const loadClipboard = () => optionalImport<any>('expo-clipboard');
const loadMediaLibrary = () => optionalImport<any>('expo-media-library');

export interface SanctuaryQRCardProps {
  /** Canonical QR URL (e.g. https://gurudevi.app/qr?v=1&action=...) */
  value: string;
  /** Primary entity title (e.g. School name, Class name, Group name) */
  title: string;
  /** Optional subtitle or descriptive hint */
  subtitle?: string;
  /** Alphanumeric code text to display prominently (e.g. SANCT-TCH-2026-X89) */
  code?: string;
  /** QR code size in pixels (default: 200) */
  size?: number;
  /** Human-readable label for accessibility / share title */
  label?: string;
  /** Accent brand color (default: Sanctuary Saffron #a85022) */
  accentColor?: string;
  /** Background color for the card surface (default: #ffffff) */
  backgroundColor?: string;
  /** Callback on successful copy */
  onCopied?: () => void;
  /** Callback on successful share */
  onShared?: () => void;
  /** Callback on successful photo save */
  onSaved?: () => void;
}

/**
 * SanctuaryQRCard — Production-grade QR Display & Export Component.
 *
 * Provides:
 * - Crisp vector QR code rendering with the canonical Gurudevi Lotus emblem
 * - 1-Click native OS Share Sheet (exports high-res PNG flyer)
 * - 1-Click Save to Camera Roll (with permission check)
 * - 1-Click Copy Link / Monospace Code (with haptic feedback)
 */
export function SanctuaryQRCard({
  value,
  title,
  subtitle,
  code,
  size = 200,
  label,
  accentColor = '#a85022',
  backgroundColor = '#ffffff',
  onCopied,
  onShared,
  onSaved,
}: SanctuaryQRCardProps) {
  const viewRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [shareState, setShareState] = useState<'idle' | 'sharing'>('idle');

  const shareTitle = label || title;

  const handleShareImage = async () => {
    if (shareState === 'sharing') return;
    setShareState('sharing');
    hapticSelection();

    try {
      const viewShot = await loadViewShot();
      const Sharing = await loadSharing();

      if (!viewShot || !Sharing || !viewRef.current) {
        // Fallback: copy link if viewShot/sharing is unavailable
        await handleCopyLink();
        setShareState('idle');
        return;
      }

      const uri = await viewShot.captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Share ${shareTitle} QR`,
        });
        hapticSuccess();
        onShared?.();
      }
    } catch (err) {
      console.warn('[SanctuaryQRCard] Share image failed:', err);
    } finally {
      setShareState('idle');
    }
  };

  const handleCopyLink = async () => {
    hapticSelection();
    try {
      const Clipboard = await loadClipboard();
      const textToCopy = code || value;

      if (Clipboard) {
        await Clipboard.setStringAsync(textToCopy);
      }

      setCopyState('copied');
      hapticSuccess();
      onCopied?.();

      setTimeout(() => {
        setCopyState('idle');
      }, 2000);
    } catch (err) {
      console.warn('[SanctuaryQRCard] Copy link failed:', err);
    }
  };

  const handleSaveToGallery = async () => {
    if (saveState === 'saving') return;
    setSaveState('saving');
    hapticSelection();

    try {
      const viewShot = await loadViewShot();
      const MediaLibrary = await loadMediaLibrary();

      if (!viewShot || !MediaLibrary || !viewRef.current) {
        setSaveState('idle');
        return;
      }

      const uri = await viewShot.captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        setSaveState('saved');
        hapticSuccess();
        onSaved?.();

        setTimeout(() => {
          setSaveState('idle');
        }, 2500);
      } else {
        setSaveState('idle');
      }
    } catch (err) {
      console.warn('[SanctuaryQRCard] Save to gallery failed:', err);
      setSaveState('idle');
    }
  };

  return (
    <VStack className="w-full items-center p-6 rounded-[36px] bg-phase-surface border border-phase-border shadow-xl">
      {/* Header Info */}
      <VStack className="items-center gap-1 mb-6 px-4">
        <Text className="text-xl font-black text-center text-phaseText-primary tracking-tight">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-center text-phaseText-secondary font-medium leading-relaxed">
            {subtitle}
          </Text>
        )}
      </VStack>

      {/* Captured Export Container (What gets shared / saved as PNG) */}
      <Box
        ref={viewRef}
        collapsable={false}
        className="p-6 rounded-[28px] items-center justify-center border border-phase-border/40 shadow-sm"
        style={{ backgroundColor }}
      >
        <QRCodeGenerator
          value={value}
          size={size}
          errorCorrectionLevel="M"
          label={label || title}
          color="#131e27"
          backgroundColor={backgroundColor}
          showLotus={true}
        />
        {code && (
          <Box className="mt-3 px-4 py-1.5 rounded-full bg-phase-interactive/10 border border-phase-interactive/20">
            <Text className="text-xs font-mono font-black text-phase-interactive tracking-widest text-center">
              {code}
            </Text>
          </Box>
        )}
      </Box>

      {/* Monospace Code Pill (If Alphanumeric Code is present) */}
      {code && (
        <Pressable
          onPress={handleCopyLink}
          className="mt-5 px-6 py-2.5 rounded-2xl bg-phase-interactive/5 border border-phase-interactive/25 flex-row items-center gap-2"
          accessibilityRole="button"
          accessibilityLabel={`Copy code ${code}`}
        >
          <Text className="text-lg font-mono font-black text-phase-interactive tracking-[3px]">
            {code}
          </Text>
          <Icon as={copyState === 'copied' ? Check : Copy} size={16} className="text-phase-interactive" />
        </Pressable>
      )}

      {/* Action Buttons Row */}
      <HStack className="w-full gap-2.5 mt-6">
        {/* Share Button */}
        <Pressable
          onPress={handleShareImage}
          className="flex-1 min-h-[46px] rounded-2xl bg-phase-interactive items-center justify-center flex-row gap-2 shadow-sm"
          accessibilityRole="button"
          accessibilityLabel="Share QR Code flyer"
        >
          <Icon as={Share2} size={16} className="text-white" />
          <Text className="text-xs font-black text-white uppercase tracking-wider">
            {shareState === 'sharing' ? 'Sharing...' : 'Share'}
          </Text>
        </Pressable>

        {/* Save to Photos Button */}
        <Pressable
          onPress={handleSaveToGallery}
          className="flex-1 min-h-[46px] rounded-2xl bg-phase-canvas border border-phase-border items-center justify-center flex-row gap-2"
          accessibilityRole="button"
          accessibilityLabel="Save QR badge to photo gallery"
        >
          <Icon as={saveState === 'saved' ? Check : Download} size={16} className="text-phaseText-primary" />
          <Text className="text-xs font-black text-phaseText-primary uppercase tracking-wider">
            {saveState === 'saved' ? 'Saved!' : saveState === 'saving' ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>

        {/* Copy Link Button */}
        <Pressable
          onPress={handleCopyLink}
          className="flex-1 min-h-[46px] rounded-2xl bg-phase-canvas border border-phase-border items-center justify-center flex-row gap-2"
          accessibilityRole="button"
          accessibilityLabel="Copy link to clipboard"
        >
          <Icon as={copyState === 'copied' ? Check : Copy} size={16} className="text-phaseText-primary" />
          <Text className="text-xs font-black text-phaseText-primary uppercase tracking-wider">
            {copyState === 'copied' ? 'Copied!' : 'Copy'}
          </Text>
        </Pressable>
      </HStack>
    </VStack>
  );
}

export default SanctuaryQRCard;
