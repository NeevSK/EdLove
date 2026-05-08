import type { UserContext } from '../schemas/user.schema';

/**
 * FeatureFlags - The central registry of all boolean switches in the Gurudevi Sanctuary.
 *
 * FAANG Principle: "Strongly Typed Gates". Never use magic strings in the UI.
 */
export interface FeatureFlags {
  // ERP / Financial Flags
  isInventoryEnabled: boolean;
  isPaymentsEnabled: boolean;
  isAccountingEnabled: boolean;

  // People & Administration Flags
  isStaffManagementEnabled: boolean;
  isStudentReportingEnabled: boolean;
  isTemplateManagementEnabled: boolean;

  // Infrastructure Flags (Deployment Gating)
  isLibraryManagementEnabled: boolean;

  // Business Flags (Entitlements / Tiers)
  isProMember: boolean;
  canUseOCR: boolean;
  isAIAssistantEnabled: boolean;

  // Experimental / Beta Flags
  isPublicSensingEnabled: boolean;
  isNewOnboardingEnabled: boolean;
  isGuardianWorkspaceEnabled: boolean;
  isStudentAssignmentQueueEnabled: boolean;
  isStudentGoalsWorkspaceEnabled: boolean;
  isStudentGradesWorkspaceEnabled: boolean;
  isStudentProgressWorkspaceEnabled: boolean;
  isStudentRewardsWorkspaceEnabled: boolean;

  // Workspace & Infrastructure Flags
  isDevelopingWorkspace: boolean;
  isSelfWorkspaceEnabled: boolean;
  isWorkforceEnabled: boolean;
  isDevelopingWorkforce: boolean;
  isFormBuilderEnabled: boolean;
  isDevelopingFormBuilder: boolean;
  isGraphicsEngineEnabled: boolean;

  // Community & Social Flags
  isAnalyticsEnabled: boolean;
  isCommunityEnabled: boolean;
  isMessagingEnabled: boolean;
  isSocialShieldEnabled: boolean;

  // Development / In-Progress Flags (Strictly off in Prod unless developer role)
  isDevelopingAI: boolean;
  isDevelopingAnalyticsDashboard: boolean;
  isDevelopingVoiceNavigation: boolean;

  // Global Safety Flags (Kill Switches)
  isUnderMaintenance: boolean;

  // Resilience & Infrastructure Flags
  isPowerSyncEnabled: boolean;
  isBackgroundSyncEnabled: boolean;
}

/**
 * resolveFeatureFlags: The Hierarchical Resolution Engine.
 */
export type ExposureHandler = (flag: string, value: boolean | string) => void;
let exposureHandler: ExposureHandler | null = null;

/** Register a callback for analytics (e.g. PostHog) to track flag usage */
export const setFeatureExposureHandler = (handler: ExposureHandler) => {
  exposureHandler = handler;
};

/** Internal utility to trigger the exposure callback */
export const trackFeatureExposureInternal = (flag: string, value: boolean | string) => {
  exposureHandler?.(flag, value);
};

