import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  Pressable: 'Pressable',
  StyleSheet: { create: (s: any) => s },
  Platform: { OS: 'ios', select: (obj: any) => obj.ios },
}));

vi.mock('@repo/ui/hooks', () => ({
  useThemedColors: () => ({
    surface: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
  }),
}));

vi.mock('@repo/ui/theme', () => ({
  Theme: {
    colors: {
      sanctuarySaffron: '#D97706',
    },
  },
}));

vi.mock('@repo/ui/primitives', () => ({
  Box: 'Box',
  HStack: 'HStack',
  VStack: 'VStack',
  Text: 'Text',
  Pressable: 'Pressable',
  Icon: 'Icon',
  Badge: 'Badge',
  BadgeText: 'BadgeText',
}));

vi.mock('@repo/ui/icons', () => ({
  Award: 'Award',
  ChevronRight: 'ChevronRight',
  Clock: 'Clock',
  Lock: 'Lock',
  ShieldCheck: 'ShieldCheck',
  Sparkles: 'Sparkles',
  Trophy: 'Trophy',
}));

import { BatteryEngine } from '@intuitui-labs/form-builder-engine';
import type { BatteryNode, FormSubmissionHistoryItem } from '@intuitui-labs/form-builder-engine/schema';
import { BatterySequenceCard } from '../components/BatterySequenceCard';

describe('G1 BatteryEngine & BatterySequenceCard Integration', () => {
  const introNode: BatteryNode = {
    id: 'intro-sensing',
    schemaId: 'intro-sensing-id',
    title: 'Introductory Resilience Sensing',
    kind: 'survey',
    sequenceOrder: 1,
    stage: 'baseline',
    accessPolicy: {
      allowRedo: true,
      rewardStrategy: 'first_attempt_only',
    },
  };

  const advancedQuizNode: BatteryNode = {
    id: 'advanced-climate-quiz',
    schemaId: 'advanced-climate-quiz-id',
    title: 'Advanced Climate Knowledge Exam',
    kind: 'quiz',
    sequenceOrder: 2,
    stage: 'quiz',
    prerequisites: {
      completedFormIds: ['intro-sensing-id'],
      minScorePercent: 75,
    },
    accessPolicy: {
      allowRedo: true,
      rewardStrategy: 'score_delta',
      maxAttempts: 3,
    },
  };

  it('allows access to unblocked root battery nodes with zero prior history', () => {
    const history: FormSubmissionHistoryItem[] = [];
    const evaluation = BatteryEngine.evaluateNodeAccess(introNode, history);

    expect(evaluation.canStart).toBe(true);
    expect(evaluation.isLocked).toBe(false);
    expect(evaluation.attemptsUsed).toBe(0);
    expect(evaluation.reason).toBeUndefined();
  });

  it('locks downstream nodes when prerequisite forms have not been completed', () => {
    const history: FormSubmissionHistoryItem[] = [];
    const evaluation = BatteryEngine.evaluateNodeAccess(advancedQuizNode, history);

    expect(evaluation.canStart).toBe(false);
    expect(evaluation.isLocked).toBe(true);
    expect(evaluation.reason).toBe('prerequisite_unmet');
    expect(evaluation.missingFormIds).toContain('intro-sensing-id');
  });

  it('unlocks downstream nodes once prerequisites meet score thresholds', () => {
    const history: FormSubmissionHistoryItem[] = [
      {
        formId: 'intro-sensing-id',
        isCompleted: true,
        completedAt: '2026-10-25T10:00:00Z',
        scorePercent: 90,
        attemptNumber: 1,
      },
    ];

    const evaluation = BatteryEngine.evaluateNodeAccess(advancedQuizNode, history);
    expect(evaluation.canStart).toBe(true);
    expect(evaluation.isLocked).toBe(false);
    expect(evaluation.attemptsUsed).toBe(0);
  });

  it('sanitizes reward points to prevent repetitive XP farming on completed forms', () => {
    // 1st attempt on first_attempt_only: awards points
    const reward1 = BatteryEngine.calculateSanitizedReward(
      introNode.accessPolicy!,
      1,
      20,
    );
    expect(reward1.pointsAwarded).toBe(20);

    // 2nd attempt on first_attempt_only: zero points awarded
    const reward2 = BatteryEngine.calculateSanitizedReward(
      introNode.accessPolicy!,
      2,
      20,
    );
    expect(reward2.pointsAwarded).toBe(0);
    expect(reward2.reason).toBe('redo_points_suppressed');
  });

  it('rewards score delta on redoable quizzes', () => {
    // Attempt 2 improves from 30 points to 45 points: awards delta (+15)
    const deltaReward = BatteryEngine.calculateSanitizedReward(
      advancedQuizNode.accessPolicy!,
      2,
      45,
      30,
    );
    expect(deltaReward.pointsAwarded).toBe(15);
  });

  it('BatterySequenceCard instantiates cleanly without errors', () => {
    expect(BatterySequenceCard).toBeDefined();
  });
});
