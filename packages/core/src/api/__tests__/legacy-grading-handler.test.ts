import { describe, expect, it, vi } from 'vitest';
import { gradingHandlers } from '../handlers/grading';

describe('legacy Hono grading boundary', () => {
  it('returns an explicit retirement response for every legacy operation', async () => {
    const methods = Object.values(gradingHandlers);
    for (const handler of methods) {
      const json = vi.fn((body: unknown, status: number) => ({ body, status }));
      await expect(handler({ json } as never)).resolves.toEqual({
        body: {
          error: 'LEGACY_GRADING_API_RETIRED',
          message: 'Use the Sanctuary lifecycle grading API backed by GradeMark.',
        },
        status: 410,
      });
      expect(json).toHaveBeenCalledOnce();
    }
  });
});
