-- 20261010180000_institutional_erp_and_educational_economics.sql
-- Sovereign Institutional ERP, Nutrition Programs, Asset Ledgers & Educational Economics
-- Grounded in the Quiet Cultivation & Private Sanctuary Doctrine

-- 1. Chargeable Schedules (Default 0 LKR for public schools; configurable for private/tuition)
CREATE TABLE IF NOT EXISTS public.chargeable_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  classroom_id uuid REFERENCES public.classrooms(id) ON DELETE SET NULL,
  title text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  frequency text NOT NULL CHECK (frequency IN ('one_time', 'monthly', 'termly', 'annual')),
  applicable_grade integer CHECK (applicable_grade BETWEEN 1 AND 13),
  scope text NOT NULL CHECK (scope IN ('institutional_mandatory', 'classroom_specific', 'commercial_tuition', 'optional_extracurricular')),
  is_statutory_waiver_eligible boolean NOT NULL DEFAULT true,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Household Welfare Profiles (Aswesuma welfare tiers & verification)
CREATE TABLE IF NOT EXISTS public.household_welfare_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id text NOT NULL,
  aswesuma_tier text NOT NULL CHECK (aswesuma_tier IN ('transitional', 'vulnerable', 'poor', 'severely_poor', 'none')),
  annual_income_lkr numeric(12, 2) NOT NULL DEFAULT 0,
  digital_certificate_hash text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'under_review', 'expired', 'revoked')),
  expires_at timestamptz,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Household Wards (Deterministic birthdate ordering for sibling concessions)
CREATE TABLE IF NOT EXISTS public.household_wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id text NOT NULL,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  date_of_birth date NOT NULL,
  is_active_school_student boolean NOT NULL DEFAULT true,
  current_grade integer NOT NULL CHECK (current_grade BETWEEN 1 AND 13),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_household_student UNIQUE (household_id, student_id)
);

-- 4. Regulatory Notices (Ministry circulars, gazettes & statutory fee caps)
CREATE TABLE IF NOT EXISTS public.regulatory_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  gazette_number text,
  statutory_fee_cap_cents integer,
  rules_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Educational Fee Assessments (Student fee invoices, waivers & net payable)
CREATE TABLE IF NOT EXISTS public.educational_fee_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_id uuid NOT NULL REFERENCES public.chargeable_schedules(id) ON DELETE CASCADE,
  gross_amount_cents integer NOT NULL,
  waiver_amount_cents integer NOT NULL DEFAULT 0,
  net_payable_cents integer NOT NULL,
  exemption_reason text,
  status text NOT NULL DEFAULT 'assessed' CHECK (status IN ('assessed', 'invoiced', 'partially_paid', 'settled', 'waived')),
  assessment_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Institutional Events (Midday meal nutrition, excursions, sports meets)
CREATE TABLE IF NOT EXISTS public.institutional_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('nutrition_meal', 'excursion_trip', 'sports_meet', 'academic_competition', 'cultural_ceremony', 'parent_meeting')),
  scope_type text NOT NULL CHECK (scope_type IN ('classroom', 'grade_section', 'school', 'multi_institute')),
  scope_entity_id text,
  cadence text NOT NULL CHECK (cadence IN ('daily', 'weekly', 'monthly', 'termly', 'annual', 'ad_hoc')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'approved', 'active', 'completed', 'cancelled')),
  estimated_budget_cents integer NOT NULL DEFAULT 0,
  actual_cost_cents integer NOT NULL DEFAULT 0,
  funding_source text NOT NULL DEFAULT 'sds_fund' CHECK (funding_source IN ('ministry_grant', 'sds_fund', 'parent_contribution', 'mixed')),
  lead_organizer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Inventory Asset Items (Durable equipment vs consumable stock, Board of Survey)
CREATE TABLE IF NOT EXISTS public.inventory_asset_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('durable_equipment', 'consumable_stock')),
  unit_of_measure text NOT NULL CHECK (unit_of_measure IN ('units', 'kilograms', 'liters', 'meters', 'boxes')),
  current_quantity numeric(10, 2) NOT NULL DEFAULT 0,
  reorder_threshold numeric(10, 2) NOT NULL DEFAULT 0,
  unit_cost_cents integer NOT NULL DEFAULT 0,
  condition text NOT NULL DEFAULT 'serviceable' CHECK (condition IN ('serviceable', 'repairable', 'unserviceable_condemned', 'missing')),
  storage_location text NOT NULL,
  custodian_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_board_of_survey_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Inventory Stock Movements (Continuous FIFO/cost movements & consumption)
CREATE TABLE IF NOT EXISTS public.inventory_stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_item_id uuid NOT NULL REFERENCES public.inventory_asset_items(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('inflow_purchase', 'inflow_donation', 'outflow_consumption', 'outflow_event_dispatch', 'adjustment_loss', 'disposal_board_of_survey')),
  quantity numeric(10, 2) NOT NULL,
  unit_cost_cents integer NOT NULL DEFAULT 0,
  total_cost_cents integer NOT NULL DEFAULT 0,
  balance_after numeric(10, 2) NOT NULL,
  related_event_id uuid REFERENCES public.institutional_events(id) ON DELETE SET NULL,
  actor_id uuid NOT NULL REFERENCES auth.users(id),
  notes text,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- 9. Facility Reservations (Clash-detection scheduling)
