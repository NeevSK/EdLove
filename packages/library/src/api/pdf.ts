import { degrees, PDFDocument, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFTextField, rgb, StandardFonts } from 'pdf-lib';
import type { PDFImage, PDFPage } from 'pdf-lib';
import { bytesToBase64 } from '@repo/library/utils/bytes';

export interface PDFGenerateOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export interface PDFMergeOptions {
  pageRanges?: { start: number; end?: number }[];
}

export interface PDFSplitOptions {
  ranges: { start: number; end: number }[];
  outputPrefix?: string;
}

export interface PDFFormFieldOptions {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  value?: string | boolean;
  options?: string[];
  rect: { x: number; y: number; width: number; height: number };
  pageIndex: number;
  fontSize?: number;
  readOnly?: boolean;
}

export interface PDFWatermarkOptions {
  text: string;
  opacity?: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  rotation?: number;
  pages?: number[]; // specific pages, default all
}

export interface PDFImageEmbedOptions {
  imageBytes: Uint8Array;
  format: 'jpg' | 'png';
  x: number;
  y: number;
  width?: number;
  height?: number;
  pageIndex: number;
  opacity?: number;
}

export interface PDFPageDrawOptions {
  pageIndex: number;
  content: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  font?: keyof typeof StandardFonts;
}

/**
 * PDF Generation & Manipulation API (pdf-lib)
 * Offline-first, no external dependencies beyond pdf-lib
 */
export class PDFAPI {
  doc: PDFDocument | null = null;

  /**
   * Create a new PDF document
   */
  static async create(options: PDFGenerateOptions = {}): Promise<PDFAPI> {
    const api = new PDFAPI();
    api.doc = await PDFDocument.create();
    
    if (options.title) api.doc.setTitle(options.title);
    if (options.author) api.doc.setAuthor(options.author);
    if (options.subject) api.doc.setSubject(options.subject);
    if (options.keywords) api.doc.setKeywords(options.keywords);
    if (options.creator) api.doc.setCreator(options.creator);
    if (options.producer) api.doc.setProducer(options.producer);
    if (options.creationDate) api.doc.setCreationDate(options.creationDate);
    if (options.modificationDate) api.doc.setModificationDate(options.modificationDate);
    
    return api;
  }

  /**
   * Load existing PDF from bytes
   */
  static async load(pdfBytes: Uint8Array): Promise<PDFAPI> {
    const api = new PDFAPI();
    api.doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    return api;
  }

  /**
   * Load existing PDF from base64 string
   */
  static async loadFromBase64(base64: string): Promise<PDFAPI> {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return PDFAPI.load(bytes);
  }

  /**
   * Add a new page
   */
  addPage(width = 612, height = 792): PDFPage {
    if (!this.doc) throw new Error('Document not initialized');
    return this.doc.addPage([width, height]);
  }

  /**
   * Insert page at index
   */
  insertPage(index: number, width = 612, height = 792): PDFPage {
    if (!this.doc) throw new Error('Document not initialized');
    return this.doc.insertPage(index, [width, height]);
  }

  /**
   * Remove page at index
   */
  removePage(index: number): void {
    if (!this.doc) throw new Error('Document not initialized');
    this.doc.removePage(index);
  }

  /**
   * Get page count
   */
  getPageCount(): number {
    if (!this.doc) throw new Error('Document not initialized');
    return this.doc.getPageCount();
  }

  /**
   * Get page by index
   */
  getPage(index: number): PDFPage {
    if (!this.doc) throw new Error('Document not initialized');
    return this.doc.getPage(index);
  }

