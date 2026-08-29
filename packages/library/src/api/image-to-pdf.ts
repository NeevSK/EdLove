import { PDFDocument, rgb, StandardFonts, type PDFImage } from 'pdf-lib';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { bytesToBase64, base64ToBytes } from '@repo/library/utils/bytes';

export interface ImageToPDFOptions {
  pageSize?: [number, number];
  margin?: number;
  fitMode?: 'contain' | 'cover' | 'fill' | 'width' | 'height';
  quality?: number;
  format?: 'jpg' | 'png';
  compress?: boolean;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
  };
  addPageNumbers?: boolean;
  pageNumberFormat?: (page: number, total: number) => string;
  pageNumberPosition?: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center';
  pageNumberFontSize?: number;
  pageNumberColor?: { r: number; g: number; b: number };
}

export interface ImageSource {
  uri: string;
  mimeType?: string;
  rotation?: number;
}

export interface ProcessedImage {
  bytes: Uint8Array;
  width?: number;
  height?: number;
  mimeType: string;
  format: 'jpg' | 'png';
}

export interface ImageToPDFResult {
  pdfBytes: Uint8Array;
  pageCount: number;
  processedImages: ProcessedImage[];
  processingTimeMs: number;
  fileSizeBytes: number;
}

/**
 * Image → PDF conversion (pdf-lib + expo-image-manipulator).
 * Each source image becomes one page, fitted within the page area.
 */
export class ImageToPDFAPI {
  static async convertImagesToPDF(
    images: ImageSource[],
    options: ImageToPDFOptions = {}
  ): Promise<ImageToPDFResult> {
    const startTime = Date.now();

    const pageSize = options.pageSize ?? [612, 792];
    const margin = options.margin ?? 36;
    const fitMode = options.fitMode ?? 'contain';
    const quality = options.quality ?? 0.85;
    const format = options.format ?? 'jpg';
    const compress = options.compress ?? true;

    const contentWidth = pageSize[0] - 2 * margin;
    const contentHeight = pageSize[1] - 2 * margin;

    const doc = await PDFDocument.create();
    if (options.metadata?.title) doc.setTitle(options.metadata.title);
    if (options.metadata?.author) doc.setAuthor(options.metadata.author);
    if (options.metadata?.subject) doc.setSubject(options.metadata.subject);
    if (options.metadata?.keywords) doc.setKeywords(options.metadata.keywords);
    if (options.metadata?.creator) doc.setCreator(options.metadata.creator);
    doc.setProducer('Document Powerhouse');

    const processedImages: ProcessedImage[] = [];
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const total = images.length;

    for (let i = 0; i < total; i++) {
      const image = images[i];
      if (!image) continue;
      const processed = await this.prepareImage(image, {
        quality,
        format,
        compress,
        maxDimension: Math.ceil(Math.max(contentWidth, contentHeight, pageSize[0], pageSize[1])),
      });
      processedImages.push(processed);

      const embedded: PDFImage =
        processed.format === 'jpg' ? await doc.embedJpg(processed.bytes) : await doc.embedPng(processed.bytes);

      const imgWidth = processed.width && processed.width > 0 ? processed.width : embedded.width;
      const imgHeight = processed.height && processed.height > 0 ? processed.height : embedded.height;
      const layout = this.calculateLayout(imgWidth, imgHeight, contentWidth, contentHeight, fitMode);

      const page = doc.addPage(pageSize);
      page.drawImage(embedded, {
        x: margin + layout.x,
        y: margin + layout.y,
        width: layout.width,
        height: layout.height,
      });

      if (options.addPageNumbers) {
        const pageNumber = i + 1;
        const text = (options.pageNumberFormat ?? ((p: number, t: number) => `${p} / ${t}`))(pageNumber, total);
        const position = this.getPageNumberPosition(options.pageNumberPosition ?? 'bottom-center', pageSize, margin);
        const color = options.pageNumberColor ?? { r: 0.5, g: 0.5, b: 0.5 };
        page.drawText(text, {
          x: position.x,
          y: position.y,
          size: options.pageNumberFontSize ?? 10,
          font,
          color: rgb(color.r, color.g, color.b),
        });
      }
    }

    const pdfBytes = await doc.save({ useObjectStreams: true });

    return {
      pdfBytes,
      pageCount: total,
      processedImages,
      processingTimeMs: Date.now() - startTime,
      fileSizeBytes: pdfBytes.length,
    };
  }

