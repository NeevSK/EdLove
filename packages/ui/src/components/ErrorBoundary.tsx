import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Platform, View, Text as RNText, TouchableOpacity, StyleSheet } from 'react-native';
import { Box, VStack, Text, Heading, Center, Button, ButtonText, ButtonIcon } from '../gluestack';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { Theme } from '../theme/Theme';

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

if (__DEV__ && !Component) {
    console.error('CRITICAL: React.Component is undefined in ErrorBoundary initialization. This usually indicates a broken Metro resolution or Circular Dependency.');
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

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // High-risk: Rendering the full design system fallback. 
            // If this fails (double-fault), we fall back to the basic React Native View/Text.
            try {
                return (
                    <Box sx={{ flex: 1, backgroundColor: Theme.colors.ink }}>
                        <Center sx={{ flex: 1, padding: Theme.spacing.xl }}>
                            <VStack space="xl" alignItems="center" maxWidth={400}>
                                <Box sx={{
                                    padding: Theme.spacing.xl,
                                    backgroundColor: 'rgba(255, 99, 71, 0.1)', 
                                    borderRadius: Theme.corners.full,
                                }}>
                                    {/* These icons are the most likely to cause "Element type is invalid" on Web if not aliased */}
                                    {Platform.OS !== 'web' ? (
                                        <AlertTriangle size={64} color={Theme.colors.emberRed} />
                                    ) : (
                                        <RNText style={{ fontSize: 64 }}>⚠️</RNText>
                                    )}
                                </Box>

                                <Heading color={Theme.colors.sacredWhite} textAlign="center" size="2xl">
                                    Something went wrong
                                </Heading>

                                <Text color={Theme.colors.starlightGray} textAlign="center">
                                    We&apos;ve encountered an unexpected issue. The sanctuary is momentarily disrupted.
                                </Text>

                                <Button
                                    onPress={this.handleReset}
                                    size="lg"
                                    action="primary"
                                    sx={{
                                        backgroundColor: Theme.colors.emberRed,
                                        borderRadius: Theme.corners.comfortable,
                                    }}
                                >
                                    {Platform.OS !== 'web' && <ButtonIcon as={RefreshCw} color={Theme.colors.sacredWhite} />}
                                    <ButtonText color={Theme.colors.sacredWhite}>
                                        Try Again
                                    </ButtonText>
                                </Button>

                                {__DEV__ && this.state.error && (
                                    <Box sx={{
                                        padding: Theme.spacing.md,
                                        backgroundColor: Theme.colors.shroud,
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
    }
});
