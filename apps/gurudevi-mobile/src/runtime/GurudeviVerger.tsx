import {
  type ExperimentAssignment,
  type GovernorTelemetrySink,
  GURUDEVI_MOBILE_HOST,
} from '@repo/core/governor';
import {
  createVergerAndroidPort,
  isVergerAndroidAvailable,
  readFrameTotals,
} from '@repo/verger-android';
import { VergerProvider } from '@repo/verger-react';
import { type ReactNode, useState } from 'react';
import { type RuntimeMode, resolveRuntimeMode } from './runtimeMode';

interface GurudeviVergerProps {
  readonly children: ReactNode;
  /** Overrides the resolved mode (tests, diagnostics). */
  readonly mode?: RuntimeMode;
  readonly assignment?: ExperimentAssignment;
  readonly telemetrySink?: GovernorTelemetrySink;
}

/**
 * Gurudevi's mounting of verger: its mobile host, the Android port, and the mode Gurudevi
 * resolves from its own build and remote settings. Off unless something turns it on.
 */
export function GurudeviVerger({ children, mode, assignment, telemetrySink }: GurudeviVergerProps) {
  const [resolved] = useState<RuntimeMode>(
    () => mode ?? assignment?.runtime ?? resolveRuntimeMode(),
  );
  return (
    <VergerProvider
      host={GURUDEVI_MOBILE_HOST}
      createPort={(now) => createVergerAndroidPort(now)}
      mode={resolved}
      assignment={assignment}
      telemetrySink={telemetrySink}
      readTotals={isVergerAndroidAvailable ? readFrameTotals : undefined}
      memorySensing={isVergerAndroidAvailable}
    >
      {children}
    </VergerProvider>
  );
}
