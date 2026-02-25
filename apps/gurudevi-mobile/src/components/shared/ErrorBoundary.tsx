import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Box, VStack, Text, Heading, Center } from '@repo/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { Theme } from '@repo/ui';
import { SanctuaryButton } from '@repo/ui';

interface Props {
    children: ReactNode;
    name: string;  // Name for tracking which boundary caught the error
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    isRecovering: boolean; // Recursion guard
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        isRecovering: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, isRecovering: false };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
                    <Center sx={{ flex: 1, padding: Theme.spacing.xl }}>
                        <VStack space="xl" alignItems="center" maxWidth={300}>
                            <Box sx={{
                                padding: Theme.spacing.xl,
                                backgroundColor: 'rgba(255, 99, 71, 0.1)', // Ember red, low opacity
                                borderRadius: Theme.corners.full,
                            }}>
                                <AlertTriangle size={64} color={Theme.colors.emberRed} />
                            </Box>

                            <Heading color={Theme.colors.sacredWhite} textAlign="center" size="2xl">
                                Something went wrong
                            </Heading>

                            <Text color={Theme.colors.pearlGray} textAlign="center">
                                We've encountered an unexpected issue. The sanctuary is momentarily disrupted.
                            </Text>

                            <SanctuaryButton
                                onPress={this.handleReset}
                                leftIcon={RefreshCw}
                                size="lg"
                                action="primary"
                            >
                                Try Again
                            </SanctuaryButton>

                            {/* Dev-only error details */}
                            {__DEV__ && this.state.error && (
                                <Box sx={{
                                    padding: Theme.spacing.md,
                                    backgroundColor: Theme.colors.midnightBlue,
                                    borderRadius: Theme.corners.comfortable,
                                    marginTop: Theme.spacing.lg,
                                    width: '100%'
                                }}>
                                    <Text color={Theme.colors.dimGray} size="xs" mb="$1">
                                        Boundary: {this.props.name}
                                    </Text>
                                    <Text color={Theme.colors.emberRed} size="xs" fontFamily="monospace">
                                        {this.state.error.toString()}
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </Center>
                </Box>
            );
        }

        return this.props.children;
    }
}
