import { BookOpen, Bookmark, FileText, Library } from '@repo/ui/icons';
import type { MobileDomainRegistry } from './types';

export const libraryRegistry: MobileDomainRegistry = {
  domain: 'library',
  title: 'Knowledge Library',
  subtitle: 'Curated Textbooks, Resources & Exam Archives',
  items: [
    {
      id: 'lib-curriculum',
      title: 'Digital Textbooks & Syllabus',
      description: 'Official national curriculum texts and digital reference guides',
      route: '/library',
      icon: BookOpen,
      defaultSubTab: true,
    },
    {
      id: 'lib-resources',
      title: 'Resource Bank',
      description: 'Pedagogical slide decks, worksheets and multi-media assets',
      route: '/library',
      icon: Library,
    },
    {
      id: 'lib-exams',
      title: 'Past Papers & Exam Archives',
      description: 'Standardized assessment archives with marking schemes',
      route: '/library',
      icon: FileText,
    },
    {
      id: 'lib-saved',
      title: 'Saved & Offline Desk',
      description: 'Locally cached materials accessible without network',
      route: '/library',
      icon: Bookmark,
    },
  ],
};
