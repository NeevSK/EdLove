/**
 * @repo/ui/components/web — the same generic components for the web, as plain DOM.
 *
 *   import { Button, Row, Section, Text } from '@repo/ui/components/web';
 *
 * Every look-related value comes from CSS variables that `WorldStyles`
 * (`@repo/ui/theme/web`) puts in the document head, built from the same
 * recipes the native components read. There is no runtime styling cost and
 * nothing to hydrate.
 *
 * Props extend the contracts in `@repo/ui/theme` (`contracts.ts`), the same ones
 * `@repo/ui/components/native` extends, so a screen reads the same on both.
 */

export { Button, type ButtonProps } from './Button/Button';
export { Chip, type ChipProps, Chips, type ChipsProps } from './Chip/Chip';
export { Row, type RowProps } from './Row/Row';
export { Section, type SectionProps } from './Section/Section';
export { Surface, type SurfaceProps } from './Surface/Surface';
export { Text, type TextProps } from './Text/Text';
export { TextField, type TextFieldProps } from './TextField/TextField';
export { Perch, type PerchProps } from './Perch/Perch';
export { Switch, type SwitchProps } from './Switch/Switch';
export { WorldLoading, type WorldLoadingProps, WorldSkeleton, type WorldSkeletonProps } from './Waiting/Waiting';
export { WaitingSign, type WaitingSignProps } from './WaitingSign/WaitingSign';
export { WorldPicker, type WorldPickerProps } from './WorldPicker/WorldPicker';
export { Dialog, type DialogProps } from './Dialog/Dialog';
export { Popover, type PopoverProps } from './Popover/Popover';
export { Sheet, type SheetProps } from './Sheet/Sheet';
export { ToastHost } from './Toast/ToastHost';
export { Tooltip, type TooltipProps } from './Tooltip/Tooltip';
export { toast } from '../shared/toasts';
export { Checkbox, type CheckboxProps } from './Checkbox/Checkbox';
export { Menu, type MenuProps } from './Menu/Menu';
export { RadioGroup, type RadioGroupProps } from './Radio/RadioGroup';
export { Select, type SelectProps } from './Select/Select';
export { Slider, type SliderProps } from './Slider/Slider';
