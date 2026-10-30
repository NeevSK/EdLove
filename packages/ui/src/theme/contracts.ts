/**
 * Component contracts: the props a component has on every platform.
 *
 * `@repo/ui/components/native` and `@repo/ui/components/web` extend these with
 * what only their platform has (haptics and `style` on native; HTML attributes
 * and `href` on the web). A screen written against a contract reads the same on
 * both, and an agent that learns one set has learned the other.
 */

import type { ComponentType, ReactNode } from 'react';
import type { SignKind } from './signs';
import type {
  BadgeTone,
  ButtonSize,
  ButtonVariant,
  Radius,
  SectionDensity,
  SurfaceTone,
  TextRole,
  TextTone,
  ToastTone,
  WorldId,
  WorldLanguage,
} from './types';

/** An icon component; drawn in the ink of whatever holds it. */
export interface KitIconProps {
  size?: number;
  color?: string;
  'aria-hidden'?: boolean;
}

export interface TextContract {
  /** What the words are for. The world decides how each kind looks. */
  kind?: TextRole;
  tone?: TextTone;
  align?: 'left' | 'center' | 'right';
}

export interface ButtonContract {
  /** The words on the button. Also its accessible name. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional leading icon, drawn in the button's ink colour. */
  icon?: ComponentType<KitIconProps>;
  loading?: boolean;
  fullWidth?: boolean;
}

export interface SurfaceContract {
  /** `plain`: ruled lines, no box. `raised`: a held sheet. `inset`: a quiet well. */
  tone?: SurfaceTone;
}

export interface FieldContract {
  /** Always visible above the field, and the field's accessible name. */
  label: string;
  hint?: string;
  /** Shown under the field and announced; also marks the field invalid. */
  error?: string;
}

export type ChipKind = 'button' | 'radio' | 'checkbox';

export interface ChipContract {
  label: string;
  selected?: boolean;
  /** `radio` and `checkbox` chips announce their checked state. */
  kind?: ChipKind;
  lang?: WorldLanguage;
}

export interface ChipsContract {
  /** Names the group for assistive technology. */
  label?: string;
  /** One choice at a time: the group is announced as a radio group. */
  single?: boolean;
}

export interface RowContract {
  label: string;
  detail?: string;
  note?: string;
  accessory?: ReactNode;
  onPress?: () => void;
  signal?: boolean;
  signalLabel?: string;
  chevron?: boolean;
}

export interface SectionContract {
  /** Short name of the group. Announced as a heading. */
  title: string;
  voice?: string;
  density?: SectionDensity;
  signal?: boolean;
  children: ReactNode;
}

export interface SwitchContract {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** The setting's name: the switch's accessible name. Show it beside the switch (a Row does). */
  label: string;
}

export interface WaitingSignContract {
  /** Width and height in px (dp on native). */
  size?: number;
  /** Draw another world's sign (previews); defaults to the active world's. */
  kind?: SignKind;
  /** Hold still regardless of motion settings (a sign used as an illustration). */
  still?: boolean;
}

export type LoadingSize = 'sm' | 'md' | 'lg';

export interface LoadingContract {
  /** What is happening, already translated ("Loading lessons"). Read aloud and shown. */
  label: string;
  size?: LoadingSize;
  /** Hide the words visually; they are still read aloud. */
  quiet?: boolean;
  /** Cover the screen with the world's ground. */
  fullscreen?: boolean;
}

export interface SkeletonContract {
  height: number;
  /** Defaults to the world's inset corners. */
  radius?: Radius;
  /** Hold still even when shimmer is allowed. */
  still?: boolean;
}

export interface WorldPickerContract {
  value: WorldId;
  onChange: (world: WorldId) => void;
  /** Accessible name of the group, already translated (e.g. "World"). */
  label: string;
}

export interface DialogContract {
  open: boolean;
  /** Called when the person dismisses the dialog (Escape, back, the backdrop). */
  onClose: () => void;
  /** Announced as the dialog's name and shown as its heading. */
  title: string;
  /** One or two plain lines under the title; announced as the description. */
  description?: string;
  children?: ReactNode;
  /** Buttons along the bottom, primary last. */
  actions?: ReactNode;
  /** When false, only an action can close it (Escape, back and the backdrop do nothing). */
  dismissable?: boolean;
}

export interface SheetContract {
  open: boolean;
  onClose: () => void;
  /** The sheet's name; shown as its heading. */
  title: string;
  children?: ReactNode;
  dismissable?: boolean;
}

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  /** Already translated, one short sentence. */
  message: string;
  tone?: ToastTone;
  action?: ToastAction;
  /** How long it stays, in ms. Toasts with an action stay longer by default. */
  durationMs?: number;
}

