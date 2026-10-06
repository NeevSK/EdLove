import { useTheme } from '@repo/ui/hooks/useTheme';
import { tokens } from '@repo/ui/tokens';
import { Component, type ErrorInfo, type ReactNode, useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, Pressable } from '@repo/ui/primitives';
import { Mascot } from './Mascot';

interface Props {
  children: ReactNode;
  name: string; // Name for tracking which boundary caught the error
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
}

/**
 * Copy error and stack to system clipboard across Web & Native
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch {
    // Silent fallback
  }

  return false;
}

/**
 * ErrorCard - Presentation component for the Sanctuary Error Boundary
 */
function ErrorCard({
  name,
  error,
  errorInfo,
  onReset,
}: {
  name: string;
  error: Error | null;
  errorInfo?: ErrorInfo | null;
  onReset?: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isDark, scene, text, accent, textOnAccent } = useTheme();

  const errorMessage = error?.message || error?.toString() || 'Unknown runtime disruption.';
  const componentStack = errorInfo?.componentStack || '';
  const errorStack = error?.stack || '';
  const fullErrorPayload = `[Boundary: ${name}]\nTimestamp: ${new Date().toISOString()}\nError: ${errorMessage}\n\nStack:\n${errorStack}\n\nComponent Stack:\n${componentStack}`;

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(fullErrorPayload);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [fullErrorPayload]);

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.cardContainer,
          {
            backgroundColor: isDark ? scene.surface.bg : tokens.semantic.surface.canvas,
            borderColor: isDark ? scene.surface.border : tokens.semantic.border.subtle,
          },
        ]}
      >
        {/* Sanctuary Guide Interrupted Presence */}
        <View style={styles.mascotContainer}>
          <Mascot mode="offline" state="interrupted" size={120} podVariant="raw" />
        </View>

        {/* Reassuring Header & Copy */}
        <Text
          style={[
            styles.titleText,
            { color: isDark ? text.primary : tokens.semantic.text.primary },
          ]}
        >
          Sanctuary Paused
        </Text>
        <Text
          style={[
            styles.subtitleText,
            { color: isDark ? text.secondary : tokens.semantic.text.secondary },
          ]}
        >
          An unexpected disruption occurred in this view. Your session and stored data remain
          completely safe.
        </Text>

        {/* Actions Suite */}
        <View style={styles.actionsRow}>
          {onReset && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Restore view"
              onPress={onReset}
              style={[styles.primaryButton, { backgroundColor: accent.action }]}
              className="active:opacity-80"
            >
              <Text style={[styles.primaryButtonText, { color: textOnAccent }]}>
                Restore Sanctuary
              </Text>
            </Pressable>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Copy error details"
            onPress={() => {
              void handleCopy();
            }}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(42, 35, 24, 0.04)',
                borderColor: isDark ? 'rgba(212, 132, 58, 0.2)' : tokens.semantic.border.subtle,
              },
              copied && styles.copiedButton,
            ]}
            className="active:opacity-70"
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: isDark ? text.secondary : tokens.semantic.text.secondary },
                copied && styles.copiedButtonText,
              ]}
            >
              {copied ? 'Copied to Clipboard ✓' : 'Copy Error Details'}
            </Text>
          </Pressable>
        </View>

        {/* Collapsible Technical Inspector */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={showDetails ? 'Hide technical details' : 'Show technical details'}
          onPress={() => setShowDetails((prev) => !prev)}
          style={styles.detailsToggle}
          className="active:opacity-60"
        >
          <Text style={[styles.detailsToggleText, { color: accent.action }]}>
            {showDetails ? '▴ Hide Technical Diagnostics' : '▾ View Technical Diagnostics'}
          </Text>
        </Pressable>

        {showDetails && (
          <View
            style={[
              styles.inspectorBox,
              {
                backgroundColor: isDark ? scene.canvas.bg : tokens.semantic.surface.quiet,
                borderColor: isDark ? scene.border.subtle : tokens.semantic.border.subtle,
              },
            ]}
          >
            <View
              style={[
                styles.inspectorHeader,
                {
                  borderBottomColor: isDark
                    ? 'rgba(255, 255, 255, 0.06)'
                    : tokens.semantic.border.subtle,
                },
              ]}
            >
              <Text style={[styles.inspectorBoundaryBadge, { color: accent.action }]}>
                Boundary: {name}
              </Text>
              <Text
                style={[
                  styles.inspectorTimestamp,
                  { color: isDark ? text.muted : tokens.semantic.text.muted },
                ]}
              >
                {new Date().toLocaleTimeString()}
              </Text>
            </View>

            <ScrollView style={styles.inspectorScroll} nestedScrollEnabled>
              <Text style={styles.inspectorErrorText}>{errorMessage}</Text>
              {errorStack ? (
                <Text
                  style={[
                    styles.inspectorStackText,
                    { color: isDark ? text.muted : tokens.semantic.text.muted },
                  ]}
                >
                  {errorStack}
                </Text>
              ) : null}
              {componentStack ? (
                <Text
                  style={[
                    styles.inspectorComponentStackText,
                    { color: isDark ? text.muted : tokens.semantic.text.muted },
                  ]}
                >
                  {componentStack}
                </Text>
              ) : null}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

export default class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isRecovering: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, isRecovering: false };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary: ${this.props.name}]`, error, errorInfo);

    if (this.state.isRecovering) {
      console.error('Critical: Recursive error detected in ErrorBoundary itself.');
      return;
    }

    this.setState({ errorInfo, isRecovering: true });
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, isRecovering: false });
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorCard
          name={this.props.name}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * RouteErrorBoundary - Native Expo Router contract component ({ error, retry })
 */
export function RouteErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry?: () => Promise<void> | void;
}) {
  return (
    <ErrorCard
      name="Route Navigator"
      error={error}
      onReset={retry ? () => void retry() : undefined}
    />
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.md,
  },
  cardContainer: {
    borderRadius: 24,
    borderWidth: 1,
    padding: tokens.spacing.lg,
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
    shadowColor: tokens.colors.shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.md,
  },
  emblemIcon: {
    fontSize: 32,
    lineHeight: 36,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.md,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: tokens.spacing.xs,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  actionsRow: {
    flexDirection: 'column',
    width: '100%',
    gap: tokens.spacing.sm,
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: tokens.spacing.lg,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  secondaryButton: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  copiedButton: {
    backgroundColor: 'rgba(91, 140, 79, 0.15)',
    borderColor: tokens.colors.success,
  },
  copiedButtonText: {
    color: tokens.colors.success,
  },
  detailsToggle: {
    marginTop: tokens.spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  detailsToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inspectorBox: {
    marginTop: tokens.spacing.sm,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: tokens.spacing.sm,
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  inspectorBoundaryBadge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inspectorTimestamp: {
    fontSize: 11,
  },
  inspectorScroll: {
    maxHeight: 180,
  },
  inspectorErrorText: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.colors.error,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: tokens.spacing.xs,
  },
  inspectorStackText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inspectorComponentStackText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 6,
  },
});
