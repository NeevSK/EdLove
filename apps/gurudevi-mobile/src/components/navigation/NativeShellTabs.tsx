import { alpha, mix } from '@repo/ui/theme';
import { typeStyle, useWorldContext, useWorldMotion } from '@repo/ui/theme/native';
import { NativeTabs } from 'expo-router/native-tabs';
import type { ReactNode } from 'react';
import { View } from 'react-native';

/** Admitted tabs, in the same order as the custom tab bar. */
const TABS = [
  {
    name: 'library',
    title: 'Library',
    sf: 'books.vertical',
    md: 'local_library',
  },
  { name: 'workspace', title: 'Workspace', sf: 'graduationcap', md: 'school' },
  { name: 'self', title: 'Self', sf: 'heart', md: 'favorite' },
  { name: 'community', title: 'Community', sf: 'person.2', md: 'group' },
  { name: 'profile', title: 'Profile', sf: 'person', md: 'person' },
] as const;

export type ShellTab = (typeof TABS)[number]['name'];

export interface NativeShellTabsProps {
  /** The same header the custom tabs draw, or null while it is hidden on scroll. */
  header: ReactNode;
  onTabPress: (tab: string) => void;
  showLabels?: boolean;
  /** A short badge per tab ("3", "•"); the system tab bar says it to screen readers. */
  badges?: Partial<Record<ShellTab, string>>;
  /** Room names in the person's language; the work room is named for their role. */
  labels?: Partial<Record<ShellTab, string>>;
}

/**
 * Variant B of the tab shell: the system tab bar (`NativeTabs`, stable in Expo SDK 58), dressed
 * by the active world. The selected tab is the lit thing (the world's lamp, at a strength that
 * reads as text); the bar steps aside on scroll unless motion is off; its blur goes when the
 * person asks for less transparency. Inactive tabs stop drawing (`activityEnabled`).
 * Long-press on a tab (the feature catalog) has no native equivalent here.
 */
export function NativeShellTabs({
  header,
  onTabPress,
  showLabels = true,
  badges,
  labels,
}: NativeShellTabsProps) {
  const { world, language } = useWorldContext();
  const { animates } = useWorldMotion();
  const t = world.tokens;
  // The lamp at text strength: lampDeep is held to 4.5:1 on the ground in every theme.
  const lit = t.lampDeep;
  const face = typeStyle(world.recipes.text.label, language, world).fontFamily;
  const label = { fontFamily: face, fontSize: 12 };
  const solid = world.access.transparency === 'reduced';

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {header}
      <NativeTabs
        activityEnabled
        backgroundColor={t.ground}
        blurEffect={solid ? 'none' : undefined}
        shadowColor={world.recipes.material.shadow}
        minimizeBehavior={animates ? 'onScrollDown' : 'never'}
        tintColor={lit}
        iconColor={{ default: t.inkSoft, selected: lit }}
        indicatorColor={mix(t.ground, t.lamp, 0.18)}
        rippleColor={alpha(t.lamp, 0.14)}
        badgeBackgroundColor={t.lamp}
        badgeTextColor={t.onLamp}
        labelStyle={{
          default: { ...label, color: t.inkSoft },
          selected: { ...label, color: lit },
        }}
        labelVisibilityMode={showLabels ? 'labeled' : 'unlabeled'}
        screenListeners={({ route }) => ({
          tabPress: () => onTabPress(route.name),
        })}
      >
        {TABS.map((tab) => (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
            <NativeTabs.Trigger.Label>{labels?.[tab.name] ?? tab.title}</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Badge hidden={!badges?.[tab.name]}>
              {badges?.[tab.name]}
            </NativeTabs.Trigger.Badge>
          </NativeTabs.Trigger>
        ))}
        <NativeTabs.Trigger name="notifications" hidden />
        <NativeTabs.Trigger name="settings" hidden />
      </NativeTabs>
    </View>
  );
}
