/**
 * The world contract.
 *
 * Gurudevi's components are generic (Button, Text, Surface, TextField, Chip,
 * Row, Section). They know behaviour, states and accessibility, nothing about
 * looks. A *world* is an adapter that dresses them: semantic colour tokens,
 * a few style choices, and the recipes derived from those.
 *
 * A world resolves against the hour of the day (phase) and light or dark mode,
 * so the same world feels like dawn paper at 6 and lamp light after dusk.
 *
 * Everything in this folder is plain data so mobile (React Native) and web
 * (DOM + CSS variables) render from one source.
 */

export type WorldId = 'sanctuary' | 'kandyan' | 'wewa' | 'kele' | 'angampora' | 'ratna';

export type WorldPhase = 'predawn' | 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

export type WorldMode = 'light' | 'dark';

export type WorldLanguage = 'en' | 'si' | 'ta';

/**
 * Semantic tokens. Components only ever use these names, never raw colours.
 * All values are opaque `#RRGGBB` so contrast can be tested.
 */
export interface WorldTokens {
  /** The place itself: the page behind everything. */
  ground: string;
  /** A held thing lifted from the ground: a sheet, a raised surface. */
  raised: string;
  /** A recessed well: inset notes, quiet input areas. */
  sunken: string;
  /** Primary text and drawn lines. */
  ink: string;
  /** Secondary text. Must still pass 4.5:1 on ground. */
  inkSoft: string;
  /** Decorative and disabled text. 3:1 on ground, never for body copy. */
  inkFaint: string;
  /** Hairlines and dividers. */
  line: string;
  /** The one lit thing: primary action, selection, attention. */
  lamp: string;
  /** Text and icons placed on `lamp`. */
  onLamp: string;
  /** `lamp` deep enough to be text on `ground` (links, signals). */
  lampDeep: string;
  /** The colour of the world's light, used for glows and washes. */
  glow: string;
  /** The world's ornament colour: borders, bands, inner frames. */
  ornament: string;
  danger: string;
  onDanger: string;
  success: string;
  /** Keyboard and screen-reader focus ring. */
  focus: string;
}

/** Corner radius: one value, or [topLeft, topRight, bottomRight, bottomLeft]. */
export type Radius = number | readonly [number, number, number, number];

/** A solid colour or a vertical gradient (top to bottom). */
export type Paint = string | { readonly from: string; readonly to: string };

/** A drawn edge. `inset` > 0 draws it inside, leaving a gap (a double frame). */
export interface Edge {
  width: number;
  color: string;
  inset?: number;
}

export interface Glow {
  color: string;
  radius: number;
  opacity: number;
}

export interface Shadow {
  color: string;
  opacity: number;
  radius: number;
  offsetY: number;
}

export type FontRole = 'serif' | 'sans';

export type FontWeight = '400' | '500' | '600' | '700';

export interface TypeStyle {
  family: FontRole;
  size: number;
  lineHeight: number;
  weight: FontWeight;
  letterSpacing: number;
  italic: boolean;
  uppercase: boolean;
  color: string;
}

export type TextRole = 'display' | 'title' | 'body' | 'label' | 'caption' | 'value';

export type TextTone = 'ink' | 'soft' | 'faint' | 'lamp' | 'danger' | 'onLamp';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonVariantRecipe {
  /** `filled` and `outlined` are shaped controls; `text` is an underlined word. */
  form: 'filled' | 'outlined' | 'text';
  fill: Paint | null;
  ink: string;
  edge: Edge | null;
  innerEdge: Edge | null;
  glow: Glow | null;
  underline: Edge | null;
}

export interface ButtonRecipe {
  radius: Radius;
  gap: number;
  sizes: Record<ButtonSize, { height: number; paddingX: number; fontSize: number }>;
  label: Omit<TypeStyle, 'color'>;
  pressedOpacity: number;
  disabledOpacity: number;
  variants: Record<ButtonVariant, ButtonVariantRecipe>;
}

export type SurfaceTone = 'plain' | 'raised' | 'inset';

export interface SurfaceToneRecipe {
  fill: string | null;
  radius: Radius;
  padding: number;
  paddingX: number;
  edge: Edge | null;
  innerEdge: Edge | null;
  shadow: Shadow | null;
  /** Ruled lines instead of a box (the `plain` tone in most worlds). */
  ruleTop: Edge | null;
  ruleBottom: Edge | null;
}

export type SurfaceRecipe = Record<SurfaceTone, SurfaceToneRecipe>;

export type FieldState = 'rest' | 'focus' | 'error' | 'disabled';

