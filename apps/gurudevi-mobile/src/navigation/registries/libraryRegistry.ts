import { BookOpen, Bookmark, FileSpreadsheet, FileText, Library, Plus } from '@repo/ui/icons';
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
      route: '/library?category=Curriculum',
      icon: BookOpen,
      defaultSubTab: true,
    },
    {
      id: 'lib-resources',
      title: 'Resource Bank',
      description: 'Pedagogical slide decks, worksheets and multi-media assets',
      route: '/library?category=Worksheets',
      icon: Library,
    },
    {
      id: 'lib-exams',
      title: 'Past Papers & Exam Archives',
      description: 'Standardized assessment archives with marking schemes',
      route: '/library?category=Past%20Papers',
      icon: FileText,
    },
    {
      id: 'lib-saved',
      title: 'Saved & Offline Desk',
      description: 'Locally cached materials accessible without network',
      route: '/library?view=saved',
      icon: Bookmark,
    },
    {
      id: 'lib-tools',
      title: 'Knowledge Tools',
      description: 'Document scanner, OCR lens, spreadsheet grid and PDF editor',
      route: '/library/tools',
      icon: FileSpreadsheet,
    },
    {
      id: 'lib-contribute',
      title: 'Contribute Material',
      description: 'Submit verified lesson plans, notes and curriculum resources',
      route: '/library/contribute',
      icon: Plus,
    },
  ],
};
