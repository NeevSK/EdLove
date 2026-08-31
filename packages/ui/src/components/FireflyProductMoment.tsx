import { tokens } from '@repo/ui/tokens';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FireflyFeedbackScene } from './FireflyFeedbackScene';
import type { MascotArtworkSource } from './Mascot';

export type FireflyProductMomentKind = 'coming-soon' | 'pro' | 'onboarding' | 'explore';

type MomentDefinition = {
  eyebrow: string;
  sceneState: 'empty' | 'loading' | 'success';
};

const momentDefinitions: Record<FireflyProductMomentKind, MomentDefinition> = {
  'coming-soon': { eyebrow: 'A NEW PATH IS GROWING', sceneState: 'empty' },
  pro: { eyebrow: 'A DEEPER SANCTUARY', sceneState: 'success' },
  onboarding: { eyebrow: 'YOUR FIRST STEPS', sceneState: 'loading' },
  explore: { eyebrow: 'FOLLOW THE LIGHT', sceneState: 'empty' },
};

export type FireflyProductMomentProps = {
  kind: FireflyProductMomentKind;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  step?: number;
  totalSteps?: number;
  artwork?: MascotArtworkSource;
  testID?: string;
};

/** A reusable product moment for discovery, access, and first-use guidance. */
export function FireflyProductMoment({
  kind,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  step,
  totalSteps,
  artwork,
  testID,
}: FireflyProductMomentProps) {
  const definition = momentDefinitions[kind];
  const hasProgress = kind === 'onboarding' && step !== undefined && totalSteps !== undefined;

  return (
    <View
      accessible
      accessibilityLabel={`${definition.eyebrow}: ${title}`}
      style={styles.wrap}
      testID={testID}
    >
      <FireflyFeedbackScene
        artwork={artwork}
        animate={kind === 'onboarding'}
        state={definition.sceneState}
      />
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{definition.eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {hasProgress ? (
          <Text
            accessibilityLabel={`Onboarding step ${step} of ${totalSteps}`}
            style={styles.progress}
          >
            {step} of {totalSteps}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={secondaryActionLabel}
          onPress={onSecondaryAction}
          style={styles.secondaryAction}
        >
          <Text style={styles.secondaryActionLabel}>{secondaryActionLabel}</Text>
        </Pressable>
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
  progress: {
    ...tokens.typography.roles.label,
    color: tokens.semantic.text.secondary,
  },
  action: {
    alignItems: 'center',
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radii.md,
    marginTop: tokens.spacing.lg,
    minHeight: tokens.interaction.minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
  actionPressed: { opacity: 0.82 },
  actionLabel: { ...tokens.typography.roles.label, color: tokens.colors.textInverse },
  secondaryAction: {
    minHeight: tokens.interaction.minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.md,
  },
  secondaryActionLabel: { ...tokens.typography.roles.label, color: tokens.colors.primary },
});
