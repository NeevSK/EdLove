import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import type { EmptyStateContract, ErrorStateContract } from '../../../theme/contracts';
import { Button } from '../Button/Button';
import { FeedbackScene } from '../FeedbackScene/FeedbackScene';
import { Text } from '../Text/Text';

const SCENE_SIZE = 176;

export interface EmptyStateProps extends EmptyStateContract {
  style?: StyleProp<ViewStyle>;
}

/**
 * Nothing here yet, said kindly, with the one thing that would change that.
 * Drawn over the world's perch, so an empty screen still feels like a place.
 */
export function EmptyState({ title, message, action, style }: EmptyStateProps) {
  return (
    <View style={[styles.wrap, style]}>
      <FeedbackScene state="empty" size={SCENE_SIZE} />
      <Text kind="title" align="center" role="heading">
        {title}
      </Text>
      {message ? (
        <Text kind="body" tone="soft" align="center">
          {message}
        </Text>
      ) : null}
      {action ? <Button label={action.label} onPress={action.onPress} variant="primary" /> : null}
    </View>
  );
}

export interface ErrorStateProps extends ErrorStateContract {
  style?: StyleProp<ViewStyle>;
}

/**
 * Something went wrong: what happened in plain words, and a way to try again
 * when trying again can help. Announced when it appears.
 */
export function ErrorState({ title, message, retry, style }: ErrorStateProps) {
  return (
    <View role="alert" style={[styles.wrap, style]}>
      <FeedbackScene state="error" size={SCENE_SIZE} />
      <Text kind="title" align="center" role="heading">
        {title}
      </Text>
      {message ? (
        <Text kind="body" tone="soft" align="center">
          {message}
        </Text>
      ) : null}
      {retry ? <Button label={retry.label} onPress={retry.onPress} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, paddingVertical: 24, paddingHorizontal: 16 },
});
