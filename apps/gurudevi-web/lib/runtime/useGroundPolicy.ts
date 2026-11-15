'use client';

import { type GroundPolicy, groundPolicyOf } from '@repo/core/logic/workspace/groundPlan';
import { useMemo } from 'react';
import { useGurudeviView } from './useGurudeviView';
import { useWebGroundLiveliness } from './webGroundLiveliness';

/** The one ground policy for this browser: the person's choice, then verger. */
export function useGroundPolicy(): GroundPolicy {
  const liveliness = useWebGroundLiveliness();
  const view = useGurudeviView();
  const quality = view?.experience.quality ?? null;
  return useMemo(
    () => groundPolicyOf({ liveliness, experience: quality ? { quality } : null }),
    [liveliness, quality],
  );
}
