interface UserProperties {
    [key: string]: any;
}
export declare class PostHogAnalytics {
    private posthog;
    private isInitialized;
    constructor(apiKey?: string, options?: {
        host?: string;
        debug?: boolean;
    });
    initialize(apiKey: string, options?: {
        host?: string;
        debug?: boolean;
    }): Promise<void>;
    track(event: string, properties?: Record<string, any>): void;
    capture(event: string, properties?: Record<string, any>): void;
    identify(userId: string, userProperties?: UserProperties): void;
    reset(): void;
    screen(screenName: string, properties?: Record<string, any>): void;
    trackAssignmentView(assignmentId: string, properties?: {
        subject?: string;
        difficulty?: string;
        estimatedTime?: number;
    }): void;
    trackGradeReceived(assignmentId: string, grade: number, properties?: {
        maxGrade?: number;
        subject?: string;
        timeSpent?: number;
    }): void;
    trackStudySession(subject: string, duration: number, properties?: {
        topics?: string[];
        completedAssignments?: number;
    }): void;
    trackQuizAttempt(quizId: string, score: number, totalQuestions: number, properties?: {
        topic?: string;
        difficulty?: string;
        timeSpent?: number;
    }): void;
}
export declare const posthogAnalytics: PostHogAnalytics;
export {};
//# sourceMappingURL=PostHogAnalytics.native.d.ts.map