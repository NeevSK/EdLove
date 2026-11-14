import {
  CANONICAL_NAME_PROMPTS,
  PREFERRED_NAME_MAX_LENGTH,
} from '@repo/core/types';
import React from 'react';

export interface PreferredNameEntryProps {
  detectedName?: string;
  displayName: string;
  isEditingCustomName: boolean;
  onDisplayNameChange: (value: string) => void;
  onSelectDetectedName: (detected: string) => void;
  onStartCustomName: () => void;
  onBackToDetectedName: () => void;
  styles: Record<string, string>;
  id?: string;
  autoFocus?: boolean;
}

/**
 * PreferredNameEntry — Canonical Web Name Selection Component
 *
 * Provides smart candidate name recognition (1-tap selection) and
 * seamless transition to custom preferred name entry with full validation.
 */
export function PreferredNameEntry({
  detectedName,
  displayName,
  isEditingCustomName,
  onDisplayNameChange,
  onSelectDetectedName,
  onStartCustomName,
  onBackToDetectedName,
  styles,
  id = 'onboarding-name',
  autoFocus = true,
}: PreferredNameEntryProps) {
  if (detectedName && !isEditingCustomName) {
    return (
      <div className={styles.detectedNameCard} role="region" aria-label="Detected identity suggestion">
        <p className={styles.detectedNamePrompt}>
          Should we call you <strong>{detectedName}</strong>, or do you prefer another name?
        </p>
        <div className={styles.detectedNameChoiceRow}>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => onSelectDetectedName(detectedName)}
          >
            {CANONICAL_NAME_PROMPTS.callMeAction(detectedName)}
          </button>
          <button
            type="button"
            className={styles.secondaryActionBtn}
            onClick={onStartCustomName}
          >
            {CANONICAL_NAME_PROMPTS.useDifferentAction}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <label className={styles.fieldLabel} htmlFor={id}>
        {CANONICAL_NAME_PROMPTS.fieldLabel}
      </label>
      <input
        autoComplete="name"
        autoFocus={autoFocus}
        className={styles.nameInput}
        id={id}
        maxLength={PREFERRED_NAME_MAX_LENGTH}
        onChange={(event) => onDisplayNameChange(event.currentTarget.value)}
        placeholder={CANONICAL_NAME_PROMPTS.placeholder}
        required
        value={displayName}
      />
      <p className={styles.detectedNameHelper} style={{ marginTop: '6px' }}>
        {CANONICAL_NAME_PROMPTS.helperText}
      </p>
      {detectedName ? (
        <div className={styles.detectedNameSuggestion}>
          <button
            type="button"
            className={styles.useDetectedNameBtn}
            onClick={onBackToDetectedName}
          >
            {CANONICAL_NAME_PROMPTS.backToDetectedAction(detectedName)}
          </button>
        </div>
      ) : null}
    </>
  );
}