export const resolveFeatureFlags = (
  context: UserContext,
  globalConfigs: Record<string, string | boolean> = {},
): FeatureFlags => {
  // 0. Default Safe Harbor State
  const flags: FeatureFlags = {
    isInventoryEnabled: false,
    isPaymentsEnabled: false,
    isAccountingEnabled: false,
    isLibraryManagementEnabled: true,
    isStaffManagementEnabled: true, // Defaulting to true for now unless ERP is on
    isStudentReportingEnabled: true,
    isTemplateManagementEnabled: true,
    isProMember: false,
    canUseOCR: false,
    isAIAssistantEnabled: false,
    isPublicSensingEnabled: true,
    isNewOnboardingEnabled: false,
    isGuardianWorkspaceEnabled: false,
    isStudentAssignmentQueueEnabled: true,
    isStudentGoalsWorkspaceEnabled: true,
    isStudentGradesWorkspaceEnabled: true,
    isStudentProgressWorkspaceEnabled: true,
    isStudentRewardsWorkspaceEnabled: false,
    isDevelopingWorkspace: false,
    isSelfWorkspaceEnabled: true,
    isWorkforceEnabled: true,
    isDevelopingWorkforce: false,
    isFormBuilderEnabled: true,
    isDevelopingFormBuilder: false,
    isGraphicsEngineEnabled: true,
    isAnalyticsEnabled: true,
    isCommunityEnabled: true,
    isMessagingEnabled: true,
    isSocialShieldEnabled: true,
    isDevelopingAI: false,
    isDevelopingAnalyticsDashboard: false,
    isDevelopingVoiceNavigation: false,
    isUnderMaintenance: false,
    isPowerSyncEnabled: false,
    isBackgroundSyncEnabled: true,
  };

  // 1. Infrastructure Level (Process Env)
  // Note: Expo/Next.js bundle these at build time
  const envFlags = {
    ERP:
      process.env['EXPO_PUBLIC_ENABLE_ERP'] === 'true' ||
      process.env['NEXT_PUBLIC_ENABLE_ERP'] === 'true',
    NEW_ONBOARDING: process.env['EXPO_PUBLIC_ENABLE_NEW_ONBOARDING'] === 'true',
    GUARDIAN_WORKSPACE:
      process.env['EXPO_PUBLIC_ENABLE_GUARDIAN_WORKSPACE'] === 'true' ||
      process.env['NEXT_PUBLIC_ENABLE_GUARDIAN_WORKSPACE'] === 'true',
    STUDENT_REWARDS_WORKSPACE:
      process.env['EXPO_PUBLIC_ENABLE_STUDENT_REWARDS_WORKSPACE'] === 'true' ||
      process.env['NEXT_PUBLIC_ENABLE_STUDENT_REWARDS_WORKSPACE'] === 'true',
    STUDENT_GOALS_WORKSPACE:
      process.env['EXPO_PUBLIC_ENABLE_STUDENT_GOALS_WORKSPACE'] === 'true' ||
      process.env['NEXT_PUBLIC_ENABLE_STUDENT_GOALS_WORKSPACE'] === 'true',
    STUDENT_GRADES_WORKSPACE:
      process.env['EXPO_PUBLIC_ENABLE_STUDENT_GRADES_WORKSPACE'] === 'true' ||
      process.env['NEXT_PUBLIC_ENABLE_STUDENT_GRADES_WORKSPACE'] === 'true',
    STUDENT_PROGRESS_WORKSPACE:
      process.env['EXPO_PUBLIC_ENABLE_STUDENT_PROGRESS_WORKSPACE'] === 'true' ||
      process.env['NEXT_PUBLIC_ENABLE_STUDENT_PROGRESS_WORKSPACE'] === 'true',
    COMMUNITY: process.env['EXPO_PUBLIC_ENABLE_COMMUNITY'] !== 'false',
    MESSAGING: process.env['EXPO_PUBLIC_ENABLE_MESSAGING'] !== 'false',
    SOCIAL_SHIELD: process.env['EXPO_PUBLIC_ENABLE_SOCIAL_SHIELD'] !== 'false',
  };

  if (envFlags.ERP) {
    flags.isInventoryEnabled = true;
    flags.isPaymentsEnabled = true;
    flags.isAccountingEnabled = true;
    flags.isStaffManagementEnabled = true;
    flags.isStudentReportingEnabled = true;
  }
  if (envFlags.NEW_ONBOARDING) flags.isNewOnboardingEnabled = true;
  if (envFlags.GUARDIAN_WORKSPACE) flags.isGuardianWorkspaceEnabled = true;
  if (envFlags.STUDENT_REWARDS_WORKSPACE) flags.isStudentRewardsWorkspaceEnabled = true;
  if (envFlags.STUDENT_GOALS_WORKSPACE) flags.isStudentGoalsWorkspaceEnabled = true;
  if (envFlags.STUDENT_GRADES_WORKSPACE) flags.isStudentGradesWorkspaceEnabled = true;
  if (envFlags.STUDENT_PROGRESS_WORKSPACE) flags.isStudentProgressWorkspaceEnabled = true;

  if (envFlags.COMMUNITY === false) flags.isCommunityEnabled = false;
  if (envFlags.MESSAGING === false) flags.isMessagingEnabled = false;
  if (envFlags.SOCIAL_SHIELD === false) flags.isSocialShieldEnabled = false;

  // 2. Entitlement Level (Pricing Tier, Citizenship & Features Array)
  const isPaidTier = context.pricing_tier === 'PRO' || context.pricing_tier === 'INSTITUTIONAL';
  const isInstitutional = context.pricing_tier === 'INSTITUTIONAL';
  const isWanderer = context.citizenship === 'WANDERER';
  
  const capacity = context.active_bond?.capacity || null;
  const isAdmin = ['admin', 'founder', 'developer'].includes(capacity || '');

  flags.isProMember = isPaidTier || isAdmin;

  // Wanderer specific overrides
  if (isWanderer) {
    flags.isPaymentsEnabled = false;
    flags.isAccountingEnabled = false;
    flags.isStaffManagementEnabled = false;
  }

  // Institutional features
  if (isInstitutional || isAdmin) {
    flags.isInventoryEnabled = true;
    flags.isPaymentsEnabled = true;
    flags.isAccountingEnabled = true;
    flags.isStaffManagementEnabled = true;
  }

  if ((context.features || []).includes('OCR') || isAdmin) flags.canUseOCR = true;
  if ((context.features || []).includes('AI_ASSISTANT') || isAdmin) flags.isAIAssistantEnabled = true;
  if ((context.features || []).includes('STAFF_MANAGEMENT')) flags.isStaffManagementEnabled = true;
  if ((context.features || []).includes('STUDENT_REPORTING')) flags.isStudentReportingEnabled = true;
  if ((context.features || []).includes('BETA_TESTER')) flags.isNewOnboardingEnabled = true;
  if (
    (context.features || []).includes('GUARDIAN_WORKSPACE') ||
    (context.features || []).includes('BETA_GUARDIAN_WORKSPACE')
  ) {
    flags.isGuardianWorkspaceEnabled = true;
  }
  if (
    (context.features || []).includes('STUDENT_REWARDS_WORKSPACE') ||
    (context.features || []).includes('BETA_STUDENT_WORKSPACE')
  ) {
    flags.isStudentRewardsWorkspaceEnabled = true;
  }
  if (
    (context.features || []).includes('STUDENT_GOALS_WORKSPACE') ||
    (context.features || []).includes('BETA_STUDENT_WORKSPACE')
  ) {
    flags.isStudentGoalsWorkspaceEnabled = true;
  }
  if (
    (context.features || []).includes('STUDENT_GRADES_WORKSPACE') ||
    (context.features || []).includes('BETA_STUDENT_WORKSPACE')
  ) {
    flags.isStudentGradesWorkspaceEnabled = true;
  }
  if (
    (context.features || []).includes('STUDENT_PROGRESS_WORKSPACE') ||
    (context.features || []).includes('BETA_STUDENT_WORKSPACE')
  ) {
    flags.isStudentProgressWorkspaceEnabled = true;
  }
  if (
    (context.features || []).includes('STUDENT_ASSIGNMENT_QUEUE') ||
    (context.features || []).includes('BETA_STUDENT_WORKSPACE')
  ) {
    flags.isStudentAssignmentQueueEnabled = true;
  }

  if ((context.features || []).includes('COMMUNITY')) flags.isCommunityEnabled = true;
  if ((context.features || []).includes('DIRECT_MESSAGING')) flags.isMessagingEnabled = true;
  if ((context.features || []).includes('SOCIAL_SHIELD')) flags.isSocialShieldEnabled = true;

  // 3. Capacity/Persona Logic
  if (capacity === 'student') {
    flags.isInventoryEnabled = false; // Strictly enforced override
  }

  if (capacity === 'developer') {
    flags.isDevelopingAnalyticsDashboard = true;
    flags.isDevelopingVoiceNavigation = true;
    flags.isDevelopingWorkspace = true;
    flags.isDevelopingAI = true;
    flags.isDevelopingFormBuilder = true;
    flags.isDevelopingWorkforce = true;
  }

  if (capacity === 'guardian' || capacity === 'parent') {
    flags.isGuardianWorkspaceEnabled = true;
  }

  // 4. Remote Level (Global Configs) - HIGHEST PRIORITY Overrides
  if (globalConfigs['KILL_SWITCH_OCR'] === 'true' || globalConfigs['KILL_SWITCH_OCR'] === true) {
    flags.canUseOCR = false;
  }

  if (
    globalConfigs['KILL_SWITCH_COMMUNITY'] === 'true' ||
    globalConfigs['KILL_SWITCH_COMMUNITY'] === true
  ) {
    flags.isCommunityEnabled = false;
  }

  if (
    globalConfigs['KILL_SWITCH_MESSAGING'] === 'true' ||
    globalConfigs['KILL_SWITCH_MESSAGING'] === true
  ) {
    flags.isMessagingEnabled = false;
  }

  if (globalConfigs['MAINTENANCE_MODE'] === 'true' || globalConfigs['MAINTENANCE_MODE'] === true) {
    flags.isUnderMaintenance = true;
    // Potentially disable features here
  }

  if (globalConfigs['ENABLE_POWERSYNC'] === 'true' || globalConfigs['ENABLE_POWERSYNC'] === true) {
    flags.isPowerSyncEnabled = true;
  }

  if (globalConfigs['DISABLE_BACKGROUND_SYNC'] === 'true' || globalConfigs['DISABLE_BACKGROUND_SYNC'] === true) {
    flags.isBackgroundSyncEnabled = false;
  }

  // 5. User Specific Override (Flag Injection from Context)
  // This allows us to push a specific flag to a specific user via the flags map in UserContext
  if (context.flags) {
    const flagsToProcess = context.flags;
    Object.keys(flagsToProcess).forEach((key) => {
      if (key in flags) {
        (flags as any)[key] = flagsToProcess[key];
      }
    });
  }

  return flags;
};
