import { tokens } from '@repo/ui/tokens';
import React from 'react';
import { type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { FireflyFeedbackScene } from './FireflyFeedbackScene';

export type ErrorStateProps = {
  title: string;
  message?: string;
  /** Usually a direct recovery action such as "Try again". */
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** A recoverable interruption with a visible route back to the next action. */
export function ErrorState({ title, message, children, className, style }: ErrorStateProps) {
  return (
    <View accessibilityRole="alert" className={className} style={[styles.wrap, style]}>
      <FireflyFeedbackScene state="error" />
      <View style={styles.copy}>
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
