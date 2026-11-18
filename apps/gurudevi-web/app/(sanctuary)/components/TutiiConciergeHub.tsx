import { useState, useCallback } from 'react';
import styles from './tutii-concierge.module.css';

export interface ConciergeOption {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  primaryActionLabel?: string;
  onSelect?: () => void;
  nextStepId?: string;
  outcomeText?: string;
}

export interface ConciergeStep {
  id: string;
  question: string;
  subtext?: string;
  options: ConciergeOption[];
}

export interface TutiiConciergeHubProps {
  theme?: 'wellbeing' | 'community' | 'default';
  badge: string;
  title: string;
  initialStepId: string;
  steps: Record<string, ConciergeStep>;
  storageKey?: string;
  defaultDismissed?: boolean;
  onDismissChange?: (dismissed: boolean) => void;
  minimizedPrompt?: string;
  escapeHatchLabel?: string;
}

export function TutiiConciergeHub({
  theme = 'default',
  badge,
  title,
  initialStepId,
  steps,
  storageKey,
  defaultDismissed = false,
  onDismissChange,
  minimizedPrompt = 'Need guidance? Ask Tutii',
  escapeHatchLabel = 'Browse directly ✕',
}: Readonly<TutiiConciergeHubProps>) {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultDismissed;
    if (storageKey) {
      const stored = sessionStorage.getItem(`concierge_dismissed_${storageKey}`);
      if (stored !== null) return stored === 'true';
    }
    return defaultDismissed;
  });

  const [currentStepId, setCurrentStepId] = useState<string>(initialStepId);
  const [selectedOption, setSelectedOption] = useState<ConciergeOption | null>(null);

  const handleDismiss = useCallback(
    (dismissed: boolean) => {
      setIsDismissed(dismissed);
      if (storageKey && typeof window !== 'undefined') {
        sessionStorage.setItem(`concierge_dismissed_${storageKey}`, String(dismissed));
      }
      onDismissChange?.(dismissed);
    },
    [storageKey, onDismissChange],
  );

  const handleOptionClick = useCallback(
    (option: ConciergeOption) => {
      setSelectedOption(option);
      if (option.nextStepId && steps[option.nextStepId]) {
        setCurrentStepId(option.nextStepId);
      } else if (option.onSelect) {
        option.onSelect();
      }
    },
    [steps],
  );

  const handleReset = useCallback(() => {
    setSelectedOption(null);
    setCurrentStepId(initialStepId);
  }, [initialStepId]);

  if (isDismissed) {
    return (
      <div
        className={styles.minimizedBar}
        onClick={() => handleDismiss(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleDismiss(false);
          }
        }}
        aria-label={`Open Tutii Concierge: ${minimizedPrompt}`}
      >
        <span className={styles.minimizedText}>
          <span aria-hidden="true">✨</span>
          <span>{minimizedPrompt}</span>
        </span>
        <span className={styles.minimizedAction}>Open Concierge →</span>
      </div>
    );
  }

  const currentStep = steps[currentStepId] ?? steps[initialStepId];

  return (
    <section
      className={styles.conciergeContainer}
      data-theme={theme}
      aria-labelledby="concierge-title"
    >
      <header className={styles.headerRow}>
        <div className={styles.avatarVoiceGroup}>
          <div className={styles.avatarWrapper}>
            <img
              src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
              alt="Tutii avatar"
              className={styles.avatarImg}
              width={38}
              height={38}
              loading="eager"
            />
          </div>
          <div className={styles.titleArea}>
            <span className={styles.badge}>{badge}</span>
            <h2 id="concierge-title" className={styles.title}>
              {title}
            </h2>
          </div>
        </div>

        <button
          type="button"
          className={styles.escapeHatchBtn}
          onClick={() => handleDismiss(true)}
          title="Minimize concierge and browse directly"
          aria-label={escapeHatchLabel}
        >
          <span>{escapeHatchLabel}</span>
        </button>
      </header>

      {/* Main Conversation Step */}
      <div className={styles.promptCard}>
        <p className={styles.speechText}>
          {selectedOption?.outcomeText ? selectedOption.outcomeText : currentStep?.question}
        </p>
        {currentStep?.subtext && !selectedOption?.outcomeText && (
          <span className={styles.stepIndicator}>{currentStep.subtext}</span>
        )}
      </div>

      {selectedOption && selectedOption.outcomeText ? (
        <div className={styles.actionStep}>
          <div className={styles.actionRow}>
            {selectedOption.primaryActionLabel && selectedOption.onSelect && (
              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={() => {
                  selectedOption.onSelect?.();
                }}
              >
                <span>{selectedOption.primaryActionLabel}</span>
                <span aria-hidden="true">→</span>
              </button>
            )}
            <button
              type="button"
              className={styles.secondaryActionBtn}
              onClick={handleReset}
            >
              ← Choose another path
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.optionsGrid} role="group" aria-label="Guidance options">
          {currentStep?.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={styles.optionCard}
              onClick={() => handleOptionClick(opt)}
            >
              <div className={styles.optionHeader}>
                <span className={styles.optionEmoji} aria-hidden="true">
                  {opt.emoji}
                </span>
                <span>{opt.title}</span>
              </div>
              <p className={styles.optionSub}>{opt.subtitle}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
