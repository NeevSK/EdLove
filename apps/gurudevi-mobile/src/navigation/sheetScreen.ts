import { NAVIGATION_POLICY } from '@repo/core/flows/navigationPolicy';
import type { NativeStackNavigationOptions } from 'expo-router/native-stack';

/**
 * Screen options for a route that a flow presents as a `sheet` step. In expo-router 58 a route is a
 * sheet because its layout says so, not because the caller asked; a layout spreads this into the
 * route's `<Stack.Screen options>` so the navigator's `sheet` and the screen agree, and the look
 * comes from the one navigation policy.
 */
export const SHEET_SCREEN: NativeStackNavigationOptions = {
  presentation: 'formSheet',
  sheetAllowedDetents: [...NAVIGATION_POLICY.sheet.detents],
  sheetGrabberVisible: NAVIGATION_POLICY.sheet.grabber,
  sheetCornerRadius: NAVIGATION_POLICY.sheet.cornerRadius,
};
