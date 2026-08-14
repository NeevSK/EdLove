import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';
import { Pressable, Text } from '@repo/ui/primitives';
import { Component, type ErrorInfo, type ReactNode } from 'react';

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
        <BrandedErrorState
          title={`${this.props.featureName} is taking a pause`}
          message="This space could not be shown. Your other Self spaces are still available."
        >
          <Pressable
            onPress={() => this.setState({ hasError: false })}
            accessibilityRole="button"
            accessibilityLabel={`Try ${this.props.featureName} again`}
            className="rounded-full bg-phase-action px-4 py-2"
          >
            <Text className="text-phase-text-inverse font-semibold">Try again</Text>
          </Pressable>
        </BrandedErrorState>
      );
    }

    return this.props.children;
  }
}
