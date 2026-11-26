import type { Root, RootContent } from 'mdast';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

/**
 * Gurudevi Markdown v1: the one stored form of prose content (pages, notes, handouts, slides).
 * CommonMark + GFM + maths + YAML front matter + named blocks (generic directives), and nothing
 * else. The fixtures in `__tests__/dialect.test.ts` are the definition; the decision and the
 * reasons are in docs/architecture/2026-11-14-content-authoring-and-formats.md.
 */

export const DIALECT_VERSION = 1;

export const FrontMatter = z.strictObject({
  title: z.string().min(1).optional(),
  lang: z
    .string()
    .regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/)
    .optional(),
  kind: z.enum(['page', 'slides']).default('page'),
  /** A world id, for slides and printed pages. */
  theme: z.string().min(1).optional(),
  /** Marp's own switch, kept so a deck opens unchanged in Marp tools. */
  marp: z.boolean().optional(),
});
export type FrontMatter = z.infer<typeof FrontMatter>;

/** The named blocks v1 knows. Anything else is kept as written and reported. */
export const CONTAINER_BLOCKS = ['note', 'tip', 'warning', 'example', 'hint'] as const;
export const LEAF_BLOCKS = ['activity', 'h5p', 'video', 'audio'] as const;

/** Leaf blocks must name an exact version or pack, never a moving target. */
const PINNED_BY: Record<(typeof LEAF_BLOCKS)[number], string> = {
  activity: 'version',
  h5p: 'pack',
  video: 'pack',
  audio: 'pack',
};

export type BodyProblem =
  | { readonly code: 'front_matter_invalid'; readonly detail: string }
  | { readonly code: 'raw_html'; readonly line?: number }
  | { readonly code: 'unknown_block'; readonly name: string; readonly line?: number }
  | { readonly code: 'block_wrong_form'; readonly name: string; readonly line?: number }
  | { readonly code: 'unpinned_reference'; readonly name: string; readonly line?: number }
  | { readonly code: 'hint_without_level'; readonly line?: number }
  | { readonly code: 'missing_alt_text'; readonly url: string; readonly line?: number };

export interface ParsedBody {
  readonly frontMatter: FrontMatter;
  readonly tree: Root;
  readonly problems: readonly BodyProblem[];
}

// One processor for parsing and one for writing, configured once: the canonical style is
// fixed here, so saving twice never changes the text.
const reader = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkDirective);
const writer = unified()
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkDirective)
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

type AnyNode = Root | RootContent;
const childrenOf = (node: AnyNode): readonly RootContent[] =>
  'children' in node ? (node.children as RootContent[]) : [];

function walk(node: AnyNode, visit: (n: RootContent) => void): void {
  for (const child of childrenOf(node)) {
    visit(child);
    walk(child, visit);
  }
}

function checkTree(tree: Root): BodyProblem[] {
  const problems: BodyProblem[] = [];
  walk(tree, (node) => {
    const line = node.position?.start.line;
    switch (node.type) {
      case 'html':
        problems.push({ code: 'raw_html', line });
        return;
      case 'image':
        if ((node.alt ?? '').trim().length === 0)
          problems.push({ code: 'missing_alt_text', url: node.url, line });
        return;
      case 'containerDirective':
      case 'leafDirective':
      case 'textDirective': {
        const name = node.name;
        const isContainer = (CONTAINER_BLOCKS as readonly string[]).includes(name);
        const isLeaf = (LEAF_BLOCKS as readonly string[]).includes(name);
        if (!isContainer && !isLeaf) {
          problems.push({ code: 'unknown_block', name, line });
          return;
        }
        if (
          (isContainer && node.type !== 'containerDirective') ||
          (isLeaf && node.type !== 'leafDirective')
        ) {
          problems.push({ code: 'block_wrong_form', name, line });
          return;
        }
        if (isLeaf) {
          const key = PINNED_BY[name as (typeof LEAF_BLOCKS)[number]];
          if (!node.attributes?.[key]) problems.push({ code: 'unpinned_reference', name, line });
        }
        if (name === 'hint' && !/^\d+$/.test(node.attributes?.level ?? ''))
          problems.push({ code: 'hint_without_level', line });
        return;
      }
      default:
        return;
    }
  });
  return problems;
}

function readFrontMatter(tree: Root): { frontMatter: FrontMatter; problems: BodyProblem[] } {
  const first = tree.children[0];
  if (first?.type !== 'yaml') return { frontMatter: FrontMatter.parse({}), problems: [] };
  let raw: unknown;
  try {
    raw = parseYaml(first.value) ?? {};
  } catch (error) {
    return {
      frontMatter: FrontMatter.parse({}),
      problems: [{ code: 'front_matter_invalid', detail: String(error) }],
    };
  }
  const parsed = FrontMatter.safeParse(raw);
  return parsed.success
    ? { frontMatter: parsed.data, problems: [] }
    : {
        frontMatter: FrontMatter.parse({}),
        problems: [{ code: 'front_matter_invalid', detail: parsed.error.message }],
      };
}

/**
 * Reads stored or incoming text. Text is put in Unicode NFC; zero-width joiners and non-joiners
 * are kept, because Sinhala conjuncts and some Tamil forms need them.
 */
export function parseBody(text: string): ParsedBody {
  const tree = reader.parse(text.normalize('NFC')) as Root;
  const { frontMatter, problems } = readFrontMatter(tree);
  return { frontMatter, tree, problems: [...problems, ...checkTree(tree)] };
}

/** Writes a tree in the canonical style. */
export function serializeBody(tree: Root): string {
  return writer.stringify(tree);
}

/** The canonical text for any input: what a save stores. */
export const canonicalBody = (text: string): string => serializeBody(parseBody(text).tree);

/**
 * A deck's slides: in `kind: slides`, a top-level thematic break (`---`) separates slides,
 * as in Marp. Front matter belongs to the deck, not to a slide. A page is one "slide".
 */
export function splitSlides(parsed: ParsedBody): readonly Root[] {
  const content = parsed.tree.children.filter((n) => n.type !== 'yaml');
  if (parsed.frontMatter.kind !== 'slides') return [{ type: 'root', children: content }];
  const slides: RootContent[][] = [[]];
  for (const node of content) {
    if (node.type === 'thematicBreak') slides.push([]);
    else slides.at(-1)?.push(node);
  }
  return slides.filter((s) => s.length > 0).map((children) => ({ type: 'root', children }));
}

/** A tree without source positions, for comparing two trees by content. */
export function withoutPositions<T>(node: T): T {
  if (Array.isArray(node)) return node.map(withoutPositions) as T;
  if (node === null || typeof node !== 'object') return node;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node))
    if (key !== 'position') out[key] = withoutPositions(value);
  return out as T;
}
