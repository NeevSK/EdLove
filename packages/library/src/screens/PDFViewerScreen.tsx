import { useMediaDownloader } from '@repo/core/hooks';
import { PdfViewer } from '@repo/ui/components/media/PdfViewer';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * PDFViewerScreen - Thin navigation shell around the shared UI PdfViewer.
 */
export default function PDFViewerScreen() {
  const { resourceId, title, url, creator } = useLocalSearchParams<{
    resourceId: string;
    title: string;
    url: string;
    creator?: string;
  }>();
  const router = useRouter();

  const [isBookmarked, setIsBookmarked] = useState(false);

  const { downloadState, progress, errorMsg, startDownload, openInNativeViewer } =
    useMediaDownloader({
      resourceId,
      url,
      mimeType: 'application/pdf',
    });

  const handleBack = useCallback(() => {
    safeBack('/library');
  }, []);

  const handleDownload = useCallback(() => {
    void startDownload();
  }, [startDownload]);

  const handleOpen = useCallback(() => {
    void openInNativeViewer();
  }, [openInNativeViewer]);

  const handleToggleBookmark = useCallback(() => {
    setIsBookmarked((b) => !b);
  }, []);

  return (
    <PdfViewer
      title={title}
      subtitle={creator || 'Institutional Document'}
      downloadState={downloadState}
      progress={progress}
      errorMsg={errorMsg}
      onDownload={handleDownload}
      onOpen={handleOpen}
      onBack={handleBack}
      isBookmarked={isBookmarked}
      onToggleBookmark={handleToggleBookmark}
    />
  );
}
