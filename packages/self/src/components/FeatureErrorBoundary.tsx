import { BrandedEmptyState, BrandedErrorState } from '@repo/ui';
import { Pressable, Text } from '@repo/ui/primitives';
import { Component, type ErrorInfo, type ReactNode } from 'react';

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string };
  return e.code === '42P01' || (typeof e.message === 'string' && e.message.includes('does not exist'));
}

interface Props {
  children: ReactNode;
  featureName: string;
  featureId?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * FeatureErrorBoundary - Prevents a single broken feature from crashing the entire Sanctuary.
 * Standardized for 2026 Resilient UI with Telemetry integration.
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
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
      if (isMissingTableError(this.state.error)) {
        return (
          <BrandedEmptyState
            title={`${this.props.featureName} hasn't bloomed yet`}
            message="This sanctuary space is being prepared. Your other spaces are still available."
            subtle
          />
        );
      }
      return (
        <BrandedErrorState
          title={`${this.props.featureName} is taking a pause`}
          message="This space could not be shown. Your other Self spaces are still available."
        >
          <Pressable
            onPress={() => this.setState({ hasError: false, error: undefined })}
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
