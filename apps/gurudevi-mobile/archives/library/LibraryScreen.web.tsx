import React from 'react';
import { LibraryScreenWeb } from '@repo/library';
import { ErrorBoundary } from '@repo/ui';

/**
 * Architecturally Elegant Thin Wrapper for The Sanctuary (Library)
 * Centralizes the knowledge hub logic within the @repo/library package.
 */
export default function AppLibraryScreen() {
    return (
        <ErrorBoundary name="LibraryScreen" fallback={<div style={{ padding: 40, textAlign: 'center' }}>Failed to load Sanctuary. Please refresh.</div>}>
            <LibraryScreenWeb />
        </ErrorBoundary>
    );
}
