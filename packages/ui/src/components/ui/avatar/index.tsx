import { cssInterop } from 'nativewind';
import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import { Text, View, type ViewProps } from 'react-native';
import { Image } from '../image';

cssInterop(View, { className: 'style' });
cssInterop(Text, { className: 'style' });

/**
 * Avatar Component
 *
 * A high-impact identity primitive.
 * Hardened for consistent sizing, fallbacks, and design system fidelity.
 */

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarContextType {
  size: AvatarSize;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

function useAvatar() {
  const context = useContext(AvatarContext);
  if (!context) throw new Error('useAvatar must be used within an Avatar component');
  return context;
}

export const Avatar = ({
  children,
  className,
  size = 'md',
  ...props
}: {
  size?: AvatarSize;
  children?: React.ReactNode;
  className?: string;
} & ViewProps) => {
  const sizeMap: Record<AvatarSize, string> = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  };

  const contextValue = useMemo(() => ({ size }), [size]);

  return (
    <AvatarContext.Provider value={contextValue}>
      <View
        {...props}
        className={`relative overflow-hidden rounded-full bg-phase-surface border border-phase-interactive/10 items-center justify-center ${sizeMap[size] || sizeMap.md} ${className || ''}`}
      >
        {children}
      </View>
    </AvatarContext.Provider>
  );
};

export const AvatarFallbackText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { size } = useAvatar();

  const fontSizeMap: Record<AvatarSize, string> = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl',
    '2xl': 'text-3xl',
  };

  return (
    <Text
      className={`font-bold text-phase-text-primary tracking-tighter ${fontSizeMap[size] || fontSizeMap.md} ${className || ''}`}
    >
      {children}
    </Text>
  );
};

export const AvatarImage = ({ source, className }: any) => (
  <Image
    source={source}
    className={`w-full h-full absolute inset-0 ${className || ''}`}
    resizeMode="cover"
  />
);

Avatar.displayName = 'Avatar';
AvatarFallbackText.displayName = 'AvatarFallbackText';
AvatarImage.displayName = 'AvatarImage';

export { Avatar as default };
