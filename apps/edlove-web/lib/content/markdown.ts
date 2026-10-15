/**
 * Lightweight, zero-dependency Markdown & Frontmatter Parser for React Server Components
 * Parses frontmatter YAML headers and converts Markdown to semantic HTML.
 */

export interface ParsedMarkdown<T = Record<string, unknown>> {
  frontmatter: T;
  contentHtml: string;
  rawBody: string;
  readingTimeMinutes: number;
  wordCount: number;
}

/**
 * Parses simple YAML-like frontmatter key-value pairs and arrays.
 */
export function parseYamlFrontmatter(yamlStr: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = yamlStr.split(/\r?\n/);

  let currentKey = '';
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check for array items: - item
    if (trimmed.startsWith('- ') && inArray) {
      const val = trimmed
        .slice(2)
        .trim()
        .replace(/^["']|["']$/g, '');
      arrayValues.push(val);
      continue;
    }

    // Key-value pair: key: value
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (match) {
      // Save previously accumulated array
      if (inArray && currentKey) {
        result[currentKey] = arrayValues;
        inArray = false;
        arrayValues = [];
      }

      const key = match[1]!;
      let value = match[2]!.trim();

      // Inline array: [a, b, c]
      if (value.startsWith('[') && value.endsWith(']')) {
        const items = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        result[key] = items;
        continue;
      }

      // Multi-line array start
      if (value === '') {
        currentKey = key;
        inArray = true;
        arrayValues = [];
        continue;
      }

      // Boolean
      if (value.toLowerCase() === 'true') {
        result[key] = true;
        continue;
      }
      if (value.toLowerCase() === 'false') {
        result[key] = false;
        continue;
      }

      // Number
      if (!Number.isNaN(Number(value)) && !value.includes('-') && value !== '') {
        result[key] = Number(value);
        continue;
      }

      // Clean quotes
      value = value.replace(/^["']|["']$/g, '');
      result[key] = value;
    }
  }

  if (inArray && currentKey) {
    result[currentKey] = arrayValues;
  }

  return result;
}

/**
 * Escapes HTML characters
 */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Converts standard Markdown to semantic HTML
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const htmlOut: string[] = [];

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeLines: string[] = [];

  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  let inTable = false;
  let tableHeaderParsed = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]!;
    const line = rawLine.trim();

    // Fenced Code Blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        htmlOut.push(
          `<pre class="bg-[#1f1d1a] text-[#f5eee1] p-4 rounded-xl overflow-x-auto text-xs font-mono my-4"><code>${escapeHtml(
            codeLines.join('\n'),
          )}</code></pre>`,
        );
        inCodeBlock = false;
        codeLines = [];
        continue;
      } else {
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
        codeLines = [];
        continue;
      }
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    // Close open list if non-list line
    if (inList && !line.startsWith('- ') && !line.startsWith('* ') && !/^\d+\.\s/.test(line)) {
      htmlOut.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
    }

    // Close open table if non-table line
    if (inTable && !line.startsWith('|')) {
      htmlOut.push('</tbody></table></div>');
      inTable = false;
      tableHeaderParsed = false;
    }

    // Blank line
    if (!line) continue;

    // Headers
    if (line.startsWith('# ')) {
      htmlOut.push(
        `<h1 class="text-3xl sm:text-4xl font-serif font-bold text-[#1a1714] mt-8 mb-4 tracking-tight">${parseInline(line.slice(2))}</h1>`,
      );
      continue;
    }
    if (line.startsWith('## ')) {
      htmlOut.push(
        `<h2 class="text-2xl sm:text-3xl font-serif font-bold text-[#1a1714] mt-8 mb-3 tracking-tight">${parseInline(line.slice(3))}</h2>`,
      );
      continue;
    }
    if (line.startsWith('### ')) {
      htmlOut.push(
        `<h3 class="text-xl font-serif font-bold text-[#1a1714] mt-6 mb-2 tracking-tight">${parseInline(line.slice(4))}</h3>`,
      );
      continue;
    }
    if (line.startsWith('#### ')) {
      htmlOut.push(
        `<h4 class="text-lg font-bold text-[#1a1714] mt-4 mb-2">${parseInline(line.slice(5))}</h4>`,
      );
      continue;
    }

    // Horizontal Rule
    if (line === '---' || line === '***') {
      htmlOut.push('<hr class="my-8 border-[#ebdccb]" />');
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteText = line.slice(2).trim();
      htmlOut.push(
        `<blockquote class="border-l-4 border-[#a85022] pl-4 py-1 italic my-4 text-[#423c35] bg-[#faf8f5]/60 rounded-r-lg">${parseInline(quoteText)}</blockquote>`,
      );
      continue;
    }

    // Unordered List
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        if (inList) htmlOut.push(listType === 'ul' ? '</ul>' : '</ol>');
        htmlOut.push(
          '<ul class="list-disc pl-6 space-y-1.5 my-3 text-sm sm:text-base text-[#38332e] leading-relaxed">',
        );
        inList = true;
        listType = 'ul';
      }
      htmlOut.push(`<li>${parseInline(line.slice(2))}</li>`);
      continue;
    }

    // Ordered List
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) htmlOut.push(listType === 'ul' ? '</ul>' : '</ol>');
        htmlOut.push(
          '<ol class="list-decimal pl-6 space-y-1.5 my-3 text-sm sm:text-base text-[#38332e] leading-relaxed">',
        );
        inList = true;
        listType = 'ol';
      }
      htmlOut.push(`<li>${parseInline(olMatch[2]!)}</li>`);
      continue;
    }

    // Tables
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      // Skip delimiter line |---|---|
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaderParsed = true;
        htmlOut.push(
          '<div class="overflow-x-auto my-6"><table class="w-full text-left text-xs sm:text-sm border border-[#ebdccb] rounded-lg">',
        );
        htmlOut.push('<thead class="bg-[#f5eee1] text-[#1a1714] font-bold"><tr>');
        for (const cell of cells) {
          htmlOut.push(`<th class="p-3 border-b border-[#ebdccb]">${parseInline(cell)}</th>`);
        }
        htmlOut.push('</tr></thead><tbody class="divide-y divide-[#ebdccb]">');
        continue;
      } else {
        htmlOut.push('<tr class="hover:bg-[#faf8f5]">');
        for (const cell of cells) {
          htmlOut.push(`<td class="p-3">${parseInline(cell)}</td>`);
        }
        htmlOut.push('</tr>');
        continue;
      }
    }

    // Standard Paragraph
    htmlOut.push(
      `<p class="my-4 text-base leading-relaxed text-[#38332e] font-serif">${parseInline(line)}</p>`,
    );
  }

  if (inList) htmlOut.push(listType === 'ul' ? '</ul>' : '</ol>');
  if (inTable) htmlOut.push('</tbody></table></div>');

  return htmlOut.join('\n');
}

/**
 * Parses inline formatting: bold, italic, inline code, and links.
 */
function parseInline(text: string): string {
  let res = escapeHtml(text);

  // Inline code: `code`
  res = res.replace(
    /`([^`]+)`/g,
    '<code class="bg-[#f5eee1] text-[#a85022] font-mono text-xs px-1.5 py-0.5 rounded border border-[#ebdccb]">$1</code>',
  );

  // Bold: **text**
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  res = res.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  res = res.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Links: [label](url)
  res = res.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-[#a85022] hover:underline font-semibold" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  return res;
}

/**
 * Parses full document containing YAML frontmatter and Markdown body.
 */
export function parseDocument<T = Record<string, any>>(rawContent: string): ParsedMarkdown<T> {
  let frontmatter: any = {};
  let rawBody = rawContent;

  const fmMatch = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (fmMatch) {
    frontmatter = parseYamlFrontmatter(fmMatch[1]!);
    rawBody = fmMatch[2]!;
  }

  const wordCount = rawBody.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const contentHtml = markdownToHtml(rawBody);

  return {
    frontmatter,
    contentHtml,
    rawBody,
    readingTimeMinutes,
    wordCount,
  };
}
