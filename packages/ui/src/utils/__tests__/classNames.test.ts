import { describe, expect, it } from 'vitest';
import { cn } from '@repo/ui/utils/classNames';

describe('cn', () => {
  it('composes present class names without extra whitespace', () => {
    expect(cn('px-4', false, undefined, 'text-center', null)).toBe('px-4 text-center');
  });

  it.for([
    ['px-4', 'px-2', 'px-2'],
    ['text-sm', 'text-lg', 'text-lg'],
    ['rounded-xl', 'rounded-full', 'rounded-full'],
  ])('uses last-wins conflict resolution for %s and %s', ([first, second, output]) => {
    expect(cn(first, second)).toBe(output);
  });

  it('keeps refinement and orthogonal axes', () => {
    expect(cn('p-3', 'px-4')).toBe('p-3 px-4');
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('merges semantic phase tokens', () => {
    expect(cn('bg-phase-primary', 'bg-phase-accent')).toBe('bg-phase-accent');
    expect(cn('text-phase-accent', 'text-phase-danger')).toBe('text-phase-danger');
    expect(cn('border border-phase-accent', 'bg-transparent')).toBe(
      'border border-phase-accent bg-transparent',
    );
  });

  it('respects modifier scoping', () => {
    expect(cn('px-3', 'hover:px-4')).toBe('px-3 hover:px-4');
    expect(cn('hover:px-2', 'hover:px-4')).toBe('hover:px-4');
  });
});
