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

export { initialsOf } from '../shared/initials';
export { toast } from '../shared/toasts';
export {
  ApprovalCard,
  ArtifactCard,
  Citation,
  MessageActions,
  PrivacyState,
  RunStatus,
  ThinkingTrace,
  ToolCallCard,
} from './Agent/AgentCards';
export { Composer, type ComposerProps } from './Agent/Composer';
export { ActionFab, type ActionFabProps, FabMenu, type FabMenuProps } from './Agent/Fab';
export {
  MessageBubble,
  type MessageBubbleProps,
  MessageList,
  type MessageListProps,
} from './Agent/Message';
export {
  Disclosure,
  type DisclosureProps,
  Notice,
  type NoticeProps,
  NumberStepper,
  type NumberStepperProps,
  SearchField,
  type SearchFieldProps,
  Steps,
  type StepsProps,
} from './Basics/Basics';
export { Breadcrumb, type BreadcrumbProps } from './Breadcrumb/Breadcrumb';
export { Button, type ButtonProps } from './Button/Button';
export { Card, type CardProps } from './Card/Card';
export { Carousel, type CarouselProps } from './Carousel/Carousel';
export { Checkbox, type CheckboxProps } from './Checkbox/Checkbox';
export { Chip, type ChipProps, Chips, type ChipsProps } from './Chip/Chip';
export { Dialog, type DialogProps } from './Dialog/Dialog';
export { Group, type GroupProps } from './Group/Group';
export { Icon, type IconProps } from './Icon/Icon';
export { IconButton, type IconButtonProps } from './IconButton/IconButton';
export { Launcher, type LauncherProps } from './Launcher/Launcher';
export { Grid, type GridProps } from './Layout/Grid';
export { Inline, type InlineProps, Stack, type StackProps } from './Layout/Layout';
export { Link, type LinkProps } from './Link/Link';
export { List, type ListProps } from './List/List';
export { type MediaAdapterSet, MediaAdapters, useMediaAdapters } from './Media/adapters';
export { BrowserPdfAdapter } from './Media/BrowserPdfAdapter';
export {
  AudioRecord,
  type AudioRecordProps,
  FileField,
  type FileFieldProps,
  ImageCapture,
  type ImageCaptureProps,
} from './Media/Capture';
export { DocumentView, type DocumentViewProps } from './Media/DocumentView';
export { FILE_CARD_ENGLISH, FileCard, type FileCardProps } from './Media/FileCard';
export { Markdown, type MarkdownProps } from './Media/Markdown';
export { Media, type MediaProps } from './Media/Media';
export { RichTextEditor, type RichTextEditorProps } from './Media/RichTextEditor';
export { Menu, type MenuProps } from './Menu/Menu';
export { Perch, type PerchProps } from './Perch/Perch';
export { Popover, type PopoverProps } from './Popover/Popover';
export {
  ChoiceQuestion,
  type ChoiceQuestionProps,
  PrivacyNote,
  type PrivacyNoteProps,
  Scale,
  type ScaleProps,
} from './Question/Question';
export { RadioGroup, type RadioGroupProps } from './Radio/RadioGroup';
export { Rail, type RailProps } from './Rail/Rail';
export { Row, type RowProps } from './Row/Row';
export { Section, type SectionProps } from './Section/Section';
export { SegmentedControl, type SegmentedControlProps } from './Segmented/SegmentedControl';
export { Select, type SelectProps } from './Select/Select';
export {
  ChoiceRow,
  type ChoiceRowProps,
  DangerRow,
  type DangerRowProps,
  LinkRow,
  type LinkRowProps,
} from './Settings/SettingsRows';
export { Sheet, type SheetProps } from './Sheet/Sheet';
export { AppHeader, type AppHeaderProps } from './Shell/AppHeader';
export { NotificationItem, type NotificationItemProps } from './Shell/NotificationItem';
export { SwitchRow, type SwitchRowProps } from './Shell/SwitchRow';
export { TaskTabs, type TaskTabsProps } from './Shell/TaskTabs';
export { Slider, type SliderProps } from './Slider/Slider';
export {
  EmptyState,
  type EmptyStateProps,
  ErrorState,
  type ErrorStateProps,
} from './States/States';
export {
  Avatar,
  type AvatarProps,
  Badge,
  type BadgeProps,
  Divider,
  Progress,
  type ProgressProps,
} from './Status/Status';
export { Surface, type SurfaceProps } from './Surface/Surface';
export { SwipeRow, type SwipeRowProps } from './SwipeRow/SwipeRow';
export { Switch, type SwitchProps } from './Switch/Switch';
export { Table, type TableProps } from './Table/Table';
export { Tabs, type TabsProps } from './Tabs/Tabs';
export { Text, type TextProps } from './Text/Text';
export { TextField, type TextFieldProps } from './TextField/TextField';
export { MonthGrid, type MonthGridProps } from './Time/MonthGrid';
export {
  DateField,
  type DateFieldProps,
  DateTravel,
  type DateTravelProps,
  TimeAgo,
  type TimeAgoProps,
  TimeField,
  type TimeFieldProps,
  Timeline,
  type TimelineProps,
} from './Time/Time';
export { ToastHost } from './Toast/ToastHost';
export { Tooltip, type TooltipProps } from './Tooltip/Tooltip';
export {
  WorldLoading,
  type WorldLoadingProps,
  WorldSkeleton,
  type WorldSkeletonProps,
} from './Waiting/Waiting';
export { WaitingSign, type WaitingSignProps } from './WaitingSign/WaitingSign';
export { WorldPicker, type WorldPickerProps } from './WorldPicker/WorldPicker';
