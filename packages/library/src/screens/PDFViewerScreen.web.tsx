/**
 * PDFViewerScreen.web.tsx  Pattern A: full web replacement
 *
 * On native, PDFViewerScreen uses expo-file-system + expo-sharing to download
 * and open PDFs via the device's native viewer.  Neither package ships a web
 * implementation, so importing them in the Metro web bundle crashes the build.
 *
 * On web, Metro resolves this file instead.  We use two browser-native APIs:
 *   1. <iframe> embed  shows the PDF inline without any download.
 *   2. window.open()   opens the PDF in a new tab as a fallback.
 *
 * No expo-file-system or expo-sharing imports here.
 */

import { useNavigation } from '@react-navigation/native';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Box } from '@repo/ui/primitives';
import { HStack } from '@repo/ui/primitives';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import { useTheme } from '@repo/ui/primitives';

import { Bookmark, ExternalLink, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';

interface PDFViewerScreenProps {
  route: {
    params: {
      resourceId: string;
      title: string;
      url: string;
      creator?: string;
    };
  };
  navigation?: any;
}

export default function PDFViewerScreen({ route }: PDFViewerScreenProps) {
  const { title, url } = route.params;
  const navigation = useNavigation();
  const theme = useTheme();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // bump to reload iframe

  const openInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <ScreenWrapper scroll={false} style={{ backgroundColor: theme.glass.surface.bg, flex: 1 }}>
      <GlobalHeader
        title={title}
        subtitle="Document Viewer"
        showBack
        onBack={() => (navigation as any).goBack()}
        rightAction={
          <Box
            className="rounded-full overflow-hidden"
            style={{ backgroundColor: isBookmarked ? `${theme.accent.action}22` : 'transparent' }}
          >
            <SanctuaryButton
              variant="ghost"
              size="sm"
              leftIcon={Bookmark}
              onPress={() => setIsBookmarked((b) => !b)}
              accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
            >
              {''}
            </SanctuaryButton>
          </Box>
        }
      />

      {/* Inline iframe viewer */}
      <Box className="flex-1 overflow-hidden">
        <iframe
          key={iframeKey}
          src={url}
          title={title}
          style={
            {
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            } as any
          }
          allowFullScreen
        />
      </Box>

      {/* Action bar below the iframe */}
      <HStack className="p-md gap-sm justify-center border-t border-phase-border bg-phase-surface">
        <SanctuaryButton
          variant="outline"
          size="sm"
          leftIcon={RefreshCw}
          onPress={() => setIframeKey((k) => k + 1)}
          accessibilityLabel="Reload document"
        >
          Reload
        </SanctuaryButton>
        <SanctuaryButton
          size="sm"
          leftIcon={ExternalLink}
          onPress={openInNewTab}
          accessibilityLabel="Open PDF in new tab"
        >
          Open in New Tab
        </SanctuaryButton>
      </HStack>
    </ScreenWrapper>
  );
}
