/** Provider-neutral product analytics contract. This is observation only. */
export const PRODUCT_ANALYTICS_EVENTS = [
  'app_started',
  'guest_started',
  'onboarding_started',
  'onboarding_completed',
  'signup_started',
  'account_converted',
  'school_bond_claimed',
  'feature_exposed',
  'feature_opened',
  'feature_action_completed',
  'feature_action_failed',
] as const;

export type ProductAnalyticsEventName = (typeof PRODUCT_ANALYTICS_EVENTS)[number];
export type ProductAnalyticsScalar = string | number | boolean | null | undefined;
export type ProductAnalyticsEntitlementScope =
  | 'individual'
  | 'active_bond'
  | 'active_entity'
  | 'add_on';

/** Only low-cardinality, product-safe dimensions belong in this context. */
export interface ProductAnalyticsContext {
  platform?: 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'unknown';
  identity_mode?: 'anonymous' | 'authenticated';
  citizenship?: 'THIRD_CLASS' | 'SECOND_CLASS' | 'FIRST_CLASS';
  onboarding_completed?: boolean;
  active_capacity?: string | null;
  active_entity_type?: string | null;
  school_type?: string | null;
  personal_pricing_tier?: 'FREE' | 'PRO' | 'INSTITUTIONAL' | null;
  effective_entitlement_scope?: ProductAnalyticsEntitlementScope | null;
  effective_entitlement_tier?: 'FREE' | 'PRO' | 'INSTITUTIONAL' | null;
  app_version?: string;
  analytics_schema_version: 1;
}

export interface ProductAnalyticsEvent {
  name: ProductAnalyticsEventName;
  properties?: ProductAnalyticsEventProperties[ProductAnalyticsEventName];
  context?: Partial<ProductAnalyticsContext>;
}

export interface ProductAnalyticsEventProperties {
  app_started: Record<string, never>;
  guest_started: Record<string, never>;
  onboarding_started: Record<string, never>;
  onboarding_completed: { duration_seconds?: number };
  signup_started: Record<string, never>;
  account_converted: { duration_seconds?: number };
  school_bond_claimed: { school_type?: string | null };
  feature_exposed: { feature_id: string; flag_value: ProductAnalyticsScalar };
  feature_opened: { feature_id: string };
  feature_action_completed: {
    feature_id: string;
    action: string;
    has_label?: boolean;
    view_date?: string;
    duration_seconds?: number;
  };
  feature_action_failed: { feature_id: string; action: string; error_code?: string };
}
