import ErrorMessage from '@repo/ui/components/ErrorMessage';
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
        <ErrorMessage
          type="warning"
          message={`The ${this.props.featureName} could not be shown. Your other sanctuary surfaces remain available.`}
          onDismiss={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
