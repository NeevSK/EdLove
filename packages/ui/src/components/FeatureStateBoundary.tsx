import type { FeatureSurfaceStateSnapshot } from '@repo/core/logic/capabilityDecision';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandedEmptyState } from './BrandedEmptyState';
import { BrandPulse } from './BrandPulse';
import { ErrorState } from './ErrorState';

export type FeatureStateBoundaryProps = Readonly<{
  snapshot: FeatureSurfaceStateSnapshot;
  children: React.ReactNode;
  emptyTitle?: string;
  onRetry?: () => void;
}>;

/**
 * Renders the shared lifecycle vocabulary at a feature boundary. Domain code
 * supplies its content and recovery callback; it must not recreate semantic
 * loading, empty, unavailable, or retry states locally.
 */
export function FeatureStateBoundary({
  snapshot,
  children,
  emptyTitle = 'Nothing is here yet',
  onRetry,
}: FeatureStateBoundaryProps) {
  switch (snapshot.state) {
    case 'initializing':
    case 'loading':
    case 'saving':
      return (
        <View accessibilityLiveRegion="polite" style={styles.center}>
          <BrandPulse accessibilityLabel={snapshot.safeMessage} size={32} />
          <Text style={styles.message}>{snapshot.safeMessage}</Text>
        </View>
      );
    case 'empty':
      return <BrandedEmptyState message={snapshot.safeMessage} title={emptyTitle} />;
    case 'retryable_error':
      return (
        <ErrorState message={snapshot.safeMessage} title="Something interrupted this space">
          {snapshot.canRetry && onRetry ? (
            <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          ) : null}
        </ErrorState>
      );
    case 'permission_denied':
      return (
        <ErrorState message={snapshot.safeMessage} title="This space is not available to you" />
      );
    case 'unsupported':
      return <ErrorState message={snapshot.safeMessage} title="This is not available here" />;
    case 'disposed':
      return null;
    case 'offline_stale':
    case 'ready':
    case 'saved':
      return (
        <View>
          {snapshot.state === 'offline_stale' ? (
            <Text accessibilityLiveRegion="polite" style={styles.offline}>
              {snapshot.safeMessage}
            </Text>
          ) : null}
          {children}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    padding: 24,
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
  },
  offline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: 'center',
  },
  retry: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  retryText: {
    textDecorationLine: 'underline',
  },
});
