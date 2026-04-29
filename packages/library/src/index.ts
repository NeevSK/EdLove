export {
  AssetCreationModal as AddResourceModal,
  CollectionCreationModal as AddCollectionModal,
  UniversalPerspective,
} from '@repo/ui';
export { libraryAPI } from './api';
export { CollectionPickerModal } from './components/CollectionPickerModal';
export { ResourceList, type ResourceListProps } from './components/ResourceList';
export {
  type DisplayResourceType,
  ResourceRow,
  type ResourceRowProps,
} from './components/ResourceRow';
export { getOrderedShelfDefs, SHELF_DEFS, type ShelfDefinition } from './constants/shelf';
export { LIBRARY_KEYS, useBookmarkedResources, useCollection, useLibrary } from './hooks';
export { default as CollectionDetailScreenWeb } from './screens/CollectionDetailScreen.web';
export { default as LibraryScreen } from './screens/LibraryScreen';
export { default as LibraryScreenWeb } from './screens/LibraryScreen.web';
export { default as PDFViewerScreen } from './screens/PDFViewerScreen';
export { default as VideoPlayerScreen } from './screens/VideoPlayerScreen';
export {
  type CollectionFilters,
  type CreateCollectionInput,
  type CreateResourceInput,
  type KnowledgeLink,
  type KnowledgeNode,
  type KnowledgeTopology,
  LIBRARY_UI_CATEGORIES,
  type LibraryCollection,
  type LibraryResource,
  type ResourceDifficulty,
  type ResourceFilters,
  type ResourceLanguage,
  type ResourceVisibility,
} from './types';
export { buildLibraryExternalLinkOptions } from './utils/externalLinks';

export const LIBRARY_UI_CATEGORIES_LOCAL = [
  { id: 'All', en: 'All' },
  { id: 'video', en: 'Videos' },
  { id: 'pdf', en: 'Documents' },
  { id: 'link', en: 'Web Resources' },
  { id: 'reading', en: 'Articles' },
  { id: 'note', en: 'Personal Notes' },
];

export { LibraryResourceCard } from './components/LibraryResourceCard';
export {
  LibraryThumbnailCard,
  type LibraryThumbnailCardProps,
} from './components/LibraryThumbnailCard';
export { StudentAnalysisModal } from './components/modals/StudentAnalysisModal';
export { default as CuratorReviewScreen } from './screens/CuratorReviewScreen';
export { default as MapScreen } from './screens/MapScreen';
