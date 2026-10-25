import {
  type CapacityFacts,
  type LabReport,
  type LeverSpec,
  labReport,
  type Verger,
} from '@repo/verger-core';
import { useEffect, useState } from 'react';
import { useVerger, useVergerSnapshot } from './vergerStore';

/**
 * The dev lab's live view (D2): the bound verger's `labReport`, rebuilt on every snapshot and
 * every `refreshMs` (outcomes and self-cost move without a snapshot). Null when no verger is
 * bound. For development screens only: it polls.
 */
export function useVergerLab(
  levers: readonly LeverSpec[],
  capacity?: CapacityFacts,
  refreshMs = 1000,
): { readonly verger: Verger | null; readonly report: LabReport | null } {
  const verger = useVerger();
  const snapshot = useVergerSnapshot();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), refreshMs);
    return () => clearInterval(timer);
  }, [refreshMs]);
  const [report, setReport] = useState<LabReport | null>(null);
  useEffect(() => {
    setReport(verger ? labReport(verger, levers, capacity) : null);
  }, [verger, snapshot, tick, levers, capacity]);
  return { verger, report };
}
