import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMediaDownloader } from '@repo/core/hooks';

import { UniversalDocumentPortal } from '@repo/ui/components/media/UniversalDocumentPortal';
import { useCallback, useState } from 'react';

function resolveDocumentMimeType(format?: string) {
  switch (format?.toLowerCase()) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return undefined;
  }
}

/**
 * DocumentViewerScreen - Navigation Shell
 * Uses the shared UniversalDocumentPortal to handle non-PDF/Video documents.
 */
export function DocumentViewerScreen() {
  const router = useRouter();
  const { title, url, format, size, resourceId } = useLocalSearchParams<{
    title?: string;
    url?: string;
    format?: string;
    size?: string;
    resourceId?: string;
  }>();
  const resolvedTitle = title ?? '';
  const resolvedUrl = url ?? '';
  const resolvedFormat = format ?? '';
  const resolvedSize = size ?? '';

  const [aiSummaryReady, setAiSummaryReady] = useState(false);

  const { downloadState, progress, errorMsg, startDownload, openInNativeViewer } =
    useMediaDownloader({
      url: resolvedUrl,
      resourceId: resourceId ?? '',
      mimeType: resolveDocumentMimeType(resolvedFormat),
    });

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenNative = useCallback(async () => {
    await openInNativeViewer();
  }, [openInNativeViewer]);

  const handleGenerateSummary = useCallback(() => {
    // Placeholder for 2026 AI Logic
    setAiSummaryReady(true);
  }, []);

  return (
    <UniversalDocumentPortal
      title={resolvedTitle}
      format={resolvedFormat}
      size={resolvedSize}
      downloadState={downloadState}
      progress={progress}
      errorMsg={errorMsg}
      onDownload={startDownload}
      onOpenNative={handleOpenNative}
      onBack={handleBack}
      aiSummaryReady={aiSummaryReady}
      onGenerateSummary={handleGenerateSummary}
    />
  );
}

export default DocumentViewerScreen;
