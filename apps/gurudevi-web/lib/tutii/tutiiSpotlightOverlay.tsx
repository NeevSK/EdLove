import { ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { tutiiJourneySpec, UserRolePerspective } from './schema';
import { createtutiiActor, tutiiMachineContext } from './tutiiMachine';

interface tutiiSpotlightOverlayProps {
  spec: tutiiJourneySpec;
  role: UserRolePerspective;
  autoStart?: boolean;
  onDismiss?: () => void;
  onComplete?: () => void;
}

export function TutiiSpotlightOverlay({
  spec,
  role,
  autoStart = true,
  onDismiss,
  onComplete,
}: tutiiSpotlightOverlayProps) {
  const [actor] = useState(() => createtutiiActor());
  const [snapshot, setSnapshot] = useState<tutiiMachineContext>(
    actor.getSnapshot().context as unknown as tutiiMachineContext,
  );
  const [stateValue, setStateValue] = useState<string>(actor.getSnapshot().value as string);

  useEffect(() => {
    const sub = actor.subscribe((s) => {
      setSnapshot(s.context as unknown as tutiiMachineContext);
      setStateValue(s.value as string);

      if (s.value === 'dismissed') {
        onDismiss?.();
      } else if (s.value === 'completed') {
        onComplete?.();
      }
    });

    actor.start();

    // Check localStorage before auto-starting
    if (autoStart && typeof window !== 'undefined') {
      const alreadySeen = window.localStorage.getItem(`tutii.journey.${spec.id}.seen`);
      if (!alreadySeen) {
        actor.send({ type: 'START', spec, role });
      }
    }

    const handleResize = () => {
      actor.send({ type: 'RESIZE' });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        actor.send({ type: 'DISMISS' });
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      sub.unsubscribe();
      actor.stop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [actor, autoStart, onComplete, onDismiss, role, spec]);

  const handleNext = useCallback(() => {
    actor.send({ type: 'NEXT' });
  }, [actor]);

  const handlePrev = useCallback(() => {
    actor.send({ type: 'PREV' });
  }, [actor]);

  const handleDismiss = useCallback(() => {
    actor.send({ type: 'DISMISS' });
  }, [actor]);

  // Don't render if not spotlighting or no target
  if (stateValue !== 'spotlighting' || !snapshot.activeStep || !snapshot.targetRect) {
    return null;
  }

  const { targetRect, placement, activeStep, currentIndex, filteredSteps } = snapshot;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === filteredSteps.length - 1;
  const primaryAction = activeStep.actions?.find((a) => a.kind === 'primary');

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-auto transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-label={activeStep.title ?? activeStep.narration}
    >
      {/* SVG Mask for Target Spotlight */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="tutii-mask">
            {/* White area = visible overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black area = cut-out spotlight */}
            <rect
              x={targetRect.left}
              y={targetRect.top}
              width={targetRect.width}
              height={targetRect.height}
              rx={12}
              ry={12}
              fill="black"
            />
          </mask>
        </defs>
        {/* Semi-transparent backdrop with mask applied */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(19, 30, 39, 0.72)"
          mask="url(#tutii-mask)"
        />
      </svg>

      {/* Target Pulsing Halo */}
      <div
        className="absolute pointer-events-none rounded-xl border-2 border-sanctuary-saffron shadow-lg animate-pulse"
        style={{
          left: `${targetRect.left}px`,
          top: `${targetRect.top}px`,
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
        }}
      />

      {/* Popover Callout */}
      {placement && (
        <div
          className="absolute z-50 flex flex-col w-80 max-w-[calc(100vw-32px)] rounded-2xl bg-paper-light border border-line shadow-2xl p-5 text-ink transition-all duration-200 ease-out"
          style={{
            left: `${placement.left}px`,
            top: `${placement.top}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sanctuary-saffron/15 text-sanctuary-saffron text-xs font-bold">
                {currentIndex + 1}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                tutii Companion
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 -mr-1 text-ink-soft hover:text-ink rounded-lg hover:bg-line/20 transition-colors"
              aria-label="Dismiss guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Character Avatar & Title */}
          <div className="flex items-start gap-3 my-2">
            <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border border-sanctuary-saffron/30 bg-cream-silence">
              <img
                src="/avatars/tutii-guide.png"
                alt="tutii"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="w-full h-full flex items-center justify-center text-sanctuary-saffron">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-semibold text-base leading-snug">
                {activeStep.title ?? 'tutii Guide'}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft font-sans">
                {activeStep.narration}
              </p>
            </div>
          </div>

          {/* Action Button (Optional primary feature CTA) */}
          {primaryAction && (
            <div className="mt-3">
              <button
                onClick={() => {
                  const targetEl = document.querySelector(activeStep.targetSelector) as HTMLElement;
                  if (targetEl) {
                    targetEl.click();
                  }
                  handleNext();
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-sanctuary-saffron hover:bg-sanctuary-saffron/90 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{primaryAction.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Footer Controls */}
          <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs">
            <span className="text-ink-soft font-medium">
              Step {currentIndex + 1} of {filteredSteps.length}
            </span>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="px-2.5 py-1 text-xs font-medium text-ink-soft hover:text-ink hover:bg-line/20 rounded-md transition-colors"
                >
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-ink hover:bg-ink/90 rounded-md shadow-sm transition-colors flex items-center gap-1"
              >
                <span>{isLast ? 'Got it' : 'Next'}</span>
                {isLast ? <Check className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
