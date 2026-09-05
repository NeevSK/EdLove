import { Component, type ErrorInfo, type ReactNode, useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
 * ErrorCard - Standalone presentation component for the Sanctuary Error Boundary
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
      <View style={styles.cardContainer}>
        {/* Breathing Lotus Emblem */}
        <View style={styles.iconCircle}>
          <Text style={styles.emblemIcon}>🪷</Text>
        </View>

        {/* Reassuring Header & Copy */}
        <Text style={styles.titleText}>Sanctuary Paused</Text>
        <Text style={styles.subtitleText}>
          An unexpected disruption occurred in this view. Your session and stored data remain
          completely safe.
        </Text>

        {/* Actions Suite */}
        <View style={styles.actionsRow}>
          {onReset && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Restore view"
              onPress={onReset}
              activeOpacity={0.8}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Restore Sanctuary</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Copy error details"
            onPress={() => {
              void handleCopy();
            }}
            activeOpacity={0.7}
            style={[styles.secondaryButton, copied && styles.copiedButton]}
          >
            <Text style={[styles.secondaryButtonText, copied && styles.copiedButtonText]}>
              {copied ? 'Copied to Clipboard ✓' : 'Copy Error Details'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Collapsible Technical Inspector */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={showDetails ? 'Hide technical details' : 'Show technical details'}
          onPress={() => setShowDetails((prev) => !prev)}
          activeOpacity={0.6}
          style={styles.detailsToggle}
        >
          <Text style={styles.detailsToggleText}>
            {showDetails ? '▴ Hide Technical Diagnostics' : '▾ View Technical Diagnostics'}
          </Text>
        </TouchableOpacity>

        {showDetails && (
          <View style={styles.inspectorBox}>
            <View style={styles.inspectorHeader}>
              <Text style={styles.inspectorBoundaryBadge}>Boundary: {name}</Text>
              <Text style={styles.inspectorTimestamp}>{new Date().toLocaleTimeString()}</Text>
            </View>

            <ScrollView style={styles.inspectorScroll} nestedScrollEnabled>
              <Text style={styles.inspectorErrorText}>{errorMessage}</Text>
              {errorStack ? <Text style={styles.inspectorStackText}>{errorStack}</Text> : null}
              {componentStack ? (
                <Text style={styles.inspectorComponentStackText}>{componentStack}</Text>
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
    backgroundColor: '#0D0907', // Sanctuary obsidian-warm ink
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardContainer: {
    backgroundColor: '#18110D', // Dark amber card surface
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 132, 58, 0.25)', // Golden amber border
    padding: 28,
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 132, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 132, 58, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emblemIcon: {
    fontSize: 32,
    lineHeight: 36,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF5EB',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#C4B5A5',
    textAlign: 'center',
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'column',
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#D4843A', // Brand Golden Amber
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 132, 58, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#E0D2C3',
    fontSize: 14,
    fontWeight: '600',
  },
  copiedButton: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  copiedButtonText: {
    color: '#34D399',
  },
  detailsToggle: {
    marginTop: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  detailsToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D4843A',
  },
  inspectorBox: {
    marginTop: 12,
    width: '100%',
    backgroundColor: '#090604',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 6,
  },
  inspectorBoundaryBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F6BF8C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inspectorTimestamp: {
    fontSize: 11,
    color: '#7C6F64',
  },
  inspectorScroll: {
    maxHeight: 180,
  },
  inspectorErrorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F87171',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  inspectorStackText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inspectorComponentStackText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 6,
  },
});
