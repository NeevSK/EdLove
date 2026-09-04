import { describe, expect, expectTypeOf, it, test } from 'vitest';
import {
  marksToGPA,
  multiTenantAnalyticsAPI,
  PerformanceAnalyzer,
} from './stats';

describe('analytics stats engine & boundaries', { tags: ['analytics', 'pure', 'fast'] }, () => {
  it('enforces static type boundaries on analytics contracts (T16 expectTypeOf)', () => {
    expectTypeOf(marksToGPA).toBeFunction();
    expectTypeOf(marksToGPA).parameter(0).toBeNumber();
    expectTypeOf(marksToGPA).returns.toMatchTypeOf<{ grade: string; gpa: number }>();

    expectTypeOf(multiTenantAnalyticsAPI.getLiveMetrics).toBeFunction();
    expectTypeOf(multiTenantAnalyticsAPI.getLiveMetrics).parameter(0).toBeString();
    expectTypeOf(multiTenantAnalyticsAPI.aggregateTenantMetrics).toBeFunction();
    expectTypeOf(PerformanceAnalyzer).toBeConstructibleWith({} as any);
  });

  test.for([
    { marks: 95, expectedGrade: 'A', expectedMinGpa: 3.5 },
    { marks: 80, expectedGrade: 'A', expectedMinGpa: 3.5 },
    { marks: 65, expectedGrade: 'B', expectedMinGpa: 3.0 },
    { marks: 50, expectedGrade: 'C', expectedMinGpa: 2.0 },
    { marks: 35, expectedGrade: 'S', expectedMinGpa: 1.0 },
    { marks: 20, expectedGrade: 'F', expectedMinGpa: 0.0 },
  ])('parametric verification of marks to GPA mapping: marks $marks (T17 test.for)', ({ marks, expectedGrade, expectedMinGpa }) => {
    const res = marksToGPA(marks);
    expect(res.grade).toBe(expectedGrade);
    expect(res.gpa).toBeGreaterThanOrEqual(expectedMinGpa);
  });

  it('provides live metrics matching expected schema shape', async () => {
    const metrics = await multiTenantAnalyticsAPI.getLiveMetrics('tenant-1');
    expect(metrics).toMatchObject({
      active_users: 0,
      system_health: 'healthy',
      resource_usage: { cpu: 0, memory: 0, storage: 0 },
    });
  });
});
