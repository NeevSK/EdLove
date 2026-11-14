import { openExternalURL } from '@repo/ui/utils/linking';
import React from 'react';
import { Pressable } from '@repo/ui/components/ui/pressable';
import { Text } from '@repo/ui/components/ui/text';
import { tokens } from '@repo/ui/tokens';
import { Platform } from 'react-native';

/**
 * Link Component
 *
 * Hardened primitive for navigational links.
 * Uses native <a> tag on Web to support inline text nesting and browser navigation,
 * and Pressable on Native.
 */
export const Link = ({
  children,
  href,
  onPress,
  className,
  isExternal = true,
  style,
  hitSlop: _hitSlop,
  accessibilityRole: _accessibilityRole,
  accessibilityLabel: _accessibilityLabel,
  activeOpacity: _activeOpacity,
  ...props
}: any) => {
  const handlePress = (e: any) => {
    if (onPress) {
      onPress(e);
      return;
    }

    if (href && isExternal) {
      void openExternalURL(href);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        aria-label={_accessibilityLabel}
        onClick={(e) => {
          if (onPress) {
            e.preventDefault();
            onPress(e);
          }
        }}
        className={`inline text-phase-accent hover:underline cursor-pointer ${className || ''}`}
        style={{
          color: tokens.colors.primary,
          cursor: 'pointer',
          textDecoration: 'underline',
          display: 'inline',
          ...style,
        }}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="link"
      className={`inline active:opacity-70 ${className || ''}`}
      style={style}
      {...props}
    >
      {children}
    </Pressable>
  );
};

export const LinkText = ({ children, className, style }: any) => (
  <Text
    className={`text-phase-accent font-medium ${Platform.OS === 'web' ? 'hover:underline' : ''} ${className || ''}`}
    style={[{ color: tokens.colors.primary }, style]}
  >
    {children}
  </Text>
);
