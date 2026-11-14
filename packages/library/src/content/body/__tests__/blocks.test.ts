import { describe, expect, it } from 'vitest';
import { embedsOf, hintLadder, toContentTree } from '../blocks';
import { parseBody } from '../dialect';

const tree = (text: string) => toContentTree(parseBody(text).tree);

describe('toContentTree', () => {
  it('turns prose into typed nodes with inline runs', () => {
    expect(tree('# භාග\n\nහරි **අඩක්** සහ $\\frac12$.\n')).toEqual([
      { kind: 'heading', level: 1, children: [{ kind: 'text', value: 'භාග' }] },
      {
        kind: 'paragraph',
        children: [
          { kind: 'text', value: 'හරි ' },
          { kind: 'strong', children: [{ kind: 'text', value: 'අඩක්' }] },
          { kind: 'text', value: ' සහ ' },
          { kind: 'math', tex: '\\frac12' },
          { kind: 'text', value: '.' },
        ],
      },
    ]);
  });

  it('maps containers to callouts with an optional title, and hints to levels', () => {
    const nodes = tree(
      ':::tip[Remember]\nHalf is one of two.\n:::\n\n:::hint{level=2}\nCount the parts.\n:::\n',
    );
    expect(nodes[0]).toMatchObject({
      kind: 'callout',
      tone: 'tip',
      title: [{ kind: 'text', value: 'Remember' }],
      children: [{ kind: 'paragraph' }],
    });
    expect(nodes[1]).toMatchObject({ kind: 'hint', level: 2 });
  });

  it('checks leaf attributes and turns them into embeds', () => {
    const nodes = tree(
      '::activity{form=fractions-check version=3}\n\n::video{pack=intro@3 cues=cues.json}\n',
    );
    expect(nodes).toEqual([
      { kind: 'embed', embed: { kind: 'activity', form: 'fractions-check', version: 3 } },
      { kind: 'embed', embed: { kind: 'video', pack: 'intro@3', cues: 'cues.json' } },
    ]);
  });

  it('shows unknown or failing blocks as plain text, never drops them', () => {
    const nodes = tree(
      ':::quiz\nWhat is half?\n:::\n\n::activity{form=x}\n\n:::hint\nno level\n:::\n',
    );
    expect(nodes).toEqual([
      { kind: 'invalid', name: 'quiz', text: 'What is half?' },
      { kind: 'invalid', name: 'activity', text: '' },
      { kind: 'invalid', name: 'hint', text: 'no level' },
    ]);
  });

  it('drops raw HTML and front matter from what is shown', () => {
    expect(tree('---\ntitle: x\n---\n\n<script>x</script>\n\nok\n')).toEqual([
      { kind: 'paragraph', children: [{ kind: 'text', value: 'ok' }] },
    ]);
  });

  it('keeps tables, task lists and code', () => {
    const nodes = tree(
      '| a | b |\n| :- | -: |\n| 1 | 2 |\n\n- [x] done\n- todo\n\n```ts\nx\n```\n',
    );
    expect(nodes[0]).toMatchObject({ kind: 'table', align: ['left', 'right'] });
    expect(nodes[1]).toMatchObject({ kind: 'list', items: [{ checked: true }, { checked: null }] });
    expect(nodes[2]).toEqual({ kind: 'code', lang: 'ts', value: 'x' });
  });
});

describe('embedsOf and hintLadder', () => {
  it('finds embeds inside callouts and lists, in order', () => {
    const nodes = tree(':::example\n::h5p{pack=drag@1}\n:::\n\n- item\n\n  ::audio{pack=say@2}\n');
    expect(embedsOf(nodes)).toEqual([
      { kind: 'h5p', pack: 'drag@1' },
      { kind: 'audio', pack: 'say@2' },
    ]);
  });

  it('orders hints by level', () => {
    const nodes = tree(':::hint{level=2}\nb\n:::\n\n:::hint{level=1}\na\n:::\n');
    expect(hintLadder(nodes).map((h) => h.level)).toEqual([1, 2]);
  });
});
