import { describe, expect, it } from 'vitest';
import { classifyCustomTrapSlope, filterTrapsBySlope, findTrapById, resolveTraps } from '..';
import type { ThinkingTrap } from '../types';

const FIXTURE_TRAPS: ThinkingTrap[] = [
  {
    id: 'all_or_nothing',
    label: 'Everything-or-nothing',
    emoji: '⚪⚫',
    slope: 'general',
    description: 'Two colors only.',
    example: 'One B ruins the term.',
    challengePrompt: 'Is there a middle grade?',
  },
  {
    id: 'fixed_mindset',
    label: 'I just cannot',
    emoji: '🧱',
    slope: 'learning',
    description: 'Ability seen as fixed.',
    example: 'Not a math person.',
    challengePrompt: 'Smallest untried step?',
  },
];

describe('findTrapById', () => {
  it('resolves a known id', () => {
    expect(findTrapById(FIXTURE_TRAPS, 'all_or_nothing')?.slope).toBe('general');
  });

  it('returns undefined for an unknown id', () => {
    expect(findTrapById(FIXTURE_TRAPS, 'missing_trap')).toBeUndefined();
  });
});

describe('filterTrapsBySlope', () => {
  it('returns only traps in the requested slope', () => {
    const learning = filterTrapsBySlope(FIXTURE_TRAPS, 'learning');
    expect(learning.map((trap) => trap.id)).toEqual(['fixed_mindset']);
  });
});

describe('classifyCustomTrapSlope', () => {
  it('returns general for everyday reflections', () => {
    expect(classifyCustomTrapSlope('My own pattern')).toBe('general');
  });

  it('returns learning for academic-flavoured text', () => {
    expect(classifyCustomTrapSlope('My study doubt pattern')).toBe('learning');
  });
});

describe('resolveTraps', () => {
  it('resolves ids and ignores unknowns', () => {
    const resolved = resolveTraps(FIXTURE_TRAPS, ['all_or_nothing', 'does_not_exist']);
    expect(resolved.map((trap) => trap.id)).toEqual(['all_or_nothing']);
  });

  it('returns an empty list when nothing matches and no custom trap is given', () => {
    expect(resolveTraps(FIXTURE_TRAPS, ['nope'])).toEqual([]);
  });

  it('appends a fully-built custom trap when provided', () => {
    const custom: ThinkingTrap = {
      id: 'custom',
      label: 'My own pattern',
      emoji: '✍️',
      slope: 'general',
      description: 'Your own described thinking pattern.',
      example: '',
      challengePrompt: 'What would a teacher you respect say about this?',
    };
    const resolved = resolveTraps(FIXTURE_TRAPS, [], custom);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]?.id).toBe('custom');
    expect(resolved[0]?.slope).toBe('general');
  });

  it('preserves catalog order and appends the custom trap last', () => {
    const custom: ThinkingTrap = {
      id: 'custom',
      label: 'Custom',
      emoji: '✍️',
      slope: 'learning',
      description: '',
      example: '',
      challengePrompt: '',
    };
    const resolved = resolveTraps(FIXTURE_TRAPS, ['fixed_mindset', 'all_or_nothing'], custom);
    expect(resolved.map((trap) => trap.id)).toEqual(['fixed_mindset', 'all_or_nothing', 'custom']);
  });
});
