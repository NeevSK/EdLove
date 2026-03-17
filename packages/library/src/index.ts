export * from './api/library';
export * from './types';
export * from './constants/shelf';
export * from './hooks/useLibrary';
export * from './components/ResourceList';
export { default as AddResourceModal } from './components/AddResourceModal';
export { default as LibraryScreen } from './screens/LibraryScreen';
export { default as PDFViewerScreen } from './screens/PDFViewerScreen';
export { default as VideoPlayerScreen } from './screens/VideoPlayerScreen';

export const LIBRARY_UI_CATEGORIES = [
    { id: 'All', en: 'All' },
    { id: 'video', en: 'Videos' },
    { id: 'pdf', en: 'Documents' },
    { id: 'link', en: 'Web Resources' },
    { id: 'text', en: 'Articles' },
    { id: 'note', en: 'Personal Notes' }
];
export { default as MapScreen } from './screens/MapScreen';
export { default as CuratorReviewScreen } from './screens/CuratorReviewScreen';
export * from './components/modals/StudentAnalysisModal';
export * from './components/perspectives/UniversalPerspective';

