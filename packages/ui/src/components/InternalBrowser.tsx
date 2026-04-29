import * as WebBrowser from 'expo-web-browser';
import { ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Share2, X } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Share, StyleSheet } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { Pressable, Text, useTheme, View } from '../primitives';

export interface InternalBrowserProps {
  url: string;
  onClose?: () => void;
  title?: string;
  showToolbar?: boolean;
}

/**
 * InternalBrowser - A sandboxed, logic-isolated webview for general browsing.
 * Adheres to Gurudevi Decision 11: Display surface only, hard isolation boundary.
 */
export const InternalBrowser: React.FC<InternalBrowserProps> = ({
  url,
  onClose,
  title,
  showToolbar = true,
}) => {
  const { scene, isDark } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    setIsLoading(navState.loading);
  }, []);

  const handleBack = () => webViewRef.current?.goBack();
  const handleForward = () => webViewRef.current?.goForward();
  const handleReload = () => webViewRef.current?.reload();

  const handleShare = async () => {
    try {
      await Share.share({
        url: currentUrl,
        message: currentUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOpenExternal = async () => {
    try {
      await WebBrowser.openBrowserAsync(currentUrl);
    } catch (_error) {
      // Fallback to basic Linking
      Linking.openURL(currentUrl);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: scene.canvas.bg }]}>
      {/* Header / App Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: scene.surface.bg,
            borderBottomColor: scene.surface.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {onClose && (
            <Pressable onPress={onClose} style={styles.iconButton}>
              <X size={20} color={scene.text.primary} />
            </Pressable>
          )}
          <View style={styles.titleContainer}>
            <Text numberOfLines={1} style={[styles.title, { color: scene.text.primary }]}>
              {title || 'Internal Browser'}
            </Text>
            <Text numberOfLines={1} style={[styles.url, { color: scene.text.secondary }]}>
              {new URL(currentUrl).hostname}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable onPress={handleOpenExternal} style={styles.iconButton}>
            <ExternalLink size={18} color={scene.text.primary} />
          </Pressable>
        </View>
      </View>

      {/* Progress Bar */}
      {isLoading && progress > 0 && progress < 1 && (
        <View style={[styles.progressBarContainer, { backgroundColor: scene.canvas.border }]}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: scene.primary.main, width: `${progress * 100}%` },
            ]}
          />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        style={[styles.webView, { backgroundColor: scene.canvas.bg }]}
        // Security Settings
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
        originWhitelist={['https://*', 'http://*']}
        incognito={true} // Maintain sandboxing
        // Gurudevi Logic: Display surface only, no JS bridge by default
      />

      {/* Bottom Toolbar */}
      {showToolbar && (
        <View
          style={[
            styles.toolbar,
            {
              backgroundColor: scene.surface.bg,
              borderTopColor: scene.surface.border,
              borderTopWidth: 1,
              paddingBottom: 24, // Extra padding for home indicator
            },
          ]}
        >
          <Pressable
            onPress={handleBack}
            disabled={!canGoBack}
            style={[styles.toolbarButton, !canGoBack && styles.disabled]}
          >
            <ChevronLeft size={24} color={canGoBack ? scene.text.primary : scene.text.muted} />
          </Pressable>

          <Pressable
            onPress={handleForward}
            disabled={!canGoForward}
            style={[styles.toolbarButton, !canGoForward && styles.disabled]}
          >
            <ChevronRight size={24} color={canGoForward ? scene.text.primary : scene.text.muted} />
          </Pressable>

          <View style={{ flex: 1 }} />

          <Pressable onPress={handleReload} style={styles.toolbarButton}>
            <RotateCcw size={20} color={scene.text.primary} />
          </Pressable>

          <Pressable onPress={handleShare} style={styles.toolbarButton}>
            <Share2 size={20} color={scene.text.primary} />
          </Pressable>
        </View>
      )}

      {/* Initial Loading Overlay */}
      {isLoading && progress === 0 && (
        <View style={[styles.loadingOverlay, { backgroundColor: scene.canvas.bg }]}>
          <ActivityIndicator color={scene.primary.main} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 8,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  url: {
    fontSize: 10,
    opacity: 0.7,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  webView: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  progressBarContainer: {
    height: 3,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
