export * from './api/library';
export { default as AddCollectionModal } from './components/AddCollectionModal';
export { default as AddResourceModal } from './components/AddResourceModal';
export * from './components/ResourceList';
export * from './components/ResourceRow';
export * from './constants/shelf';
export * from './hooks/useLibrary';
export { default as CollectionDetailScreenWeb } from './screens/CollectionDetailScreen.web';
export { default as LibraryScreen } from './screens/LibraryScreen';
export { default as LibraryScreenWeb } from './screens/LibraryScreen.web';
export { default as PDFViewerScreen } from './screens/PDFViewerScreen';
export { default as VideoPlayerScreen } from './screens/VideoPlayerScreen';
export * from './types';
export * from './utils/externalLinks';

export const LIBRARY_UI_CATEGORIES = [
  { id: 'All', en: 'All' },
  { id: 'video', en: 'Videos' },
  { id: 'pdf', en: 'Documents' },
  { id: 'link', en: 'Web Resources' },
  { id: 'reading', en: 'Articles' },
  { id: 'note', en: 'Personal Notes' },
];
export * from './components/LibraryResourceCard';
export * from './components/LibraryThumbnailCard';
export * from './components/modals/StudentAnalysisModal';
export * from './components/perspectives/UniversalPerspective';
export { default as CuratorReviewScreen } from './screens/CuratorReviewScreen';
export { default as MapScreen } from './screens/MapScreen';
