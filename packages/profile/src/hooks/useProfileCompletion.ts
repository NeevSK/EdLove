import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserRole } from '@repo/core';
import type { UserProfile } from '../types';
import { PROFILE_SECTIONS } from '../config/profileSections';
import { isFieldFilled } from '../lib/isFieldFilled';

const CELEBRATION_KEY = '@gurudevi/profile_completed_celebrated';

export interface ProfileCompletionResult {
  percentage: number;       // 0–100 integer
  isComplete: boolean;
  nextHint: string;         // e.g. "Add your profile photo to complete"
  sectionBreakdown: {
    [sectionId: string]: { score: number; label: string };
  };
  hasSeenCompletionCelebration: boolean;
  markCompletionCelebrationSeen: () => Promise<void>;
}

export function useProfileCompletion(
  profile: UserProfile | null,
  role: UserRole | null,
): ProfileCompletionResult {
  // Default true prevents flash-showing overlay on mount for already-completed profiles
  const [hasSeenCelebration, setHasSeenCelebration] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CELEBRATION_KEY).then(val => {
      // val === null means never set → hasn't seen it
      setHasSeenCelebration(val === 'true');
    });
  }, []);

  const markCompletionCelebrationSeen = useCallback(async () => {
    setHasSeenCelebration(true);
    await AsyncStorage.setItem(CELEBRATION_KEY, 'true');
  }, []);

  const computed = useMemo(() => {
    if (!profile || !role) {
      return {
        percentage: 0,
        isComplete: false,
        nextHint: 'Add your full name to complete',
        sectionBreakdown: {} as ProfileCompletionResult['sectionBreakdown'],
      };
    }

    // 1. Filter sections by countInCompletion and role eligibility
    const eligibleSections = PROFILE_SECTIONS.filter(section => {
      if (!section.countInCompletion) return false;
      if (section.roles === 'all') return true;
      return (section.roles as UserRole[]).includes(role);
    });

    let totalWeight = 0;
    let filledWeight = 0;
    const sectionBreakdown: ProfileCompletionResult['sectionBreakdown'] = {};
    // Track highest-weight unfilled field for the nextHint
    let topUnfilled: { label: string; weight: number } | null = null;

    for (const section of eligibleSections) {
      // 2. Filter fields by onlyForRoles
      const eligibleFields = section.fields.filter(f => {
        if (!f.onlyForRoles) return true;
        return f.onlyForRoles.includes(role);
      });

      let sectionTotalWeight = 0;
      let sectionFilledWeight = 0;

      for (const field of eligibleFields) {
        totalWeight += field.weight;
        sectionTotalWeight += field.weight;

        const value = profile[field.key];
        if (isFieldFilled(value)) {
          filledWeight += field.weight;
          sectionFilledWeight += field.weight;
        } else {
          if (!topUnfilled || field.weight > topUnfilled.weight) {
            topUnfilled = { label: field.label, weight: field.weight };
          }
        }
      }

      sectionBreakdown[section.id] = {
        score: sectionTotalWeight > 0
          ? Math.round((sectionFilledWeight / sectionTotalWeight) * 100)
          : 100,
        label: section.label,
      };
    }

    const percentage = totalWeight > 0
      ? Math.round((filledWeight / totalWeight) * 100)
      : 0;

    return {
      percentage,
      isComplete: percentage === 100,
      nextHint: topUnfilled
        ? `Add your ${topUnfilled.label} to complete`
        : '🎉 Profile complete!',
      sectionBreakdown,
    };
  }, [profile, role]);

  return {
    ...computed,
    hasSeenCompletionCelebration: hasSeenCelebration,
    markCompletionCelebrationSeen,
  };
}
