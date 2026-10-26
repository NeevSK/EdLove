import { tokens } from '@repo/ui/tokens';
import type React from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { WorldEnter } from '../world/native/motion';
import { Text } from '../world/native/Text';
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

/**
 * An invitation to take the first useful action, never a disguised failure.
 * Tutii rests on the world's perch; the words arrive the way the world moves.
 */
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
      <WorldEnter style={styles.copy}>
        <Text kind="label" tone="lamp">
          A CLEAR PLACE TO BEGIN
        </Text>
        <Text kind="title" align="center">
          {title}
        </Text>
        {message ? (
          <Text kind="body" tone="soft" align="center">
            {message}
          </Text>
        ) : null}
      </WorldEnter>
      {children ? (
        <WorldEnter index={1} style={styles.actions}>
          {children}
        </WorldEnter>
      ) : null}
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
