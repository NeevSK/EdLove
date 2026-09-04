import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  _resetWasmForTesting,
  evaluateShape1,
  evaluateShape2,
  isCedarWasmLoaded,
} from '../cedarClientEvaluator';

const mockEvaluate = vi.fn();

vi.mock('@cedar-policy/cedar-wasm/web', () => ({
  evaluate: (...args: unknown[]) => mockEvaluate(...args),
}));

describe('cedarClientEvaluator', () => {
  beforeEach(() => {
    _resetWasmForTesting();
    vi.clearAllMocks();
  });

  afterEach(() => {
    _resetWasmForTesting();
  });

  const basePolicy = 'permit(principal, action, resource);';

  const baseUser = {
    id: 'user-1',
    attrs: {
      school_id: 'school-1',
      capacity: 'teacher',
      classroom_ids: ['classroom-1'],
    },
  };

  describe('evaluateShape1', () => {
    it('returns true when WASM returns Allow', async () => {
      mockEvaluate.mockResolvedValue({ decision: 'Allow' });

      const result = await evaluateShape1(basePolicy, {
        user: baseUser,
        action: 'read',
        resourceType: 'Classroom',
      });

      expect(result).toBe(true);
    });

    it('returns false when WASM returns Deny', async () => {
      mockEvaluate.mockResolvedValue({ decision: 'Deny' });

      const result = await evaluateShape1(basePolicy, {
        user: baseUser,
        action: 'delete',
        resourceType: 'Classroom',
      });

      expect(result).toBe(false);
    });

    it('passes correct request shape to WASM evaluator', async () => {
      mockEvaluate.mockResolvedValue({ decision: 'Allow' });

      await evaluateShape1(basePolicy, {
        user: baseUser,
        action: 'update',
        resourceType: 'School',
      });

      expect(mockEvaluate).toHaveBeenCalledWith(
        expect.objectContaining({
          policies: basePolicy,
          request: expect.objectContaining({
            principal: { type: 'User', id: 'user-1' },
            action: { type: 'Action', id: 'update' },
            resource: { type: 'School', id: '__cedar_shape1_check__' },
          }),
        }),
      );
    });

    it('passes user attributes as entity', async () => {
      mockEvaluate.mockResolvedValue({ decision: 'Allow' });

      await evaluateShape1(basePolicy, {
        user: baseUser,
        action: 'read',
        resourceType: 'Classroom',
      });

      expect(mockEvaluate).toHaveBeenCalledWith(
        expect.objectContaining({
          entities: expect.arrayContaining([
            expect.objectContaining({
              uid: { type: 'User', id: 'user-1' },
              attrs: {
                school_id: 'school-1',
                capacity: 'teacher',
                classroom_ids: ['classroom-1'],
              },
            }),
          ]),
        }),
      );
    });
  });

  describe('evaluateShape2', () => {
    it('returns true when WASM returns Allow for instance-level check', async () => {
      mockEvaluate.mockResolvedValue({ decision: 'Allow' });

      const result = await evaluateShape2(basePolicy, {
        user: baseUser,
        action: 'update',
        resourceType: 'Classroom',
        resourceId: 'classroom-42',
        resourceAttrs: { teacher_id: 'user-1', school_id: 'school-1' },
      });

      expect(result).toBe(true);
    });

    it('passes resource id and attributes correctly', async () => {
      mockEvaluate.mockResolvedValue({ decision: 'Allow' });

      await evaluateShape2(basePolicy, {
        user: baseUser,
        action: 'update',
        resourceType: 'Classroom',
        resourceId: 'classroom-42',
        resourceAttrs: { teacher_id: 'user-1', school_id: 'school-1' },
      });

      expect(mockEvaluate).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            resource: { type: 'Classroom', id: 'classroom-42' },
          }),
          entities: expect.arrayContaining([
            expect.objectContaining({
              uid: { type: 'Classroom', id: 'classroom-42' },
              attrs: { teacher_id: 'user-1', school_id: 'school-1' },
            }),
          ]),
        }),
      );
    });
  });

  describe('isCedarWasmLoaded', () => {
    it('returns false before any evaluation', () => {
      expect(isCedarWasmLoaded()).toBe(false);
    });

    it('returns true after successful evaluation', async () => {
      mockEvaluate.mockResolvedValue({ decision: 'Allow' });
      await evaluateShape1(basePolicy, {
        user: baseUser,
        action: 'read',
        resourceType: 'Classroom',
      });
      expect(isCedarWasmLoaded()).toBe(true);
    });
  });
});
