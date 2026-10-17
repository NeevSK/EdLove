import type { FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PowerSyncFormsAdapter, type ExtendedFormSchema } from '../forms.adapter';

const mockDb = {
  insert: vi.fn(),
  select: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@repo/core/adapters/powersync/database', () => ({
  getDrizzleDB: () => mockDb,
}));

describe('PowerSyncFormsAdapter Local-First Persistence & Round-Trip', () => {
  let adapter: PowerSyncFormsAdapter;

  beforeEach(() => {
    adapter = new PowerSyncFormsAdapter();
    vi.clearAllMocks();
  });

  it('saves and serializes quiz assessment settings and affordanceConfig in SQLite config payload', async () => {
    let savedValues: any = null;
    mockDb.insert.mockReturnValue({
      values: (val: any) => {
        savedValues = val;
        return {
          onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
        };
      },
    });

    const testForm: ExtendedFormSchema = {
      v: '1.0',
      id: 'quiz-101',
      tenantId: 'school-1',
      title: 'Biology Midterm Quiz',
      pages: [
        {
          id: 'p1',
          title: 'Cell Biology',
          fields: [
            {
              id: 'q1',
              name: 'mitochondria',
              type: 'select',
              label: 'Powerhouse of the cell?',
              order: 0,
              rubric: {
                kind: 'single-choice',
                points: 10,
                correctValue: 'mitochondria',
                explanation: 'Mitochondria produces ATP.',
              },
            } as any,
          ],
        },
      ],
      settings: {
        isPublished: true,
        slug: 'bio-midterm',
        assessment: {
          timing: 'cadence',
          globalDurationSeconds: 1800,
          passingScore: 75,
        },
      },
      affordanceConfig: {
        enableConfetti: true,
        hapticFeedback: 'medium',
      },
      createdAt: '2026-10-15T00:00:00.000Z',
      updatedAt: '2026-10-15T00:00:00.000Z',
    };

    await adapter.save(testForm);

    expect(savedValues).toBeDefined();
    expect(savedValues.id).toBe('quiz-101');
    expect(savedValues.isPublished).toBe(true);

    const parsedConfig = JSON.parse(savedValues.config);
    expect(parsedConfig.pages).toHaveLength(1);
    expect(parsedConfig.pages[0].fields[0].rubric.points).toBe(10);
    expect(parsedConfig.settings.assessment.globalDurationSeconds).toBe(1800);
    expect(parsedConfig.affordanceConfig.enableConfetti).toBe(true);
  });

  it('loads and reconstructs quiz assessment and affordances from serialized config', async () => {
    const configPayload = JSON.stringify({
      pages: [
        {
          id: 'p1',
          title: 'Math Quiz',
          fields: [
            {
              id: 'q1',
              name: 'sum',
              type: 'text',
              label: '2 + 2 = ?',
              rubric: { points: 5, correctValue: '4' },
            },
          ],
        },
      ],
      settings: {
        isPublished: true,
        slug: 'math-quiz',
        assessment: { timing: 'instant', passingScore: 80 },
      },
      affordanceConfig: { enableSound: true },
    });

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: 'quiz-math',
              ownerId: 'school-1',
              title: 'Math Quiz',
              description: 'Quick math assessment',
              config: configPayload,
              isPublished: true,
              slug: 'math-quiz',
              category: 'quiz',
              createdAt: '2026-10-15T00:00:00.000Z',
              updatedAt: '2026-10-15T00:00:00.000Z',
            },
          ]),
        }),
      }),
    });

    const loaded = await adapter.load('quiz-math');

    expect(loaded.id).toBe('quiz-math');
    expect(loaded.pages[0]!.fields[0]!.rubric).toEqual({ points: 5, correctValue: '4' });
    expect((loaded.settings as Record<string, any>).assessment?.passingScore).toBe(80);
    expect(loaded.affordanceConfig?.enableSound).toBe(true);
  });

  it('maintains 100% backward compatibility with legacy array configs', async () => {
    const legacyArrayConfig = JSON.stringify([
      {
        id: 'p1',
        title: 'Legacy Survey',
        fields: [{ id: 'f1', name: 'feedback', type: 'text', label: 'Comments' }],
      },
    ]);

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: 'survey-legacy',
              ownerId: 'school-1',
              title: 'Legacy Survey',
              description: null,
              config: legacyArrayConfig,
              isPublished: false,
              slug: null,
              category: 'survey',
              createdAt: '2026-10-15T00:00:00.000Z',
              updatedAt: '2026-10-15T00:00:00.000Z',
            },
          ]),
        }),
      }),
    });

    const loaded = await adapter.load('survey-legacy');
    expect(loaded.pages).toHaveLength(1);
    expect(loaded.pages[0]!.title).toBe('Legacy Survey');
    expect(loaded.settings.isPublished).toBe(false);
  });
});
