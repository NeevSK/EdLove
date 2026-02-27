import React, { createContext, useContext, useState, useCallback } from 'react';
import { Box, Text, VStack } from '../gluestack';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';;
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

    const showToast = useCallback(({ message, type = 'sanctuary', duration = 3000 }: ToastOptions) => {
        setToast({ message, type, duration });
        setTimeout(() => setToast(null), duration);
    }, []);

    const getToastStyles = (type: ToastType) => {
        switch (type) {
            case 'success': return { bg: '#10B981', icon: '✨' };
            case 'error': return { bg: '#EF4444', icon: '⚠️' };
            case 'sanctuary': return { bg: Theme.colors.sanctuarySaffron, icon: '🙏' };
            default: return { bg: colors.tertiary, icon: 'ℹ️' };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
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
                >
                    <Box sx={{
                        padding: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                        backgroundColor: getToastStyles(toast.type!).bg,
                        ...Theme.shadows.md
                    }}>
                        <VStack sx={{ alignItems: 'center', gap: 4 }}>
                            <Text sx={{ color: '#FFFFFF', fontWeight: '700', textAlign: 'center' }}>
                                {getToastStyles(toast.type!).icon} {toast.message}
                            </Text>
                        </VStack>
                    </Box>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

export const useLotusToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useLotusToast must be used within ToastProvider');
    return context;
};
