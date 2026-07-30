import type React from 'react';
import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react';
import { Platform, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { Toast, ToastTitle } from '@repo/ui/components/ui/toast';
import { VStack } from '@repo/ui/components/ui/vstack';

/**
 * Toast State Excellence (2026 Standard)
 *
 * Implements a queue-based, high-performance feedback system.
 * Uses a reducer for atomic state transitions and rigorous memoization.
 */

type ToastType = 'success' | 'error' | 'info' | 'sanctuary' | 'warning';

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

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  }, []);

  const showToast = useCallback(
    ({ message, type = 'sanctuary', duration = 3000 }: Omit<ToastItem, 'id'>) => {
      const id = `toast-${counterRef.current++}`;
      dispatch({ type: 'ADD_TOAST', payload: { id, message, type, duration } });

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
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

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✨';
      case 'error':
        return '⚠️';
      case 'warning':
        return '🔸';
      case 'info':
        return 'ℹ️';
      case 'sanctuary':
        return '💫';
      default:
        return '💫';
    }
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <VStack
        className="absolute top-12 left-4 right-4 z-[1000] gap-2"
        style={{ pointerEvents: 'box-none' }}
      >
        {toasts.map((toast) => {
          const ToastContainer = Platform.OS === 'web' ? View : Animated.View;
          const toastProps =
            Platform.OS === 'web'
              ? ({ className: 'w-full', style: { pointerEvents: 'auto' } } as const)
              : ({
                  entering: FadeInUp,
                  exiting: FadeOutUp,
                  layout: Layout.springify(),
                  className: 'w-full',
                  style: { pointerEvents: 'auto' },
                } as const);

          return (
            <ToastContainer key={toast.id} {...toastProps}>
              <Toast action={mapTypeToVariant(toast.type)}>
                <VStack className="flex-1">
                  <ToastTitle>
                    {getIcon(toast.type)} {toast.message}
                  </ToastTitle>
                </VStack>
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
