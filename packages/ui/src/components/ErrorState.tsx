import { tokens } from '@repo/ui/tokens';
import type React from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from '../world/native/Text';
import { FireflyFeedbackScene } from './FireflyFeedbackScene';

export type ErrorStateProps = {
  title: string;
  message?: string;
  /** Usually a direct recovery action such as "Try again". */
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * A recoverable interruption with a visible route back to the next action.
 * Plain on purpose: the world's type and ink, no ornament and no motion, so
 * the words are the clearest thing on the screen.
 */
export function ErrorState({ title, message, children, className, style }: ErrorStateProps) {
  return (
    <View accessibilityRole="alert" className={className} style={[styles.wrap, style]}>
      <FireflyFeedbackScene state="error" />
      <View style={styles.copy}>
        <Text kind="title" align="center">
          {title}
        </Text>
        {message ? (
          <Text kind="body" tone="soft" align="center">
            {message}
          </Text>
        ) : null}
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
  actions: {
    marginTop: tokens.spacing.lg,
    minHeight: tokens.interaction.minTouchTarget,
  },
});
