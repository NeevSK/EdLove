import { describe, expect, it } from 'vitest';
import { canonicalBody, parseBody, serializeBody, splitSlides, withoutPositions } from '../dialect';

// The fixtures define Gurudevi Markdown v1. Every editor and renderer is held to them.
const ZWJ = '‍';

const sinhalaPage = `---
title: භාග හැඳින්වීම
lang: si
---

# භාග

ශ${'්'}${ZWJ}රී ලංකාවේ පාසල්වල *භාග* ඉගෙනීම **පහසුයි**.

- එක් කොටසක්
- කොටස් දෙකක්

:::example
½ + ¼ = ¾
:::

:::hint{level=1}
හරය එකම කරන්න.
:::

::activity{form=fractions-check version=3}
`;

const tamilPage = `---
title: பின்னங்கள்
lang: ta
---

## பின்னங்கள் அறிமுகம்

| பின்னம் | மதிப்பு |
| ------- | ------- |
| ½       | 0.5     |

- [x] படித்தேன்
- [ ] பயிற்சி செய்தேன்

$\\frac{1}{2} + \\frac{1}{4} = \\frac{3}{4}$

$$
a^2 + b^2 = c^2
$$

![இரண்டு பாதிகள்](images/halves.png)
`;

const englishSlides = `---
title: Introducing fractions
lang: en
kind: slides
theme: sanctuary
marp: true
---

# Fractions

A fraction is part of a whole.

---

## Halves

:::note
Two equal parts.
:::

::video{pack=fractions-intro@3 cues=cues.json}

---

## Try it

::h5p{pack=halves-drag@1}
`;

const fixtures = { sinhalaPage, tamilPage, englishSlides };

describe('Gurudevi Markdown v1: the round-trip contract', () => {
  it.each(Object.entries(fixtures))('%s is stable, idempotent and faithful', (_name, text) => {
    const canon = canonicalBody(text);
    // Stable: parse → write → parse gives the same tree.
    expect(withoutPositions(parseBody(canon).tree)).toEqual(withoutPositions(parseBody(text).tree));
    // Idempotent: writing twice gives the same text.
    expect(canonicalBody(canon)).toBe(canon);
    // Faithful: canonical text opened and saved without edits is byte-identical.
    expect(serializeBody(parseBody(canon).tree)).toBe(canon);
    expect(parseBody(text).problems).toEqual([]);
  });

  it('keeps the zero-width joiner Sinhala conjuncts need', () => {
    expect(canonicalBody(sinhalaPage)).toContain(`ශ${'්'}${ZWJ}රී`);
  });

  it('stores text in NFC', () => {
    const decomposed = 'Café';
    expect(canonicalBody(decomposed)).toBe('Café\n');
  });
});

describe('front matter', () => {
  it('reads the known keys and defaults to a page', () => {
    expect(parseBody(sinhalaPage).frontMatter).toEqual({
      title: 'භාග හැඳින්වීම',
      lang: 'si',
      kind: 'page',
    });
    expect(parseBody('Just text.').frontMatter).toEqual({ kind: 'page' });
  });

  it('reports unknown keys and broken YAML instead of keeping them silently', () => {
    expect(parseBody('---\ntitle: x\ncolour: red\n---\n\nHi').problems[0]?.code).toBe(
      'front_matter_invalid',
    );
    expect(parseBody('---\ntitle: [\n---\n\nHi').problems[0]?.code).toBe('front_matter_invalid');
  });
});

describe('checks', () => {
  it('reports raw HTML, unknown blocks, blocks in the wrong form, unpinned references, hints without a level and missing alt text', () => {
    const text = [
      '<script>alert(1)</script>',
      '',
      ':::quiz',
      'x',
      ':::',
      '',
      '::note',
      '',
      '::activity{form=fractions-check}',
      '',
      ':::hint',
      'y',
      ':::',
      '',
      '![](a.png)',
    ].join('\n');
    expect(parseBody(text).problems.map((p) => p.code)).toEqual([
      'raw_html',
      'unknown_block',
      'block_wrong_form',
      'unpinned_reference',
      'hint_without_level',
      'missing_alt_text',
    ]);
  });

  it('keeps an unknown block as written, so nothing an author wrote is lost', () => {
    expect(canonicalBody(':::quiz\nx\n:::\n')).toBe(':::quiz\nx\n:::\n');
  });
});

describe('slides', () => {
  it('splits a deck on top-level rules and keeps front matter out of the slides', () => {
    const slides = splitSlides(parseBody(englishSlides));
    expect(slides).toHaveLength(3);
    expect(slides.map((s) => s.children[0]?.type)).toEqual(['heading', 'heading', 'heading']);
  });

  it('treats a rule in a page as a rule, not a new slide', () => {
    expect(splitSlides(parseBody('One\n\n---\n\nTwo\n'))).toHaveLength(1);
  });
});