  private static async prepareImage(
    image: ImageSource,
    options: { quality: number; format: 'jpg' | 'png'; compress: boolean; maxDimension: number }
  ): Promise<ProcessedImage> {
    // Data URIs carry the bytes directly; skip image processing entirely.
    if (image.uri.startsWith('data:')) {
      const match = /^data:image\/([a-z0-9]+);base64,(.+)$/is.exec(image.uri);
      if (!match) {
        throw new Error('Invalid image data URI');
      }
      const encoded = match[2];
      if (encoded === undefined) {
        throw new Error('Invalid image data URI');
      }
      const decoded = base64ToBytes(encoded);
      const isPng = match[1] === 'png';
      return {
        bytes: decoded,
        mimeType: isPng ? 'image/png' : 'image/jpeg',
        format: isPng ? 'png' : 'jpg',
      };
    }

    let uri = image.uri;
    if (!uri.startsWith('http') && !uri.startsWith('file:') && !uri.startsWith('content:')) {
      uri = `file://${uri}`;
    }

    const actions: Parameters<typeof manipulateAsync>[1] = [];
    const rotation = image.rotation ?? 0;
    if (rotation > 0) {
      actions.push({ rotate: rotation });
    }
    if (options.compress) {
      actions.push({ resize: { width: options.maxDimension } });
    }

    const result = await manipulateAsync(uri, actions, {
      compress: options.format === 'jpg' ? options.quality : 1,
      format: options.format === 'jpg' ? SaveFormat.JPEG : SaveFormat.PNG,
      base64: true,
    });
    if (!result.base64) {
      throw new Error('Image processing returned no base64 output');
    }

    return {
      bytes: base64ToBytes(result.base64),
      width: result.width,
      height: result.height,
      mimeType: options.format === 'jpg' ? 'image/jpeg' : 'image/png',
      format: options.format,
    };
  }

  private static calculateLayout(
    imgWidth: number,
    imgHeight: number,
    contentWidth: number,
    contentHeight: number,
    fitMode: NonNullable<ImageToPDFOptions['fitMode']>
  ): { x: number; y: number; width: number; height: number } {
    const imgAspect = imgWidth / imgHeight;
    const contentAspect = contentWidth / contentHeight;

    let width: number;
    let height: number;

    switch (fitMode) {
      case 'contain':
        if (imgAspect > contentAspect) {
          width = contentWidth;
          height = contentWidth / imgAspect;
        } else {
          height = contentHeight;
          width = contentHeight * imgAspect;
        }
        break;
      case 'cover':
        if (imgAspect > contentAspect) {
          height = contentHeight;
          width = contentHeight * imgAspect;
        } else {
          width = contentWidth;
          height = contentWidth / imgAspect;
        }
        break;
      case 'fill':
        width = contentWidth;
        height = contentHeight;
        break;
      case 'width':
        width = contentWidth;
        height = contentWidth / imgAspect;
        break;
      case 'height':
        height = contentHeight;
        width = contentHeight * imgAspect;
        break;
    }

    return {
      x: (contentWidth - width) / 2,
      y: (contentHeight - height) / 2,
      width,
      height,
    };
  }

  private static getPageNumberPosition(
    position: NonNullable<ImageToPDFOptions['pageNumberPosition']>,
    pageSize: [number, number],
    margin: number
  ): { x: number; y: number } {
    const y = position.startsWith('top') ? pageSize[1] - margin / 2 : margin / 2;
    let x = pageSize[0] / 2;
    if (position.includes('left')) x = margin;
    else if (position.includes('right')) x = pageSize[0] - margin;
    return { x, y };
  }

  static async imageToPDF(image: ImageSource, options: ImageToPDFOptions = {}): Promise<ImageToPDFResult> {
    return this.convertImagesToPDF([image], options);
  }

  static async fromBase64(base64: string, mimeType: string, options: ImageToPDFOptions = {}): Promise<ImageToPDFResult> {
    return this.convertImagesToPDF([{ uri: `data:${mimeType};base64,${base64}`, mimeType }], options);
  }

  /**
   * Returns a data-URI string of the generated PDF (handy for web viewers / sharing).
   */
  static async toDataUri(images: ImageSource[], options: ImageToPDFOptions = {}): Promise<string> {
    const result = await this.convertImagesToPDF(images, options);
    return `data:application/pdf;base64,${bytesToBase64(result.pdfBytes)}`;
  }
}