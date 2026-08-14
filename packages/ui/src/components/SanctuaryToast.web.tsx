import { CircleAlert, CircleCheck, Info, X } from '@repo/ui/icons';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Pressable } from '@repo/ui/primitives';
import { Box } from '@repo/ui/components/ui/box';
import { Text } from '@repo/ui/components/ui/text';
import { tokens } from '@repo/ui/tokens';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface SanctuaryToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export default function SanctuaryToast({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3000,
}: SanctuaryToastProps) {
  const getIconData = () => {
    switch (type) {
      case 'success':
        return { icon: CircleCheck, color: tokens.colors.success };
      case 'error':
        return { icon: CircleAlert, color: tokens.colors.error };
      case 'info':
      default:
        return { icon: Info, color: tokens.colors.info };
      case 'warning':
        return { icon: CircleAlert, color: tokens.colors.warning };
    }
  };

  const { icon: Icon, color: iconColor } = getIconData();

  const hide = useCallback(() => {
    onHide();
  }, [onHide]);

  useEffect(() => {
    if (!visible) return;

    const timer = window.setTimeout(() => {
      hide();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [visible, hide, duration]);

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 24,
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 999999,
        pointerEvents: 'box-none',
      }}
    >
      <Box
        style={{
          backgroundColor: tokens.colors.toastSurface,
          borderWidth: 1,
          borderColor: tokens.colors.toastBorder,
          borderRadius: 16,
          padding: 16,
          width: '100%',
          maxWidth: 420,
          boxShadow: tokens.colors.toastShadow,
        }}
      >
        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon color={iconColor} size={24} />
          <Text style={{ color: tokens.colors.toastText, flex: 1, fontSize: 14, fontWeight: '500' }}>
            {message}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            accessibilityHint="Closes this notification"
            onPress={hide}
            className="p-1 active:opacity-60"
          >
            <X size={18} color={tokens.colors.toastTextMuted} />
          </Pressable>
        </Box>
      </Box>
    </View>
  );
}
