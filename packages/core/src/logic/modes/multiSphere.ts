/**
 * Canonical Multi-Sphere Education API Domain
 *
 * Exposes sovereign data for:
 * - Sphere 2: Co-Curricular & Athletics (Societies, Sports, House Systems)
 * - Sphere 3: Campus Operational ERP (Relief Period Cover, Nutrition Inspection)
 * - Sphere 4: Personal Educator Sanctuary (Draft Lessons, Pedagogical Reflections)
 */

import {
  MOCK_COCURRICULAR_ACTIVITIES,
  MOCK_OPERATIONAL_DUTIES,
  MOCK_SANCTUARY_SEEDS,
  type MockCoCurricularActivity,
  type MockOperationalDuty,
  type MockSanctuarySeed,
} from '@repo/core/logic/modes/mockData';
import {
  getSandboxSamples,
  isEmptyArray,
  registerSandboxDomain,
} from '@repo/core/logic/modes/sandboxDataset';

registerSandboxDomain({
  domain: 'cocurricular',
  ghostMethods: ['getActivities'],
  isEmpty: (_method, data) => isEmptyArray(data),
  getSamples: (method) => {
    if (method === 'getActivities') return MOCK_COCURRICULAR_ACTIVITIES;
    return undefined;
  },
});

registerSandboxDomain({
  domain: 'campusOps',
  ghostMethods: ['getDailyDuties'],
  isEmpty: (_method, data) => isEmptyArray(data),
  getSamples: (method) => {
    if (method === 'getDailyDuties') return MOCK_OPERATIONAL_DUTIES;
    return undefined;
  },
});

registerSandboxDomain({
  domain: 'sanctuary',
  ghostMethods: ['getDraftSeeds'],
  isEmpty: (_method, data) => isEmptyArray(data),
  getSamples: (method) => {
    if (method === 'getDraftSeeds') return MOCK_SANCTUARY_SEEDS;
    return undefined;
  },
});

export const multiSphereAPI = {
  async getCoCurricularActivities(): Promise<readonly MockCoCurricularActivity[]> {
    return getSandboxSamples<readonly MockCoCurricularActivity[]>(
      'cocurricular',
      'getActivities',
      [],
      MOCK_COCURRICULAR_ACTIVITIES,
    );
  },

  async getDailyDuties(): Promise<readonly MockOperationalDuty[]> {
    return getSandboxSamples<readonly MockOperationalDuty[]>(
      'campusOps',
      'getDailyDuties',
      [],
      MOCK_OPERATIONAL_DUTIES,
    );
  },

  async getSanctuarySeeds(): Promise<readonly MockSanctuarySeed[]> {
    return getSandboxSamples<readonly MockSanctuarySeed[]>(
      'sanctuary',
      'getDraftSeeds',
      [],
      MOCK_SANCTUARY_SEEDS,
    );
  },
};

