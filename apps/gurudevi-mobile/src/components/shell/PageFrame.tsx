/**
 * A page outside the rooms (Reading, Companions): the world's floor quiet behind it, a working
 * header under the status bar with back, and a readable column that centres on a tablet.
 */

import {
  AppHeader,
  useFloorPresence,
  useKeypadSpace,
  useShellLayout,
} from '@repo/ui/components/native';
import { ChevronLeft } from '@repo/ui/icons/native';
import type { KitIconProps } from '@repo/ui/theme';
import { useWorld } from '@repo/ui/theme/native';
import type { ComponentType, ReactNode } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigator } from '@repo/ui/components/native/navigation';

export function PageFrame({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  const router = useNavigator();
  useFloorPresence('quiet');
  const insets = useSafeAreaInsets();
  // Width, height and the cutouts on both sides: the column holds its reading width either way up.
  const layout = useShellLayout();
  // The focused field scrolls clear of the keyboard and its typing bar, or of our keypad.
  const pad = useKeypadSpace();
  const t = useWorld().tokens;
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          backgroundColor: t.ground,
        }}
      >
        <AppHeader
          title={title}
          eyebrow={eyebrow}
          compact
          ruled
          leading={{
            kind: 'back',
            label: 'Back',
            onPress: () => router.back('/self'),
          }}
          icons={{ back: ChevronLeft as ComponentType<KitIconProps> }}
        />
      </View>
      <KeyboardAwareScrollView
        bottomOffset={64}
        contentContainerStyle={{
          paddingLeft: layout.gutter + insets.left + pad.left,
          paddingRight: layout.gutter + insets.right + pad.right,
          paddingTop: layout.rhythm.top + 2,
          paddingBottom: insets.bottom + 40 + pad.bottom,
          gap: layout.rhythm.gap,
          width: '100%',
          maxWidth: layout.readable,
          alignSelf: 'center',
        }}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}
