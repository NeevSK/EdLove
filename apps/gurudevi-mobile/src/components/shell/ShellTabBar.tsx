/**
 * The tabs navigator's bar, drawn by the kit's `WorldTabBar`: the navigator says which rooms exist
 * and which is in front; the world draws them. Hidden routes (notifications, settings) stay out.
 */

import { type RailHud, WorldTabBar, type WorldTabItem } from '@repo/ui/components/native';
import type { KitIconProps } from '@repo/ui/theme';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { ComponentType } from 'react';

export interface ShellTabBarProps extends BottomTabBarProps {
  layout: 'docked' | 'floating' | 'rail';
  icons: Readonly<Record<string, ComponentType<KitIconProps>>>;
  labels: Readonly<Record<string, string>>;
  /** Rooms whose tab does something on a long press (their screen listens for it). */
  holds?: Readonly<Record<string, boolean | undefined>>;
  signals?: Readonly<Record<string, boolean | undefined>>;
  hidden?: boolean;
  /** A phone on its side: the header's controls ride on the rail. */
  hud?: RailHud;
  side?: 'left' | 'right';
}

export function ShellTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
  layout,
  icons,
  labels,
  holds,
  signals,
  hidden,
  hud,
  side,
}: ShellTabBarProps) {
  const items: WorldTabItem[] = [];
  state.routes.forEach((route, index) => {
    const options = descriptors[route.key]?.options as { hidden?: boolean } | undefined;
    const icon = icons[route.name];
    if (options?.hidden || !icon) return;
    const focused = index === state.index;
    const long = holds?.[route.name];
    items.push({
      key: route.key,
      label: labels[route.name] ?? route.name,
      icon,
      focused,
      signal: signals?.[route.name],
      longPressHint: long ? `Hold for all of ${labels[route.name] ?? route.name}` : undefined,
      onPress: () => {
        const event = emitter.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!focused && !event.defaultPrevented) navigateToTab(route.key);
      },
      onLongPress: long
        ? () => emitter.emit({ type: 'tabLongPress', target: route.key })
        : undefined,
    });
  });
  return (
    <WorldTabBar
      items={items}
      layout={layout}
      insets={insets}
      hidden={hidden}
      hud={hud}
      side={side}
    />
  );
}
