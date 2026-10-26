import { typeStyle, useWorldContext } from '@repo/ui/world/native';
import { NativeTabs } from 'expo-router/native-tabs';
import type { ReactNode } from 'react';
import { View } from 'react-native';

/** The five tabs, in the same order and with the same names as the custom tab bar. */
const TABS = [
  { name: 'library', title: 'Library', sf: 'books.vertical', md: 'local_library' },
  { name: 'workspace', title: 'Workspace', sf: 'graduationcap', md: 'school' },
  { name: 'self', title: 'Self', sf: 'heart', md: 'favorite' },
  { name: 'community', title: 'Community', sf: 'person.3', md: 'groups' },
  { name: 'profile', title: 'Profile', sf: 'person.crop.circle', md: 'person' },
] as const;

export interface NativeShellTabsProps {
  /** The same header the custom tabs draw, or null while it is hidden on scroll. */
  header: ReactNode;
  onTabPress: (tab: string) => void;
  showLabels?: boolean;
}

/**
 * Variant B of the tab shell: the system tab bar (`NativeTabs`, stable in Expo SDK 58), dressed
 * in the active world's ground, ink and label face. Inactive tabs stop drawing
 * (`activityEnabled`). Long-press on a tab (the feature catalog) has no native equivalent here.
 */
export function NativeShellTabs({ header, onTabPress, showLabels = true }: NativeShellTabsProps) {
  const { world, language } = useWorldContext();
  const t = world.tokens;
  const face = typeStyle(world.recipes.text.label, language, world).fontFamily;
  const label = { fontFamily: face, fontSize: 12 };

  return (
    <View style={{ flex: 1, backgroundColor: t.ground }}>
      {header}
      <NativeTabs
        activityEnabled
        backgroundColor={t.ground}
        tintColor={t.ink}
        iconColor={{ default: t.inkSoft, selected: t.ink }}
        indicatorColor={t.sunken}
        rippleColor={t.sunken}
        labelStyle={{
          default: { ...label, color: t.inkSoft },
          selected: { ...label, color: t.ink },
        }}
        labelVisibilityMode={showLabels ? 'labeled' : 'unlabeled'}
        screenListeners={({ route }) => ({ tabPress: () => onTabPress(route.name) })}
      >
        {TABS.map((tab) => (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
            <NativeTabs.Trigger.Label>{tab.title}</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        ))}
        <NativeTabs.Trigger name="notifications" hidden />
        <NativeTabs.Trigger name="settings" hidden />
      </NativeTabs>
    </View>
  );
}
