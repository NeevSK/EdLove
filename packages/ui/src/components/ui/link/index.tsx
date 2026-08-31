import React from 'react';
import { Platform, Text, TouchableOpacity } from 'react-native';
import { openExternalURL } from '@repo/ui/utils/linking';

/**
 * Link Component
 *
 * Hardened primitive for navigational links.
 * Uses native <a> tag on Web to support inline text nesting and browser navigation,
 * and TouchableOpacity on Native.
 */
export const Link = ({
  children,
  href,
  onPress,
  className,
  isExternal = true,
  style,
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
        onClick={(e) => {
          if (onPress) {
            e.preventDefault();
            onPress(e);
          }
        }}
        className={`inline text-phase-accent hover:underline cursor-pointer ${className || ''}`}
        style={{
          color: '#D4843A',
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
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole="link"
      activeOpacity={0.7}
      style={style}
      className={`inline ${className || ''}`}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export const LinkText = ({ children, className, style }: any) => (
  <Text
    className={`text-phase-accent font-medium ${Platform.OS === 'web' ? 'hover:underline' : ''} ${className || ''}`}
    style={[{ color: '#D4843A' }, style]}
  >
    {children}
  </Text>
);

