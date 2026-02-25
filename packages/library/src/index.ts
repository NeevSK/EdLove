export * from './api/library';
export * from './types';
export * from './hooks/useLibrary';
export * from './components/ResourceList';
export * from './components/AddResourceModal';
export { default as LibraryScreen } from './screens/LibraryScreen';

export const LIBRARY_UI_CATEGORIES = [
    { id: 'All', en: 'All' },
    { id: 'video', en: 'Videos' },
    { id: 'pdf', en: 'Documents' },
    { id: 'link', en: 'Web Resources' },
    { id: 'text', en: 'Articles' },
    { id: 'note', en: 'Personal Notes' }
];
