import { describe, expect, it } from 'vitest';
import { DRAFT_TTL_MS, draftStorageKey, parseDraft } from '../Drafts';

describe('drafts', () => {
  const now = 1_800_000_000_000;
  it('keeps each account apart on a shared phone', () => {
    expect(draftStorageKey('chat:class:7b', 'a')).not.toBe(draftStorageKey('chat:class:7b', 'b'));
    expect(draftStorageKey('ai:compose', null)).toBe('gurudevi.draft:device:ai:compose');
  });
  it('reads a recent draft back', () => {
    expect(parseDraft(JSON.stringify({ v: 'Half a note', at: now - 1000 }), now)).toBe('Half a note');
  });
  it('drops drafts older than a week, empty ones, and broken ones', () => {
    expect(parseDraft(JSON.stringify({ v: 'old', at: now - DRAFT_TTL_MS - 1 }), now)).toBeNull();
    expect(parseDraft(JSON.stringify({ v: '', at: now }), now)).toBeNull();
    expect(parseDraft('{not json', now)).toBeNull();
    expect(parseDraft(JSON.stringify({ v: 3, at: now }), now)).toBeNull();
    expect(parseDraft(null, now)).toBeNull();
  });
});
