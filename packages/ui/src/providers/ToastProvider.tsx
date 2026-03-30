import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Box, Text, VStack } from '../gluestack';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

type ToastType = 'success' | 'error' | 'info' | 'sanctuary';

interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<ToastOptions | null>(null);
    const colors = useThemedColors();
    // Track the active timer so rapid showToast calls don't leave orphaned timers
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clear the pending dismiss timer on unmount to prevent state updates after unmount
    useEffect(() => {
        return () => {
            if (timerRef.current !== null) clearTimeout(timerRef.current);
        };
    }, []);

    const showToast = useCallback(({ message, type = 'sanctuary', duration = 3000 }: ToastOptions) => {
        // Clear any in-flight dismiss timer before starting a fresh one
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
        }
        setToast({ message, type, duration });
        timerRef.current = setTimeout(() => {
            setToast(null);
            timerRef.current = null;
        }, duration);
    }, []);

    const getToastStyles = (type: ToastType) => {
        switch (type) {
            // Use semantic theme tokens (Zero Fallback Rule \u2014 no raw hex values)
            case 'success': return { bg: colors.success, icon: '\u2728' };
            case 'error': return { bg: colors.error, icon: '\u26A0\uFE0F' };
            case 'sanctuary': return { bg: Theme.colors.sanctuarySaffron, icon: '\uD83D\uDCAB' };
            default: return { bg: colors.tertiary, icon: '\u2139\uFE0F' };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}
            {children}
            {toast && (
                <Animated.View
                    entering={FadeInUp}
                    exiting={FadeOutUp}
                    style={{
                        position: 'absolute',
                        top: 60,
                        left: 20,
                        right: 20,
                        zIndex: 1000,
                    }}
                
                    <Box sx={{
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                        backgroundColor: getToastStyles(toast.type!).bg,
                        ...Theme.shadows.md
                    }}
                        <VStack sx={{ alignItems: 'center', gap: 4 }}
                            <Text sx={{ color: Theme.colors.sacredWhite, fontWeight: '700', textAlign: 'center' }}
                                {getToastStyles(toast.type!).icon} {toast.message}
                            </Text
                        </VStack
                    </Box
                </Animated.View
            )}
        </ToastContext.Provider
    );
};

export const useLotusToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useLotusToast must be used within ToastProvider (or SanctuaryProvider)');
    return context;
};

