export interface FeatureFlags {
  isInventoryEnabled: boolean;
  isAccountingEnabled: boolean;
  isAIAssistantEnabled: boolean;
  isGuardianWorkspaceEnabled: boolean;
  isDevelopingWorkspace: boolean;
  isDevelopingWorkforce: boolean;
  isDevelopingFormBuilder: boolean;
  isGraphicsEngineEnabled: boolean;
  isAnalyticsEnabled: boolean;
  isSocialShieldEnabled: boolean;
  isUnderMaintenance: boolean;
  isPowerSyncEnabled: boolean;
  isComposerPasteEnabled: boolean;
  isNitroFetchEnabled: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  isInventoryEnabled: false,
  isAccountingEnabled: false,
  isAIAssistantEnabled: false,
  isGuardianWorkspaceEnabled: false,
  isDevelopingWorkspace: false,
  isDevelopingWorkforce: false,
  isDevelopingFormBuilder: false,
  isGraphicsEngineEnabled: true,
  isAnalyticsEnabled: true,
  isSocialShieldEnabled: true,
  isUnderMaintenance: false,
  isPowerSyncEnabled: false,
  isComposerPasteEnabled: false,
  isNitroFetchEnabled: false,
};
