import { Text } from '@repo/ui/components/ui/text';
import { Toast, ToastTitle } from '@repo/ui/components/ui/toast';
import { VStack } from '@repo/ui/components/ui/vstack';
import { useAccessibility } from '@repo/ui/hooks/useAccessibility';
import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

/**
 * Toast State Excellence (2026 Standard)
 *
 * Implements a queue-based, high-performance feedback system.
 * Uses a reducer for atomic state transitions and rigorous memoization.
 */

export type ToastType = 'success' | 'error' | 'info' | 'sanctuary' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastAction = { type: 'ADD_TOAST'; payload: ToastItem } | { type: 'REMOVE_TOAST'; id: string };

interface ToastContextType {
  showToast: (options: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function toastReducer(state: ToastItem[], action: ToastAction): ToastItem[] {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.payload];
    case 'REMOVE_TOAST':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const counterRef = useRef(0);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const { isReduceMotionEnabled } = useAccessibility();

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  const showToast = useCallback(
    ({ message, type = 'sanctuary', duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `toast-${counterRef.current++}`;
      const readableDuration = Math.max(2500, Math.min(duration, 10000));
      dispatch({ type: 'ADD_TOAST', payload: { id, message, type, duration: readableDuration } });

      const timer = setTimeout(() => {
        removeToast(id);
      }, readableDuration);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    },
    [],
  );

  const contextValue = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);

  const mapTypeToVariant = (
    type: ToastType,
  ): 'success' | 'error' | 'warning' | 'info' | 'attention' => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'sanctuary':
        return 'attention';
      default:
        return 'attention';
    }
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <VStack
        className="absolute left-4 right-4 z-[1000] gap-2"
        style={{ top: Math.max(insets.top + 12, 24), pointerEvents: 'box-none' }}
      >
        {toasts.map((toast) => {
          const ToastContainer = Platform.OS === 'web' ? View : Animated.View;
          const toastProps =
            Platform.OS === 'web'
              ? ({ className: 'w-full', style: { pointerEvents: 'auto' } } as const)
              : ({
                  entering: isReduceMotionEnabled ? undefined : FadeInUp,
                  exiting: isReduceMotionEnabled ? undefined : FadeOutUp,
                  layout: isReduceMotionEnabled ? undefined : Layout.springify(),
                  className: 'w-full',
                  style: { pointerEvents: 'auto' },
                } as const);

          return (
            <ToastContainer key={toast.id} {...toastProps}>
              <Toast action={mapTypeToVariant(toast.type)}>
                <VStack className="flex-1">
                  <ToastTitle>{toast.message}</ToastTitle>
                </VStack>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss notification"
                  accessibilityHint="Closes this notification"
                  onPress={() => removeToast(toast.id)}
                  className="p-1 active:opacity-60"
                >
                  <Text style={{ color: '#D8D0C3', fontSize: 18, lineHeight: 20 }}>×</Text>
                </Pressable>
              </Toast>
            </ToastContainer>
          );
        })}
      </VStack>
    </ToastContext.Provider>
  );
};

export const useSanctuaryToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useSanctuaryToast must be used within ToastProvider');

  return useMemo(
    () => ({
      ...context,
      showToast: (options: { message: string; type?: ToastType; duration?: number }) =>
        context.showToast({
          type: 'sanctuary',
          ...options,
        } as ToastItem),
    }),
    [context],
  );
};

export { useSanctuaryToast as useToast };
