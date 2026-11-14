// Gurudevi Markdown v1: the one stored form of prose content. See
// docs/architecture/2026-11-14-content-authoring-and-formats.md.
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
