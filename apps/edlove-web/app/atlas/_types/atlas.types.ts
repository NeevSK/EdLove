export interface SchoolItem {
  census_no: string;
  name: string;
  name_si?: string;
  name_ta?: string;
  type: string;
  category: string;
  medium?: string;
  grade_span?: string;
  total_students: number;
  difficulty_level: string | null;
  district_name: string;
  province_name: string;
}

export interface BudgetProfile {
  budget_id: string;
  school_census_no: string;
  school_name: string;
  school_type: string;
  school_category: string;
  fiscal_year: number;
  treasury_recurrent_lkr: number;
  treasury_capital_lkr: number;
  per_pupil_state_spend_lkr: number;
  sds_facility_fees_lkr: number;
  sds_donations_and_events_lkr: number;
  sds_alumni_endowments_lkr: number;
  sds_total_revenue_lkr: number;
  sds_to_treasury_ratio: number;
  notes: string;
}

export interface EdTechItem {
  solution_id: string;
  name: string;
  origin_country: string;
  scope: string;
  founding_year: number | null;
  target_audience: string;
  pedagogical_model: string;
  connectivity_requirement: string;
  hardware_class: string;
  pricing_model: string;
  founder_epistemology: string;
  design_fit_assessment: string | null;
  trajectory_status: string;
  evidence_tier: string | null;
  business_trajectory: string | null;
  intended_population: string | null;
  ideology_quote: string | null;
}

export interface SqaIndicator {
  indicator_id: string;
  dimension_no: number;
  indicator_no: number;
  title_en: string;
  title_si: string;
  dimension_title_en: string;
  dimension_title_si: string;
  performance_levels_json: string;
  historical_gaming_notes: string;
}

export interface ResearchMonograph {
  resource_id: string;
  title: string;
  summary: string;
  resource_type: string;
  content_format: string;
  canonical_url: string;
  publication_date: string;
}

export interface UgcProgram {
  program_code: string;
  name_en: string;
  stream_id: string;
  duration_years: number;
}

export interface UgcCutoff {
  cutoff_id: string;
  academic_year: string;
  program_code: string;
  program_name_en: string;
  district_id: string;
  district_name: string;
  min_z_score: number;
  merit_all_island_z_score: number;
  is_disadvantaged_district: number;
}

export interface TertiaryInstitution {
  inst_id: string;
  name_en: string;
  name_si?: string;
  name_ta?: string;
  inst_type: string;
  district_id?: string;
  province_id?: string;
  district_name?: string;
  province_name?: string;
  address_town?: string;
  latitude?: number;
  longitude?: number;
  coord_precision?: string;
  established_year?: number;
  governing_body?: string;
  statutory_decree?: string;
  website_url?: string;
  annual_student_enrollment?: number;
  campus_acreage?: number;
  faculties_count?: number;
  hostel_available?: number;
  hospital_attached?: number;
  research_centers_count?: number;
  notes?: string;
}

export interface CampusFacility {
  facility_id: string;
  inst_id: string;
  institution_name_en?: string;
  facility_type: string;
  name_en: string;
  name_si?: string;
  capacity_units?: number;
  features_json?: string;
  notes?: string;
}

export interface UniversityLeader {
  occupancy_id: string;
  valid_from: string;
  tenure_status: string;
  canonical_name: string;
  canonical_name_si?: string;
  honors_prefix?: string;
  qualifications_json?: string;
  biographical_notes?: string;
  role_title_en: string;
  entity_id: string;
  entity_name: string;
}

export interface TneDegreeFunnelItem {
  funnel_id: string;
  local_inst_id: string;
  foreign_partner_id: string;
  local_institution_name: string;
  local_town: string;
  foreign_partner_name: string;
  foreign_partner_country: string;
  global_rank_band: string;
  partner_portal: string;
  program_name: string;
  award_model: string;
  awarding_body_location: string;
  local_cost_lkr: number;
  foreign_cost_estimate_usd?: number;
  post_study_work_rights: string;
  recruitment_channel_type: string;
  visa_success_rate_band: string;
  strategic_advisory: string;
}

export interface HigherEdScholarshipItem {
  scholarship_id: string;
  title_en: string;
  title_si?: string;
  title_ta?: string;
  funding_tier: string;
  academic_level: string;
  awarding_entity: string;
  coverage_scope: string;
  approx_annual_value_lkr?: number;
  eligible_destinations?: string;
  eligibility_criteria: string;
  annual_quota_slots?: number;
  application_window?: string;
  official_portal_url?: string;
  selection_model?: string;
  strategic_advisory?: string;
}

