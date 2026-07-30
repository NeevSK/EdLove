export {
  AssetCreationModal as AddResourceModal,
  CollectionCreationModal as AddCollectionModal,
} from '@repo/ui/components/media/AssetCreationPortal';
export { UniversalPerspective } from '@repo/ui/components/visualization/UniversalPerspective';

export * from '@repo/library/api';
export * from '@repo/library/components';
export * from '@repo/library/constants/libraryRegistry';
export {
  getOrderedShelfDefs,
  SHELF_DEFS,
  type ShelfDefinition,
} from '@repo/library/constants/shelf';
export * from '@repo/library/hooks';
export * from '@repo/library/screens';
export * from '@repo/library/types';
export { buildLibraryExternalLinkOptions } from '@repo/library/utils/externalLinks';

export const LIBRARY_UI_CATEGORIES_LOCAL = [
  { id: 'All', en: 'All' },
  { id: 'video', en: 'Videos' },
  { id: 'pdf', en: 'Documents' },
  { id: 'link', en: 'Web Resources' },
  { id: 'reading', en: 'Articles' },
  { id: 'note', en: 'Personal Notes' },
];

export { default } from '@repo/library/screens/LibraryScreen';
