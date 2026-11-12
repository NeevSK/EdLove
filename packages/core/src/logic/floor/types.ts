/**
 * The floor system's vocabulary. A screen is a tree of containers (screen,
 * floor, area, group, piece, part); every container has a footprint, a weight,
 * limits, a pattern and a cost. Everything here is plain data so the same tree
 * can be laid out on native and web, printed, compared and linted.
 *
 * Design: docs "Floor System" (Claude Doc), sections "Everything is a container"
 * through "Inspectable, comparable, testable".
 */

export type FloorLevel = 'screen' | 'floor' | 'area' | 'group' | 'piece' | 'part';

/** When a piece matters: now, later today, or any time. */
export type TimeBand = 'now' | 'later' | 'anytime';

/** How dense a floor is (spacing doc 16): it sets gaps, chunk caps and ornament. */
export type DensityTier = 'calm' | 'standard' | 'dense';

/** Width classes, in dp (Android window size classes; Apple size classes map onto them). */
export type WidthClass = 'compact' | 'medium' | 'expanded' | 'large' | 'xlarge';

export type Orientation = 'portrait' | 'landscape';

/** How much may move: decided by the person, the world and the verger together. */
export type MotionLevel = 'full' | 'reduced' | 'none';

/** The verger's visual detail tier. */
export type DetailTier = 'rich' | 'balanced' | 'essential';

/** What a group is for; it picks the pattern. */
export type GroupJob = 'act' | 'glance' | 'browse' | 'find' | 'step' | 'track';

/** How a group's pieces are drawn: a shape is not a pattern, it is how a pattern's pieces look. */
export type PieceShape = 'tile' | 'circle' | 'spine' | 'wide';

/** Depth from placement, cheapest first. None of them needs motion. */
export type DepthCue = 'overlap' | 'scale' | 'light' | 'haze' | 'tilt';

export type PatternId =
  | 'hero'
  | 'lamp'
  | 'stream'
  | 'tile-grid'
  | 'mixed-tiles'
  | 'shelf'
  | 'circle-rail'
  | 'chip-rail'
  | 'grouped-list'
  | 'one-at-a-time'
  | 'path'
  | 'day-river'
  | 'pinboard'
  | 'list-detail'
  | 'desk'
  | 'board';

/** What a container costs to draw. Summed up the tree against the tier's budget. */
export interface FloorCost {
  /** Mounted views, roughly. */
  views: number;
  /** Pictures decoded. */
  pictures: number;
  /** Anything that keeps moving. */
  moves: boolean;
}

/**
 * What a component tells its parent: how small it can be, what it would like,
 * what aspect it keeps, what it costs and how it is spoken. Sizes are at text
 * scale 1 and grow with the person's text size.
 */
export interface FloorFit {
  level: FloorLevel;
  min: { w?: number; h: number };
  preferred?: { w?: number; h?: number };
  /** Width over height, kept when the parent cannot give the preferred size. */
  aspect?: number;
  /** Takes a finger: the touch minimum applies. */
  interactive?: boolean;
  cost: FloorCost;
  /** How a screen reader speaks it; `{n}` and `{total}` are filled in. */
  spoken?: string;
}

/** Things embedded in a piece that the floor must account for. */
export interface EmbeddedPart {
  kind: 'icon' | 'emoji' | 'picture' | 'tooltip' | 'badge' | 'motion';
  /** Words a person needs; never allowed to live only in a tooltip. */
  carriesNeededWords?: boolean;
  /** Spoken name, required for emoji and pictures that mean something. */
  spoken?: string;
  /** Drawn height, for parts that take a finger (a badge never should). */
  height?: number;
  interactive?: boolean;
}

export interface AreaInput {
  id: string;
  label: string;
  /** A labelled smart area ("Today"): the only place the system may reorder by default. */
  smart?: boolean;
}

export interface GroupInput {
  id: string;
  label: string;
  area: string;
  job: GroupJob;
  shape?: PieceShape;
  /** The person's saved position among the area's groups. */
  savedIndex?: number;
  /** The person pinned this group. */
  pinned?: boolean;
}

export interface PieceInput {
  id: string;
  label: string;
  group: string;
  time?: TimeBand;
  needsAttention?: boolean;
  /** How much this piece matters to the role in this room, 1 by default. */
  roleImportance?: number;
  pinned?: boolean;
  /** Holds the lamp: it matters most right now. At most one per screen. */
  lit?: boolean;
  /** Something the person must do (roll call, marks due), not only browse. */
  task?: boolean;
  /** The person's saved position in the group. */
  savedIndex?: number;
  fit: FloorFit;
  parts?: EmbeddedPart[];
}

/** One bar of chrome: status bar, header, perspective stripe, rooms bar, action button. */
export interface ChromeBar {
  id: string;
  height: number;
  /** Higher gives way first when the floor is short of room. */
  giveWayRank: number;
  /** Never hidden (the status bar). */
  essential?: boolean;
}

/** The real estate: the window, the person's text size, the keyboard and the chrome. */
export interface FloorSpace {
  width: number;
  height: number;
  fontScale: number;
  insets?: { top: number; bottom: number; left: number; right: number };
  keyboard?: number;
  chrome: readonly ChromeBar[];
}

/** Fine-grained dials from the person, the verger and the world. */
export interface FloorControls {
  detail: DetailTier;
  /** The person's own motion setting (reduce motion included). */
  motion: MotionLevel;
  /** Overrides the tier's cost budget, for tests and the lab. */
  costBudget?: number;
}

/** What the active world asks of the floor; it never decides space. */
export interface WorldFloorBias {
  depthCues?: readonly DepthCue[];
  /** Shape a world prefers for browsing shelves, where the group did not say. */
  shelfShape?: PieceShape;
  /** The world's motion ceiling. */
  motion?: MotionLevel;
}

export interface FloorFootprint {
  w: number;
  h: number;
}

export interface FloorNode {
  id: string;
  level: FloorLevel;
  label: string;
  pattern?: PatternId;
  footprint: FloorFootprint;
  weight: number;
  cost: FloorCost;
  motion: MotionLevel;
  depth: readonly DepthCue[];
  /** Above the first screen, below it (reached by scrolling), or folded behind "See all". */
  placement: 'first-screen' | 'below' | 'folded';
  /** Why the engine chose this, in plain words, for the inspector. */
  why: string[];
  children: FloorNode[];
  /** For pieces: the input they came from. */
  piece?: PieceInput;
}

export interface FloorTree {
  room: string;
  widthClass: WidthClass;
  orientation: Orientation;
  tier: DensityTier;
  /** Chrome that stays and chrome that gave way. */
  chrome: { shown: string[]; hidden: string[] };
  root: FloorNode;
  /** Pieces in reading order, the same order the screen reader uses. */
  readingOrder: string[];
  totalCost: FloorCost;
  budget: number;
}