export interface NvqLevel {
  nvq_level: number;
  level_name_en: string;
  level_name_si?: string;
  level_name_ta?: string;
  entry_requirement?: string;
  equivalent_academic_tier?: string;
  apex_awarding_bodies_json?: string;
  typical_career_tier?: string;
}

export interface TertiaryProgram {
  program_id: string;
  inst_id: string;
  institution_name_en?: string;
  title_en: string;
  title_si?: string;
  domain_cluster: string;
  qualification_type: string;
  nvq_level_equivalent?: number;
  duration_months: number;
  study_mode?: string;
  state_funded_or_tuition: string;
  approx_tuition_fee_lkr: number;
  entry_criteria?: string;
  industry_accreditation?: string;
}

export interface TransitionPathway {
  pathway_id: string;
  starting_cohort_status: string;
  academic_stream: string;
  recommended_pathway_tier: string;
  title_en: string;
  description_en: string;
  example_programs_json?: string;
  cost_profile: string;
  time_to_employment_months: number;
  strategic_advisory?: string;
}

export interface GovernmentBudget {
  budget_record_id: string;
  fiscal_year: number;
  budget_tier: string;
  entity_scope: string;
  entity_name_en: string;
  recurrent_budget_lkr: number;
  capital_budget_lkr: number;
  total_allocation_lkr: number;
  gdp_share_percent: number | null;
  welfare_transfers_json: string | null;
  primary_spending_heads_json: string | null;
  source_citation: string;
  notes: string;
}

export interface EducationCharity {
  entity_id: string;
  name_en: string;
  name_si?: string;
  name_ta?: string;
  entity_type: string;
  thematic_focus: string;
  operational_districts_json: string;
  annual_investment_est_lkr?: number;
  flagship_initiatives_json: string;
  headquarters_location?: string;
  official_portal?: string;
  strategic_advisory?: string;
}

export interface NationalCompetition {
  competition_id: string;
  canonical_name_en: string;
  canonical_name_si?: string;
  canonical_name_ta?: string;
  category: string;
  governing_body: string;
  inception_year?: number;
  annual_participants_est?: number;
  qualifying_hierarchy: string;
  flagship_trophy_or_award?: string;
  key_venues?: string;
  international_pathway?: string;
  traditions_and_cultural_significance?: string;
}

export interface CoCurricularMovement {
  movement_id: string;
  name_en: string;
  name_si?: string;
  name_ta?: string;
  movement_type: string;
  founding_year?: number;
  governing_body: string;
  highest_honor_award?: string;
  uniform_and_insignia?: string;
  core_pillars_json?: string;
  annual_student_cadre_est?: number;
  official_portal?: string;
  civic_role_notes?: string;
}

export interface DhammaSchoolNetwork {
  network_id: string;
  faith_tradition: string;
  name_en: string;
  name_si?: string;
  name_ta?: string;
  governing_state_department: string;
  operating_venues: string;
  estimated_school_units: number;
  estimated_student_enrollment: number;
  national_examination_framework?: string;
  volunteer_teaching_force_est?: number;
  sociological_role_notes?: string;
}

export interface ResourceDistributionProfile {
  profile_id: string;
  school_census_no: string;
  sports_infrastructure_tier: string;
  sports_offered_json: string;
  swimming_pool_available: number;
  cricket_turf_available: number;
  aesthetic_streams_available_json: string;
  aesthetic_teacher_status: string;
  al_science_capable: number;
  functional_computer_terminals: number;
  drinking_water_source: string;
  electricity_status: string;
  midday_meal_beneficiary: number;
  co_curricular_units_json?: string;
  notes?: string;
}

export interface SchoolResourceProfile extends ResourceDistributionProfile {
  school_name: string;
  school_name_si?: string;
  school_name_ta?: string;
  district: string;
  zone?: string;
  division?: string;
  school_type: string;
  student_count: number;
  teacher_count: number;
}

export interface MovementsSummary {
  total_movements: number;
  total_cadre: number;
  total_dhamma_networks: number;
  total_dhamma_units: number;
  total_dhamma_students: number;
  total_dhamma_teachers: number;
}

export interface DistributionStats {
  total_profiles: number;
  pools_count: number;
  turf_count: number;
  al_science_count: number;
  midday_meal_count: number;
  total_computers: number;
}
