import { describe, expect, it } from 'vitest';
import { markdownToHtml, parseDocument, parseYamlFrontmatter } from '../../lib/content/markdown';
import {
  CANONICAL_RESEARCH_MONOGRAPHS,
  getAllCosmosEntries,
  getAllInnovations,
  getCosmosEntryBySlug,
  getInnovationBySlug,
} from '../../lib/content/reader';

describe('Markdown & Frontmatter Engine', () => {
  it('parses YAML frontmatter headers accurately', () => {
    const yaml = `
title: "The Art of Teaning"
subtitle: "Matching Impedance"
category: framework
order: 30
tags: [resonance, somatic, teaning]
draft: false
`;
    const res = parseYamlFrontmatter(yaml);
    expect(res.title).toBe('The Art of Teaning');
    expect(res.subtitle).toBe('Matching Impedance');
    expect(res.category).toBe('framework');
    expect(res.order).toBe(30);
    expect(res.tags).toEqual(['resonance', 'somatic', 'teaning']);
    expect(res.draft).toBe(false);
  });

  it('converts markdown elements into semantic HTML', () => {
    const md = `
# Living Education

Education is not an extractive transaction; it is **resonance**.

- Item 1
- Item 2

> A living school breathes.
`;
    const html = markdownToHtml(md);
    expect(html).toContain('<h1');
    expect(html).toContain('Living Education');
    expect(html).toContain('<strong>resonance</strong>');
    expect(html).toContain('<ul');
    expect(html).toContain('<li>Item 1</li>');
    expect(html).toContain('<blockquote');
  });

  it('loads all 200 innovation dossiers from the markdown archive', () => {
    const innovations = getAllInnovations();
    expect(innovations.length).toBe(200);
    expect(innovations[0]?.slug).toBe('001-ecobasa');
    expect(innovations[0]?.title).toContain('Ecobasa');
  });

  it('retrieves a single innovation dossier and parses its HTML', () => {
    const doc = getInnovationBySlug('001-ecobasa');
    expect(doc).not.toBeNull();
    expect(doc?.slug).toBe('001-ecobasa');
    expect(doc?.frontmatter.title).toContain('Ecobasa');
    expect(doc?.contentHtml).toContain('<h2');
    expect(doc?.contentHtml).toContain('Executive Summary');
  });

  it('contains all 8 canonical research monographs from E:\\edresearch', () => {
    expect(CANONICAL_RESEARCH_MONOGRAPHS.length).toBe(8);
    const nobleLie = CANONICAL_RESEARCH_MONOGRAPHS.find((m) => m.id === 'LK-RES-EDR-NOBLE-LIE');
    expect(nobleLie).toBeDefined();
    expect(nobleLie?.author).toBe('Neev Edirisuriya');
  });

  it('loads all Paradigm Cosmos entries and parses single paradigm', () => {
    const cosmos = getAllCosmosEntries();
    expect(cosmos.length).toBeGreaterThanOrEqual(6);
    expect(cosmos[0]?.slug).toBe('01-biological');
    expect(cosmos[0]?.title).toBe('Biological Learning');

    const bio = getCosmosEntryBySlug('01-biological');
    expect(bio).not.toBeNull();
    expect(bio?.frontmatter.icon).toBe('🦅');
    expect(bio?.contentHtml).toContain('The Original Paradigm');
  });
});
