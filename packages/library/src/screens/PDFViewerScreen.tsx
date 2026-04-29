import { useNavigation } from '@react-navigation/native';
import { useMediaDownloader } from '@repo/core/hooks';

import { PdfViewer } from '@repo/ui/components/media/PdfViewer';
import { useCallback, useState } from 'react';

interface PDFViewerScreenProps {
  route: {
    params: {
      resourceId: string;
      title: string;
      url: string;
      creator?: string;
    };
  };
}

/**
 * PDFViewerScreen - Thin navigation shell around the shared UI PdfViewer.
 */
export default function PDFViewerScreen({ route }: PDFViewerScreenProps) {
  const { resourceId, title, url, creator } = route.params;
  const navigation = useNavigation();

  const [isBookmarked, setIsBookmarked] = useState(false);

  const { downloadState, progress, errorMsg, startDownload, openInNativeViewer } =
    useMediaDownloader({
      resourceId,
      url,
      mimeType: 'application/pdf',
    });

  const handleBack = useCallback(() => {
    (navigation as any).goBack();
  }, [navigation]);

  return (
    <PdfViewer
      title={title}
      subtitle={creator || 'Institutional Document'}
      downloadState={downloadState}
      progress={progress}
      errorMsg={errorMsg}
      onDownload={startDownload}
      onOpen={openInNativeViewer}
      onBack={handleBack}
      isBookmarked={isBookmarked}
      onToggleBookmark={() => setIsBookmarked((b) => !b)}
    />
  );
}
