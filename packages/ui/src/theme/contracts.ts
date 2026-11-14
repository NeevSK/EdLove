/**
 * Component contracts: the props a component has on every platform.
 *
 * `@repo/ui/components/native` and `@repo/ui/components/web` extend these with
 * what only their platform has (haptics and `style` on native; HTML attributes
 * and `href` on the web). A screen written against a contract reads the same on
 * both, and an agent that learns one set has learned the other.
 */

import type { FileKind, FileRef } from '@repo/core/logic/files/fileKind';
import type { ComponentType, ReactNode } from 'react';
import type { KitSize } from '../tokens/sizes';
import type { SpaceDensity, SpaceRelation } from '../tokens/space';
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

export type {
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
};

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

/** How things are spaced: by what relation they have (see `tokens/space.ts`). */
export interface StackContract {
  /** `none` for content that brings its own spacing. Default `between`. */
  gap?: SpaceRelation | 'none';
  density?: SpaceDensity;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

/** Side by side, wrapping onto new lines when there is no room. */
export interface InlineContract extends StackContract {
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Default true: a row of chips or actions wraps instead of overflowing. */
  wrap?: boolean;
}

/**
 * Rows that belong together (a settings group): one surface, only the outer
 * corners round, hairlines between rows. Groups stand apart by `group` space.
 */
export interface GroupContract {
  /** Small heading above the group; also the group's accessible name. */
  label?: string;
  /** A note under the group explaining its rows. */
  footer?: string;
}

/** An icon drawn in a text tone at a fixed size. Decorative unless it has a label. */
export interface IconContract {
  icon: ComponentType<KitIconProps>;
  size?: KitSize;
  tone?: TextTone;
  /** Only when the icon means something on its own (no text beside it). */
  label?: string;
}

/** Equal columns that come and go with the space available. */
export interface GridContract {
  /** The narrowest a column may get before one is dropped. Default `md`. */
  min?: KitSize;
  /** Never more columns than this. */
  max?: number;
  gap?: SpaceRelation;
}

/**
 * Card shapes: `tile` (media above words), `wide` (media beside words,
 * stacking when narrow), `square` (media fills, words over a veil at the
 * foot), `pill` (a small rounded chip-like card: icon and title).
 */
export type CardShape = 'tile' | 'wide' | 'square' | 'pill';

export interface CardContract {
  title: string;
  /** One short line under the title ("12 students", "Due Friday"). */
  meta?: string;
  shape?: CardShape;
  size?: KitSize;
  /** An image or illustration; the card clips it to its corners. */
  media?: ReactNode;
  icon?: ComponentType<KitIconProps>;
  selected?: boolean;
  disabled?: boolean;
}

/**
 * Pebble corner slot modes:
 * - `pin`: Toggleable bookmark / favorite pin
 * - `menu`: 3-dot overflow menu triggering an action dropdown or bottom sheet
 * - `counter`: Badge / unread count or streak scalar
 * - `tooltip`: Explanatory domain or circadian guidance
 * - `status`: Live pulse dot (ready / busy / syncing)
 * - `custom`: Arbitrary child slot
 */
export type PebbleCornerSlotMode =
  | 'pin'
  | 'menu'
  | 'counter'
  | 'tooltip'
  | 'status'
  | 'custom';

export interface PebbleCornerBadgeSpec {
  mode: PebbleCornerSlotMode;
  isPinned?: boolean;
  count?: number;
  status?: 'ready' | 'busy' | 'syncing';
  dotOrientation?: 'vertical' | 'horizontal';
  guidanceTooltip?: string;
  menuActions?: Array<{ id: string; label: string; icon?: string }>;
  onAction?: (actionId: string, event?: any) => void;
}

/**
 * Discrete degradation gears for Pebble (driven by Container Queries):
 * - `full` (G3, >=140px): 1:1 squircle with central illustration, title, rhythm row, full corner sticker
 * - `medium` (G2, 110-139px): Proportional squircle with rhythm row
 * - `compact` (G1, <110px / mobile ~88-92px): 1:1 squircle with 3rd line dropped completely and scaled corner sticker
 * - `auto`: Automatically select gear based on container width
 */
export type PebbleGear = 'full' | 'medium' | 'compact' | 'auto';

export interface PebbleContract {
  title: string;
  /** Central emoji or glyph illustration */
  emoji?: string;
  media?: ReactNode;
  icon?: ComponentType<KitIconProps>;
  /** 3rd line rhythm or context (omitted automatically in compact gear) */
  rhythm?: string;
  /** Autonomous corner sticker slot */
  cornerBadge?: PebbleCornerBadgeSpec;
  /** Discrete size gear or auto-responsive */
  gear?: PebbleGear;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

/** A short horizontal run of cards that scrolls and snaps. */
export interface RailContract<T> {
  /** Names the rail ("Recent lessons"); shown above it. */
  label: string;
  items: readonly T[];
  keyOf: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Width of each item. Default `md`. */
  size?: KitSize;
}

/** One item per page, with buttons as well as swipes. Never moves by itself. */
export interface CarouselContract<T> {
  label: string;
  items: readonly T[];
  keyOf: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Names for the page buttons and position ("Previous", "Next", "{n} of {total}"). */
  labels?: { previous: string; next: string; position: (n: number, total: number) => string };
  onPageChange?: (index: number) => void;
}

// What kind of file something is, and a file a component can show: owned by core with the
// file policy (`@repo/core/logic/files`).
export type { FileKind, FileRef } from '@repo/core/logic/files/fileKind';

/**
 * Long-form text in Markdown. The kit sets it in the world's prose; which
 * library parses and draws it is an adapter the app chooses (`MediaAdapters`).
 */
export interface MarkdownContract {
  source: string;
  /** `lamp` inside a person's own message bubble. */
  tone?: 'ground' | 'lamp';
  onLinkPress?: (url: string) => void;
}

/** A file shown as a held thing: its kind, name and size, and what can be done with it. */
export interface FileCardContract {
  file: FileRef;
  /** Opening it (a viewer, the system). Without it the card is not a button. */
  onOpen?: () => void;
  /** Upload or download progress, 0–1. */
  progress?: number;
  error?: string;
  onRetry?: () => void;
  onRemove?: () => void;
  /** Names for actions and kinds, in the reader's language. English by default. */
  labels?: Partial<FileCardLabels>;
}

export interface FileCardLabels {
  kinds: Record<FileKind, string>;
  open: string;
  retry: string;
  remove: string;
  /** "{n}% uploaded". */
  progress: (percent: number) => string;
}

/**
 * Ports: what an adapter receives. The kit chooses which adapter by the file's
 * kind and hands it the world's prose; the adapter only draws.
 */
export interface MarkdownAdapterProps {
  source: string;
  onLinkPress?: (url: string) => void;
}

/**
 * On native the adapter also gets the world's prose to style itself. On the
 * web it emits plain semantic HTML and `.gd-prose` styles it from the world.
 */
export interface NativeMarkdownAdapterProps extends MarkdownAdapterProps {
  prose: import('./types').ProseTone;
}

export interface DocumentAdapterProps {
  file: FileRef;
  /** Call when the document cannot be drawn; the kit falls back to a file card. */
  onError: () => void;
}

/** Kinds a document adapter can be registered for. */
export type DocumentKind = Extract<
  FileKind,
  'pdf' | 'document' | 'sheet' | 'slides' | 'markdown' | 'text'
>;

/** A document shown in place (PDF, Word, Excel, PowerPoint), by an adapter the app chooses. */
export interface DocumentContract {
  file: FileRef;
  /** Shown when no adapter can draw this kind, and on failure. */
  onOpenElsewhere?: () => void;
}

/**
 * A rating or agreement scale (Likert, 1–5 stars, 0–10). One choice from
 * 3 to 11 points; the ends say what they mean.
 */
export interface ScaleContract {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  /** Points from `min` to `max` inclusive. Default 1–5. */
  min?: number;
  max?: number;
  /** What the lowest and highest points mean ("Not at all", "Completely"). */
  ends?: { low: string; high: string };
  /** Words for every point, when each has one (a 5-point Likert). */
  pointLabels?: readonly string[];
  disabled?: boolean;
}

/** How an answer reads once a quiz reveals it (instant timing) or after review. */
export type AnswerMark = 'correct' | 'incorrect' | 'missed' | 'none';

/**
 * A question with choices (single or several). The form engine evaluates; the
 * kit only shows the result it is given, never decides it.
 */
export interface ChoiceQuestionContract<V extends string = string> {
  prompt: string;
  options: readonly ChoiceOption<V>[];
  multiple?: boolean;
  value: readonly V[];
  onChange: (value: V[]) => void;
  /** After evaluation: the right answers and why. Locks the question. */
  reveal?: { correct: readonly V[]; explanation?: string };
  /** Words for marks and the result, in the reader's language. */
  labels?: Partial<AnswerLabels>;
}

export interface AnswerLabels {
  correct: string;
  incorrect: string;
  missed: string;
  /** Said when the reveal lands: all right, or not. */
  resultRight: string;
  resultWrong: string;
  explanationHeading: string;
}

/**
 * Who will see this person's answers. The service decides; the kit says it
 * plainly before the first question, so no one guesses.
 */
export interface PrivacyNoteContract {
  identity: 'named' | 'anonymous' | 'pseudonymous';
  /** Who reads the answers ("Your class teacher"). */
  audience?: string;
  labels?: Partial<Record<'named' | 'anonymous' | 'pseudonymous', string>>;
}

export interface SurfaceContract {
  /** `plain`: ruled lines, no box. `raised`: a held sheet. `inset`: a quiet well. */
  tone?: SurfaceTone;
}

export interface LivingGroundContract {
  /**
   * Atmospheric lighting mode:
   * - `canopy`: directional overhead sunbeam filtering through the world's canopy
   * - `centered`: radial illumination from behind the primary focal area
   * - `ambient`: gentle vertical wash
   * - `none`: quiet ground without directional light
   */
  atmosphere?: 'canopy' | 'centered' | 'ambient' | 'none';
  /** Whether to enable procedural grain dithering from the active world. Default true. */
  dither?: boolean;
  /** Explicit world override; when omitted, inherits the active world. */
  worldId?: WorldId;
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
  /** `danger` for a row that ends or deletes something: its label in danger words. */
  tone?: 'plain' | 'danger';
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

/**
 * A panel that slides in from a side edge over the current place: details beside a list, filters,
 * a conversation next to its work. It covers the screen (the shell tucks its chrome away), keeps the
 * place visible behind a scrim, and has no address of its own.
 */
export interface SidePanelContract {
  open: boolean;
  onClose: () => void;
  /** The panel's name; shown as its heading. */
  title: string;
  children?: ReactNode;
  /**
   * The edge it comes from. `end` (the default) is the right in a left-to-right layout and the
   * left in a right-to-left one; `start` is the other edge.
   */
  side?: 'start' | 'end';
  /** When false, only `open` closes it: the scrim, Back, Escape and dragging do nothing. */
  dismissable?: boolean;
}

export interface ToastAction {
  label: string;
  onPress: () => void;
}

/**
 * How much room a toast takes. A `pill` is one short line, centred, for a quiet confirmation
 * ("Saved"). A `card` carries a description or an action. A `banner` spans the top edge and stays
 * until it is dismissed or resolved: offline, sync trouble, something that waits on the person.
 */
export type ToastSize = 'pill' | 'card' | 'banner';

export interface ToastOptions {
  /** Already translated, one short sentence. */
  message: string;
  /** A second, quieter line. */
  description?: string;
  tone?: ToastTone;
  /** Defaults to `card` when there is a description or an action, otherwise `pill`. */
  size?: ToastSize;
  action?: ToastAction;
  /** How long it stays, in ms; `Infinity` until dismissed. Banners stay by default. */
  durationMs?: number;
  /**
   * Identifies what the toast is about. Showing a toast with the same key updates the one already
   * up instead of adding another; the same message again counts up (×2, ×3) rather than stacking.
   */
  key?: string;
  /** Announced assertively and shown ahead of the queue, as danger toasts are. */
  important?: boolean;
  /** When false, it can't be swiped or tapped away; it leaves when resolved or dismissed in code. */
  dismissible?: boolean;
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

// ---------------------------------------------------------------------------
// Agent kit (1c layer 1). Shaped by the AG-UI event families: text stream,
// tool calls, human approval, lifecycle. The kit renders what the agent
// client (packages/ai) tells it; it never speaks the wire protocol.
// ---------------------------------------------------------------------------

/** Who wrote a message: the person, the assistant, or someone else in a group. */
export type MessageAuthor = 'self' | 'assistant' | 'other';

/** Where a message is in its life. Only `complete` is announced, once. */
export type MessageState = 'streaming' | 'complete' | 'stopped' | 'failed';

export interface MessageBubbleContract {
  author: MessageAuthor;
  /** Markdown. Drawn through the `Markdown` port, never as raw HTML. */
  content: string;
  state?: MessageState;
  /** Shown for `other` in group conversations. */
  authorName?: string;
  /** Already formatted for the reader ("9:41", "Yesterday"). */
  time?: string;
  attachments?: readonly FileRef[];
  onOpenAttachment?: (file: FileRef) => void;
  /** Offered when the message failed or was stopped. */
  onRetry?: () => void;
  labels?: Partial<AgentLabels>;
}

export interface MessageListContract<T> {
  items: readonly T[];
  keyOf: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Names the conversation ("Conversation with Gurudevi"). */
  label: string;
  /** Shown before the first message. */
  empty?: EmptyStateContract;
  /** Load older messages when the top comes near. */
  onStartReached?: () => void;
}

export interface ComposerContract {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  /** Field name for assistive technology ("Message"). */
  label: string;
  placeholder?: string;
  /** A reply is streaming: Send becomes Stop. */
  busy?: boolean;
  onStop?: () => void;
  attachments?: readonly FileRef[];
  onAttach?: () => void;
  onRemoveAttachment?: (file: FileRef) => void;
  /** Characters allowed; the count shows near the end and blocks sending past it. */
  maxLength?: number;
  disabled?: boolean;
  labels?: Partial<AgentLabels>;
}

export interface MessageActionsContract {
  onCopy?: () => void;
  onRegenerate?: () => void;
  onEdit?: () => void;
  labels?: Partial<AgentLabels>;
}

export interface ThinkingTraceContract {
  /** The reasoning text (Markdown), as streamed so far. */
  content: string;
  state: 'thinking' | 'done';
  /** How long it took, once done. */
  seconds?: number;
  labels?: Partial<AgentLabels>;
}

export type ToolCallState = 'running' | 'done' | 'failed';

export interface ToolCallContract {
  /** Said in words ("Searching attendance records"), not a function name. */
  title: string;
  state: ToolCallState;
  /** A short summary of the arguments ("Grade 7B, this week"). */
  detail?: string;
  /** A short summary of the result, once done. */
  result?: string;
  onRetry?: () => void;
  labels?: Partial<AgentLabels>;
}

export type ApprovalState =
  | 'pending'
  | 'submitting'
  | 'accepted'
  | 'discarded'
  | 'failed'
  | 'expired';

/**
 * Human in the loop: the agent stops and asks. Accepted shows only once the
 * service confirms; failure and expiry say so and can be tried again.
 */
export interface ApprovalCardContract {
  title: string;
  /** What will change if accepted (Markdown). */
  changes?: string;
  /** Where it will land ("Teacher notes, Grade 8 Science"). */
  target?: string;
  state: ApprovalState;
  onAccept: () => void;
  onDiscard: () => void;
  labels?: Partial<AgentLabels>;
}

export interface RunStep {
  label: string;
  state: 'pending' | 'running' | 'done' | 'failed';
}

export interface RunStatusContract {
  steps: readonly RunStep[];
  /** Formatted by the caller ("1 min 12 s"). */
  elapsed?: string;
  onCancel?: () => void;
  labels?: Partial<AgentLabels>;
}

export interface CitationContract {
  /** 1-based. */
  index: number;
  title: string;
  source?: string;
  onOpen?: () => void;
}

export interface ArtifactCardContract {
  title: string;
  /** A document kind, or `html` for a generated page (always sandboxed). */
  kind: FileKind | 'html';
  summary?: string;
  onOpen: () => void;
  labels?: Partial<AgentLabels>;
}

export type ChatPrivacy = 'saved' | 'temporary' | 'incognito';

/** Always visible while a chat is not saved, in the same words as `PrivacyNote`. */
export interface PrivacyStateContract {
  mode: ChatPrivacy;
  onChange?: (mode: ChatPrivacy) => void;
  labels?: Partial<AgentLabels>;
}

export interface FabAction {
  key: string;
  label: string;
  hint?: string;
  icon?: ComponentType<KitIconProps>;
  /** `lamp` for the primary action; `danger` for one that ends or deletes. */
  tone?: 'plain' | 'lamp' | 'danger';
  onPress: () => void;
  /** Actions sharing a group sit together under its name ("AI companion"). */
  group?: string;
}

/** The floating action: one lit control that opens what this screen offers. */
export interface ActionFabContract {
  label: string;
  icon?: ComponentType<KitIconProps>;
  onPress: () => void;
  /** A quiet mark that something needs the person (gaps, unread). */
  signal?: boolean;
  signalLabel?: string;
  hidden?: boolean;
}

export interface FabMenuContract {
  open: boolean;
  onClose: () => void;
  /** Names the menu ("Classroom actions"). */
  label: string;
  actions: readonly FabAction[];
}

/** Rich text editing (Markdown out). Drawn by the adapter the app chooses. */
export interface RichTextEditorContract {
  label: string;
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface RichTextAdapterProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  editable: boolean;
  accessibilityLabel: string;
}

export interface AgentLabels {
  you: string;
  assistant: string;
  send: string;
  stop: string;
  attach: string;
  remove: string;
  retry: string;
  copy: string;
  regenerate: string;
  edit: string;
  cancel: string;
  stopped: string;
  failed: string;
  /** "{n} characters left". */
  charactersLeft: (n: number) => string;
  thinking: string;
  /** "Thought for {s} s". */
  thoughtFor: (seconds: number) => string;
  showThinking: string;
  hideThinking: string;
  running: string;
  done: string;
  toolFailed: string;
  accept: string;
  discard: string;
  submitting: string;
  accepted: string;
  discarded: string;
  approvalFailed: string;
  expired: string;
  open: string;
  sandboxed: string;
  privacy: Record<ChatPrivacy, string>;
  /** "Source {n}: {title}". */
  source: (n: number, title: string) => string;
  menu: string;
  close: string;
}

// ---------------------------------------------------------------------------
// Media foundation (1c layer 2): view, pick, capture. The kit owns the frame,
// limits, failure words and accessibility; pickers, recorders and players are
// adapters (native: the mobile app's; web: the browser's own).
// ---------------------------------------------------------------------------

/**
 * An image, video or voice clip in place. An image needs words (`alt`) unless
 * it is decorative; video and voice carry captions or a transcript so no one
 * is shut out.
 */
export interface MediaContract {
  file: FileRef;
  /** What the image shows, said to screen readers. Required for images unless `decorative`. */
  alt?: string;
  decorative?: boolean;
  caption?: string;
  /** Width / height. Reserves the space so nothing jumps while it loads. */
  aspect?: number;
  /** A still shown before a video plays. */
  poster?: string;
  /** WebVTT captions for video. */
  captions?: { uri: string; language: string; label: string };
  /** Plain-text transcript for voice and video, offered under the player. */
  transcript?: string;
  labels?: Partial<MediaLabels>;
}

/** Why a file was not taken; each has its own words. */
export type FileRejection = 'type' | 'size' | 'count' | 'unsafe';

export interface FileRules {
  /** Kinds accepted; omit for any. */
  accept?: readonly FileKind[];
  /** Largest file, in bytes. */
  maxBytes?: number;
  /** Most files in the field. */
  maxFiles?: number;
}

/** A file in a field: where it is in its upload. */
export interface FileItem extends FileRef {
  /** Upload progress, 0–1, while sending. */
  progress?: number;
  /** Why the upload failed, in words; offers retry. */
  error?: string;
}

/**
 * Pick (and on the web drop) files. Each file is a card with progress, an
 * announced error, retry and remove; the rules are said before choosing and
 * any file breaking them is refused with its reason.
 */
export interface FileFieldContract extends FileRules {
  label: string;
  hint?: string;
  files: readonly FileItem[];
  onAdd: (files: FileRef[]) => void;
  onRemove: (file: FileItem) => void;
  onRetry?: (file: FileItem) => void;
  /** An error for the whole field (from the form). */
  error?: string;
  disabled?: boolean;
  labels?: Partial<MediaLabels>;
}

/** Record a voice answer: record, stop, play back, record again; length shown and limited. */
export interface AudioRecordContract {
  label: string;
  value?: FileRef & { durationMs?: number };
  onRecorded: (file: FileRef & { durationMs: number }) => void;
  onClear?: () => void;
  /** Longest recording, in seconds. */
  maxSeconds?: number;
  disabled?: boolean;
  labels?: Partial<MediaLabels>;
}

/** Take or choose a photo: camera or library, preview, retake. */
export interface ImageCaptureContract {
  label: string;
  value?: FileRef;
  onCaptured: (file: FileRef) => void;
  onClear?: () => void;
  /** Offer the camera, the library, or both (default). */
  sources?: readonly ('camera' | 'library')[];
  disabled?: boolean;
  labels?: Partial<MediaLabels>;
}

/** What a capture port answers: files, nothing (cancelled), or permission refused. */
export type CaptureResult<T> =
  | { status: 'ok'; value: T }
  | { status: 'cancelled' }
  | { status: 'denied' };

/** A recorder, as a hook the platform provides (recording is stateful). */
export interface RecorderPort {
  /** Asks for the microphone; false when refused. */
  prepare: () => Promise<boolean>;
  start: () => Promise<void>;
  stop: () => Promise<FileRef & { durationMs: number }>;
  /** Elapsed milliseconds while recording. */
  elapsedMs: number;
  recording: boolean;
}

export interface CapturePorts {
  pickFiles?: (options: {
    accept?: readonly FileKind[];
    multiple: boolean;
  }) => Promise<CaptureResult<FileRef[]>>;
  pickImage?: (source: 'camera' | 'library') => Promise<CaptureResult<FileRef>>;
  useRecorder?: () => RecorderPort;
}

export interface AudioAdapterProps {
  file: FileRef;
  accessibilityLabel: string;
  onError: () => void;
  labels: { play: string; pause: string };
}

export interface VideoAdapterProps {
  file: FileRef;
  poster?: string;
  captions?: MediaContract['captions'];
  accessibilityLabel: string;
  onError: () => void;
}

export interface MediaLabels {
  choose: string;
  drop: string;
  /** "Up to 3 files, 10 MB each: PDF, Image". */
  rules: (rules: { maxFiles?: number; maxSize?: string; kinds?: string }) => string;
  rejected: Record<FileRejection, (name: string) => string>;
  permission: { camera: string; library: string; microphone: string };
  play: string;
  pause: string;
  record: string;
  stopRecording: string;
  recordAgain: string;
  /** "0:42 of 2:00". */
  recordingLength: (elapsed: string, max?: string) => string;
  takePhoto: string;
  choosePhoto: string;
  retake: string;
  remove: string;
  transcript: string;
  showTranscript: string;
  /** Shown when media cannot be played or shown; the file card follows. */
  unavailable: string;
  /** Image with no words given: a warning for authors, never silent. */
  missingAlt: string;
}

// ---------------------------------------------------------------------------
// Shell (the frame every screen shares). Placement follows the app's long-
// standing header: leading control and identity on the left, actions on the
// right, search opening underneath.
// ---------------------------------------------------------------------------

export interface HeaderAction {
  key: string;
  label: string;
  icon: ComponentType<KitIconProps>;
  onPress: () => void;
  /** A toggle's state (search open), said to assistive technology. */
  expanded?: boolean;
  /** A count (unread) or a dot; said as part of the name via `badgeLabel`. */
  badge?: number | 'dot';
  badgeTone?: 'lamp' | 'danger' | 'quiet';
  /** "3 unread". Required when `badge` is set, so the mark is never only colour. */
  badgeLabel?: string;
}

export interface AppHeaderContract {
  title: string;
  /** The quiet line above the title (a greeting, a context). */
  eyebrow?: string;
  leading?: { kind: 'back' | 'menu'; label: string; onPress: () => void };
  /** The person, opening their profile. */
  avatar?: { name: string; src?: string; label: string; onPress: () => void };
  /** Shown in place of the title when acting under another identity (a school, a child). */
  perspective?: {
    label: string;
    onPress?: () => void;
    switchLabel?: string;
    /** Beside the title (the compact header) instead of in its place. */
    beside?: boolean;
  };
  /** A quiet line under the title (the compact header's context). */
  subtitle?: string;
  /** Right side, in order; at most three read well on a phone. */
  actions?: readonly HeaderAction[];
  /** A screen's own control at the far right, after the actions. */
  trailing?: ReactNode;
  /** Search that opens under the header. */
  search?: {
    open: boolean;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label: string;
  };
  /** Content has scrolled under the header: it lifts with a hairline and shadow. */
  raised?: boolean;
  /** A hairline under the header even at rest. */
  ruled?: boolean;
  /**
   * The connection, said quietly on the header's top line while it matters
   * (offline, syncing) instead of a banner over the content. Announced politely.
   */
  status?: { tone: 'offline' | 'syncing' | 'attention'; label: string };
  /** Short landscape phones: one tight line. */
  compact?: boolean;
}

export interface TaskTab {
  id: string;
  title: string;
}

/**
 * Open tasks as a strip of tabs (like a browser's): Home stays first, each task
 * can be chosen, closed and reordered (drag on touch, actions for screen
 * readers, Alt+arrows on the web).
 */
export interface TaskTabsContract {
  /** Names the strip ("Open workspace tasks"). */
  label: string;
  home?: { label: string; selected: boolean; onPress: () => void };
  tabs: readonly TaskTab[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onReorder: (id: string, toIndex: number) => void;
  labels?: Partial<TaskTabsLabels>;
}

export interface TaskTabsLabels {
  /** "Close {title}". */
  close: (title: string) => string;
  /** "Reorder {title}": the drag handle's name. */
  reorder: (title: string) => string;
  moveEarlier: string;
  moveLater: string;
  /** Said for the drag handle. */
  reorderHint: string;
}

/**
 * One notification. Unread ones carry a lit mark and say "Unread" first;
 * the time is already formatted for the reader. Grouped by day in `Group`s.
 */
export interface NotificationItemContract {
  title: string;
  body?: string;
  /** "9:41", "Yesterday". */
  time: string;
  unread: boolean;
  icon?: ComponentType<KitIconProps>;
  /** `danger` for something that needs action now. */
  tone?: 'plain' | 'danger';
  onPress?: () => void;
  onMarkRead?: () => void;
  labels?: Partial<{ unread: string; markRead: string }>;
}

/** A settings row that is itself the switch: one control, one name, a large target. */
export interface SwitchRowContract {
  label: string;
  /** What it changes, under the label; also the switch's description. */
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Time: one set of pieces for days, hours and moments. Days are civil dates
// (`YYYY-MM-DD`), times wall-clock (`HH:MM`); the past recedes, today is
// ringed in the lamp, the future is warmed (`recipes.time`).
// ---------------------------------------------------------------------------

/** Looking back, today, or planning ahead; the same words as core's `TemporalIntent`. */
export type TimeIntent = 'review' | 'current' | 'plan';

export interface TimeLabels {
  today: string;
  now: string;
  review: string;
  current: string;
  plan: string;
  previousDay: string;
  nextDay: string;
  previousWeek: string;
  nextWeek: string;
  previousMonth: string;
  nextMonth: string;
  chooseDate: string;
  chooseTime: string;
  hour: string;
  minute: string;
  earlier: string;
  later: string;
  done: string;
  clear: string;
  busy: string;
  unavailable: string;
  noDate: string;
  noTime: string;
}

interface TimeWords {
  /** A BCP 47 locale for dates and numbers; defaults to the world's language. */
  locale?: string;
  labels?: Partial<TimeLabels>;
}

/** A moment said relative to now ("5 minutes ago"), its exact time kept for readers. */
export interface TimeAgoContract extends TimeWords {
  at: string | Date;
  /** Fixed now, for tests and frozen views; otherwise it keeps itself current. */
  now?: Date;
  /** Also show the exact day and time after the relative words. */
  exact?: boolean;
}

/**
 * Travel through days: previous, the day (and time) chosen, next, and back
 * to today, with past or future said in words and drawn by the world's light.
 */
export interface DateTravelContract extends TimeWords {
  date: string;
  onChange: (date: string) => void;
  /** How far previous and next move. Default `day`. */
  step?: 'day' | 'week' | 'month';
  /** A time of day with the date; shown and chosen only when `onTimeChange` is given. */
  time?: string | null;
  onTimeChange?: (time: string | null) => void;
  /** Minutes the time moves by. Default 5. */
  timeStep?: number;
  min?: string;
  max?: string;
  /** Activity per day for the calendar it opens. */
  activity?: Readonly<Record<string, number>>;
  /** Say "Looking back" or "Planning ahead" above the day. Default true. */
  showIntent?: boolean;
  /** Fixed today, for tests. */
  today?: Date;
}

/** A month of days to choose from, with activity marked by dot and words. */
export interface MonthGridContract extends TimeWords {
  value: string | null;
  onChange: (date: string) => void;
  /** The grid's accessible name ("Lesson date"). */
  label: string;
  /** Which month shows, `YYYY-MM`; uncontrolled from the value or today when omitted. */
  month?: string;
  onMonthChange?: (month: string) => void;
  min?: string;
  max?: string;
  activity?: Readonly<Record<string, number>>;
  today?: Date;
}

export interface DateFieldContract extends FieldContract, TimeWords {
  value: string | null;
  onChange: (date: string | null) => void;
  min?: string;
  max?: string;
  activity?: Readonly<Record<string, number>>;
  disabled?: boolean;
}

export interface TimeFieldContract extends FieldContract, TimeWords {
  value: string | null;
  onChange: (time: string | null) => void;
  /** Minutes each step moves. Default 5. */
  step?: number;
  /** Earliest and latest times, `HH:MM`. */
  min?: string;
  max?: string;
  disabled?: boolean;
}

/**
 * Date: Primary temporal navigator that steps down across form factors:
 * full (floor bar) -> medium (window bar) -> compact (pill) -> nano (tile).
 */
export interface DateContract extends TimeWords {
  date: string;
  onChange?: (date: string) => void;
  /** Degradation form factor tier */
  formFactor?: 'nano' | 'compact' | 'medium' | 'full' | 'auto' | 'expandable';
  dateLabel?: string;
  today?: string;
  activity?: Readonly<Record<string, number>>;
  disabled?: boolean;
  min?: string;
  max?: string;
}

/**
 * Time: Minimalist ticking analog/digital time indicator.
 */
export interface TimeContract {
  time?: string;
  onChange?: (time: string) => void;
  format?: '12h' | '24h';
  live?: boolean;
  showAnalog?: boolean;
  disabled?: boolean;
}

/**
 * DateTimeCombo: Unified master control combining Date and Time with decoupled dismissal.
 */
export interface DateTimeComboContract extends DateContract {
  time?: string;
  onTimeChange?: (time: string) => void;
  timeFormat?: '12h' | '24h';
  allowDismiss?: boolean;
}

export type ScrollAreaVariant =
  | 'auto'
  | 'sovereign'
  | 'mechanical'
  | 'fluid'
  | 'circadian'
  | 'ratna'
  | 'perahera'
  | 'leaf'
  | 'perimeter'
  | 'macos'
  | 'fluent'
  | 'classic'
  | 'native';

/**
 * Resolves the living scrollbar archetype for a given world ID.
 * Defaults to 'sovereign' for sanctuary (the quiet washi paper & lamp baseline).
 */
export function resolveScrollVariantForWorld(worldId?: string): ScrollAreaVariant {
  switch (worldId) {
    case 'wewa':
      return 'fluid';
    case 'kele':
      return 'leaf';
    case 'ratna':
      return 'ratna';
    case 'perahera':
      return 'perahera';
    case 'spark':
      return 'circadian';
    case 'kandyan':
    case 'angampora':
      return 'mechanical';
    default:
      return 'sovereign';
  }
}

export interface ScrollAreaPip {
  id: string;
  /** Position along track as a percentage [0..100]. */
  offsetPct: number;
  /** Accessible label or chapter title. */
  label?: string;
}

/**
 * ScrollArea: Sovereign scroll container with normalized wheel translation,
 * pointer-capture drag panning, kinetic momentum, and custom hairline tracking.
 */
export interface ScrollAreaContract {
  children?: ReactNode;
  /**
   * Scroll axis.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /**
   * Scrollbar style archetype:
   * - 'sovereign': Gurudevi living light (world-responsive lamp glow).
   * - 'mechanical': 3D tactile micro-trench with knurled brass/graphite louvers.
   * - 'fluid': Kinetic dewdrop with velocity-driven surface tension elongation.
   * - 'circadian': Living sundial needle casting diurnal solar shadows.
   * - 'perimeter': Seamless frame indicator traveling along container's outer stroke.
   * - 'macos': Apple floating translucent pill with auto-hide.
   * - 'fluent': Windows 11 Fluent expanding rail (4px -> 10px on hover).
   * - 'classic': Windows classic persistent track with stepper arrow buttons.
   * - 'native': Standard unstyled browser native OS scrollbar.
   * @default 'sovereign'
   */
  variant?: ScrollAreaVariant;
  /**
   * Visual tone for the scrollbar thumb and living glow.
   * - 'lamp': World's radiant lamp color with glowing halo.
   * - 'quiet': Minimal subtle hairline without bloom.
   * - 'signal': High-contrast electric accent with crisp edge.
   * @default 'lamp'
   */
  tone?: 'lamp' | 'quiet' | 'signal';
  /**
   * Show subtle alpha edge-fade masks when overflow exists.
   * @default true
   */
  showEdgeGradients?: boolean;
  /**
   * Allow pointer dragging on canvas to scroll (desktop mouse/stylus).
   * @default true
   */
  dragToScroll?: boolean;
  /**
   * Apply physics-based kinetic momentum decay on release after pointer panning.
   * @default true
   */
  kineticMomentum?: boolean;
  /**
   * Visibility policy for the scrollbar track and thumb.
   * @default 'hover'
   */
  scrollbarVisibility?: 'always' | 'hover' | 'scrolling';
  /**
   * Optional custom id assigned to the internal scrollable viewport element.
   * Useful when anchor links or external scroll listeners (e.g. skip links, headers)
   * need to target the exact scrolling element rather than the outer wrapper.
   */
  viewportId?: string;
  /**
   * Accessible region label.
   */
  label?: string;
  /**
   * Optional spatial landmark beads or chapter pips positioned along the rail.
   */
  pips?: readonly ScrollAreaPip[];
  /**
   * Optional HUD context label displayed on hover/drag scrub.
   */
  hudLabel?: string;
  /**
   * Optional callback reporting normalized scroll progress [0..1] per active axis.
   */
  onScrollProgress?: (progress: { x: number; y: number }) => void;
}

export interface TimelineEntry {
  id: string;
  at: string | Date;
  title: string;
  body?: string;
  tone?: 'plain' | 'lamp' | 'danger';
  onPress?: () => void;
}

/** Moments in time order by day: the past recedes, a now line, the future warmed. */
export interface TimelineContract extends TimeWords {
  entries: readonly TimelineEntry[];
  /** The list's accessible name. */
  label: string;
  now?: Date;
}

// ---------------------------------------------------------------------------
// Basic pieces: things most screens need and the kit lacked.
// ---------------------------------------------------------------------------

/** A titled part that folds open and shut; closed parts keep their summary. */
export interface DisclosureContract {
  title: string;
  /** A line under the title, shown open or shut ("3 answers"). */
  summary?: string;
  /** Controlled when given, with `onOpenChange`. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/** A calm message inside the page (not a banner over it). */
export interface NoticeContract {
  /** `danger` is announced at once; the others politely. Default `neutral`. */
  tone?: BadgeTone;
  title?: string;
  message: string;
  action?: { label: string; onPress: () => void };
  onDismiss?: () => void;
  /** Name of the dismiss control. Default "Dismiss". */
  dismissLabel?: string;
}

export interface SearchFieldContract {
  /** The field's name, heard and (by default) hidden; the placeholder is not a label. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** A magnifier from the app's icon set, drawn soft at the start. */
  icon?: ComponentType<KitIconProps>;
  onSubmit?: (value: string) => void;
  /** How many results there are now; said politely as it changes. */
  resultCount?: number;
  labels?: Partial<{ clear: string; results: (count: number) => string }>;
}

/** A whole number chosen by steps, or typed (web), within bounds. */
export interface NumberStepperContract {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Default 1. */
  step?: number;
  /** Words after the number ("minutes"); also heard. */
  unit?: string;
  hint?: string;
  disabled?: boolean;
  labels?: Partial<{ decrease: string; increase: string }>;
}

export interface StepItem {
  key: string;
  label: string;
  /** Done and error are said in words and drawn; the current step comes from `current`. */
  state?: 'done' | 'error';
}

/** Where a person is in a sequence of steps (a form, a setup); never colour alone. */
export interface StepsContract {
  steps: readonly StepItem[];
  /** Index of the step on screen. */
  current: number;
  label: string;
  /** Going back to a step; steps up to the current one, and done ones, are offered. */
  onSelect?: (index: number) => void;
  labels?: Partial<{ step: (n: number, total: number) => string; done: string; error: string }>;
}

// ---------------------------------------------------------------------------
// Settings rows: Row is the value row (label and detail); these add the
// three behaviours settings need: pick one, go elsewhere, end something.
// ---------------------------------------------------------------------------

/** A setting with one chosen value; the row shows it, pressing opens the choices. */
export interface ChoiceRowContract<V extends string = string> {
  label: string;
  value: V | null;
  options: readonly ChoiceOption<V>[];
  onChange: (value: V) => void;
  note?: string;
  /** Shown when nothing is chosen. Default "Not set". */
  placeholder?: string;
}

/** A row that goes somewhere: another screen, or (`external`) outside the app. */
export interface LinkRowContract {
  label: string;
  detail?: string;
  note?: string;
  /** Web: an address the row links to. Native: opened with the system when `external`. */
  href?: string;
  onPress?: () => void;
  /** Leaves the app (a browser, mail); said in words and drawn with ↗. */
  external?: boolean;
  labels?: Partial<{ opensOutside: string }>;
}

/** A row that ends or deletes something, asking first when `confirm` is given. */
export interface DangerRowContract {
  label: string;
  note?: string;
  onConfirm: () => void;
  confirm?: {
    title: string;
    description?: string;
    confirmLabel: string;
    cancelLabel?: string;
  };
  /** While the action runs: the row is off and says so. */
  busy?: boolean;
  labels?: Partial<{ working: string }>;
}

// ---------------------------------------------------------------------------
// Launcher: the rooms, tools and actions a place offers, found by search,
// grouped by kind, opened with a press and kept in the task strip with a
// long press.
// ---------------------------------------------------------------------------

export interface LauncherItem {
  id: string;
  title: string;
  description?: string;
  icon?: ComponentType<KitIconProps>;
  /** A short word that needs the person ("New", "3 due"); drawn lit and said. */
  badge?: string;
  /** Items sharing a group sit together under its name ("Teaching", "Records"). */
  group?: string;
}

export interface LauncherLabels {
  search: string;
  recent: string;
  keep: string;
  kept: (title: string) => string;
  results: (count: number) => string;
  empty: string;
  other: string;
}

export interface LauncherContract {
  /** The launcher's accessible name ("Workspace rooms and tools"). */
  label: string;
  items: readonly LauncherItem[];
  onOpen: (id: string) => void;
  /** Keep in the task strip without opening (long press, or an action for readers). */
  onKeep?: (id: string) => void;
  /** Ids shown first under "Recent", most recent first. */
  recent?: readonly string[];
  /** Search words; filters by title, description and group. */
  placeholder?: string;
  labels?: Partial<LauncherLabels>;
}

export type LanguagePickerVariant = 'capsule' | 'dropdown' | 'auto';

export interface LanguageItemMeta {
  readonly code: WorldLanguage;
  readonly label: string;
  readonly nativeLabel: string;
  readonly shortLabel: string;
}

export const CANONICAL_LANGUAGES: readonly LanguageItemMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', shortLabel: 'EN' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල', shortLabel: 'සි' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', shortLabel: 'த' },
] as const;

export interface LanguagePickerContract {
  /** Active language code ('en' | 'si' | 'ta'). */
  value: WorldLanguage;
  /** Called when language is selected. */
  onChange: (language: WorldLanguage) => void;
  /** Display presentation: 'capsule' (segmented buttons) or 'dropdown' (popout). Defaults to 'capsule'. */
  variant?: LanguagePickerVariant;
  /** Accessible label for the control. */
  label?: string;
  /** Languages displayed in the picker. Defaults to CANONICAL_LANGUAGES. */
  languages?: readonly LanguageItemMeta[];
  /** Optional container query threshold for 'auto' variant (px). Defaults to 360. */
  threshold?: number;
}

export type ThemeSwitcherVariant = 'auto' | 'pill' | 'compact' | 'icon';
export type LuminanceMode = 'light' | 'dark' | 'system';
export type ResolvedLuminance = 'light' | 'dark';

export interface ThemeSwitcherContract {
  /** The active world id. */
  world: WorldId;
  /** Callback when world changes. */
  onWorldChange: (world: WorldId) => void;
  /** Current luminance preference. */
  mode?: LuminanceMode;
  /** Callback when luminance mode changes. */
  onModeChange?: (mode: LuminanceMode) => void;
  /** Resolved active luminance (light or dark), taking into account system preference. */
  resolvedMode?: ResolvedLuminance;
  /** Visual presentation mode. 'auto' degrades from pill -> compact -> icon via container width. */
  variant?: ThemeSwitcherVariant;
  /** Accessible label for the control. */
  label?: string;
  /** Current language for localized world labels. */
  lang?: WorldLanguage;
  /** Container width threshold in px for 'auto' degradation. Default: 420. */
  threshold?: number;
}




export interface RadarAxis {
  id: string;
  /** Already translated ("Maths", "Caring for others"). */
  label: string;
}

export interface RadarSeries {
  id: string;
  /** Already translated ("Now", "Start of term"). */
  label: string;
  /** 0 to 1 for each axis id. A missing axis is drawn at the centre and said aloud as "not yet". */
  values: Readonly<Record<string, number>>;
  /** `now` is lit; `then` is a quiet outline behind it, for comparing a person with their own past. */
  emphasis?: 'now' | 'then';
}

/**
 * Many dimensions of one person at once. The kit draws; it never decides what the axes or the
 * values mean. Callers pass the person's own areas and their own evidence or self-rating, never a
 * score computed about them or a comparison with others.
 */
export interface RadarContract {
  axes: RadarAxis[];
  series: RadarSeries[];
  /** What the chart is, already translated ("Your areas, this term and last"). */
  label: string;
  /** Said for an axis with no value ("not yet"), already translated. */
  missingLabel: string;
  size?: number;
}
