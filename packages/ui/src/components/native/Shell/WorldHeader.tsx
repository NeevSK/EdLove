/**
 * The shell's header, worn by the world. It sits under the status bar (never over it), on a soft
 * wash of the world's ground so its words keep their contrast over the living floor, and it takes
 * one of three layouts the person chooses:
 *
 * - greeting: the person's photo, "Good evening, Neev" and the room's name, large. The home look.
 * - compact: one line, the photo small and the room's name; more of the floor shows.
 * - classic: the room's name on the left and every control on the right, the photo last.
 *
 * Inside a room (posture `inside`) every layout becomes the same working header: back, the
 * screen's title over the room's name, and the help and notification buttons.
 *
 * Held sideways on a phone (`hud`), the photo, help and bell move onto the rail: at a room's front
 * the header is gone (only the task strip stays), and inside a room it is one line, back and title.
 *
 * The photo opens the person's "You" sheet (settings, world, reading, help live there). The help
 * button is Tutii or a plain AI button, while the two are being compared. Notifications always stay.
 */

import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { alpha } from '../../../theme/color';
import type { HeaderAction, KitIconProps } from '../../../theme/contracts';
import { useWorld } from '../../../theme/native/WorldContext';
import { AppHeader, HeaderAvatar } from './AppHeader';

export type WorldHeaderLayout = 'greeting' | 'compact' | 'classic';

export interface WorldHeaderProps {
  layout: WorldHeaderLayout;
  /** `home` on a room's front screen, `inside` on any screen within it. */
  posture: 'home' | 'inside';
  /** The room's name ("Self", "Classroom"). */
  room: string;
  /** The screen's title inside a room. */
  title?: string;
  /** "Good evening, Neev": shown by the greeting layout at home. */
  greeting?: string;
  person: { name: string; src?: string };
  /** Opens the person's "You" sheet. */
  onYou: () => void;
  onBack?: () => void;
  backLabel?: string;
  notifications: {
    count: number;
    label: string;
    countLabel?: string;
    onPress: () => void;
    icon: ComponentType<KitIconProps>;
  };
  /** Tutii or the AI button; left out where the person has turned help off. */
  assistant?: { label: string; icon: ComponentType<KitIconProps>; onPress: () => void };
  /** The workspace's perspective ("Grade 7 B"), switchable. */
  perspective?: { label: string; switchLabel?: string; onPress?: () => void };
  /** Anything that belongs under the header (task tabs). */
  below?: React.ReactNode;
  icons?: { back?: ComponentType<KitIconProps> };
  /** Draw no wash (a screen that paints its own top). */
  bare?: boolean;
  /** The rail carries the photo, help and bell (a phone on its side). */
  hud?: boolean;
}

export function WorldHeader({
  layout,
  posture,
  room,
  title,
  greeting,
  person,
  onYou,
  onBack,
  backLabel = 'Back',
  notifications,
  assistant,
  perspective,
  below,
  icons,
  bare = false,
  hud = false,
}: WorldHeaderProps) {
  const world = useWorld();
  const insets = useSafeAreaInsets();
  const t = world.tokens;
  const inside = posture === 'inside';

  const actions: HeaderAction[] = [];
  if (assistant)
    actions.push({
      key: 'assistant',
      label: assistant.label,
      icon: assistant.icon,
      onPress: assistant.onPress,
    });
  actions.push({
    key: 'notifications',
    label: notifications.label,
    icon: notifications.icon,
    onPress: notifications.onPress,
    badge: notifications.count > 0 ? notifications.count : undefined,
    badgeLabel:
      notifications.count > 0
        ? (notifications.countLabel ?? `${notifications.count} unread`)
        : undefined,
  });

  const avatar = {
    name: person.name,
    src: person.src,
    label: `${person.name}: you, settings and help`,
    onPress: onYou,
  };
  const classic = layout === 'classic' && !inside;

  if (hud && !inside && !perspective) {
    // At a room's front, held sideways: no header row; the task strip alone, under a thin wash.
    // (The workspace keeps one line, for its perspective switch.)
    return below ? (
      <View
        style={[
          { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right },
          bare ? null : { backgroundColor: alpha(t.ground, 0.72) },
        ]}
      >
        {below}
      </View>
    ) : (
      <View style={{ height: insets.top }} />
    );
  }

  // The wash: the world's ground, strong at the top where the status bar sits, gone at the bottom,
  // so the header reads over any scene and the floor still shows through.
  const wash = bare
    ? undefined
    : {
        backgroundImage: `linear-gradient(to bottom, ${alpha(t.ground, inside ? 0.94 : 0.82)} 0%, ${alpha(t.ground, inside ? 0.86 : 0.5)} 70%, ${alpha(t.ground, inside ? 0.7 : 0)} 100%)`,
      };

  return (
    <View
      style={[
        { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right },
        wash as object,
      ]}
    >
      <AppHeader
        title={inside ? (title ?? room) : room}
        eyebrow={inside ? room : layout === 'greeting' && !hud ? greeting : undefined}
        compact={layout === 'compact' || inside || hud}
        leading={inside && onBack ? { kind: 'back', label: backLabel, onPress: onBack } : undefined}
        avatar={inside || classic || hud ? undefined : avatar}
        perspective={
          perspective ? { ...perspective, beside: layout !== 'greeting' || inside } : undefined
        }
        actions={hud ? [] : actions}
        trailing={
          classic && !hud ? (
            <View style={styles.trailingAvatar}>
              <HeaderAvatar {...avatar} />
            </View>
          ) : undefined
        }
        ruled={inside}
        icons={icons}
      />
      {below}
    </View>
  );
}

const styles = StyleSheet.create({
  trailingAvatar: { marginLeft: 4 },
});
