import { HStack } from '@repo/ui/components/ui/hstack';
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
import Animated, {
  FadeInUp,
  FadeOutUp,
  Layout,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info' | 'sanctuary' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  count: number;
  duration?: number;
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Omit<ToastItem, 'count'> }
  | { type: 'REMOVE_TOAST'; id: string };

interface ToastContextType {
  showToast: (options: Omit<ToastItem, 'id' | 'count'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function toastReducer(state: ToastItem[], action: ToastAction): ToastItem[] {
  switch (action.type) {
    case 'ADD_TOAST': {
      const existingIndex = state.findIndex(
        (t) => t.message === action.payload.message && t.type === action.payload.type,
      );

      if (existingIndex !== -1) {
        const nextState = [...state];
        const existing = nextState[existingIndex]!;
        nextState[existingIndex] = {
          ...existing,
          count: existing.count + 1,
          duration: action.payload.duration ?? existing.duration,
        };
        return nextState;
      }

      return [...state, { ...action.payload, count: 1 }];
    }
    case 'REMOVE_TOAST':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

function StackedToastItem({
  toast,
  index,
  total,
  onRemove,
  isReduceMotionEnabled,
}: {
  toast: ToastItem;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  isReduceMotionEnabled: boolean;
}) {
  const reverseIndex = total - 1 - index; // 0 for topmost/latest toast

  // Sonner 3D visual depth stacking transforms:
  // Topmost toast is full scale (1.0). Older toasts shrink down and shift up into background stack.
  const scale = reverseIndex === 0 ? 1 : Math.max(0.85, 1 - reverseIndex * 0.05);
  const translateYOffset = reverseIndex === 0 ? 0 : -reverseIndex * 8;
  const opacity = reverseIndex > 3 ? 0 : 1 - reverseIndex * 0.2;

  const animatedStyle = useAnimatedStyle(() => {
    if (isReduceMotionEnabled) return { opacity };
    return {
      transform: [
        { translateY: withSpring(translateYOffset, { damping: 18, stiffness: 120 }) },
        { scale: withSpring(scale, { damping: 18, stiffness: 120 }) },
      ],
      opacity: withSpring(opacity),
    };
  }, [reverseIndex, isReduceMotionEnabled]);

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

  const Container = (Platform.OS === 'web' ? View : Animated.View) as any;
  const animProps =
    Platform.OS === 'web'
      ? ({ className: 'w-full', style: { pointerEvents: 'auto' } } as const)
      : ({
          entering: isReduceMotionEnabled ? undefined : FadeInUp,
          exiting: isReduceMotionEnabled ? undefined : FadeOutUp,
          layout: isReduceMotionEnabled ? undefined : Layout.springify(),
          className: 'w-full',
          style: [{ pointerEvents: 'auto' }, animatedStyle] as any,
        } as const);

  return (
    <Container {...animProps}>
      <Toast action={mapTypeToVariant(toast.type)}>
        <HStack className="flex-1 items-center gap-2">
          <ToastTitle>{toast.message}</ToastTitle>

          {toast.count > 1 && (
            <View className="bg-red-500/20 border border-red-500/40 px-2 py-0.5 rounded-full">
              <Text className="text-xs font-bold text-red-300">×{toast.count}</Text>
            </View>
          )}
        </HStack>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          accessibilityHint="Closes this notification"
          onPress={() => onRemove(toast.id)}
          className="p-1 active:opacity-60"
        >
          <Text style={{ color: '#D8D0C3', fontSize: 18, lineHeight: 20 }}>×</Text>
        </Pressable>
      </Toast>
    </Container>
  );
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
    ({ message, type = 'sanctuary', duration = 4000 }: Omit<ToastItem, 'id' | 'count'>) => {
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

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <VStack
        className="absolute left-4 right-4 z-[1000] gap-2"
        style={{ top: Math.max(insets.top + 12, 24), pointerEvents: 'box-none' }}
      >
        {toasts.map((toast, index) => (
          <StackedToastItem
            key={toast.id}
            toast={toast}
            index={index}
            total={toasts.length}
            onRemove={removeToast}
            isReduceMotionEnabled={isReduceMotionEnabled}
          />
        ))}
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
