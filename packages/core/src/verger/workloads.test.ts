import { describe, expect, it } from 'vitest';
import { GURUDEVI_LEVERS } from './gurudeviLevers';
import { GURUDEVI_WORKLOADS } from './gurudeviWorkloads';
import { GURUDEVI_HOST, GURUDEVI_MOBILE_HOST } from './host';

describe("Gurudevi's demand registry", () => {
  it('every lever is read by some declared work: no ladder without demand', () => {
    const read = new Set(GURUDEVI_WORKLOADS.flatMap((w) => w.levers ?? []));
    expect(GURUDEVI_LEVERS.map((l) => l.id).filter((id) => !read.has(id))).toEqual([]);
  });

  it('no critical work hangs on a lever that sleeps as decoration', () => {
    const ambient = new Set(GURUDEVI_LEVERS.filter((l) => l.ambient).map((l) => l.id));
    const critical = GURUDEVI_WORKLOADS.filter((w) => w.class === 'critical');
    expect(critical.flatMap((w) => (w.levers ?? []).filter((id) => ambient.has(id)))).toEqual([]);
  });

  it('both hosts carry the registry; the mobile host only with the levers it governs', () => {
    expect(GURUDEVI_HOST.workloads).toHaveLength(GURUDEVI_WORKLOADS.length);
    expect(GURUDEVI_MOBILE_HOST.workloads).toHaveLength(GURUDEVI_WORKLOADS.length);
    const mobileLevers = new Set(GURUDEVI_MOBILE_HOST.levers.map((l) => l.id));
    for (const workload of GURUDEVI_MOBILE_HOST.workloads) {
      for (const id of workload.levers ?? []) expect(mobileLevers.has(id)).toBe(true);
    }
  });
});
