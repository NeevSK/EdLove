export {
  AssetCreationModal as AddResourceModal,
  CollectionCreationModal as AddCollectionModal,
} from '@repo/ui/components/media/AssetCreationPortal';
export { UniversalPerspective } from '@repo/ui/components/visualization/UniversalPerspective';

export * from '@library/api';
export * from '@library/components';
export * from '@library/constants/libraryRegistry';
export {
  getOrderedShelfDefs,
  SHELF_DEFS,
  type ShelfDefinition,
} from '@library/constants/shelf';
export * from '@library/hooks';
export * from '@library/screens';
export * from '@library/types';
export { buildLibraryExternalLinkOptions } from '@library/utils/externalLinks';

export const LIBRARY_UI_CATEGORIES_LOCAL = [
  { id: 'All', en: 'All' },
  { id: 'video', en: 'Videos' },
  { id: 'pdf', en: 'Documents' },
  { id: 'link', en: 'Web Resources' },
  { id: 'reading', en: 'Articles' },
  { id: 'note', en: 'Personal Notes' },
];

export { default } from '@library/screens/LibraryScreen';