export interface FieldRecipe {
  form: 'underline' | 'box';
  label: TypeStyle;
  value: TypeStyle;
  placeholder: { color: string; italic: boolean };
  hint: TypeStyle;
  error: TypeStyle;
  minHeight: number;
  paddingX: number;
  radius: Radius;
  fill: string | null;
  states: Record<FieldState, { edge: Edge; glow: Glow | null }>;
}

export interface ChipStateRecipe {
  fill: string | null;
  ink: string;
  edge: Edge | null;
  underline: Edge | null;
  glow: Glow | null;
}

export interface ChipRecipe {
  form: 'underline' | 'outlined';
  radius: Radius;
  paddingX: number;
  paddingY: number;
  gap: number;
  label: Omit<TypeStyle, 'color'>;
  rest: ChipStateRecipe;
  selected: ChipStateRecipe;
}

export interface RowRecipe {
  minHeight: number;
  paddingY: number;
  gap: number;
  label: TypeStyle;
  detail: TypeStyle;
  note: TypeStyle;
  chevron: string;
  /** The small lit dot a row shows when it needs the person. */
  signal: { color: string; size: number; glow: Glow };
}

/**
 * How a group of rows is held together.
 * - `margin`: the group name sits in a left margin, rows on hairlines (a register).
 * - `thread`: a cord runs down the page, each group a knot on it (an ola book).
 * - `leaves`: each group is a strip of paper with binding holes.
 * - `light`: no lines; space, a voice title and a faint pool of light.
 * - `boxes`: a raised surface per group (the familiar card).
 */
export type BoundaryKind = 'margin' | 'thread' | 'leaves' | 'light' | 'boxes';

/** `dense` for working screens (Settings, Attendance); `calm` for quiet ones (Self). */
export type SectionDensity = 'dense' | 'calm';

export interface SectionRecipe {
  kind: BoundaryKind;
  title: TypeStyle;
  /** Larger human sentence that can open a calm section. */
  voice: TypeStyle;
  gap: number;
  paddingX: number;
  paddingY: number;
  /** Width of the margin column (`margin`). Falls back to stacked below `marginMinWidth`. */
  marginWidth: number;
  marginMinWidth: number;
  rowDivider: Edge | null;
  rule: Edge;
  thread: { color: string; width: number; knot: number; knotLit: string };
  leaf: { fill: string; radius: Radius; shadow: Shadow; hole: string };
  wash: { color: string; opacity: number; litOpacity: number };
  box: SurfaceToneRecipe;
}

export type OrnamentKind = 'hairline' | 'liyawela' | 'ripple' | 'branch' | 'stance' | 'lace';

export interface WorldRecipes {
  text: Record<TextRole, TypeStyle>;
  button: ButtonRecipe;
  surface: SurfaceRecipe;
  field: FieldRecipe;
  chip: ChipRecipe;
  row: RowRecipe;
  section: Record<SectionDensity, SectionRecipe>;
  ornament: { kind: OrnamentKind; color: string; accent: string };
  motion: { settleMs: number; breatheMs: number };
}

/**
 * The few choices that make a world itself. Recipes are built from these plus
 * the tokens, so a new world is mostly a palette and a dozen decisions.
 */
export interface WorldStyle {
  corner: { control: Radius; surface: Radius; chip: Radius; field: Radius };
  primary: { fill: 'solid' | 'gradient'; doubleEdge: boolean; glow: boolean };
  /** How secondary-weight actions look: an outlined control, or an underlined word. */
  quietForm: 'text' | 'outlined';
  raised: { edge: 'hairline' | 'frame' | 'none'; shadow: boolean };
  field: 'underline' | 'box';
  chip: 'underline' | 'outlined';
  /** Small labels: spaced small capitals, or a soft italic. */
  label: 'smallcaps' | 'italic';
  lineWeight: number;
  boundary: Record<SectionDensity, BoundaryKind>;
  ornament: OrnamentKind;
}

export interface WorldPalette {
  light: WorldTokens;
  dark: WorldTokens;
}

export interface WorldDefinition {
  id: WorldId;
  /** Display names in the three languages Gurudevi speaks. */
  names: Record<WorldLanguage, string>;
  /** One human line describing the world, in English. */
  description: string;
  /** The mode this world is happiest in, used by previews. */
  preferredMode: WorldMode;
  palette: WorldPalette;
  style: WorldStyle;
  /** Optional per-world adjustments after recipes are built. */
  refine?: (recipes: WorldRecipes, tokens: WorldTokens, mode: WorldMode) => WorldRecipes;
}

export interface ResolvedWorld {
  id: WorldId;
  phase: WorldPhase;
  mode: WorldMode;
  definition: WorldDefinition;
  tokens: WorldTokens;
  recipes: WorldRecipes;
}
