import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Center,
  Heading,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { RefreshCw, TriangleAlert } from '@repo/ui/icons';
import { View } from '@repo/ui/primitives';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Platform, Text as RNText, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  name: string; // Name for tracking which boundary caught the error
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRecovering: boolean; // Recursion guard
}

if (__DEV__ && !Component) {
  console.error(
    'CRITICAL: React.Component is undefined in ErrorBoundary initialization. This usually indicates a broken Metro resolution or Circular Dependency.',
  );
}

export default class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    isRecovering: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRecovering: false };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.name}:`, error, errorInfo);

    // Recursive protection: If we are already recovering and hit another error, something is fundamentally broken
    if (this.state.isRecovering) {
      console.error('Critical: Recursive error detected in ErrorBoundary itself.');
      return;
    }

    this.setState({ isRecovering: true });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, isRecovering: false });
  };

  private renderSafeFallback() {
    return (
      <View style={styles.safeContainer}>
        <View style={styles.safeCard}>
          <RNText style={styles.safeTitle}>Sanctuary Disrupted</RNText>
          <RNText style={styles.safeMessage}>
            A critical error has occurred. The sanctuary is momentarily unstable.
            {__DEV__ && this.state.error && `\n\n${this.state.error.toString()}`}
          </RNText>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.safeButton}
            onPress={this.handleReset}
            activeOpacity={0.7}
          >
            <RNText style={styles.safeButtonText}>Restore Sanctuary</RNText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // High-risk: Rendering the full design system fallback.
      // If this fails (double-fault), we fall back to the basic React Native View/Text.
      try {
        return (
          <Box className="flex-1 bg-phase-ink" style={{ backgroundColor: '#211A17' }}>
            <Center className="flex-1 p-8">
              <VStack className="gap-8 items-center max-w-[400px]">
                <Box className="p-8 bg-phase-danger/10 rounded-full">
                  {/* These icons are the most likely to cause "Element type is invalid" on Web if not aliased */}
                  {Platform.OS !== 'web' ? (
                    <TriangleAlert size={64} className="text-phase-danger" />
                  ) : (
                    <RNText style={{ fontSize: 64, color: '#F6BF8C', fontWeight: '700' }}>!</RNText>
                  )}
                </Box>

                <Heading className="text-phase-text-primary text-center text-2xl font-bold">
                  Something went wrong
                </Heading>

                <Text className="text-phase-text-secondary text-center text-base">
                  We&apos;ve encountered an unexpected issue. The sanctuary is momentarily
                  disrupted.
                </Text>

                <Button
                  onPress={this.handleReset}
                  className="h-14 px-8 bg-phase-danger rounded-xl flex-row items-center gap-2"
                  style={{ backgroundColor: '#B42318' }}
                >
                  {Platform.OS !== 'web' && (
                    <ButtonIcon as={RefreshCw} className="text-phase-text-primary" />
                  )}
                  <ButtonText className="text-white font-bold text-lg" style={{ color: '#FFFFFF' }}>
                    Try Again
                  </ButtonText>
                </Button>

                {__DEV__ && this.state.error && (
                  <Box className="p-4 bg-phase-surface/50 rounded-xl mt-8 w-full border border-phase-surface">
                    <Text className="text-phase-text-tertiary text-[10px] mb-1">
                      Boundary: {this.props.name}
                    </Text>
                    <Text className="text-phase-danger text-[10px] font-mono">
                      {this.state.error.toString()}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Center>
          </Box>
        );
      } catch (e) {
        console.error('Critical: ErrorBoundary double-faulted. Falling back to SafeFallback.', e);
        return this.renderSafeFallback();
      }
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Theme.colors.ink
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  safeCard: {
    backgroundColor: '#1A1A1A', // Theme.colors.shroud
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FF634733', // EmberRed 20%
  },
  safeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  safeMessage: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  safeButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  safeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
