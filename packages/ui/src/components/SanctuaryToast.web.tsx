import { CircleAlert, CircleCheck, Info, X } from 'lucide-react-native/icons';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Pressable } from '../primitives';
import { Box } from './ui/box';
import { Text } from './ui/text';

export type ToastType = 'success' | 'error' | 'info';

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
        return { icon: CircleCheck, color: '#10B981' };
      case 'error':
        return { icon: CircleAlert, color: '#EF4444' };
      case 'info':
      default:
        return { icon: Info, color: '#F6BF8C' };
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
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 24,
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 999999,
      }}
    >
      <Box
        style={{
          backgroundColor: '#1C1917',
          borderWidth: 1,
          borderColor: 'rgba(246, 191, 140, 0.2)',
          borderRadius: 16,
          padding: 16,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        }}
      >
        <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon color={iconColor} size={24} />
          <Text style={{ color: '#FFFFFF', flex: 1, fontSize: 14, fontWeight: '500' }}>
            {message}
          </Text>
          <Pressable accessibilityRole="button" onPress={hide} className="p-1 active:opacity-60">
            <X size={18} color="#9CA3AF" />
          </Pressable>
        </Box>
      </Box>
    </View>
  );
}
