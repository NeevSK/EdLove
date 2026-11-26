// Gurudevi Markdown v1: the one stored form of prose content. See
// docs/architecture/2026-11-14-content-authoring-and-formats.md.

// The block registry's neutral half: the typed tree both renderers read.
export {
  CALLOUT_TONES,
  type CalloutTone,
  type ContentNode,
  type Embed,
  embedsOf,
  hintLadder,
  type Inline,
  LeafAttributes,
  toContentTree,
} from './blocks';
export {
  type BodyProblem,
  CONTAINER_BLOCKS,
  canonicalBody,
  DIALECT_VERSION,
  FrontMatter,
  LEAF_BLOCKS,
  type ParsedBody,
  parseBody,
  serializeBody,
  splitSlides,
  withoutPositions,
} from './dialect';
