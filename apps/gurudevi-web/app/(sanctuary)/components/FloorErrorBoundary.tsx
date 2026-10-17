'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FloorErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[FloorErrorBoundary] Uncaught floor render failure:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <section
          aria-label="Floor error fallback"
          style={{
            padding: '2.5rem 1.5rem',
            maxWidth: '680px',
            margin: '2rem auto',
            backgroundColor: 'var(--color-surface, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">
            🌱
          </div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-ink, #231d17)',
              marginBottom: '0.5rem',
            }}
          >
            {this.props.fallbackTitle ?? 'Floor Experience Temporarily Paused'}
          </h2>
          <p
            style={{
              fontSize: '0.925rem',
              color: 'var(--color-ink-muted, #5f5449)',
              lineHeight: 1.5,
              marginBottom: '1.5rem',
            }}
          >
            This sanctuary space encountered an unexpected condition. Your cached offline records
            remain completely safe.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              minHeight: '44px',
              padding: '0.625rem 1.5rem',
              backgroundColor: 'var(--color-primary, #3b5f4c)',
              color: '#ffffff',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.925rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
          >
            Retry Sanctuary Floor
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
