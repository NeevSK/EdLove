import { cn } from '@repo/ui/utils/classNames';

describe('cn', () => {
  it('composes present class names without extra whitespace', () => {
    expect(cn('px-4', false, undefined, 'text-center', null)).toBe('px-4 text-center');
  });

  // Spike parity cases (2026-09-04-spike-cn-parity.md)
  it('resolves px-* conflicts: last wins', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
    expect(cn('px-2 px-4')).toBe('px-4');
  });

  it('keeps refinement: p-3 + px-4', () => {
    expect(cn('p-3', 'px-4')).toBe('p-3 px-4');
    expect(cn('px-4', 'p-3')).toBe('p-3');
  });

  it('merges bg-phase-* custom tokens', () => {
    expect(cn('bg-phase-primary', 'bg-phase-accent')).toBe('bg-phase-accent');
    expect(cn('bg-phase-accent', 'bg-transparent')).toBe('bg-transparent');
  });

  it('merges text-* tokens correctly', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('text-phase-text-primary', 'text-white')).toBe('text-white');
    expect(cn('text-phase-accent', 'text-phase-danger')).toBe('text-phase-danger');
  });

  it('merges flex/block/display', () => {
    expect(cn('flex-row', 'flex-col')).toBe('flex-col');
    expect(cn('block', 'flex')).toBe('flex');
    expect(cn('inline', 'block')).toBe('block');
  });

  it('merges opacity and rounded', () => {
    expect(cn('opacity-40', 'opacity-100')).toBe('opacity-100');
    expect(cn('rounded-xl', 'rounded-full')).toBe('rounded-full');
  });

  it('respects modifier scoping (hover:)', () => {
    expect(cn('px-3', 'hover:px-4')).toBe('px-3 hover:px-4');
    expect(cn('hover:px-2', 'hover:px-4')).toBe('hover:px-4');
  });

  it('keeps orthogonal axes (px + py)', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles negative/inset conflicts', () => {
    expect(cn('inset-x-px', '-inset-1')).toBe('-inset-1');
  });

  it('merges font-weight and items', () => {
    expect(cn('font-bold', 'font-medium')).toBe('font-medium');
    expect(cn('items-center', 'items-start')).toBe('items-start');
  });

  it('preserves width/color when only bg resolves (case 22)', () => {
    expect(cn('bg-phase-accent border border-phase-accent', 'bg-transparent')).toBe(
      'border border-phase-accent bg-transparent',
    );
  });

  it('resolves Button md->lg switch (case 23)', () => {
    expect(cn('px-4 h-12', 'px-6 h-14')).toBe('px-6 h-14');
  });

  it('preserves text-align vs text-color vs font-size split (case 24)', () => {
    expect(cn('font-bold text-center tracking-tight', 'text-phase-accent')).toBe(
      'font-bold text-center tracking-tight text-phase-accent',
    );
  });

  it('filters falsy values (case 25)', () => {
    expect(cn(false, undefined, 'px-4', null, 'text-center')).toBe('px-4 text-center');
  });
});
