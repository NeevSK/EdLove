import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Box } from '../components/ui/box';
import { Text } from '../components/ui/text';
import { VStack } from '../components/ui/vstack';
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
            case 'success': return { bg: 'bg-phase-reward', icon: '✨' };
            case 'error': return { bg: 'bg-phase-danger', icon: '⚠️' };
            case 'sanctuary': return { bg: 'bg-phase-accent', icon: '💫' };
            default: return { bg: 'bg-phase-surface', icon: 'ℹ️' };
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
                    <Box 
                        className={`p-4 rounded-xl border border-white/10 shadow-xl ${getToastStyles(toast.type!).bg}`}
                    >
                        <VStack className="items-center gap-1">
                            <Text className="text-white font-bold text-center">
                                {getToastStyles(toast.type!).icon} {toast.message}
                            </Text>
                        </VStack>
                    </Box>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

export const useSanctuaryToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useSanctuaryToast must be used within ToastProvider (or SanctuaryProvider)');
    return context;
};
