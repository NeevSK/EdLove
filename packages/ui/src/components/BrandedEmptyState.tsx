import { tokens } from '@repo/ui/tokens';
import React from 'react';
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { FireflyFeedbackScene } from './FireflyFeedbackScene';

export type BrandedEmptyStateProps = {
  title: string;
  message?: string;
  /** Adds a slow, optional web glow without changing the state meaning. */
  subtle?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** An invitation to take the first useful action, never a disguised failure. */
export function BrandedEmptyState({
  title,
  message,
  subtle = false,
  children,
  className,
  style,
}: BrandedEmptyStateProps) {
  return (
    <View className={className} style={[styles.wrap, style]}>
      <FireflyFeedbackScene animate={subtle} state="empty" />
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>A CLEAR PLACE TO BEGIN</Text>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.xxl,
  },
  copy: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
    maxWidth: tokens.layout.pageFrame.stateMessageMaxWidth,
  },
  eyebrow: {
    ...tokens.typography.roles.label,
    color: tokens.colors.primary,
    letterSpacing: 1.1,
  },
  title: {
    ...tokens.typography.roles.sectionTitle,
    color: tokens.semantic.text.primary,
    textAlign: 'center',
  },
  message: {
    ...tokens.typography.roles.body,
    color: tokens.semantic.text.secondary,
    textAlign: 'center',
  },
  actions: {
    marginTop: tokens.spacing.lg,
    minHeight: tokens.interaction.minTouchTarget,
  },
});
