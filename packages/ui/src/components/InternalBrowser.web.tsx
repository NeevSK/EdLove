import { ChevronLeft, ChevronRight, ExternalLink, RotateCcw, Share2, X } from 'lucide-react-native';
import type React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { View } from '../primitives';
import { Text } from './ui/text';
import { Pressable } from './ui/view';

export interface InternalBrowserProps {
  url: string;
  onClose?: () => void;
  title?: string;
  showToolbar?: boolean;
}

/**
 * InternalBrowser.web - Web implementation of the sandboxed browser.
 * Note: External URLs may be blocked by X-Frame-Options.
 */
export const InternalBrowser: React.FC<InternalBrowserProps> = ({
  url,
  onClose,
  title,
  showToolbar = true,
}) => {
  const { scene } = useTheme();

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title || 'Shared Link',
        url: url,
      });
    } else {
      // Fallback: Copy to clipboard?
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: scene.canvas.bg }]}>
      {/* Header */}
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
              {url}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            accessibilityRole="button"
            onPress={handleOpenExternal}
            style={styles.iconButton}
          >
            <ExternalLink size={18} color={scene.text.primary} />
          </Pressable>
        </View>
      </View>

      {/* WebView (Iframe on Web) */}
      <View style={styles.iframeContainer}>
        <iframe
          src={url}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: 'white',
          }}
          sandbox="allow-scripts allow-same-origin allow-forms"
          title={title || 'Internal Browser Content'}
        />

        {/* Web Fallback Overlay (since many sites block iframes) */}
        <View style={styles.webWarning}>
          <Text
            style={{
              color: scene.text.secondary,
              textAlign: 'center',
              fontSize: 12,
            }}
          >
            If content doesn't load, use External Link button.
          </Text>
        </View>
      </View>

      {/* Toolbar */}
      {showToolbar && (
        <View
          style={[
            styles.toolbar,
            {
              backgroundColor: scene.surface.bg,
              borderTopColor: scene.surface.border,
              borderTopWidth: 1,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            style={[styles.toolbarButton, styles.disabled]}
            disabled
          >
            <ChevronLeft size={24} color={scene.text.muted} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={[styles.toolbarButton, styles.disabled]}
            disabled
          >
            <ChevronRight size={24} color={scene.text.muted} />
          </Pressable>

          <View style={{ flex: 1 }} />

          <Pressable
            accessibilityRole="button"
            onPress={() => window.location.reload()}
            style={styles.toolbarButton}
          >
            <RotateCcw size={20} color={scene.text.primary} />
          </Pressable>

          <Pressable accessibilityRole="button" onPress={handleShare} style={styles.toolbarButton}>
            <Share2 size={20} color={scene.text.primary} />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
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
  iframeContainer: {
    flex: 1,
    position: 'relative',
  },
  webWarning: {
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.02)',
    alignItems: 'center',
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
    opacity: 0.3,
  },
});
