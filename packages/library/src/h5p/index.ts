// The H5P player's pure core: package checks, the page that hosts the player, the bridge
// between page and host, and the events it reports. It names no app and imports only zod and
// fflate (boundary.test.ts holds that), so it can be published on its own later.
export {
  type ArchiveLimits,
  DEFAULT_ARCHIVE_LIMITS,
  type OpenedPackage,
  type OpenOptions,
  type OpenResult,
  openH5PArchive,
} from './h5pArchive';
export { applyH5PBehaviour, type H5PPlayPolicy } from './h5pBehaviour';
export {
  BRIDGE_CHANNEL,
  BRIDGE_VERSION,
  BridgeMessage,
  buildPlayerDocument,
  MAX_MESSAGE_CHARS,
  type ParseMessageResult,
  type PlayerAssets,
  type PlayerDocumentOptions,
  parseBridgeMessage,
} from './h5pBridge';
export {
  durationToMs,
  type H5PEvent,
  type H5PResult,
  type H5PVerb,
  type ReadEventResult,
  readH5PEvent,
  XAPIStatement,
} from './h5pEvents';
export {
  CONTENT_EXTENSIONS,
  checkEntryType,
  extensionOf,
  H5PDependency,
  H5PLibrary,
  H5PManifest,
  type H5PPackageIndex,
  type H5PProblem,
  type H5PProblemCode,
  type IndexOptions,
  type IndexResult,
  indexPackage,
  isArchiveNoise,
  LIBRARY_ONLY_EXTENSIONS,
  libraryFolderOf,
  libraryKey,
  safeEntryPath,
} from './h5pPackage';
