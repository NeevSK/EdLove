import { Pressable, StyleSheet } from 'react-native';
import { useWorld } from '../../../theme/native/WorldContext';

/**
 * The world's veil over the screen behind a dialog or sheet. Pressing it
 * dismisses when the overlay allows; it is not itself announced (the overlay's
 * own dismiss paths are: back, Escape, the close action).
 */
export function Scrim({ onPress }: { onPress?: () => void }) {
  const scrim = useWorld().recipes.overlay.scrim;
  return (
    <Pressable
      accessible={false}
      importantForAccessibility="no"
      onPress={onPress}
      style={[StyleSheet.absoluteFill, { backgroundColor: scrim }]}
      testID="overlay-scrim"
    />
  );
}
