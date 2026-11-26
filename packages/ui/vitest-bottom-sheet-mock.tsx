import type { ReactNode } from 'react';
import { View } from 'react-native';

/**
 * Test double for `@swmansion/react-native-bottom-sheet`, whose sheets are native views. It renders
 * a sheet's children while it is open (an index above the closed detent) and records the props each
 * render passed, so a test asserts the contract the kit hands the native sheet: detents, close
 * handling, overlay and scrim. Dragging and snapping are native and are not exercised here.
 */
export type RecordedSheet = Readonly<Record<string, unknown>> & {
  readonly index: number;
  readonly children?: ReactNode;
  readonly onIndexChange?: (index: number) => void;
  readonly onCloseRequest?: () => void;
};

export const renderedSheets: RecordedSheet[] = [];
export const lastSheet = (): RecordedSheet => {
  const sheet = renderedSheets.at(-1);
  if (!sheet) throw new Error('No bottom sheet has rendered');
  return sheet;
};

function Sheet(props: RecordedSheet) {
  renderedSheets.push(props);
  return props.index > 0 ? <View testID="bottom-sheet">{props.children}</View> : null;
}

export const ModalBottomSheet = Sheet;
export const BottomSheet = Sheet;
export const BottomSheetProvider = ({ children }: { children: ReactNode }) => children;
