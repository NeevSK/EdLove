import { hapticError } from '@repo/ui/utils/haptics';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Platform, Text as RNText, StyleSheet, View, Pressable } from '@repo/ui/primitives';

let Sentry: {
  setTag?: (k: string, v: string) => void;
  setExtra?: (k: string, v: unknown) => void;
  captureException?: (e: Error, o: any) => void;
} | null = null;
try {
  Sentry = require('@sentry/react-native');
} catch {
  // Sentry not installed - error boundaries still work without it
}

type JourneyType = 'auth' | 'onboarding' | 'create' | 'sync' | 'general';

interface JourneyErrorBoundaryProps {
  children: ReactNode;
  journey: JourneyType;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface JourneyErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const JOURNEY_MESSAGES: Record<JourneyType, { title: string; message: string; action: string }> = {
  auth: {
    title: 'Session expired',
    message: 'Your session has ended. Please log in again to continue.',
    action: 'Log in',
  },
  onboarding: {
    title: 'Something went wrong',
    message: 'We encountered an issue during setup. Your progress is saved.',
    action: 'Try again',
  },
  create: {
    title: 'Save failed',
    message: 'Your changes could not be saved. Please try again.',
    action: 'Retry',
  },
  sync: {
    title: 'Sync issue',
    message: 'We are having trouble syncing your data. Your changes are saved locally.',
    action: 'Retry sync',
  },
  general: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred.',
    action: 'Try again',
  },
};

/**
 * JourneyErrorBoundary — journey-aware error boundary.
 *
 * Renders different fallback UIs based on which journey the user is in.
 * Each fallback includes a retry action and haptic error feedback.
 */
export class JourneyErrorBoundary extends Component<
  JourneyErrorBoundaryProps,
  JourneyErrorBoundaryState
> {
  public override state: JourneyErrorBoundaryState = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): JourneyErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`JourneyErrorBoundary (${this.props.journey}):`, error, errorInfo);
    hapticError();
    this.props.onError?.(error, errorInfo);

    if (Sentry) {
      Sentry.setTag?.('journey', this.props.journey);
      Sentry.setExtra?.('componentStack', errorInfo.componentStack);
      Sentry.captureException?.(error, {
        mechanism: { type: 'react_error_boundary', handled: true },
        tags: { journey: this.props.journey },
      });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      const fallback = JOURNEY_MESSAGES[this.props.journey] || JOURNEY_MESSAGES.general;
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <RNText style={styles.title}>{fallback.title}</RNText>
            <RNText style={styles.message}>{fallback.message}</RNText>
            {__DEV__ && this.state.error && (
              <RNText style={styles.debug}>{this.state.error.toString()}</RNText>
            )}
            <Pressable
              accessibilityRole="button"
              style={styles.button}
              onPress={this.handleReset}
              className="active:opacity-70"
            >
              <RNText style={styles.buttonText}>{fallback.action}</RNText>
            </Pressable>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1A1A1A',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  debug: {
    fontSize: 11,
    color: '#FF6347',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#EF841F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