export interface TooltipContract {
  /** The words, already translated. Also the control's description for assistive technology. */
  label: string;
}

export interface PopoverContract {
  open: boolean;
  onClose: () => void;
  /** Names the popover for assistive technology. */
  label: string;
  children?: ReactNode;
}

export interface CheckboxContract {
  /** `mixed` for a parent whose children are partly checked. */
  checked: boolean | 'mixed';
  onChange: (checked: boolean) => void;
  /** Shown beside the box; its accessible name. */
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface ChoiceOption<V extends string = string> {
  value: V;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface RadioGroupContract<V extends string = string> {
  value: V | null;
  onChange: (value: V) => void;
  /** Names the group; shown above it. */
  label: string;
  options: readonly ChoiceOption<V>[];
}

export interface SelectContract<V extends string = string> {
  value: V | null;
  onChange: (value: V) => void;
  label: string;
  options: readonly ChoiceOption<V>[];
  /** Shown while nothing is chosen. */
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
}

export interface MenuItem {
  key: string;
  label: string;
  onSelect: () => void;
  /** Deletes, leaves, ends: drawn in the world's danger ink. */
  destructive?: boolean;
  disabled?: boolean;
}

export interface MenuContract {
  open: boolean;
  onClose: () => void;
  /** Names the menu for assistive technology. */
  label: string;
  items: readonly MenuItem[];
}

export interface SliderContract {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  /** How the value is read aloud and shown ("3 of 5", "60%"); defaults to the number. */
  valueText?: (value: number) => string;
  disabled?: boolean;
}

export interface TabsContract<V extends string = string> {
  value: V;
  onChange: (value: V) => void;
  /** Names the set of tabs for assistive technology. */
  label: string;
  tabs: readonly ChoiceOption<V>[];
  /** The selected tab's content, shown in its panel. */
  children?: ReactNode;
}

export interface SegmentedContract<V extends string = string> {
  value: V;
  onChange: (value: V) => void;
  label: string;
  /** Two to four short choices that switch a view in place. */
  options: readonly ChoiceOption<V>[];
}

export interface BreadcrumbItem {
  label: string;
  /** Omit for the current page (the last item). */
  href?: string;
}

export interface BreadcrumbContract {
  items: readonly BreadcrumbItem[];
  /** Names the trail; defaults to "Breadcrumb". Pass it translated. */
  label?: string;
}

export interface IconButtonContract {
  icon: ComponentType<KitIconProps>;
  /** The action's name: the accessible name, and the tooltip on the web. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export interface LinkContract {
  label: string;
}

export interface ProgressContract {
  /** 0 to 1. Omit while the amount is unknown; the bar then moves without a value. */
  value?: number;
  /** What is progressing, already translated ("Uploading photos"). */
  label: string;
}

export interface BadgeContract {
  label: string;
  tone?: BadgeTone;
}

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarContract {
  /** The person's name: the image's description and the source of the initials. */
  name: string;
  /** A photo; initials show while it loads or if it fails. */
  src?: string;
  size?: AvatarSize;
}

export interface StateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateContract {
  title: string;
  message?: string;
  action?: StateAction;
}

export interface ErrorStateContract {
  title: string;
  message?: string;
  /** Usually "Try again". Omit when nothing the person does will help. */
  retry?: StateAction;
}

export interface ListContract<T> {
  items: readonly T[];
  keyOf: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Names the list for assistive technology ("Students"). */
  label: string;
  /** Shown when there are no items (and not loading). */
  empty?: EmptyStateContract;
  /** While the first page loads: placeholder rows instead of items. */
  loading?: boolean;
  /** Load the next page when the end comes near. */
  onEndReached?: () => void;
}

export interface TableColumn<R> {
  key: string;
  header: string;
  cell: (row: R) => ReactNode;
  /** Numbers read best aligned to the end. */
  align?: 'start' | 'end';
}

export interface TableContract<R> {
  /** What the table holds; its accessible name and visible caption. */
  caption: string;
  columns: readonly TableColumn<R>[];
  rows: readonly R[];
  rowKey: (row: R) => string;
  /** Shown in place of rows when there are none. */
  empty?: string;
}

export type SwipeTone = 'lamp' | 'success' | 'danger';

export interface SwipeAction {
  /** Already translated ("Done", "Delete"). Shown behind the row and offered to screen readers. */
  label: string;
  tone: SwipeTone;
  onAction: () => void;
}

export interface SwipeRowContract {
  children: ReactNode;
  /** Revealed by swiping towards the end (right in left-to-right languages). */
  start?: SwipeAction;
  /** Revealed by swiping towards the start. Usually the destructive one. */
  end?: SwipeAction;
  /** The row's accessible name. */
  label: string;
}