  async drawText(options: PDFPageDrawOptions): Promise<void> {
    if (!this.doc) throw new Error('Document not initialized');
    const page = this.doc.getPage(options.pageIndex);
    const font = await this.doc.embedFont(StandardFonts[options.font || 'Helvetica']);

    page.drawText(options.content, {
      x: options.x,
      y: options.y,
      size: options.fontSize || 12,
      font,
      color: options.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0, 0, 0),
    });
  }

  /**
   * Draw multiple lines of text with wrapping
   */
  async drawTextWrapped(
    pageIndex: number,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize = 12,
    lineHeight = 1.2,
    color = { r: 0, g: 0, b: 0 },
    fontName: keyof typeof StandardFonts = 'Helvetica'
  ): Promise<number> {
    if (!this.doc) throw new Error('Document not initialized');
    const page = this.doc.getPage(pageIndex);
    const font = await this.doc.embedFont(StandardFonts[fontName]);

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    let currentY = y;
    for (const line of lines) {
      page.drawText(line, {
        x,
        y: currentY,
        size: fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
      });
      currentY -= fontSize * lineHeight;
    }

    return y - currentY;
  }

  /**
   * Embed image and draw on page
   */
  async embedImage(options: PDFImageEmbedOptions): Promise<void> {
    if (!this.doc) throw new Error('Document not initialized');
    const page = this.doc.getPage(options.pageIndex);
    
    let image: PDFImage;
    if (options.format === 'jpg') {
      image = await this.doc.embedJpg(options.imageBytes);
    } else {
      image = await this.doc.embedPng(options.imageBytes);
    }
    
    const { width, height } = image.scale(options.width ? options.width / image.width : 1);
    
    page.drawImage(image, {
      x: options.x,
      y: options.y,
      width: options.width || width,
      height: options.height || height,
      opacity: options.opacity ?? 1,
    });
  }

  /**
   * Add form field
   */
  async addFormField(options: PDFFormFieldOptions): Promise<void> {
    if (!this.doc) throw new Error('Document not initialized');
    const form = this.doc.getForm();
    const page = this.doc.getPage(options.pageIndex);
    const font = await this.doc.embedFont(StandardFonts.Helvetica);

    switch (options.type) {
      case 'text': {
        const field = form.createTextField(options.name);
        field.setText(typeof options.value === 'string' ? options.value : '');
        if (options.readOnly) field.enableReadOnly();
        field.addToPage(page, { ...options.rect, font });
        break;
      }
      case 'checkbox': {
        const field = form.createCheckBox(options.name);
        if (options.value === true) field.check();
        if (options.readOnly) field.enableReadOnly();
        field.addToPage(page, options.rect);
        break;
      }
      case 'dropdown': {
        const field = form.createDropdown(options.name);
        if (options.options) field.setOptions(options.options);
        if (typeof options.value === 'string') field.select(options.value);
        if (options.readOnly) field.enableReadOnly();
        field.addToPage(page, { ...options.rect, font });
        break;
      }
      case 'radio': {
        if (!options.options) break;
        const group = form.createRadioGroup(options.name);
        for (const option of options.options) {
          group.addOptionToPage(option, page, options.rect);
        }
        if (typeof options.value === 'string') group.select(options.value);
        if (options.readOnly) group.enableReadOnly();
        break;
      }
    }
  }

  /**
   * Fill existing form fields
   */
  fillForm(fields: Record<string, string | boolean>): void {
    if (!this.doc) throw new Error('Document not initialized');
    const form = this.doc.getForm();

    for (const [name, value] of Object.entries(fields)) {
      const field = form.getField(name);
      if (field instanceof PDFCheckBox) {
        if (value === true) field.check();
        else field.uncheck();
      } else if (field instanceof PDFRadioGroup) {
        if (typeof value === 'string') field.select(value);
      } else if (field instanceof PDFDropdown) {
        if (typeof value === 'string') field.select(value);
      } else if (field instanceof PDFTextField) {
        field.setText(typeof value === 'string' ? value : '');
      }
    }
  }

  /**
   * Flatten form (make fields read-only)
   */
  flattenForm(): void {
    if (!this.doc) throw new Error('Document not initialized');
    this.doc.getForm().flatten();
  }

  /**
   * Add watermark to pages
   */
  async addWatermark(options: PDFWatermarkOptions): Promise<void> {
    if (!this.doc) throw new Error('Document not initialized');
    const pages = options.pages ?? this.doc.getPages().map((_, i) => i);
    const font = await this.doc.embedFont(StandardFonts.HelveticaBold);
    const opacity = options.opacity ?? 0.3;
    const fontSize = options.fontSize ?? 60;
    const color = options.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0.5, 0.5, 0.5);
    const rotation = options.rotation ?? -45;

    for (const pageIndex of pages) {
      const page = this.doc.getPage(pageIndex);
      const { width, height } = page.getSize();
      page.drawText(options.text, {
        x: width / 2 - font.widthOfTextAtSize(options.text, fontSize) / 2,
        y: height / 2 - fontSize / 4,
        size: fontSize,
        font,
        color,
        opacity,
        rotate: degrees(rotation),
      });
    }
  }

  /**
   * Merge multiple PDFs into this document
   */
  async merge(pdfBytesArray: Uint8Array[], options: PDFMergeOptions = {}): Promise<void> {
    if (!this.doc) throw new Error('Document not initialized');

    for (const [sourceIndex, pdfBytes] of pdfBytesArray.entries()) {
      const sourceDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const pageCount = sourceDoc.getPageCount();

      const requested = options.pageRanges?.[sourceIndex] ?? options.pageRanges?.[0];
      const start = Math.max(0, Math.min(requested?.start ?? 0, pageCount - 1));
      const end = Math.min(requested?.end ?? pageCount - 1, pageCount - 1);
      if (start > end) continue;

      const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      const pages = await this.doc.copyPages(sourceDoc, indices);

      for (const page of pages) {
        this.doc.addPage(page);
      }
    }
  }

  /**
   * Split document into multiple PDFs
   */
  async split(options: PDFSplitOptions): Promise<Uint8Array[]> {
    if (!this.doc) throw new Error('Document not initialized');
    const results: Uint8Array[] = [];
    
    for (const range of options.ranges) {
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(this.doc, 
        Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i)
      );
      for (const page of pages) {
        newDoc.addPage(page);
      }
      results.push(await newDoc.save());
    }
    return results;
  }

  /**
   * Reorder pages
   */
  async reorderPages(newOrder: number[]): Promise<void> {
    if (!this.doc) throw new Error('Document not initialized');
    const pages = this.doc.getPages();
    const newDoc = await PDFDocument.create();

    for (const index of newOrder) {
      if (index >= 0 && index < pages.length) {
        const copied = await newDoc.copyPages(this.doc, [index]);
        newDoc.addPage(copied[0]);
      }
    }
    this.doc = newDoc;
  }

  /**
   * Rotate page
   */
  rotatePage(pageIndex: number, rotation: 90 | 180 | 270): void {
    if (!this.doc) throw new Error('Document not initialized');
    const page = this.doc.getPage(pageIndex);
    page.setRotation(degrees(rotation));
  }

  /**
   * Add page numbers
   */
  async addPageNumbers(
    startPage = 0,
    format: (pageNum: number, total: number) => string = (p, t) => `${p} / ${t}`,
    x = 300,
    y = 30,
    fontSize = 10,
    color = { r: 0.5, g: 0.5, b: 0.5 }
  ): Promise<void> {
    if (!this.doc) throw new Error('Document not initialized');
    const pages = this.doc.getPages();
    const font = await this.doc.embedFont(StandardFonts.Helvetica);

    for (let i = startPage; i < pages.length; i++) {
      const page = pages[i];
      if (!page) continue;
      page.drawText(format(i + 1 - startPage, pages.length - startPage), {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(color.r, color.g, color.b),
      });
    }
  }

  /**
   * Save document to bytes
   */
  async save(): Promise<Uint8Array> {
    if (!this.doc) throw new Error('Document not initialized');
    return this.doc.save({ useObjectStreams: true });
  }

  /**
   * Save document to base64 string
   */
  async saveAsBase64(): Promise<string> {
    const bytes = await this.save();
    return bytesToBase64(bytes);
  }

  /**
   * Get document metadata
   */
  getMetadata(): {
    title: string;
    author: string;
    subject: string;
    keywords: string[];
    creator: string;
    producer: string;
    creationDate: Date | null;
    modificationDate: Date | null;
    pageCount: number;
  } | null {
    if (!this.doc) return null;
    return {
      title: this.doc.getTitle() || '',
      author: this.doc.getAuthor() || '',
      subject: this.doc.getSubject() || '',
      keywords: (this.doc.getKeywords() ?? '').split(',').map(k => k.trim()).filter(Boolean),
      creator: this.doc.getCreator() || '',
      producer: this.doc.getProducer() || '',
      creationDate: this.doc.getCreationDate() ?? null,
      modificationDate: this.doc.getModificationDate() ?? null,
      pageCount: this.doc.getPageCount(),
    };
  }

  /**
   * Set document metadata
   */
  setMetadata(options: PDFGenerateOptions): void {
    if (!this.doc) throw new Error('Document not initialized');
    if (options.title) this.doc.setTitle(options.title);
    if (options.author) this.doc.setAuthor(options.author);
    if (options.subject) this.doc.setSubject(options.subject);
    if (options.keywords) this.doc.setKeywords(options.keywords);
    if (options.creator) this.doc.setCreator(options.creator);
    if (options.producer) this.doc.setProducer(options.producer);
    if (options.creationDate) this.doc.setCreationDate(options.creationDate);
    if (options.modificationDate) this.doc.setModificationDate(options.modificationDate);
  }
}

