'use client';

import { useSyncExternalStore } from 'react';

export type ExploreCapacity = 'teacher' | 'principal' | 'student' | 'guardian' | 'founder' | 'researcher';

export const DEFAULT_EXPLORE_CAPACITY: ExploreCapacity = 'teacher';
export const EXPLORE_CAPACITY_STORAGE_KEY = 'gurudevi_explore_capacity';
export const EXPLORE_CAPACITY_EVENT = 'gurudevi-explore-capacity-change';

export interface ExploreCapacityMeta {
  readonly id: ExploreCapacity;
  readonly label: string;
  readonly roleTitle: string;
  readonly description: string;
  readonly domainOverview: Readonly<{
    workspace: string;
    self: string;
    community: string;
    library: string;
  }>;
}

export const EXPLORE_CAPACITIES: readonly ExploreCapacityMeta[] = [
  {
    id: 'teacher',
    label: 'Teacher',
    roleTitle: 'Teacher & Educator',
    description:
      'Classroom Sanctuary: daily attendance, class rosters, lesson prep, and safe practice.',
    domainOverview: {
      workspace: 'Classroom Sanctuary · Daily attendance & roster practice',
      self: 'Teacher Wellbeing · Reflections & Fire Journal',
      community: 'Faculty Staff Room & Pedagogical Circles',
      library: 'Curricular Canon & Teaching Resources',
    },
  },
  {
    id: 'principal',
    label: 'School Leader',
    roleTitle: 'School Leader & Principal',
    description:
      'School Coordination: institutional climate sensing, school-wide presence, and educator support.',
    domainOverview: {
      workspace: 'School Coordination · Climate sensing & staff overview',
      self: 'Leadership Reflections & Strategic Journal',
      community: 'Whole-School Assembly & Governance Circles',
      library: 'Institutional Policies & Leadership Canon',
    },
  },
  {
    id: 'student',
    label: 'Student',
    roleTitle: 'Young Learner & Student',
    description:
      'Learning Studio: quiet self-practice, learning reflections, personal portfolio, and calm focus.',
    domainOverview: {
      workspace: 'Learning Studio · Independent practice & assignments',
      self: 'Inner Quiet · Reflections & Growth Journal',
      community: 'Peer Circles & Collaborative Spaces',
      library: 'Student Reader & Exploratory Canon',
    },
  },
  {
    id: 'guardian',
    label: 'Family & Guardian',
    roleTitle: 'Family & Guardian',
    description:
      'Family Bridge: relational care notes, learner growth trajectory, and home-school partnership.',
    domainOverview: {
      workspace: 'Family Bridge · Student care notes & attendance view',
      self: 'Family Wellbeing & Shared Reflections',
      community: 'Parent-Teacher Council & Community Dialogues',
      library: 'Family Guides & Pedagogical Principles',
    },
  },
  {
    id: 'founder',
    label: 'Platform Founder',
    roleTitle: 'Platform Founder & Steward',
    description:
      'Sovereign Architecture: regenerative school systems, network-wide sync governance, and foundational charters.',
    domainOverview: {
      workspace: 'Sovereign Core · Multi-school topologies & network ledgers',
      self: 'Foundational Vision · Stewardship Reflections & Solitude Journal',
      community: 'Global Sanctuary Council & Steward Roundtables',
      library: 'Foundational Charters & Architectural Specifications',
    },
  },
  {
    id: 'researcher',
    label: 'Cognitive Scientist',
    roleTitle: 'Cognitive Scientist & Researcher',
    description:
      'Research Atlas: attentional dynamics, contemplative bio-acoustics, and evidence-grounded pedagogy.',
    domainOverview: {
      workspace: 'Research Atlas · Attention analytics & observational data',
      self: 'Empirical Inquiry · Research Notebook & Hypotheses',
      community: 'Cognitive Science Colloquium & Peer Review Circles',
      library: 'Scientific Preprints, Field Monographs & Datasets',
    },
  },
] as const;

export function isExploreCapacity(value: unknown): value is ExploreCapacity {
  return (
    typeof value === 'string' && EXPLORE_CAPACITIES.some((meta) => meta.id === value.toLowerCase())
  );
}

export function getExploreCapacityMeta(capacity: string): ExploreCapacityMeta {
  const match = EXPLORE_CAPACITIES.find((item) => item.id.toLowerCase() === capacity.toLowerCase());
  return match ?? EXPLORE_CAPACITIES[0]!;
}

export function getExploreCapacity(): ExploreCapacity {
  if (typeof window === 'undefined') return DEFAULT_EXPLORE_CAPACITY;
  try {
    const stored = window.localStorage.getItem(EXPLORE_CAPACITY_STORAGE_KEY);
    if (stored && isExploreCapacity(stored)) {
      return stored.toLowerCase() as ExploreCapacity;
    }
  } catch {
    // LocalStorage unavailable in restricted environments
  }
  return DEFAULT_EXPLORE_CAPACITY;
}

export function hasSavedExploreCapacity(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = window.localStorage.getItem(EXPLORE_CAPACITY_STORAGE_KEY);
    return saved !== null && isExploreCapacity(saved);
  } catch {
    return false;
  }
}

export function setExploreCapacity(capacity: ExploreCapacity): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(EXPLORE_CAPACITY_STORAGE_KEY, capacity);
  } catch {
    // LocalStorage quota or access denied
  }
  window.dispatchEvent(new CustomEvent(EXPLORE_CAPACITY_EVENT, { detail: { capacity } }));
}

function subscribeExploreCapacity(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleStorage = (event: StorageEvent) => {
    if (event.key === EXPLORE_CAPACITY_STORAGE_KEY) {
      callback();
    }
  };
  const handleCustom = () => callback();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(EXPLORE_CAPACITY_EVENT, handleCustom);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(EXPLORE_CAPACITY_EVENT, handleCustom);
  };
}

/**
 * Reactive hook to read and sync the visitor's chosen capacity in the Explore sandbox.
 */
export function useExploreCapacity(): ExploreCapacity {
  return useSyncExternalStore(
    subscribeExploreCapacity,
    getExploreCapacity,
    () => DEFAULT_EXPLORE_CAPACITY,
  );
}
