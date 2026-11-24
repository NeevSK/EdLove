import { strFromU8, unzipSync } from 'fflate';

export interface ImportPptxOptions {
  /** Optional deck title to include in YAML front matter. */
  readonly title?: string;
  /** Optional BCP-47 language tag (`si`, `ta`, `en`). */
  readonly lang?: string;
  /** Optional Gurudevi world theme id. */
  readonly theme?: string;
}

export interface ExtractedSlide {
  readonly index: number;
  readonly title?: string;
  readonly paragraphs: readonly string[];
  readonly notes?: string;
}

export interface ImportPptxResult {
  readonly markdown: string;
  readonly slideCount: number;
  readonly slides: readonly ExtractedSlide[];
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
}

function extractParagraphsFromXml(xml: string): string[] {
  const paragraphs: string[] = [];
  const pRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g;
  for (const pMatch of xml.matchAll(pRegex)) {
    const pInner = pMatch[1] ?? '';
    const runs: string[] = [];
    const tRegex = /<a:t\b[^>]*>([\s\S]*?)<\/a:t>/g;
    for (const tMatch of pInner.matchAll(tRegex)) {
      runs.push(decodeXmlEntities(tMatch[1] ?? ''));
    }
    const line = runs.join('').replace(/\s+/g, ' ').trim();
    if (line.length > 0) {
      paragraphs.push(line.normalize('NFC'));
    }
  }
  return paragraphs;
}

function extractSlideTitle(xml: string, paragraphs: readonly string[]): { title?: string; rest: readonly string[] } {
  const titleShapeMatch = /<p:sp\b[^>]*>[\s\S]*?<p:ph\b[^>]*type="(?:title|ctrTitle)"[\s\S]*?<\/p:sp>/.exec(
    xml,
  );
  if (titleShapeMatch) {
    const titleParas = extractParagraphsFromXml(titleShapeMatch[0]);
    if (titleParas.length > 0) {
      const title = titleParas.join(' ');
      const rest = paragraphs.filter((p) => p !== titleParas[0]);
      return { title, rest };
    }
  }
  if (paragraphs.length > 0) {
    return { title: paragraphs[0], rest: paragraphs.slice(1) };
  }
  return { rest: [] };
}

function buildSlidesFrontMatter(options?: ImportPptxOptions): string {
  const lines: string[] = ['kind: slides', 'marp: true'];
  if (options?.title?.trim()) {
    lines.unshift(`title: ${JSON.stringify(options.title.trim())}`);
  }
  if (options?.lang?.trim()) {
    lines.push(`lang: ${options.lang.trim()}`);
  }
  if (options?.theme?.trim()) {
    lines.push(`theme: ${options.theme.trim()}`);
  }
  return `---\n${lines.join('\n')}\n---\n\n`;
}

/**
 * Extracts slides and speaker notes from a `.pptx` archive using `fflate` and emits
 * Gurudevi Markdown v1 (`kind: slides`, `marp: true`) with `---` slide separators.
 */
export function importPptxToSlidesMarkdown(
  buffer: ArrayBuffer | Uint8Array,
  options?: ImportPptxOptions,
): ImportPptxResult {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const archive = unzipSync(bytes);

  const slideEntries = Object.keys(archive)
    .map((path) => {
      const match = /^ppt\/slides\/slide(\d+)\.xml$/.exec(path);
      return match ? { path, index: Number(match[1]) } : null;
    })
    .filter((entry): entry is { path: string; index: number } => entry !== null)
    .sort((a, b) => a.index - b.index);

  const slides: ExtractedSlide[] = slideEntries.map(({ path, index }) => {
    const xml = strFromU8(archive[path] ?? new Uint8Array());
    const allParas = extractParagraphsFromXml(xml);
    const { title, rest } = extractSlideTitle(xml, allParas);

    const notesPath = `ppt/notesSlides/notesSlide${index}.xml`;
    const notesBytes = archive[notesPath];
    let notes: string | undefined;
    if (notesBytes) {
      const notesParas = extractParagraphsFromXml(strFromU8(notesBytes)).filter(
        (p) => p !== String(index),
      );
      if (notesParas.length > 0) {
        notes = notesParas.join('\n');
      }
    }

    return {
      index,
      title,
      paragraphs: rest,
      notes,
    };
  });

  const slideBlocks = slides.map((slide) => {
    const lines: string[] = [];
    if (slide.title) {
      lines.push(`# ${slide.title}`);
    }
    for (const para of slide.paragraphs) {
      lines.push(`- ${para}`);
    }
    if (slide.notes) {
      lines.push('', `:::note`, slide.notes, `:::`);
    }
    return lines.join('\n');
  });

  const body = slideBlocks.join('\n\n---\n\n');
  const markdown = `${buildSlidesFrontMatter(options)}${body}\n`.normalize('NFC');

  return {
    markdown,
    slideCount: slides.length,
    slides,
  };
}
