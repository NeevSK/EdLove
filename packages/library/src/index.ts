export {
  AssetCreationModal as AddResourceModal,
  CollectionCreationModal as AddCollectionModal,
} from '@repo/ui/components/media/AssetCreationPortal';
export { UniversalPerspective } from '@repo/ui/components/visualization/UniversalPerspective';

export * from './api';
export * from './components';
export * from './constants/libraryRegistry';
export {
  getOrderedShelfDefs,
  SHELF_DEFS,
  type ShelfDefinition,
} from './constants/shelf';
export * from './hooks';
export * from './screens';
export * from './types';
export { buildLibraryExternalLinkOptions } from './utils/externalLinks';

export const LIBRARY_UI_CATEGORIES_LOCAL = [
  { id: 'All', en: 'All' },
  { id: 'video', en: 'Videos' },
  { id: 'pdf', en: 'Documents' },
  { id: 'link', en: 'Web Resources' },
  { id: 'reading', en: 'Articles' },
  { id: 'note', en: 'Personal Notes' },
];
