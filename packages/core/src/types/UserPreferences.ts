/**
 * One person's preferences: the `user_preferences` row (ZenStack `UserPreferences`).
 *
 * Profile used the notification half and Self the daily-rhythm half, each with its own copy of
 * this type; both describe the same row, so this is the union, typed as the row stores it.
 */
export interface NotificationPreferenceSettings {
  channels: {
    push: boolean;
    email: boolean;
    in_app: boolean;
  };
  categories: Record<string, { push: boolean; email: boolean }>;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface UserPreferences {
  id: string;
  user_id: string;
  /** The bond the person last chose to act in. */
  active_bond_id?: string | null;
  /** Feature ids shown on the home row. */
  favorite_features: string[];
  hidden_features: string[];
  /** HH:mm:ss; null until the person sets their rhythm. */
  morning_check_time?: string | null;
  afternoon_check_time?: string | null;
  evening_wind_down_time?: string | null;
  enable_contextual_prompts: boolean;
  enable_usage_tracking: boolean;
  notification_settings: NotificationPreferenceSettings | null;
  updated_at: string;
  created_at: string;
}
