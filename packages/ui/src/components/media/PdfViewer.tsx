import type { DownloadState } from '@repo/core/hooks';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { Bookmark, Download, ExternalLink } from '@repo/ui/icons';
import { Box, HStack, Text, VStack } from '@repo/ui/primitives';

export interface PdfViewerProps {
  title: string;
  subtitle?: string;
  downloadState: DownloadState;
  progress: number;
  errorMsg?: string | null;
  onDownload: () => void;
  onOpen: () => void;
  onBack: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

/**
 * PdfViewer - Foundational component for document rendering.
 * Encapsulates the "Download and View" workflow with Sanctuary V3 aesthetics.
 */
export function PdfViewer({
  title,
  subtitle = 'Institutional Document',
  downloadState,
  progress,
  errorMsg,
  onDownload,
  onOpen,
  onBack,
  isBookmarked,
  onToggleBookmark,
}: PdfViewerProps) {
  const theme = useTheme();

  return (
    <ScreenWrapper scroll={false} className="bg-phase-surface">
      <GlobalHeader
        title={title}
        subtitle={subtitle}
        showBack
        onBack={onBack}
        rightAction={
          onToggleBookmark && (
            <Box className={`rounded-full ${isBookmarked ? 'bg-phase-accent/20' : ''}`}>
              <SanctuaryButton
                variant="ghost"
                size="sm"
                leftIcon={Bookmark}
                onPress={onToggleBookmark}
                accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
                className={isBookmarked ? 'opacity-100' : 'opacity-60'}
              >
                {''}
              </SanctuaryButton>
            </Box>
          )
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
            <HStack className="items-center justify-center gap-2 mb-3">
              <BrandPulse
                size={22}
                tintColor={theme.accent.action}
                accessibilityLabel="Preparing document"
              />
              <Text className="text-xs text-phaseText-secondary">Preparing your document…</Text>
            </HStack>
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
          <BrandedErrorState
            title="This document could not be prepared"
            message={
              errorMsg.toLowerCase().includes('offline')
                ? 'You are offline. Reconnect to download this document.'
                : errorMsg
            }
            style={{ paddingVertical: 12 }}
          />
        )}

        {/* Action buttons */}
        {downloadState === 'idle' || downloadState === 'error' ? (
          <SanctuaryButton
            onPress={onDownload}
            leftIcon={Download}
            accessibilityLabel="Download and open PDF"
            className="px-10"
          >
            Download Document
          </SanctuaryButton>
        ) : downloadState === 'ready' ? (
          <VStack className="w-full gap-4">
            <SanctuaryButton
              onPress={onOpen}
              leftIcon={ExternalLink}
              accessibilityLabel="Open in native viewer"
              fullWidth
            >
              Open in Viewer
            </SanctuaryButton>
            <SanctuaryButton
              variant="outline"
              onPress={onDownload}
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
