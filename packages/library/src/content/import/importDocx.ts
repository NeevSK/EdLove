import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

export interface ImportDocxOptions {
  /** Optional document title to include in YAML front matter. */
  readonly title?: string;
  /** Optional BCP-47 language tag (`si`, `ta`, `en`). */
  readonly lang?: string;
}

export interface ImportDocxResult {
  readonly markdown: string;
  readonly warnings: readonly string[];
}

const htmlToMarkdownProcessor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkStringify, {
    bullet: '-',
    emphasis: '*',
    strong: '*',
    fence: '`',
    fences: true,
    rule: '-',
    listItemIndent: 'one',
    incrementListMarker: true,
  });

function buildFrontMatter(options?: ImportDocxOptions): string {
  const lines: string[] = ['kind: page'];
  if (options?.title?.trim()) {
    lines.unshift(`title: ${JSON.stringify(options.title.trim())}`);
  }
  if (options?.lang?.trim()) {
    lines.push(`lang: ${options.lang.trim()}`);
  }
  return `---\n${lines.join('\n')}\n---\n\n`;
}

/**
 * Converts a `.docx` ArrayBuffer into canonical Gurudevi Markdown v1 via `mammoth`
 * and `rehype-remark`. Preserves Unicode NFC (including Sinhala/Tamil ZWJ/ZWNJ).
 */
export async function importDocxToMarkdown(
  buffer: ArrayBuffer,
  options?: ImportDocxOptions,
): Promise<ImportDocxResult> {
  const mammothMod = await import('mammoth');
  const mammoth = 'default' in mammothMod && mammothMod.default ? mammothMod.default : mammothMod;
  const { value: html, messages } = await mammoth.convertToHtml({ arrayBuffer: buffer });

  const file = await htmlToMarkdownProcessor.process(html);
  const body = String(file).normalize('NFC').trim();
  const warnings = messages.map((m) => m.message);

  return {
    markdown: `${buildFrontMatter(options)}${body}\n`.normalize('NFC'),
    warnings,
  };
}
