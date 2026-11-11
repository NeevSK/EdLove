import { Modal, StyleSheet, View } from 'react-native';
import type { DialogContract } from '../../../theme/contracts';
import { useWorldMotion } from '../../../theme/native/motion';
import { useWorld } from '../../../theme/native/WorldContext';
import { InnerFrame, surfaceStyle } from '../Surface/Surface';
import { Text } from '../Text/Text';
import { Scrim } from './Scrim';
import { KeypadHost, useKeypadSpace } from '../Keyboard/Keypad';

export type DialogProps = DialogContract;

/**
 * A short, focused question or message over the screen. The panel is the
 * world's raised surface (its frame, corners and shadow); the veil is the
 * world's scrim. Android back and the backdrop dismiss unless `dismissable`
 * is false, when only an action can close it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  dismissable = true,
}: DialogProps) {
  const panel = useWorld().recipes.overlay.panel;
  const { animates } = useWorldMotion();
  const dismiss = dismissable ? onClose : undefined;
  // A dialog sits above the app, so it carries its own keypad and moves aside for it.
  const pad = useKeypadSpace();

  return (
    <Modal
      visible={open}
      transparent
      statusBarTranslucent
      animationType={animates ? 'fade' : 'none'}
      onRequestClose={() => dismiss?.()}
    >
      <View
        style={[
          styles.center,
          { paddingBottom: pad.bottom, paddingLeft: pad.left, paddingRight: pad.right },
        ]}
      >
        <Scrim onPress={dismiss} />
        <View
          role="dialog"
          aria-modal
          aria-label={title}
          accessibilityViewIsModal
          style={[surfaceStyle(panel), styles.panel]}
        >
          <InnerFrame recipe={panel} />
          <Text kind="title" role="heading">
            {title}
          </Text>
          {description ? (
            <Text kind="body" tone="soft">
              {description}
            </Text>
          ) : null}
          {children}
          {actions ? <View style={styles.actions}>{actions}</View> : null}
        </View>
      </View>
      <KeypadHost />
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { width: '100%', maxWidth: 420, gap: 12 },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
});
