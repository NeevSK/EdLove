import type { DownloadState } from '@repo/core/hooks';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Download, ExternalLink, FileText, Info, Sparkles } from '@repo/ui/icons';
import { Box, HStack, Text, useTheme, VStack } from '@repo/ui/primitives';

export interface UniversalDocumentPortalProps {
  title: string;
  format: string;
  size?: string;
  downloadState: DownloadState;
  progress: number;
  errorMsg?: string | null;
  onDownload: () => void;
  onOpenNative: () => void;
  onBack: () => void;
  aiSummaryReady?: boolean;
  onGenerateSummary?: () => void;
}

/**
 * UniversalDocumentPortal - The 2026 "Fluid Media" entry point for secondary docs.
 * Implements spatial hierarchy and "Zero UI" anticipatory actions.
 */
export function UniversalDocumentPortal({
  title,
  format,
  size = 'Calculating...',
  downloadState,
  progress,
  errorMsg,
  onDownload,
  onOpenNative,
  onBack,
  aiSummaryReady,
  onGenerateSummary,
}: UniversalDocumentPortalProps) {
  const theme = useTheme();

  const isExcel = ['xlsx', 'xls', 'csv'].includes(format.toLowerCase());
  const isWord = ['docx', 'doc'].includes(format.toLowerCase());
  const isPPT = ['pptx', 'ppt'].includes(format.toLowerCase());

  return (
    <ScreenWrapper scroll={true} className="bg-phase-surface">
      <GlobalHeader title="Document Portal" showBack onBack={onBack} />

      <VStack className="flex-1 p-6 gap-8">
        {/* Spatial Preview Card */}
        <Box
          className="w-full aspect-[4/3] rounded-[32px] bg-phase-accent/5 items-center justify-center border border-phase-border overflow-hidden"
          style={{
            shadowColor: theme.accent.action,
            shadowRadius: 40,
            shadowOpacity: 0.05,
          }}
        >
          <VStack className="items-center gap-4">
            <Box className="w-20 h-20 rounded-2xl bg-white shadow-sm items-center justify-center">
              <FileText size={40} color={theme.accent.action} />
            </Box>
            <VStack className="items-center">
              <Text
                className="text-xl font-bold text-phaseText-primary text-center px-4"
                numberOfLines={2}
              >
                {title}
              </Text>
              <HStack className="gap-2 mt-1">
                <Box className="px-2 py-0.5 rounded-md bg-phase-accent/10 border border-phase-accent/20">
                  <Text className="text-[10px] font-bold text-phase-accent uppercase">
                    {format}
                  </Text>
                </Box>
                <Text className="text-[10px] text-phaseText-tertiary uppercase">{size}</Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* 2026 "Zero UI" Anticipatory Actions */}
        <VStack className="gap-4">
          <Text className="text-xs font-bold text-phaseText-tertiary uppercase tracking-widest pl-1">
            Smart Actions
          </Text>
          <HStack className="gap-3">
            <SanctuaryButton
              variant="outline"
              className="flex-1 border-dashed"
              leftIcon={Sparkles}
              onPress={onGenerateSummary}
              isDisabled={downloadState === 'downloading'}
            >
              {aiSummaryReady ? 'View Summary' : 'AI Analysis'}
            </SanctuaryButton>
            <SanctuaryButton
              variant="outline"
              className="flex-1 border-dashed"
              leftIcon={Info}
              isDisabled={downloadState === 'downloading'}
            >
              Metadata
            </SanctuaryButton>
          </HStack>
        </VStack>

        {/* Execution Area */}
        <VStack className="gap-6 mt-auto pb-8">
          {downloadState === 'downloading' && (
            <VStack className="gap-2">
              <HStack className="items-center justify-center gap-2">
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
              <Text className="text-center text-xs text-phaseText-tertiary">
                Securing resource... {Math.round(progress * 100)}%
              </Text>
            </VStack>
          )}

          {errorMsg && (
            <BrandedErrorState
              title="This document is not ready yet"
              message={
                errorMsg.toLowerCase().includes('offline')
                  ? 'You are offline. Reconnect to continue.'
                  : errorMsg
              }
              style={{ paddingVertical: 12 }}
            />
          )}

          <VStack className="gap-3">
            {downloadState === 'ready' ? (
              <SanctuaryButton onPress={onOpenNative} leftIcon={ExternalLink} fullWidth size="lg">
                Open in {isExcel ? 'Excel' : isWord ? 'Word' : isPPT ? 'PowerPoint' : 'Native App'}
              </SanctuaryButton>
            ) : (
              <SanctuaryButton
                onPress={onDownload}
                leftIcon={Download}
                fullWidth
                size="lg"
                isDisabled={downloadState === 'downloading'}
              >
                {downloadState === 'downloading' ? 'Downloading...' : 'Begin Download'}
              </SanctuaryButton>
            )}

            <Text className="text-[11px] text-phaseText-tertiary text-center leading-4 px-6">
              Handoff to native system enabled. Ensure you have the corresponding 2026 Productivity
              Suite installed for the best experience.
            </Text>
          </VStack>
        </VStack>
      </VStack>
    </ScreenWrapper>
  );
}
