import { cn } from '@repo/ui/utils/classNames';

describe('cn', () => {
  it('composes present class names without extra whitespace', () => {
    expect(cn('px-4', false, undefined, 'text-center', null)).toBe('px-4 text-center');
  });
});
