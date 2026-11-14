import type { PhrasingContent, Root, RootContent } from 'mdast';
import { z } from 'zod';
import { CONTAINER_BLOCKS, LEAF_BLOCKS } from './dialect';

/**
 * The block registry's platform-neutral half: a parsed body becomes a small typed tree that
 * the native and web renderers both read. Renderers never see mdast, so a parser upgrade
 * cannot break a screen, and each named block arrives with its attributes already checked.
 *
 * Embeds (activity, H5P, video, audio) are references only. The host app decides what plays
 * them; the UI kit does not know the form builder or the H5P player.
 */

export type Inline =
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'emphasis'; readonly children: readonly Inline[] }
  | { readonly kind: 'strong'; readonly children: readonly Inline[] }
  | { readonly kind: 'strike'; readonly children: readonly Inline[] }
  | { readonly kind: 'code'; readonly value: string }
  | { readonly kind: 'math'; readonly tex: string }
  | { readonly kind: 'link'; readonly href: string; readonly children: readonly Inline[] }
  | { readonly kind: 'image'; readonly src: string; readonly alt: string }
  | { readonly kind: 'break' };

/** Every container in the dialect except `hint` is a callout tone. */
export type CalloutTone = Exclude<(typeof CONTAINER_BLOCKS)[number], 'hint'>;
export const CALLOUT_TONES = [
  'note',
  'tip',
  'warning',
  'example',
] as const satisfies readonly CalloutTone[];

/** Checked attributes for each leaf block. A failed check becomes an `invalid` node. */
export const LeafAttributes = {
  activity: z.object({ form: z.string().min(1), version: z.coerce.number().int().positive() }),
  h5p: z.object({ pack: z.string().min(1) }),
  video: z.object({ pack: z.string().min(1), cues: z.string().min(1).optional() }),
  audio: z.object({ pack: z.string().min(1) }),
} as const satisfies Record<(typeof LEAF_BLOCKS)[number], z.ZodType>;

export type Embed =
  | ({ readonly kind: 'activity' } & z.infer<typeof LeafAttributes.activity>)
  | ({ readonly kind: 'h5p' } & z.infer<typeof LeafAttributes.h5p>)
  | ({ readonly kind: 'video' } & z.infer<typeof LeafAttributes.video>)
  | ({ readonly kind: 'audio' } & z.infer<typeof LeafAttributes.audio>);

export type ContentNode =
  | {
      readonly kind: 'heading';
      readonly level: 1 | 2 | 3 | 4 | 5 | 6;
      readonly children: readonly Inline[];
    }
  | { readonly kind: 'paragraph'; readonly children: readonly Inline[] }
  | {
      readonly kind: 'list';
      readonly ordered: boolean;
      readonly start: number;
      readonly items: readonly {
        readonly checked: boolean | null;
        readonly children: readonly ContentNode[];
      }[];
    }
  | { readonly kind: 'quote'; readonly children: readonly ContentNode[] }
  | { readonly kind: 'code'; readonly lang: string | null; readonly value: string }
  | { readonly kind: 'math'; readonly tex: string }
  | {
      readonly kind: 'table';
      readonly align: readonly ('left' | 'right' | 'center' | null)[];
      readonly rows: readonly (readonly (readonly Inline[])[])[];
    }
  | { readonly kind: 'rule' }
  | {
      readonly kind: 'callout';
      readonly tone: CalloutTone;
      readonly title: readonly Inline[] | null;
      readonly children: readonly ContentNode[];
    }
  | { readonly kind: 'hint'; readonly level: number; readonly children: readonly ContentNode[] }
  | { readonly kind: 'embed'; readonly embed: Embed }
  /** A named block we don't know, or one that failed its check: shown as plain text. */
  | { readonly kind: 'invalid'; readonly name: string; readonly text: string };

const plainText = (node: RootContent | Root): string => {
  if ('value' in node && typeof node.value === 'string') return node.value;
  if ('children' in node) return (node.children as RootContent[]).map(plainText).join('');
  return '';
};

function inlines(nodes: readonly PhrasingContent[]): Inline[] {
  const out: Inline[] = [];
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        out.push({ kind: 'text', value: node.value });
        break;
      case 'emphasis':
        out.push({ kind: 'emphasis', children: inlines(node.children) });
        break;
      case 'strong':
        out.push({ kind: 'strong', children: inlines(node.children) });
        break;
      case 'delete':
        out.push({ kind: 'strike', children: inlines(node.children) });
        break;
      case 'inlineCode':
        out.push({ kind: 'code', value: node.value });
        break;
      case 'inlineMath':
        out.push({ kind: 'math', tex: node.value });
        break;
      case 'link':
        out.push({ kind: 'link', href: node.url, children: inlines(node.children) });
        break;
      case 'image':
        out.push({ kind: 'image', src: node.url, alt: node.alt ?? '' });
        break;
      case 'break':
        out.push({ kind: 'break' });
        break;
      // Raw HTML is dropped on render (the dialect reports it); text directives are not
      // part of v1, so they show as their text.
      case 'html':
        break;
      default:
        out.push({ kind: 'text', value: plainText(node) });
    }
  }
  return out;
}

