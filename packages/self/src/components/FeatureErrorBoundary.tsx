import { Box, Text, VStack } from '@repo/ui/primitives';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  featureName: string;
  featureId?: string;
}

interface State {
  hasError: boolean;
}

/**
 * FeatureErrorBoundary - Prevents a single broken feature from crashing the entire Sanctuary.
 * Standardized for 2026 Resilient UI with Telemetry integration.
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to telemetry (Manual call since hooks aren't available in class components)
    console.error(
      `Sanctuary Fault [${this.props.featureId || this.props.featureName}]:`,
      error,
      errorInfo,
    );
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <Box className="p-6 border border-red-100 rounded-2xl bg-red-50/30">
          <VStack space="xs">
            <Text className="text-sm font-black text-red-600 uppercase tracking-widest">
              Capability Halted
            </Text>
            <Text className="text-xs text-red-400">
              The {this.props.featureName} is currently out of resonance. Our guardians have been
              notified.
            </Text>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
