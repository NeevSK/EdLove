/**
 * A page outside the rooms (Reading, Companions): the world's floor quiet behind it, a working
 * header under the status bar with back, and a readable column that centres on a tablet.
 */

import { AppHeader, useFloorPresence } from '@repo/ui/components/native';
import { ChevronLeft } from '@repo/ui/icons/native';
import { shellLayoutOf, type KitIconProps } from '@repo/ui/theme';
import { useWorld } from '@repo/ui/theme/native';
import { router } from 'expo-router';
import type { ComponentType, ReactNode } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function PageFrame({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  useFloorPresence('quiet');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const layout = shellLayoutOf(width);
  const t = useWorld().tokens;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.ground }}>
        <AppHeader
          title={title}
          eyebrow={eyebrow}
          compact
          ruled
          leading={{
            kind: 'back',
            label: 'Back',
            onPress: () => (router.canGoBack() ? router.back() : router.replace('/self')),
          }}
          icons={{ back: ChevronLeft as ComponentType<KitIconProps> }}
        />
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
          gap: 22,
          width: '100%',
          maxWidth: layout.readable,
          alignSelf: 'center',
        }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
