import { ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Share2, X } from '@repo/ui/icons';
import { Pressable, Text, useTheme, View } from '@repo/ui/primitives';
import * as WebBrowser from 'expo-web-browser';
import type React from 'react';
import { useCallback, useReducer, useRef } from 'react';
import { Linking, Share, StyleSheet } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { BrandPulse } from './BrandPulse';

export interface InternalBrowserProps {
  url: string;
  onClose?: () => void;
  title?: string;
  showToolbar?: boolean;
}

// ============================================================================
// TYPES & REDUCER
// ============================================================================

interface BrowserState {
  canGoBack: boolean;
  canGoForward: boolean;
  currentUrl: string;
  isLoading: boolean;
  progress: number;
}

type BrowserAction =
  | { type: 'UPDATE_NAVIGATION'; navState: WebViewNavigation }
  | { type: 'SET_PROGRESS'; progress: number }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_URL'; url: string };

function browserReducer(state: BrowserState, action: BrowserAction): BrowserState {
  switch (action.type) {
    case 'UPDATE_NAVIGATION':
      return {
        ...state,
        canGoBack: action.navState.canGoBack,
        canGoForward: action.navState.canGoForward,
        currentUrl: action.navState.url,
        isLoading: action.navState.loading,
      };
    case 'SET_PROGRESS':
      return { ...state, progress: action.progress };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    case 'SET_URL':
      return { ...state, currentUrl: action.url };
    default:
      return state;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const InternalBrowser: React.FC<InternalBrowserProps> = ({
  url,
  onClose,
  title,
  showToolbar = true,
}) => {
  const { scene } = useTheme();
  const webViewRef = useRef<WebView>(null);

  const [state, dispatch] = useReducer(browserReducer, {
    canGoBack: false,
    canGoForward: false,
    currentUrl: url,
    isLoading: true,
    progress: 0,
  });

  const { canGoBack, canGoForward, currentUrl, isLoading, progress } = state;

  const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    dispatch({ type: 'UPDATE_NAVIGATION', navState });
  }, []);

  const handleProgress = useCallback((p: number) => {
    dispatch({ type: 'SET_PROGRESS', progress: p });
  }, []);

  const handleLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', loading });
  }, []);

  const handleBack = useCallback(() => webViewRef.current?.goBack(), []);
  const handleForward = useCallback(() => webViewRef.current?.goForward(), []);
  const handleReload = useCallback(() => webViewRef.current?.reload(), []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        url: currentUrl,
        message: currentUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [currentUrl]);

  const handleOpenExternal = useCallback(async () => {
    try {
      await WebBrowser.openBrowserAsync(currentUrl);
    } catch {
      // Fallback to basic Linking
      void Linking.openURL(currentUrl);
    }
  }, [currentUrl]);

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
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.iconButton}>
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
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void handleOpenExternal();
            }}
            style={styles.iconButton}
          >
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
              {
                backgroundColor: scene.primary.main,
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadProgress={({ nativeEvent }) => handleProgress(nativeEvent.progress)}
        onLoadStart={() => handleLoading(true)}
        onLoadEnd={() => handleLoading(false)}
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
            accessibilityRole="button"
            onPress={handleBack}
            disabled={!canGoBack}
            style={[styles.toolbarButton, !canGoBack && styles.disabled]}
          >
            <ChevronLeft size={24} color={canGoBack ? scene.text.primary : scene.text.muted} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleForward}
            disabled={!canGoForward}
            style={[styles.toolbarButton, !canGoForward && styles.disabled]}
          >
            <ChevronRight size={24} color={canGoForward ? scene.text.primary : scene.text.muted} />
          </Pressable>

          <View style={{ flex: 1 }} />

          <Pressable accessibilityRole="button" onPress={handleReload} style={styles.toolbarButton}>
            <RotateCcw size={20} color={scene.text.primary} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void handleShare();
            }}
            style={styles.toolbarButton}
          >
            <Share2 size={20} color={scene.text.primary} />
          </Pressable>
        </View>
      )}

      {/* Initial Loading Overlay */}
      {isLoading && progress === 0 && (
        <View style={[styles.loadingOverlay, { backgroundColor: scene.canvas.bg }]}>
          <BrandPulse size={28} tintColor={scene.primary.main} />
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
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
