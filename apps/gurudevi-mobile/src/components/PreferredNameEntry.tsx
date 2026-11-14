import {
  CANONICAL_NAME_PROMPTS,
  PREFERRED_NAME_MAX_LENGTH,
} from '@repo/core/types';
import { Button, Text, TextField } from '@repo/ui/components/native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export interface PreferredNameEntryProps {
  detectedName?: string;
  displayName: string;
  isEditingCustomName: boolean;
  onDisplayNameChange: (value: string) => void;
  onSelectDetectedName: (detected: string) => void;
  onStartCustomName: () => void;
  onBackToDetectedName: () => void;
  autoFocus?: boolean;
}

/**
 * PreferredNameEntry — Canonical Mobile Preferred Name Component
 *
 * Provides candidate name recognition with 1-tap confirmation
 * or smooth transition to custom preferred name input.
 */
export function PreferredNameEntry({
  detectedName,
  displayName,
  isEditingCustomName,
  onDisplayNameChange,
  onSelectDetectedName,
  onStartCustomName,
  onBackToDetectedName,
  autoFocus = true,
}: PreferredNameEntryProps) {
  if (detectedName && !isEditingCustomName) {
    return (
      <View style={styles.detectedNameCard} accessibilityRole="summary">
        <Text kind="body" tone="soft" align="center" style={styles.detectedPrompt}>
          Should we call you <Text kind="body" style={styles.boldName}>{detectedName}</Text>, or do you prefer another name?
        </Text>

        <View style={styles.choiceColumn}>
          <Button
            label={CANONICAL_NAME_PROMPTS.callMeAction(detectedName)}
            variant="primary"
            onPress={() => onSelectDetectedName(detectedName)}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CANONICAL_NAME_PROMPTS.useDifferentAction}
            style={styles.secondaryButton}
            onPress={onStartCustomName}
          >
            <Text kind="body" tone="soft" align="center" style={styles.secondaryButtonText}>
              {CANONICAL_NAME_PROMPTS.useDifferentAction}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.customContainer}>
      <TextField
        label={CANONICAL_NAME_PROMPTS.fieldLabel}
        hint={CANONICAL_NAME_PROMPTS.helperText}
        placeholder={CANONICAL_NAME_PROMPTS.placeholder}
        value={displayName}
        onChangeText={onDisplayNameChange}
        autoFocus={autoFocus}
        maxLength={PREFERRED_NAME_MAX_LENGTH}
      />

      {detectedName ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CANONICAL_NAME_PROMPTS.backToDetectedAction(detectedName)}
          style={styles.backToDetectedButton}
          onPress={onBackToDetectedName}
        >
          <Text kind="body" tone="soft" style={styles.backToDetectedText}>
            {CANONICAL_NAME_PROMPTS.backToDetectedAction(detectedName)}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  detectedNameCard: {
    backgroundColor: 'rgba(212, 132, 58, 0.08)',
    borderColor: 'rgba(212, 132, 58, 0.25)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    gap: 16,
    marginVertical: 12,
  },
  detectedPrompt: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e5e7eb',
  },
  boldName: {
    fontWeight: '700',
    color: '#facc15',
  },
  choiceColumn: {
    gap: 12,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    textDecorationLine: 'underline',
    color: '#9ca3af',
    fontSize: 14,
  },
  customContainer: {
    gap: 12,
  },
  backToDetectedButton: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backToDetectedText: {
    fontSize: 13,
    color: '#9ca3af',
    textDecorationLine: 'underline',
  },
});
