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
