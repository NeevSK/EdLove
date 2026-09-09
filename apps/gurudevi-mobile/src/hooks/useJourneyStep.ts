import { leaveBreadcrumb } from '@repo/core/monitoring/breadcrumbs';
import { useCallback, useState } from 'react';
import { journeyAbandoned, journeyFailed, journeyStepCompleted } from '../lib/journeyAnalytics';

/**
 * useJourneyStep — granular journey step tracking.
 *
 * Returns a step tracker for a specific journey. Call `startStep(name)`
 * when entering a step, `completeStep()` when done, `failStep(errorType)`
 * on error, or `abandonStep()` if user navigates away.
 *
 * Logs breadcrumbs + analytics events automatically.
 */
export function useJourneyStep(journey: 'auth' | 'onboarding' | 'create' | 'sync') {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number | null>(null);

  const startStep = useCallback(
    (stepName: string) => {
      const now = Date.now();
      setCurrentStep(stepName);
      setStepStartTime(now);
      leaveBreadcrumb('journey', `Started ${journey}/${stepName}`, 'info', {
        journey,
        step: stepName,
      });
    },
    [journey],
  );

  const completeStep = useCallback(() => {
    if (!currentStep || stepStartTime === null) return;
    const duration = Date.now() - stepStartTime;
    leaveBreadcrumb('journey', `Completed ${journey}/${currentStep}`, 'info', {
      journey,
      step: currentStep,
      durationMs: duration,
    });
    journeyStepCompleted(journey, currentStep, duration);
    setCurrentStep(null);
    setStepStartTime(null);
  }, [currentStep, stepStartTime, journey]);

  const failStep = useCallback(
    (errorType: string) => {
      if (!currentStep) return;
      leaveBreadcrumb('journey', `Failed ${journey}/${currentStep}`, 'error', {
        journey,
        step: currentStep,
        errorType,
      });
      journeyFailed(journey, currentStep, errorType);
      setCurrentStep(null);
      setStepStartTime(null);
    },
    [currentStep, journey],
  );

  const abandonStep = useCallback(() => {
    if (!currentStep || stepStartTime === null) return;
    const timeOnStep = Date.now() - stepStartTime;
    leaveBreadcrumb('journey', `Abandoned ${journey}/${currentStep}`, 'warning', {
      journey,
      step: currentStep,
      timeOnStepMs: timeOnStep,
    });
    journeyAbandoned(journey, currentStep, timeOnStep);
    setCurrentStep(null);
    setStepStartTime(null);
  }, [currentStep, stepStartTime, journey]);

  return {
    currentStep,
    startStep,
    completeStep,
    failStep,
    abandonStep,
  };
}