/** A container's optional title: the `[label]` after the name, which remark puts first. */
function splitLabel(children: readonly RootContent[]): {
  title: Inline[] | null;
  rest: readonly RootContent[];
} {
  const first = children[0];
  if (first?.type === 'paragraph' && (first.data as { directiveLabel?: boolean })?.directiveLabel)
    return { title: inlines(first.children), rest: children.slice(1) };
  return { title: null, rest: children };
}

type ContainerDirective = Extract<RootContent, { type: 'containerDirective' }>;
type LeafDirective = Extract<RootContent, { type: 'leafDirective' }>;

function container(node: ContainerDirective): ContentNode {
  const { title, rest } = splitLabel(node.children);
  if (node.name === 'hint') {
    const level = Number(node.attributes?.level);
    if (Number.isInteger(level) && level > 0)
      return { kind: 'hint', level, children: rest.flatMap(block) };
    return { kind: 'invalid', name: node.name, text: plainText(node) };
  }
  if ((CALLOUT_TONES as readonly string[]).includes(node.name))
    return {
      kind: 'callout',
      tone: node.name as CalloutTone,
      title,
      children: rest.flatMap(block),
    };
  return { kind: 'invalid', name: node.name, text: plainText(node) };
}

function leaf(node: LeafDirective): ContentNode {
  const name = node.name as (typeof LEAF_BLOCKS)[number];
  if (!(LEAF_BLOCKS as readonly string[]).includes(name))
    return { kind: 'invalid', name: node.name, text: plainText(node) };
  const parsed = LeafAttributes[name].safeParse(node.attributes ?? {});
  if (!parsed.success) return { kind: 'invalid', name, text: plainText(node) };
  return { kind: 'embed', embed: { kind: name, ...parsed.data } as Embed };
}

function block(node: RootContent): ContentNode[] {
  switch (node.type) {
    case 'heading':
      return [{ kind: 'heading', level: node.depth, children: inlines(node.children) }];
    case 'paragraph':
      return [{ kind: 'paragraph', children: inlines(node.children) }];
    case 'list':
      return [
        {
          kind: 'list',
          ordered: node.ordered ?? false,
          start: node.start ?? 1,
          items: node.children.map((item) => ({
            checked: item.checked ?? null,
            children: item.children.flatMap(block),
          })),
        },
      ];
    case 'blockquote':
      return [{ kind: 'quote', children: node.children.flatMap(block) }];
    case 'code':
      return [{ kind: 'code', lang: node.lang ?? null, value: node.value }];
    case 'math':
      return [{ kind: 'math', tex: node.value }];
    case 'table':
      return [
        {
          kind: 'table',
          align: node.align ?? [],
          rows: node.children.map((row) => row.children.map((cell) => inlines(cell.children))),
        },
      ];
    case 'thematicBreak':
      return [{ kind: 'rule' }];
    case 'containerDirective':
      return [container(node)];
    case 'leafDirective':
      return [leaf(node)];
    case 'textDirective':
      return [{ kind: 'invalid', name: node.name, text: plainText(node) }];
    // Front matter belongs to the work, not the body; raw HTML is dropped; definitions and
    // footnote definitions are resolved by the parser for links and are not shown alone.
    case 'yaml':
    case 'html':
    case 'definition':
    case 'footnoteDefinition':
      return [];
    default:
      return [{ kind: 'paragraph', children: [{ kind: 'text', value: plainText(node) }] }];
  }
}

/** The typed tree a renderer reads, for one page or one slide. */
export function toContentTree(root: Root): readonly ContentNode[] {
  return root.children.flatMap(block);
}

/** Every embed on a page, in order: for prefetching packs and planning a download. */
export function embedsOf(nodes: readonly ContentNode[]): readonly Embed[] {
  const out: Embed[] = [];
  const visit = (list: readonly ContentNode[]) => {
    for (const n of list) {
      if (n.kind === 'embed') out.push(n.embed);
      else if (n.kind === 'list') for (const item of n.items) visit(item.children);
      else if (n.kind === 'quote' || n.kind === 'callout' || n.kind === 'hint') visit(n.children);
    }
  };
  visit(nodes);
  return out;
}

/** Hints grouped as a ladder, in level order: the renderer reveals one rung at a time. */
export function hintLadder(
  nodes: readonly ContentNode[],
): readonly Extract<ContentNode, { kind: 'hint' }>[] {
  return nodes
    .filter((n): n is Extract<ContentNode, { kind: 'hint' }> => n.kind === 'hint')
    .sort((a, b) => a.level - b.level);
}
