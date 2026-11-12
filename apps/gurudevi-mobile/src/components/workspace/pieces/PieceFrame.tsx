import { Badge, Stack, Surface, Text } from '@repo/ui/components/native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export interface PieceFrameProps {
  title: string;
  /** A short count beside the title ("3 waiting"), lit when it asks for attention. */
  badge?: { label: string; attention?: boolean };
  /** One line under the title. */
  summary?: string;
  /** Opens the piece's own screen. Leave out while it has none: the piece is then not a button. */
  onOpen?: () => void;
  children?: ReactNode;
}

/**
 * The frame every work-room piece shares: a raised surface, its name as a
 * heading, an optional count and a one-line summary. A piece that opens
 * something is one button named after it; one that does not is plain content.
 */
export function PieceFrame({ title, badge, summary, onOpen, children }: PieceFrameProps) {
  const head = (
    <View style={styles.head}>
      <Text kind="label" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {badge ? <Badge label={badge.label} tone={badge.attention ? 'lamp' : 'neutral'} /> : null}
    </View>
  );
  const body = (
    <Stack gap="inside">
      {head}
      {summary ? (
        <Text kind="body" tone="soft">
          {summary}
        </Text>
      ) : null}
      {children}
    </Stack>
  );
  return (
    <Surface tone="raised" style={styles.frame}>
      {onOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={[title, badge?.label, summary].filter(Boolean).join(', ')}
          onPress={onOpen}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          {body}
        </Pressable>
      ) : (
        body
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  frame: { padding: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1 },
});
