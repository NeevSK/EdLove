import { type FC, useState } from 'react';
import { Platform } from 'react-native';
import { EaseView } from 'react-native-ease';
import { Box, Pressable, Text, VStack } from '@repo/ui/gluestack';

interface SanctuaryCardProps {
  title?: string;
  children: any;
  footer?: any;
  onPress?: () => void;
  onLongPress?: () => void;
  href?: string;
  target?: '_blank' | '_self';
  elevated?: boolean;
  style?: any;
  accessibilityLabel?: string;
  className?: string;
}

const LIFT_SCALE_NORMAL = 1.0;
const LIFT_SCALE_PRESSED = 1.02;

const SanctuaryCard: FC<SanctuaryCardProps> = ({
  title,
  children,
  footer,
  onPress,
  onLongPress,
  href,
  target = '_self',
  elevated = false,
  style,
  accessibilityLabel,
  className,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    if (onPress || href) setPressed(true);
  };

  const handlePressOut = () => {
    if (onPress || href) setPressed(false);
  };

  const content = (
    <EaseView
      animate={(onPress || href) ? { scale: pressed ? LIFT_SCALE_PRESSED : LIFT_SCALE_NORMAL } : undefined}
      transition={(onPress || href) ? { type: 'spring', damping: 15, stiffness: 150 } : undefined}
      style={style}
      className={`
                bg-phase-surface border border-phase-interactive/20 rounded-3xl overflow-hidden
                ${elevated ? 'shadow-xl' : ''}
                ${hovered && Platform.OS === 'web' ? 'opacity-95' : ''}
                ${className || ''}
            `}
    >
      <VStack className="p-6">
        {title && <Text className="text-xl font-bold text-phase-text-primary mb-4">{title}</Text>}
        <Box className="gap-4">{children}</Box>
        {footer && (
          <VStack className="mt-4 gap-4">
            <Box className="h-px bg-white/5 opacity-30" />
            {footer}
          </VStack>
        )}
      </VStack>
    </EaseView>
  );

  if (onPress || href) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
        onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
        accessibilityRole={href ? 'link' : 'button'}
        accessibilityLabel={accessibilityLabel}
        href={href}
        hrefAttrs={{
          target: target,
          rel: target === '_blank' ? 'noopener noreferrer' : undefined,
        }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

export { SanctuaryCard, SanctuaryCard as Card };
