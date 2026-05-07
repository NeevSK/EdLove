import { describe, it, expect } from 'vitest';

describe('Core Sanity Test', () => {
  it('should pass basic assertions', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to vitest environment', () => {
    expect((import.meta as any).env).toBeDefined();
  });
});
