'use client';

import type { MediaAdapterSet } from '@repo/ui/components/web';
import { DocxPreviewAdapter } from './DocxPreviewAdapter';
import { H5pIframeHost } from './H5pIframeHost';
import { MarkdownFileAdapter, MarpMarkdownAdapter } from './MarpMarkdownAdapter';
import { MilkdownEditorAdapter } from './MilkdownEditorAdapter';
import { PdfJsAdapter } from './PdfJsAdapter';
import { PptxPreviewAdapter } from './PptxPreviewAdapter';

/**
 * Full client-side media adapter set for `apps/gurudevi-web`:
 * - PDF via `pdfjs-dist`
 * - Word (`.docx`) via `docx-preview`
 * - PowerPoint (`.pptx`) via `pptx-preview`
 * - Gurudevi Markdown & Marp slides via `@repo/library/content/body` + `@marp-team/marp-core`
 * - WYSIWYG Markdown editing via `@milkdown/kit`
 * - Interactive H5P via `h5p-standalone` + `@repo/library/h5p`
 */
export const WEB_MEDIA_ADAPTERS: MediaAdapterSet = {
  markdown: MarpMarkdownAdapter,
  richText: MilkdownEditorAdapter,
  h5p: H5pIframeHost,
  documents: {
    pdf: PdfJsAdapter,
    document: DocxPreviewAdapter,
    slides: PptxPreviewAdapter,
    markdown: MarkdownFileAdapter,
  },
};