/**
 * Convenience functions for common operations
 */
export const pdfUtils = {
  /**
   * Merge multiple PDFs into one
   */
  async mergePDFs(pdfBytesArray: Uint8Array[]): Promise<Uint8Array> {
    const merged = await PDFAPI.create();
    await merged.merge(pdfBytesArray);
    return merged.save();
  },

  /**
   * Split PDF into pages
   */
  async splitPDF(pdfBytes: Uint8Array): Promise<Uint8Array[]> {
    const doc = await PDFAPI.load(pdfBytes);
    const pageCount = doc.getPageCount();
    const ranges = Array.from({ length: pageCount }, (_, i) => ({ start: i, end: i }));
    return doc.split({ ranges });
  },

  /**
   * Extract pages from PDF
   */
  async extractPages(pdfBytes: Uint8Array, pageIndices: number[]): Promise<Uint8Array> {
    const doc = await PDFAPI.load(pdfBytes);
    const newDoc = await PDFAPI.create();
    await newDoc.merge([await doc.save()], {
      pageRanges: pageIndices.map(i => ({ start: i, end: i })),
    });
    return newDoc.save();
  },

  /**
   * Rotate specific pages
   */
  async rotatePages(pdfBytes: Uint8Array, rotations: Map<number, 90 | 180 | 270>): Promise<Uint8Array> {
    const doc = await PDFAPI.load(pdfBytes);
    for (const [pageIndex, rotation] of rotations) {
      doc.rotatePage(pageIndex, rotation);
    }
    return doc.save();
  },

  /**
   * Add watermark to PDF
   */
  async addWatermark(pdfBytes: Uint8Array, text: string, options: Partial<PDFWatermarkOptions> = {}): Promise<Uint8Array> {
    const doc = await PDFAPI.load(pdfBytes);
    await doc.addWatermark({ text, ...options });
    return doc.save();
  },

  /**
   * Add page numbers to PDF
   */
  async addPageNumbers(pdfBytes: Uint8Array, options?: Parameters<PDFAPI['addPageNumbers']>[1]): Promise<Uint8Array> {
    const doc = await PDFAPI.load(pdfBytes);
    await doc.addPageNumbers(0, options);
    return doc.save();
  },

  /**
   * Fill PDF form
   */
  async fillForm(pdfBytes: Uint8Array, fields: Record<string, string | boolean>): Promise<Uint8Array> {
    const doc = await PDFAPI.load(pdfBytes);
    doc.fillForm(fields);
    doc.flattenForm();
    return doc.save();
  },

  /**
   * Convert images to PDF
   */
  async imagesToPDF(
    images: { bytes: Uint8Array; format: 'jpg' | 'png'; width?: number; height?: number }[],
    pageSize: [number, number] = [612, 792]
  ): Promise<Uint8Array> {
    const doc = await PDFAPI.create();
    const pdfDoc = doc.doc;
    if (!pdfDoc) throw new Error('Document not initialized');

    for (const image of images) {
      const page = doc.addPage(pageSize[0], pageSize[1]);
      const { width, height } = page.getSize();

      const embeddedImage = image.format === 'jpg'
        ? await pdfDoc.embedJpg(image.bytes)
        : await pdfDoc.embedPng(image.bytes);

      const aspect = embeddedImage.width / embeddedImage.height;
      let drawWidth = width * 0.9;
      let drawHeight = drawWidth / aspect;
      if (drawHeight > height * 0.9) {
        drawHeight = height * 0.9;
        drawWidth = drawHeight * aspect;
      }

      page.drawImage(embeddedImage, {
        x: (width - drawWidth) / 2,
        y: (height - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight,
      });
    }

    return doc.save();
  },
};