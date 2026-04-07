import React from 'react';
import { ProfileScreenWeb } from '@repo/profile';
import { ErrorBoundary } from '@repo/ui';

/**
 * Architecturally Elegant Thin Wrapper for Profile
 * Centralizes the identity and presence logic within the @repo/profile package.
 */
export default function AppProfileScreen() {
    return (
        <ErrorBoundary name="ProfileScreen" fallback={<div style={{ padding: 40, textAlign: 'center' }}>Failed to load sanctuary profile. Please refresh.</div>}>
            <ProfileScreenWeb />
        </ErrorBoundary>
    );
}
