import { useNavigation } from '@react-navigation/native';
import {
  Box,
  GlobalHeader,
  HStack,
  SanctuaryButton,
  ScreenWrapper,
  Text,
  useTheme,
  VStack,
} from '@repo/ui';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Bookmark, Download, ExternalLink, XCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';

interface PDFViewerScreenProps {
  route: {
    params: {
      resourceId: string;
      title: string;
      url: string;
      creator?: string;
    };
  };
  navigation: any;
}

type DownloadState = 'idle' | 'downloading' | 'ready' | 'error';

/**
 * PDFViewerScreen - Handles local caching and native handoff for PDF resources.
 *
 * Sanctuary V3: Migrated to className utilities and phase tokens.
 * Minimalist design focusing on the action of opening the document.
 */
export default function PDFViewerScreen({ route }: PDFViewerScreenProps) {
  const { title, url } = route.params;
  const navigation = useNavigation();
  const theme = useTheme();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState(0);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileName = `gurudevi_${route.params.resourceId}.pdf`;
  const localPath =
    ((FileSystem as any).cacheDirectory ?? (FileSystem as any).documentDirectory) + fileName;

  const checkCached = useCallback(async () => {
    try {
      const info = await FileSystem.getInfoAsync(localPath);
      if (info.exists) {
        setLocalUri(localPath);
        setDownloadState('ready');
      }
    } catch {
      // not cached - that's fine
    }
  }, [localPath]);

  useEffect(() => {
    checkCached();
  }, [checkCached]);

  const startDownload = useCallback(async () => {
    if (!url) {
      setErrorMsg('No URL provided for this document.');
      setDownloadState('error');
      return;
    }
    setDownloadState('downloading');
    setProgress(0);
    setErrorMsg(null);
    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        localPath,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (totalBytesExpectedToWrite > 0) {
            setProgress(totalBytesWritten / totalBytesExpectedToWrite);
          }
        },
      );
      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        setLocalUri(result.uri);
        setDownloadState('ready');
      } else {
        throw new Error('Download returned no URI');
      }
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Download failed');
      setDownloadState('error');
    }
  }, [url, localPath]);

  const openNative = useCallback(
    async (uri?: string) => {
      const target = uri ?? localUri;
      if (!target) return;
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(target, { mimeType: 'application/pdf' });
      }
    },
    [localUri],
  );

  return (
    <ScreenWrapper scroll={false} className="bg-phase-surface">
      <GlobalHeader
        title={title}
        subtitle="Institutional Document"
        showBack
        onBack={() => (navigation as any).goBack()}
        rightAction={
          <Box className={`rounded-full ${isBookmarked ? 'bg-phase-accent/20' : ''}`}>
            <SanctuaryButton
              variant="ghost"
              size="sm"
              leftIcon={Bookmark}
              onPress={() => setIsBookmarked((b) => !b)}
              accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
              className={isBookmarked ? 'opacity-100' : 'opacity-60'}
            >
              {''}
            </SanctuaryButton>
          </Box>
        }
      />

      <VStack className="flex-1 items-center justify-center p-8">
        {/* Icon area */}
        <Box className="w-32 h-32 rounded-3xl bg-phase-accent/10 items-center justify-center mb-8 border border-phase-accent/20">
          <Download size={48} color={theme.accent.action} />
        </Box>

        <Text className="text-2xl font-bold text-phaseText-primary text-center mb-2">{title}</Text>
        <Text className="text-md text-phaseText-secondary text-center mb-10 leading-6">
          Open this document in your device's native PDF viewer for the best reading experience.
        </Text>

        {/* Progress bar - shown while downloading */}
        {downloadState === 'downloading' && (
          <Box className="w-full mb-8">
            <Box className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <Box
                className="h-full rounded-full bg-phase-accent"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </Box>
            <Text className="text-xs text-phaseText-tertiary text-center mt-2 font-mono">
              {Math.round(progress * 100)}%
            </Text>
          </Box>
        )}

        {errorMsg && (
          <HStack className="items-center gap-2 mb-6 p-4 bg-phase-danger/10 rounded-2xl border border-phase-danger/20">
            <XCircle size={16} color={theme.scene.danger.main} />
            <Text className="text-sm text-phase-danger font-medium">{errorMsg}</Text>
          </HStack>
        )}

        {/* Action buttons */}
        {downloadState === 'idle' || downloadState === 'error' ? (
          <SanctuaryButton
            onPress={startDownload}
            leftIcon={Download}
            accessibilityLabel="Download and open PDF"
            className="px-10"
          >
            Download Document
          </SanctuaryButton>
        ) : downloadState === 'ready' ? (
          <VStack className="w-full gap-4">
            <SanctuaryButton
              onPress={() => openNative()}
              leftIcon={ExternalLink}
              accessibilityLabel="Open in native viewer"
              fullWidth
            >
              Open in Viewer
            </SanctuaryButton>
            <SanctuaryButton
              variant="outline"
              onPress={startDownload}
              leftIcon={Download}
              accessibilityLabel="Re-download PDF"
              fullWidth
            >
              Refetch Document
            </SanctuaryButton>
          </VStack>
        ) : null}
      </VStack>
    </ScreenWrapper>
  );
}