CREATE TABLE IF NOT EXISTS public.facility_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  facility_id text NOT NULL,
  facility_name text NOT NULL,
  event_id uuid NOT NULL REFERENCES public.institutional_events(id) ON DELETE CASCADE,
  reserved_from timestamptz NOT NULL,
  reserved_to timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'clash_detected', 'cancelled')),
  reserved_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for sub-second queries
CREATE INDEX IF NOT EXISTS idx_chargeable_schedules_school ON public.chargeable_schedules(school_id);
CREATE INDEX IF NOT EXISTS idx_chargeable_schedules_scope ON public.chargeable_schedules(scope);
CREATE INDEX IF NOT EXISTS idx_household_welfare_household ON public.household_welfare_profiles(household_id);
CREATE INDEX IF NOT EXISTS idx_household_wards_student ON public.household_wards(student_id);
CREATE INDEX IF NOT EXISTS idx_household_wards_household ON public.household_wards(household_id);
CREATE INDEX IF NOT EXISTS idx_fee_assessments_student ON public.educational_fee_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_institutional_events_school ON public.institutional_events(school_id);
CREATE INDEX IF NOT EXISTS idx_institutional_events_dates ON public.institutional_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_school ON public.inventory_asset_items(school_id);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_cat ON public.inventory_asset_items(category);
CREATE INDEX IF NOT EXISTS idx_stock_movements_asset ON public.inventory_stock_movements(asset_item_id);
CREATE INDEX IF NOT EXISTS idx_facility_reservations_window ON public.facility_reservations(facility_id, reserved_from, reserved_to);

-- Attach Resonance Temporal History Triggers where resonance is active
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'resonance') THEN
    PERFORM resonance.enable_resonance('public', 'chargeable_schedules');
    PERFORM resonance.enable_resonance('public', 'household_welfare_profiles');
    PERFORM resonance.enable_resonance('public', 'household_wards');
    PERFORM resonance.enable_resonance('public', 'regulatory_notices');
    PERFORM resonance.enable_resonance('public', 'educational_fee_assessments');
    PERFORM resonance.enable_resonance('public', 'institutional_events');
    PERFORM resonance.enable_resonance('public', 'inventory_asset_items');
    PERFORM resonance.enable_resonance('public', 'inventory_stock_movements');
    PERFORM resonance.enable_resonance('public', 'facility_reservations');
  END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.chargeable_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_welfare_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_fee_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_asset_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Regulatory notices: readable by all authenticated users
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'regulatory_notices' AND policyname = 'Anyone can view regulatory notices') THEN
    CREATE POLICY "Anyone can view regulatory notices"
      ON public.regulatory_notices FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- School Staff & Principal policy helper pattern via bonds
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institutional_events' AND policyname = 'School members can view events') THEN
    CREATE POLICY "School members can view events"
      ON public.institutional_events FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.bonds b
          WHERE b.entity_id = institutional_events.school_id::text
            AND b.user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institutional_events' AND policyname = 'School admins can manage events') THEN
    CREATE POLICY "School admins can manage events"
      ON public.institutional_events FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.bonds b
          WHERE b.entity_id = institutional_events.school_id::text
            AND b.user_id = auth.uid()
            AND b.capacity IN ('principal', 'founder', 'admin', 'section_head', 'teacher')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.bonds b
          WHERE b.entity_id = institutional_events.school_id::text
            AND b.user_id = auth.uid()
            AND b.capacity IN ('principal', 'founder', 'admin', 'section_head', 'teacher')
        )
      );
  END IF;
END $$;

-- Inventory Items RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory_asset_items' AND policyname = 'School staff can view inventory assets') THEN
    CREATE POLICY "School staff can view inventory assets"
      ON public.inventory_asset_items FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.bonds b
          WHERE b.entity_id = inventory_asset_items.school_id::text
            AND b.user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory_asset_items' AND policyname = 'School admins can manage inventory assets') THEN
    CREATE POLICY "School admins can manage inventory assets"
      ON public.inventory_asset_items FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.bonds b
          WHERE b.entity_id = inventory_asset_items.school_id::text
            AND b.user_id = auth.uid()
            AND b.capacity IN ('principal', 'founder', 'admin', 'bursar')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.bonds b
          WHERE b.entity_id = inventory_asset_items.school_id::text
            AND b.user_id = auth.uid()
            AND b.capacity IN ('principal', 'founder', 'admin', 'bursar')
        )
      );
  END IF;
END $$;

-- Fee Assessments RLS: Student & Guardian can view their own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'educational_fee_assessments' AND policyname = 'Students and guardians can view their fee assessments') THEN
    CREATE POLICY "Students and guardians can view their fee assessments"
      ON public.educational_fee_assessments FOR SELECT
      TO authenticated
      USING (
        student_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.guardian_bonds gb
          WHERE gb.guardian_user_id = auth.uid()
            AND gb.ward_student_id = educational_fee_assessments.student_id
            AND gb.status = 'verified'
        )
      );
  END IF;
END $$;

-- RLS filters rows after a database role has table privileges. Keep the API
-- surface private by default, then grant only operations backed by a policy.
REVOKE ALL ON TABLE
  public.chargeable_schedules,
  public.household_welfare_profiles,
  public.household_wards,
  public.regulatory_notices,
  public.educational_fee_assessments,
  public.institutional_events,
  public.inventory_asset_items,
  public.inventory_stock_movements,
  public.facility_reservations
FROM anon, authenticated, service_role;

GRANT SELECT ON TABLE public.regulatory_notices TO authenticated;
GRANT SELECT ON TABLE public.educational_fee_assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.institutional_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.inventory_asset_items TO authenticated;
