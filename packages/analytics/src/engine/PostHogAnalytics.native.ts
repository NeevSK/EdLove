import PostHog from 'posthog-react-native';
import type { IAnalyticsPort } from '@repo/core';

interface UserProperties {
  [key: string]: any;
}

export class PostHogAnalytics implements IAnalyticsPort {
  private posthog: PostHog | null = null;
  private isInitialized = false;
  private isDisabled = process.env.EXPO_PUBLIC_POSTHOG_ENABLED === 'false';

  constructor(
    apiKey?: string,
    options?: {
      host?: string;
      debug?: boolean;
    },
  ) {
    if (apiKey) {
      this.initialize(apiKey, options);
    }
  }

  async initialize(
    apiKey: string,
    options?: {
      host?: string;
      debug?: boolean;
    },
  ): Promise<void> {
    if (this.isDisabled) {
      return;
    }
    if (this.isInitialized) {
      return;
    }

    try {
      this.posthog = new PostHog(apiKey, {
        host: options?.host || 'https://eu.i.posthog.com',
        captureAppLifecycleEvents: true,
        enableSessionReplay: true,
        sessionReplayConfig: {
          maskAllTextInputs: true,
        },
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
    }
  }

  track(event: string, properties?: Record<string, any>): void {
    if (this.isDisabled) {
      return;
    }
    if (!this.isInitialized || !this.posthog) {
      console.warn('PostHog not initialized. Event not tracked:', event);
      return;
    }

    try {
      this.posthog.capture(event, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  capture(event: string, properties?: Record<string, any>): void {
    this.track(event, properties);
  }

  identify(userId: string, userProperties?: UserProperties): void {
    if (this.isDisabled) {
      return;
    }
    if (!this.isInitialized || !this.posthog) {
      console.warn('PostHog not initialized. User not identified:', userId);
      return;
    }

    try {
      this.posthog.identify(userId);
      if (userProperties) {
        this.posthog.register(userProperties);
      }
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  reset(): void {
    if (this.isDisabled || !this.isInitialized || !this.posthog) {
      return;
    }

    try {
      this.posthog.reset();
    } catch (error) {
      console.error('Failed to reset PostHog:', error);
    }
  }

  screen(screenName: string, properties?: Record<string, any>): void {
    if (this.isDisabled) {
      return;
    }
    if (!this.isInitialized || !this.posthog) {
      console.warn('PostHog not initialized. Screen not tracked:', screenName);
      return;
    }

    try {
      this.posthog.screen(screenName, properties);
    } catch (error) {
      console.error('Failed to track screen:', error);
    }
  }

  // Educational specific tracking methods
  trackAssignmentView(
    assignmentId: string,
    properties?: {
      subject?: string;
      difficulty?: string;
      estimatedTime?: number;
    },
  ): void {
    this.track('assignment_viewed', {
      assignment_id: assignmentId,
      ...properties,
    });
  }

  trackGradeReceived(
    assignmentId: string,
    grade: number,
    properties?: {
      maxGrade?: number;
      subject?: string;
      timeSpent?: number;
    },
  ): void {
    this.track('grade_received', {
      assignment_id: assignmentId,
      grade,
      ...properties,
    });
  }

  trackStudySession(
    subject: string,
    duration: number,
    properties?: {
      topics?: string[];
      completedAssignments?: number;
    },
  ): void {
    this.track('study_session', {
      subject,
      duration,
      ...properties,
    });
  }

  trackQuizAttempt(
    quizId: string,
    score: number,
    totalQuestions: number,
    properties?: {
      topic?: string;
      difficulty?: string;
      timeSpent?: number;
    },
  ): void {
    this.track('quiz_attempt', {
      quiz_id: quizId,
      score,
      total_questions: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      ...properties,
    });
  }
}

// Singleton instance for easy access
export const posthogAnalytics = new PostHogAnalytics();
