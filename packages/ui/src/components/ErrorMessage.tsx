/**
 * ERROR MESSAGE - Reusable Error/Warning/Info Message Component
 * Hardened v3 implementation.
 */

import { CircleAlert, Info, TriangleAlert, X } from '@repo/ui/icons';
import type { FC } from 'react';
import { HStack, Pressable, Text, View } from '@repo/ui/primitives';
import { cn } from '@repo/ui/utils/classNames';

interface ErrorMessageProps {
  message: string;
  type?: 'gentle' | 'warning' | 'severe';
  onDismiss?: () => void;
}

const ErrorMessage: FC<ErrorMessageProps> = ({ message, type = 'gentle', onDismiss }) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'gentle':
        return {
          containerClass: 'bg-phase-surface',
          textClass: 'text-phase-text-primary',
          Icon: Info,
        };
      case 'warning':
        return {
          containerClass: 'bg-phase-accent/20 border border-phase-accent/30',
          textClass: 'text-phase-accent',
          Icon: TriangleAlert,
        };
      case 'severe':
        return {
          containerClass: 'bg-phase-danger/10 border border-phase-danger/20',
          textClass: 'text-phase-danger',
          Icon: CircleAlert,
        };
    }
  };

  const { containerClass, textClass, Icon } = getTypeConfig();

  return (
    <View className={cn('p-4 rounded-xl mb-4', containerClass)}>
      <HStack space="md" className="items-center">
        {/* Icon */}
        <Icon color="currentColor" className={textClass} size={20} />

        {/* Message Text */}
        <Text className={cn('flex-1 text-base leading-6', textClass)}>{message}</Text>

        {/* Dismiss Button (X) */}
        {onDismiss && (
          <Pressable accessibilityRole="button" onPress={onDismiss} className="p-1">
            <X color="currentColor" className={textClass} size={20} />
          </Pressable>
        )}
      </HStack>
    </View>
  );
};

export default ErrorMessage;
