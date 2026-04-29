import { useNavigation, useRoute } from '@react-navigation/native';
import { useMediaDownloader } from '@repo/core';
import { UniversalDocumentPortal } from '@repo/ui';
import React, { useCallback, useState } from 'react';

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
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { title, url, format, size } = route.params;

  const [aiSummaryReady, setAiSummaryReady] = useState(false);

  const { downloadState, progress, errorMsg, startDownload, openInNativeViewer } = useMediaDownloader({
    url,
    resourceId: route.params.resourceId,
    mimeType: resolveDocumentMimeType(format),
  });

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleOpenNative = useCallback(async () => {
    await openInNativeViewer();
  }, [openInNativeViewer]);

  const handleGenerateSummary = useCallback(() => {
    // Placeholder for 2026 AI Logic
    setAiSummaryReady(true);
  }, []);

  return (
    <UniversalDocumentPortal
      title={title}
      format={format}
      size={size}
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
