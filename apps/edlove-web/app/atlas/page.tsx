'use client';

import {
  type DistrictSpatialSummary,
  GLOBAL_COMPARATIVE_SYSTEMS,
  type GlobalCountrySpatialSummary,
  SRI_LANKA_DISTRICTS,
  SRI_LANKA_PROVINCES,
} from '@repo/core/spatial';
import Link from 'next/link';
import React, { useEffect, useState, useTransition } from 'react';

interface SchoolItem {
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

interface BudgetProfile {
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

interface EdTechItem {
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

interface SqaIndicator {
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

interface ResearchMonograph {
  resource_id: string;
  title: string;
  summary: string;
  resource_type: string;
  content_format: string;
  canonical_url: string;
  publication_date: string;
}

interface UgcProgram {
  program_code: string;
  name_en: string;
  stream_id: string;
  duration_years: number;
}

interface UgcCutoff {
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

interface TertiaryInstitution {
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

interface CampusFacility {
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

interface UniversityLeader {
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

interface TneDegreeFunnelItem {
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

interface HigherEdScholarshipItem {
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

interface NvqLevel {
  nvq_level: number;
  level_name_en: string;
  level_name_si?: string;
  level_name_ta?: string;
  entry_requirement?: string;
  equivalent_academic_tier?: string;
  apex_awarding_bodies_json?: string;
  typical_career_tier?: string;
}

interface TertiaryProgram {
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

interface TransitionPathway {
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

interface GovernmentBudget {
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

interface EducationCharity {
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

interface NationalCompetition {
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

interface CoCurricularMovement {
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

interface DhammaSchoolNetwork {
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

interface MovementsSummary {
  total_movements: number;
  total_cadre: number;
  total_dhamma_networks: number;
  total_dhamma_units: number;
  total_dhamma_students: number;
  total_dhamma_teachers: number;
}

interface DistributionStats {
  total_profiles: number;
  pools_count: number;
  turf_count: number;
  al_science_count: number;
  midday_meal_count: number;
  total_computers: number;
}

function ExternalPortalLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="pt-1 flex justify-end">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-[#a85022] hover:underline font-semibold flex items-center gap-1"
      >
        <span>{label}</span>
        <span>↗</span>
      </a>
    </div>
  );
}

export default function EducationAtlasPage() {
  const [activeTab, setActiveTab] = useState<
    | 'mesh'
    | 'finance'
    | 'charities'
    | 'competitions'
    | 'edtech'
    | 'sqa'
    | 'research'
    | 'ugc'
    | 'tertiary'
    | 'movements'
    | 'compass'
    | 'spatial'
  >('mesh');
  const [compassStandpoint, setCompassStandpoint] = useState<
    'child' | 'parent' | 'teacher' | 'tutor' | 'bureaucrat'
  >('child');
  const [compassArchetype, setCompassArchetype] = useState<'urban' | 'rural'>('urban');

  // Spatial Multi-Scale Map States
  const [spatialScaleLens, setSpatialScaleLens] = useState<'global' | 'national' | 'zonal'>(
    'national',
  );
  const [selectedSpatialDistrict, setSelectedSpatialDistrict] = useState<string>('CO');
  const [spatialMetricView, setSpatialMetricView] = useState<'delta' | 'cari' | 'meal' | 'tuition'>(
    'delta',
  );
  const [spatialSchools, setSpatialSchools] = useState<any[]>([]);
  const [spatialLoading, setSpatialLoading] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Data states
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [schoolsCount, setSchoolsCount] = useState(0);
  const [budgets, setBudgets] = useState<BudgetProfile[]>([]);
  const [govBudgets, setGovBudgets] = useState<GovernmentBudget[]>([]);
  const [financeSubTab, setFinanceSubTab] = useState<'school_micro' | 'gov_macro'>('school_micro');
  const [govTierFilter, setGovTierFilter] = useState('all');

  // Charities & Foundations
  const [charitiesList, setCharitiesList] = useState<EducationCharity[]>([]);
  const [charityTypeFilter, setCharityTypeFilter] = useState('all');
  const [charityFocusFilter, setCharityFocusFilter] = useState('all');
  const [charitySearch, setCharitySearch] = useState('');

  // National Competitions & Aesthetics
  const [competitionsList, setCompetitionsList] = useState<NationalCompetition[]>([]);
  const [compCategoryFilter, setCompCategoryFilter] = useState('all');
  const [compSearch, setCompSearch] = useState('');

  const [edtechList, setEdtechList] = useState<EdTechItem[]>([]);
  const [sqaList, setSqaList] = useState<SqaIndicator[]>([]);
  const [researchList, setResearchList] = useState<ResearchMonograph[]>([]);
  const [ugcPrograms, setUgcPrograms] = useState<UgcProgram[]>([]);
  const [ugcCutoffs, setUgcCutoffs] = useState<UgcCutoff[]>([]);
  const [selectedUgcProgram, setSelectedUgcProgram] = useState('001M');
  const [simZScore, setSimZScore] = useState('1.5500');
  const [simDistrict, setSimDistrict] = useState('D_11');
  const [stats, setStats] = useState<{
    total_schools: number;
    total_resources: number;
    total_connections: number;
  } | null>(null);

  // Tertiary & Vocational states
  const [tertiaryInstitutions, setTertiaryInstitutions] = useState<TertiaryInstitution[]>([]);
  const [tertiaryPrograms, setTertiaryPrograms] = useState<TertiaryProgram[]>([]);
  const [nvqFramework, setNvqFramework] = useState<NvqLevel[]>([]);
  const [pathways, setPathways] = useState<TransitionPathway[]>([]);
  const [selectedInstType, setSelectedInstType] = useState('all');
  const [instSearch, setInstSearch] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('al_qualified_ugc_unadmitted');
  const [selectedStream, setSelectedStream] = useState('all');
  const [selectedNvqStep, setSelectedNvqStep] = useState<number | null>(null);

  // Tertiary sub-views: 'overview' | 'tne' | 'scholarships' | 'facilities'
  const [tertiarySubTab, setTertiarySubTab] = useState<
    'overview' | 'tne' | 'scholarships' | 'facilities'
  >('overview');
  const [tneFunnels, setTneFunnels] = useState<TneDegreeFunnelItem[]>([]);
  const [scholarships, setScholarships] = useState<HigherEdScholarshipItem[]>([]);
  const [facilities, setFacilities] = useState<CampusFacility[]>([]);
  const [leadership, setLeadership] = useState<UniversityLeader[]>([]);
  const [tneModelFilter, setTneModelFilter] = useState('all');
  const [tneCountryFilter, setTneCountryFilter] = useState('all');
  const [schLevelFilter, setSchLevelFilter] = useState('all');
  const [schTierFilter, setSchTierFilter] = useState('all');

  // Civic Movements, Daham Pasal & Disparities states
  const [movementsSubTab, setMovementsSubTab] = useState<
    'movements_overview' | 'dhamma_pasal' | 'resource_disparity'
  >('movements_overview');
  const [movementsList, setMovementsList] = useState<CoCurricularMovement[]>([]);
  const [dhammaList, setDhammaList] = useState<DhammaSchoolNetwork[]>([]);
  const [movementsSummary, setMovementsSummary] = useState<MovementsSummary | null>(null);
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');
  const [dhammaFaithFilter, setDhammaFaithFilter] = useState('all');
  const [movementsSearch, setMovementsSearch] = useState('');

  const [resourceProfiles, setResourceProfiles] = useState<SchoolResourceProfile[]>([]);
  const [distributionStats, setDistributionStats] = useState<DistributionStats | null>(null);
  const [sportsTierFilter, setSportsTierFilter] = useState('all');
  const [waterSourceFilter, setWaterSourceFilter] = useState('all');
  const [scienceCapableFilter, setScienceCapableFilter] = useState('all');
  const [poolFilter, setPoolFilter] = useState('all');
  const [aestheticStatusFilter, setAestheticStatusFilter] = useState('all');
  const [disparitySearch, setDisparitySearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Load initial stats & defaults
  useEffect(() => {
    fetch('/api/atlas?mode=stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.totals) setStats(d.totals);
      })
      .catch((err) => console.error('Failed to load stats', err));

    fetch('/api/atlas?mode=finance')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.budgets) setBudgets(d.budgets);
          if (d.government_budgets) setGovBudgets(d.government_budgets);
        }
      })
      .catch((err) => console.error('Failed to load finance', err));

    fetch('/api/atlas?mode=charities')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.charities) setCharitiesList(d.charities);
      })
      .catch((err) => console.error('Failed to load charities', err));

    fetch('/api/atlas?mode=competitions')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.competitions) setCompetitionsList(d.competitions);
      })
      .catch((err) => console.error('Failed to load competitions', err));

    fetch('/api/atlas?mode=edtech')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.solutions) setEdtechList(d.solutions);
      })
      .catch((err) => console.error('Failed to load edtech', err));

    fetch('/api/atlas?mode=sqa')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.indicators) setSqaList(d.indicators);
      })
      .catch((err) => console.error('Failed to load sqa', err));

    fetch('/api/atlas?mode=research')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.monographs) setResearchList(d.monographs);
      })
      .catch((err) => console.error('Failed to load research', err));

    fetch('/api/atlas?mode=ugc')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.programs) setUgcPrograms(d.programs);
          if (d.cutoffs) setUgcCutoffs(d.cutoffs);
        }
      })
      .catch((err) => console.error('Failed to load ugc', err));

    fetch('/api/atlas?mode=tertiary')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.institutions) setTertiaryInstitutions(d.institutions);
          if (d.programs) setTertiaryPrograms(d.programs);
          if (d.nvq_levels) setNvqFramework(d.nvq_levels);
          if (d.facilities) setFacilities(d.facilities);
          if (d.leadership) setLeadership(d.leadership);
        }
      })
      .catch((err) => console.error('Failed to load tertiary', err));

    fetch('/api/atlas?mode=pathways')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.pathways) setPathways(d.pathways);
      })
      .catch((err) => console.error('Failed to load pathways', err));

    fetch('/api/atlas?mode=tne')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.funnels) setTneFunnels(d.funnels);
      })
      .catch((err) => console.error('Failed to load tne', err));

    fetch('/api/atlas?mode=scholarships')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.scholarships) setScholarships(d.scholarships);
      })
      .catch((err) => console.error('Failed to load scholarships', err));

    fetch('/api/atlas?mode=movements')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.movements) setMovementsList(d.movements);
          if (d.dhamma_networks) setDhammaList(d.dhamma_networks);
          if (d.summary) setMovementsSummary(d.summary);
        }
      })
      .catch((err) => console.error('Failed to load movements', err));

    fetch('/api/atlas?mode=distribution')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          if (d.profiles) setResourceProfiles(d.profiles);
          if (d.stats) setDistributionStats(d.stats);
        }
      })
      .catch((err) => console.error('Failed to load distribution', err));
  }, []);

  // Fetch filtered schools
  useEffect(() => {
    const params = new URLSearchParams({ mode: 'schools', limit: '30' });
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedType) params.set('type', selectedType);
    if (selectedDistrict) params.set('district', selectedDistrict);

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/atlas?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            startTransition(() => {
              setSchools(d.schools || []);
              setSchoolsCount(d.count || 0);
            });
          }
        })
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedType, selectedDistrict]);

  // Fetch spatial schools for selected district
  useEffect(() => {
    if (activeTab === 'spatial' && selectedSpatialDistrict) {
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) setSpatialLoading(true);
      });
      fetch(`/api/atlas?mode=spatial&district=${selectedSpatialDistrict}&limit=60`)
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled && d.success && d.schools) {
            setSpatialSchools(d.schools);
          }
        })
        .catch((err) => console.error('Failed to load spatial schools', err))
        .finally(() => {
          if (!cancelled) setSpatialLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }
  }, [activeTab, selectedSpatialDistrict]);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1c24] font-sans">
      {/* Header / Hero */}
      <header className="border-b border-[#e5dec9] bg-[#fffefb] py-8 px-6 sm:px-12 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                IntuituiLabs • Sovereign Civic Infrastructure
              </span>
              <span className="text-xs text-[#824112] font-mono">Urumaya Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a1714] tracking-tight">
              Sri Lanka Education Atlas & Civic Intelligence
            </h1>
            <p className="text-sm sm:text-base text-[#615951] mt-1 max-w-3xl">
              A ground-truthed spatial registry, multi-year census drift monitor, and institutional
              finance ledger tracking 10,000+ public schools beyond aggregate statistical illusions.
            </p>
          </div>

          {/* Quick Metrics Badge strip */}
          <div className="flex flex-wrap md:flex-nowrap gap-3 text-center">
            <div className="bg-[#f5eee1] border border-[#e8dbca] px-4 py-2.5 rounded-xl">
              <div className="text-xl font-bold font-mono text-[#a85022]">
                {stats?.total_schools?.toLocaleString() || '9,962'}
              </div>
              <div className="text-xs text-[#73685e]">Schools Cataloged</div>
            </div>
            <div className="bg-[#f5eee1] border border-[#e8dbca] px-4 py-2.5 rounded-xl">
              <div className="text-xl font-bold font-mono text-[#246342]">100%</div>
              <div className="text-xs text-[#73685e]">Postal Centroids</div>
            </div>
            <div className="bg-[#f5eee1] border border-[#e8dbca] px-4 py-2.5 rounded-xl">
              <div className="text-xl font-bold font-mono text-[#1a3e6a]">38</div>
              <div className="text-xs text-[#73685e]">EdTech Audited</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav
        aria-label="Atlas Views"
        className="bg-[#fffefb] border-b border-[#e5dec9] sticky top-0 z-20 px-6 sm:px-12 backdrop-blur-md bg-opacity-95"
      >
        <div className="max-w-7xl mx-auto flex gap-2 sm:gap-6 overflow-x-auto py-3 no-scrollbar text-sm font-medium">
          <button
            onClick={() => setActiveTab('mesh')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'mesh'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>🏫</span> School Mesh & Directory
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'finance'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>💰</span> Public Finance & SDS Treasury
          </button>
          <button
            onClick={() => setActiveTab('charities')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'charities'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>🤝</span> Charities, NGOs & Foundations
          </button>
          <button
            onClick={() => setActiveTab('competitions')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'competitions'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>🏆</span> Competitions, Derbies & Aesthetics
          </button>
          <button
            onClick={() => setActiveTab('edtech')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'edtech'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>📱</span> EdTech & Pedagogy Catalog
          </button>
          <button
            onClick={() => setActiveTab('sqa')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sqa'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>⚖️</span> SQA 52-Indicator Matrix
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'research'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>📚</span> Research Monographs
          </button>
          <button
            onClick={() => setActiveTab('ugc')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ugc'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>🎓</span> UGC University Z-Scores
          </button>
          <button
            onClick={() => setActiveTab('tertiary')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tertiary'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>🏛️</span> Higher Ed & Vocational Mesh
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'movements'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>🏕️</span> Movements, Daham Pasal &amp; Disparities
          </button>
          <button
            onClick={() => setActiveTab('compass')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'compass'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>🧭</span> Systemantics &amp; Relational Compass
          </button>
          <button
            onClick={() => setActiveTab('spatial')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'spatial'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:bg-[#f5eee1] hover:text-[#1a1714]'
            }`}
          >
            <span>🗺️</span> Spatial Cartography
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-8">
        {/* ================= TAB 1: SCHOOL MESH & DIRECTORY ================= */}
        {activeTab === 'mesh' && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-[#fffefb] border border-[#e5dec9] p-5 rounded-2xl shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="school-search-input"
                    className="block text-xs font-semibold text-[#73685e] uppercase tracking-wider mb-1"
                  >
                    Search Schools (Name, Town, or Census No)
                  </label>
                  <input
                    id="school-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Royal College, Laxapana, Ananda, 0117001..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#d6cbba] bg-[#faf8f5] focus:outline-hidden focus:ring-2 focus:ring-[#a85022] text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category-select"
                    className="block text-xs font-semibold text-[#73685e] uppercase tracking-wider mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#d6cbba] bg-[#faf8f5] focus:outline-hidden focus:ring-2 focus:ring-[#a85022] text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="National">National Schools (373)</option>
                    <option value="Provincial">Provincial Schools (9,782)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="type-select"
                    className="block text-xs font-semibold text-[#73685e] uppercase tracking-wider mb-1"
                  >
                    School Type
                  </label>
                  <select
                    id="type-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#d6cbba] bg-[#faf8f5] focus:outline-hidden focus:ring-2 focus:ring-[#a85022] text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="1AB">Type 1AB (A/L Science)</option>
                    <option value="1C">Type 1C (A/L Arts/Comm)</option>
                    <option value="Type 2">Type 2 (Up to O/L)</option>
                    <option value="Type 3">Type 3 (Primary Grade 1-5)</option>
                  </select>
                </div>
              </div>

              {/* Status Note */}
              <div className="mt-4 pt-4 border-t border-[#f0e7d8] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#73685e] gap-2">
                <div>
                  Showing <span className="font-semibold text-[#1a1714]">{schools.length}</span>{' '}
                  results {schoolsCount > 0 ? `(matched ${schoolsCount})` : ''}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e8a342]"></span> Tentative
                    Centroid (Survey/Postal)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#246342]"></span> Ground-Truthed
                    GPS Ping
                  </span>
                </div>
              </div>
            </div>

            {/* School Cards Grid */}
            {loading ? (
              <div className="text-center py-16 text-[#73685e]">
                <div className="inline-block animate-spin w-6 h-6 border-2 border-[#a85022] border-t-transparent rounded-full mb-3"></div>
                <div>Querying spatial index...</div>
              </div>
            ) : schools.length === 0 ? (
              <div className="text-center py-16 bg-[#fffefb] border border-[#e5dec9] rounded-2xl p-8">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-[#1a1714]">No schools found</h3>
                <p className="text-sm text-[#73685e] mt-1">
                  Try refining your search keyword or clearing the filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schools.map((s) => (
                  <Link
                    key={s.census_no}
                    href={`/atlas/school/${s.census_no}`}
                    className="group bg-[#fffefb] border border-[#e5dec9] hover:border-[#a85022] p-5 rounded-2xl transition-all hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs text-[#824112] bg-[#fbf0e8] px-2 py-0.5 rounded-md font-semibold">
                          {s.census_no}
                        </span>
                        <div className="flex gap-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              s.category === 'National'
                                ? 'bg-[#eaf1fb] text-[#1a3e6a] border border-[#cdddf2]'
                                : 'bg-[#f4efe6] text-[#615951] border border-[#e2d8c7]'
                            }`}
                          >
                            {s.category}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#fdf5ea] text-[#915809] border border-[#f5e3c2]">
                            {s.type}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#1a1714] group-hover:text-[#a85022] transition-colors line-clamp-1">
                        {s.name}
                      </h3>

                      {(s.name_si || s.name_ta) && (
                        <p className="text-xs text-[#73685e] mt-0.5 font-sans line-clamp-1">
                          {s.name_si || s.name_ta}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-2 text-xs text-[#73685e]">
                        <span>📍 {s.district_name || 'District'}</span>
                        <span>•</span>
                        <span>{s.province_name || 'Province'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f0e7d8] flex items-center justify-between text-xs">
                      <div className="font-mono">
                        <span className="font-bold text-[#1a1714]">
                          {s.total_students?.toLocaleString() || 0}
                        </span>{' '}
                        students
                      </div>
                      <div className="flex items-center gap-1.5 text-[#a85022] font-medium group-hover:translate-x-1 transition-transform">
                        <span>View Dossier</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: PUBLIC FINANCE & SDS TREASURY ================= */}
        {activeTab === 'finance' && (
          <div className="space-y-8">
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f0e7d8] pb-6">
                <div className="max-w-2xl">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                    National & School Public Finance
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
                    Fiscal Ledger: Central Treasury, 9 Provincial Councils & SDS Inversion
                  </h2>
                  <p className="text-sm text-[#615951] mt-1">
                    Exposing the two-tier structure of Sri Lankan education spending: Central
                    Treasury &amp; Provincial devolved budgets vs. the private School Development
                    Society (SDS) shadow economy.
                  </p>
                </div>

                {/* Sub-view toggle */}
                <div className="flex items-center gap-2 bg-[#f5eee1] p-1.5 rounded-xl border border-[#e8dbca] self-start md:self-auto">
                  <button
                    onClick={() => setFinanceSubTab('school_micro')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      financeSubTab === 'school_micro'
                        ? 'bg-[#1a1714] text-white shadow-xs'
                        : 'text-[#615951] hover:text-[#1a1714]'
                    }`}
                  >
                    🏫 School Micro-Finance ({budgets.length})
                  </button>
                  <button
                    onClick={() => setFinanceSubTab('gov_macro')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      financeSubTab === 'gov_macro'
                        ? 'bg-[#1a1714] text-white shadow-xs'
                        : 'text-[#615951] hover:text-[#1a1714]'
                    }`}
                  >
                    🏛️ Government Budgets ({govBudgets.length})
                  </button>
                </div>
              </div>

              {/* VIEW 1: SCHOOL MICRO-FINANCE (SDS VS TREASURY) */}
              {financeSubTab === 'school_micro' && (
                <div className="mt-6 space-y-6">
                  <div className="bg-[#faf8f5] border border-[#e8dbca] p-4 rounded-xl text-xs text-[#615951] leading-relaxed">
                    💡 <strong>The School Inversion Multiplier:</strong> In elite national schools
                    (Royal, Visakha, Central College Jaffna), parental donations and alumni
                    endowments raise <strong>5x to 7x more</strong> non-salary capital than the
                    government allocates. In rural agrarian and plantation estate schools (Type 2
                    and Type 3), SDS collections are virtually zero, leaving schools unable to
                    afford electricity or question paper photocopying.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((b) => (
                      <div
                        key={b.budget_id}
                        className="bg-[#faf8f5] border border-[#e8dbca] p-6 rounded-2xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-mono font-bold text-[#824112]">
                              {b.school_census_no}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#eaf1fb] text-[#1a3e6a]">
                              {b.school_category} • {b.school_type}
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-lg text-[#1a1714]">
                            {b.school_name}
                          </h3>
                          <p className="text-xs text-[#73685e] mt-1">{b.notes}</p>

                          <div className="mt-6 space-y-2.5 font-mono text-xs">
                            <div className="flex justify-between py-1 border-b border-[#ebdccb]">
                              <span className="text-[#73685e]">State Recurrent (Salaries):</span>
                              <span className="font-bold">
                                Rs. {(b.treasury_recurrent_lkr / 1e6).toFixed(1)}M
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#ebdccb]">
                              <span className="text-[#73685e]">State Capital Allocation:</span>
                              <span className="font-bold">
                                Rs. {(b.treasury_capital_lkr / 1e6).toFixed(2)}M
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#ebdccb]">
                              <span className="text-[#73685e]">SDS Facility Fees:</span>
                              <span className="font-bold">
                                Rs. {(b.sds_facility_fees_lkr / 1e6).toFixed(2)}M
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-[#ebdccb]">
                              <span className="text-[#73685e]">SDS Alumni &amp; Endowments:</span>
                              <span className="font-bold">
                                Rs.{' '}
                                {(
                                  (b.sds_donations_and_events_lkr + b.sds_alumni_endowments_lkr) /
                                  1e6
                                ).toFixed(1)}
                                M
                              </span>
                            </div>
                            <div className="flex justify-between py-1.5 bg-[#f3e8d9] px-2 rounded-lg text-sm">
                              <span className="font-sans font-semibold text-[#1a1714]">
                                Total SDS Revenue:
                              </span>
                              <span className="font-bold text-[#a85022]">
                                Rs. {(b.sds_total_revenue_lkr / 1e6).toFixed(2)}M
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#ebdccb]">
                          <div className="text-xs text-[#73685e] mb-1">
                            Financial Inversion Multiplier:
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-mono text-[#a85022]">
                              {b.sds_to_treasury_ratio}x
                            </span>
                            <span className="text-xs text-[#73685e]">
                              {b.sds_to_treasury_ratio > 1.0
                                ? 'SDS exceeds state capital!'
                                : 'Deficit / Dependent'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 2: GOVERNMENT MACRO BUDGETS */}
              {financeSubTab === 'gov_macro' && (
                <div className="mt-6 space-y-6">
                  {/* Macro Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#faf8f5] border border-[#e8dbca] p-4 rounded-xl">
                      <div className="text-xs text-[#73685e]">Central Ministry (General Ed)</div>
                      <div className="text-xl font-bold font-mono text-[#a85022] mt-1">
                        Rs. 237.0B
                      </div>
                      <div className="text-[11px] text-[#615951] mt-0.5">
                        Recurrent: Rs. 205B | Capital: Rs. 32B
                      </div>
                    </div>
                    <div className="bg-[#faf8f5] border border-[#e8dbca] p-4 rounded-xl">
                      <div className="text-xs text-[#73685e]">Higher Education (UGC & Unis)</div>
                      <div className="text-xl font-bold font-mono text-[#1a3e6a] mt-1">
                        Rs. 112.7B
                      </div>
                      <div className="text-[11px] text-[#615951] mt-0.5">
                        17 State Unis & 19 SLIATE ATIs
                      </div>
                    </div>
                    <div className="bg-[#faf8f5] border border-[#e8dbca] p-4 rounded-xl">
                      <div className="text-xs text-[#73685e]">
                        Provincial Devolved (9 Provinces)
                      </div>
                      <div className="text-xl font-bold font-mono text-[#246342] mt-1">
                        ~Rs. 370.0B
                      </div>
                      <div className="text-[11px] text-[#615951] mt-0.5">
                        &gt;88% allocated to teacher payroll
                      </div>
                    </div>
                    <div className="bg-[#faf8f5] border border-[#e8dbca] p-4 rounded-xl">
                      <div className="text-xs text-[#73685e]">National School Midday Meals</div>
                      <div className="text-xl font-bold font-mono text-[#824112] mt-1">
                        Rs. 16.5B
                      </div>
                      <div className="text-[11px] text-[#615951] mt-0.5">
                        1.6M Primary Students across 9,134 schools
                      </div>
                    </div>
                  </div>

                  {/* Filter pills */}
                  <div className="flex gap-2 border-b border-[#f0e7d8] pb-3">
                    <button
                      onClick={() => setGovTierFilter('all')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        govTierFilter === 'all'
                          ? 'bg-[#1a1714] text-white'
                          : 'bg-[#f5eee1] text-[#615951]'
                      }`}
                    >
                      All Budgets ({govBudgets.length})
                    </button>
                    <button
                      onClick={() => setGovTierFilter('central_treasury_line_ministry')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        govTierFilter === 'central_treasury_line_ministry'
                          ? 'bg-[#1a1714] text-white'
                          : 'bg-[#f5eee1] text-[#615951]'
                      }`}
                    >
                      Central Line Ministries
                    </button>
                    <button
                      onClick={() => setGovTierFilter('provincial_council_devolved')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        govTierFilter === 'provincial_council_devolved'
                          ? 'bg-[#1a1714] text-white'
                          : 'bg-[#f5eee1] text-[#615951]'
                      }`}
                    >
                      9 Provincial Councils
                    </button>
                  </div>

                  {/* Government Budgets Table / Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {govBudgets
                      .filter((b) => govTierFilter === 'all' || b.budget_tier === govTierFilter)
                      .map((b) => {
                        const welfare = b.welfare_transfers_json
                          ? JSON.parse(b.welfare_transfers_json)
                          : null;
                        const heads = b.primary_spending_heads_json
                          ? JSON.parse(b.primary_spending_heads_json)
                          : [];
                        return (
                          <div
                            key={b.budget_record_id}
                            className="bg-[#faf8f5] border border-[#e8dbca] p-5 rounded-2xl flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f3e8d9] text-[#824112]">
                                  FY {b.fiscal_year} • {b.budget_tier.replace(/_/g, ' ')}
                                </span>
                                {b.gdp_share_percent && (
                                  <span className="text-xs font-mono font-bold text-[#246342]">
                                    {b.gdp_share_percent}% GDP
                                  </span>
                                )}
                              </div>

                              <h3 className="font-serif font-bold text-base text-[#1a1714]">
                                {b.entity_name_en}
                              </h3>
                              <p className="text-xs text-[#73685e] mt-1">{b.notes}</p>

                              <div className="mt-4 p-3 bg-white border border-[#ebdccb] rounded-xl space-y-1.5 font-mono text-xs">
                                <div className="flex justify-between">
                                  <span className="text-[#73685e]">Recurrent Spend:</span>
                                  <span className="font-bold">
                                    Rs. {(b.recurrent_budget_lkr / 1e9).toFixed(2)} Billion
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#73685e]">Capital Spend:</span>
                                  <span className="font-bold">
                                    Rs. {(b.capital_budget_lkr / 1e9).toFixed(2)} Billion
                                  </span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-[#ebdccb] text-[#a85022] font-bold">
                                  <span>Total Allocation:</span>
                                  <span>
                                    Rs. {(b.total_allocation_lkr / 1e9).toFixed(2)} Billion
                                  </span>
                                </div>
                              </div>

                              {welfare && (
                                <div className="mt-3">
                                  <div className="text-[11px] font-bold text-[#824112] mb-1">
                                    Key Welfare Transfers:
                                  </div>
                                  <div className="flex flex-wrap gap-1 text-[10px]">
                                    {Object.entries(welfare).map(([k, v]) => (
                                      <span
                                        key={k}
                                        className="bg-[#fffefb] border border-[#ebdccb] px-2 py-0.5 rounded text-[#423c35]"
                                      >
                                        {k.replace(/_lkr/g, '').replace(/_/g, ' ')}: Rs.{' '}
                                        {((v as number) / 1e6).toFixed(0)}M
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {heads.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-[11px] font-bold text-[#73685e] mb-1">
                                    Primary Expenditure Heads:
                                  </div>
                                  <ul className="list-disc list-inside text-[11px] text-[#615951] space-y-0.5">
                                    {heads.map((h: string) => (
                                      <li key={h}>{h}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#ebdccb] text-[10px] text-[#8e857b] font-mono">
                              Source: {b.source_citation}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: CHARITIES, NGOS & FOUNDATIONS ================= */}
        {activeTab === 'charities' && (
          <div className="space-y-6">
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                    Civic Solidarity &amp; Development Partners
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
                    Educational Charities, Foundations &amp; Development Partners (
                    {charitiesList.length})
                  </h2>
                  <p className="text-sm text-[#615951] mt-1">
                    Audited directory of international multilaterals, civil society foundations,
                    corporate CSR trusts, and development bank projects funding public education
                    across Sri Lanka.
                  </p>
                </div>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search charity or initiative..."
                  value={charitySearch}
                  onChange={(e) => setCharitySearch(e.target.value)}
                  className="px-4 py-2 bg-[#faf8f5] border border-[#e5dec9] rounded-xl text-xs w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-[#a85022]"
                />
              </div>

              {/* Filter Pills */}
              <div className="mt-6 flex flex-wrap gap-2 border-t border-[#f0e7d8] pt-4">
                <button
                  onClick={() => setCharityTypeFilter('all')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    charityTypeFilter === 'all'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  All Types ({charitiesList.length})
                </button>
                <button
                  onClick={() => setCharityTypeFilter('international_multilateral')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    charityTypeFilter === 'international_multilateral'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  Multilaterals (UNICEF)
                </button>
                <button
                  onClick={() => setCharityTypeFilter('international_ngo')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    charityTypeFilter === 'international_ngo'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  International NGOs (Room to Read, Save the Children)
                </button>
                <button
                  onClick={() => setCharityTypeFilter('local_charity_foundation')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    charityTypeFilter === 'local_charity_foundation'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  Local Foundations (FoG, Sarvodaya, Berendina)
                </button>
                <button
                  onClick={() => setCharityTypeFilter('corporate_csr_foundation')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    charityTypeFilter === 'corporate_csr_foundation'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  Corporate CSR (Dialog, ComBank, JKH, Hemas)
                </button>
                <button
                  onClick={() => setCharityTypeFilter('development_bank_program')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    charityTypeFilter === 'development_bank_program'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  Development Banks (World Bank, ADB)
                </button>
              </div>
            </div>

            {/* Charities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {charitiesList
                .filter((c) => charityTypeFilter === 'all' || c.entity_type === charityTypeFilter)
                .filter((c) => {
                  if (!charitySearch.trim()) return true;
                  const q = charitySearch.toLowerCase();
                  return (
                    c.name_en.toLowerCase().includes(q) ||
                    c.thematic_focus.toLowerCase().includes(q) ||
                    c.flagship_initiatives_json.toLowerCase().includes(q)
                  );
                })
                .map((c) => {
                  const initiatives = JSON.parse(c.flagship_initiatives_json || '[]');
                  const districts = JSON.parse(c.operational_districts_json || '[]');
                  return (
                    <div
                      key={c.entity_id}
                      className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#fbf0e8] text-[#a85022]">
                            {c.entity_type.replace(/_/g, ' ')}
                          </span>
                          {c.annual_investment_est_lkr && (
                            <span className="text-xs font-mono font-bold text-[#246342]">
                              ~Rs. {(c.annual_investment_est_lkr / 1e6).toFixed(0)}M / yr
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif font-bold text-lg text-[#1a1714]">{c.name_en}</h3>
                        {c.name_si && (
                          <div className="text-xs text-[#73685e] mt-0.5">{c.name_si}</div>
                        )}

                        <div className="mt-3 flex items-center gap-2 text-xs text-[#824112]">
                          <span>🎯 Focus:</span>
                          <span className="font-semibold">
                            {c.thematic_focus.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="text-xs font-bold text-[#1a1714] mb-1.5">
                            Flagship Initiatives:
                          </div>
                          <ul className="list-disc list-inside text-xs text-[#615951] space-y-1">
                            {initiatives.map((init: string) => (
                              <li key={init}>{init}</li>
                            ))}
                          </ul>
                        </div>

                        {c.strategic_advisory && (
                          <div className="mt-4 p-3 bg-[#faf8f5] border border-[#ebdccb] rounded-xl text-xs text-[#615951] leading-relaxed">
                            💡 {c.strategic_advisory}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#f0e7d8] flex items-center justify-between text-xs">
                        <div className="text-[#73685e] flex items-center gap-1">
                          <span>📍</span>
                          <span>
                            {districts.includes('all_island')
                              ? 'All-Island Coverage'
                              : `${districts.length} Districts`}
                          </span>
                        </div>
                        {c.official_portal && (
                          <a
                            href={c.official_portal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#a85022] hover:underline flex items-center gap-1"
                          >
                            <span>Official Portal</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ================= TAB: COMPETITIONS, DERBIES & AESTHETICS ================= */}
        {activeTab === 'competitions' && (
          <div className="space-y-6">
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                    Athletic, Aesthetic &amp; Intellectual Excellence
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
                    National Competitions, Derbies, Aesthetics &amp; STEM Olympiads (
                    {competitionsList.length})
                  </h2>
                  <p className="text-sm text-[#615951] mt-1">
                    The living traditions of Sri Lankan student achievement: All-Island athletic
                    meets, centuries-old cricket derbies, Shakespeare drama, classical
                    Kandyan/Bharatanatyam dance, and International Olympiad qualifiers.
                  </p>
                </div>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search competition, trophy or sport..."
                  value={compSearch}
                  onChange={(e) => setCompSearch(e.target.value)}
                  className="px-4 py-2 bg-[#faf8f5] border border-[#e5dec9] rounded-xl text-xs w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-[#a85022]"
                />
              </div>

              {/* Category Pills */}
              <div className="mt-6 flex flex-wrap gap-2 border-t border-[#f0e7d8] pt-4">
                <button
                  onClick={() => setCompCategoryFilter('all')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    compCategoryFilter === 'all'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  All Competitions ({competitionsList.length})
                </button>
                <button
                  onClick={() => setCompCategoryFilter('sports_athletics')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    compCategoryFilter === 'sports_athletics'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  🏃 Athletics, Rugby &amp; Cricket
                </button>
                <button
                  onClick={() => setCompCategoryFilter('sports_derby_encounter')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    compCategoryFilter === 'sports_derby_encounter'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  🏏 Historic Big Matches &amp; Derbies
                </button>
                <button
                  onClick={() => setCompCategoryFilter('aesthetic_drama_theatre')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    compCategoryFilter === 'aesthetic_drama_theatre'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  🎭 Shakespeare &amp; National Drama
                </button>
                <button
                  onClick={() => setCompCategoryFilter('aesthetic_music_choral')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    compCategoryFilter === 'aesthetic_music_choral'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  🎵 Classical Eastern &amp; Choral Music
                </button>
                <button
                  onClick={() => setCompCategoryFilter('aesthetic_dance_ballet')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    compCategoryFilter === 'aesthetic_dance_ballet'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  💃 Traditional Dance &amp; Drumming
                </button>
                <button
                  onClick={() => setCompCategoryFilter('academic_olympiad_stem')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    compCategoryFilter === 'academic_olympiad_stem'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  🔬 Mathematics, Physics, Bio &amp; Chem Olympiads
                </button>
                <button
                  onClick={() => setCompCategoryFilter('cadet_and_uniformed_corps')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    compCategoryFilter === 'cadet_and_uniformed_corps'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  🎖️ NCC Cadet Corps (Herman Loos)
                </button>
                <button
                  onClick={() => setCompCategoryFilter('literary_oratory_debating')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    compCategoryFilter === 'literary_oratory_debating'
                      ? 'bg-[#1a1714] text-white'
                      : 'bg-[#f5eee1] text-[#615951]'
                  }`}
                >
                  🗣️ Parliamentary Debating &amp; Oratory
                </button>
              </div>
            </div>

            {/* Competitions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitionsList
                .filter((c) => compCategoryFilter === 'all' || c.category === compCategoryFilter)
                .filter((c) => {
                  if (!compSearch.trim()) return true;
                  const q = compSearch.toLowerCase();
                  return (
                    c.canonical_name_en.toLowerCase().includes(q) ||
                    c.governing_body.toLowerCase().includes(q) ||
                    (c.flagship_trophy_or_award &&
                      c.flagship_trophy_or_award.toLowerCase().includes(q))
                  );
                })
                .map((c) => (
                  <div
                    key={c.competition_id}
                    className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f3e8d9] text-[#824112]">
                          {c.category.replace(/_/g, ' ')}
                        </span>
                        {c.inception_year && (
                          <span className="text-xs font-mono font-bold text-[#73685e]">
                            Est. {c.inception_year}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-lg text-[#1a1714]">
                        {c.canonical_name_en}
                      </h3>
                      {c.canonical_name_si && (
                        <div className="text-xs text-[#73685e] mt-0.5">{c.canonical_name_si}</div>
                      )}

                      <div className="mt-3 text-xs text-[#615951]">
                        <span className="font-semibold text-[#1a1714]">Governing Body:</span>{' '}
                        {c.governing_body}
                      </div>

                      {c.flagship_trophy_or_award && (
                        <div className="mt-2 text-xs text-[#a85022] font-semibold flex items-center gap-1.5">
                          <span>🏆</span>
                          <span>{c.flagship_trophy_or_award}</span>
                        </div>
                      )}

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-[#f0e7d8]">
                          <span className="text-[#73685e]">Qualifying Hierarchy:</span>
                          <span className="font-medium text-[#1a1714] text-right">
                            {c.qualifying_hierarchy.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {c.annual_participants_est && (
                          <div className="flex justify-between py-1 border-b border-[#f0e7d8]">
                            <span className="text-[#73685e]">Annual Participants:</span>
                            <span className="font-bold font-mono text-[#1a1714]">
                              {c.annual_participants_est.toLocaleString()} students
                            </span>
                          </div>
                        )}
                        {c.key_venues && (
                          <div className="flex justify-between py-1 border-b border-[#f0e7d8]">
                            <span className="text-[#73685e]">Venues:</span>
                            <span className="font-medium text-[#1a1714] text-right line-clamp-1">
                              {c.key_venues}
                            </span>
                          </div>
                        )}
                        {c.international_pathway && (
                          <div className="py-1 bg-[#eaf1fb] px-2.5 rounded-lg text-[#1a3e6a] text-[11px] font-semibold">
                            🌐 International Pathway: {c.international_pathway}
                          </div>
                        )}
                      </div>

                      {c.traditions_and_cultural_significance && (
                        <p className="mt-4 text-xs text-[#615951] leading-relaxed bg-[#faf8f5] p-3 rounded-xl border border-[#ebdccb]">
                          {c.traditions_and_cultural_significance}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: EDTECH & PEDAGOGY CATALOG ================= */}
        {activeTab === 'edtech' && (
          <div className="space-y-6">
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
              <h2 className="text-2xl font-serif font-bold text-[#1a1714]">
                Global &amp; Sri Lankan EdTech Solutions Catalog ({edtechList.length})
              </h2>
              <p className="text-sm text-[#615951] mt-1">
                Audited epistemological and pedagogical profiles ingested from the research archive,
                evaluating offline-first resilience and real classroom fit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {edtechList.map((e) => (
                <div
                  key={e.solution_id}
                  className="bg-[#fffefb] border border-[#e5dec9] p-5 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-[#824112] bg-[#fbf0e8] px-2 py-0.5 rounded-md">
                        {e.origin_country} • {e.founding_year || 'N/A'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          e.scope === 'sri_lanka_national'
                            ? 'bg-[#eaf1fb] text-[#1a3e6a]'
                            : 'bg-[#f4efe6] text-[#615951]'
                        }`}
                      >
                        {e.scope}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#1a1714]">{e.name}</h3>
                    <p className="text-xs text-[#73685e] mt-1 italic">
                      &quot;{e.ideology_quote || e.pedagogical_model}&quot;
                    </p>

                    <p className="text-xs text-[#524940] mt-3 line-clamp-3 leading-relaxed">
                      {e.design_fit_assessment || e.intended_population || 'No assessment summary.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#f0e7d8] space-y-2 text-xs">
                    <div className="flex justify-between text-[#73685e]">
                      <span>Pedagogy:</span>
                      <span className="font-semibold text-[#1a1714]">{e.pedagogical_model}</span>
                    </div>
                    <div className="flex justify-between text-[#73685e]">
                      <span>Connectivity:</span>
                      <span
                        className={`font-semibold ${e.connectivity_requirement === 'offline_first' ? 'text-[#246342]' : 'text-[#a85022]'}`}
                      >
                        {e.connectivity_requirement}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#73685e]">
                      <span>Hardware Tier:</span>
                      <span className="font-semibold text-[#1a1714]">{e.hardware_class}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: SQA 52-INDICATOR MATRIX ================= */}
        {activeTab === 'sqa' && (
          <div className="space-y-6">
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                National Inspection Audit
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
                School Quality Assessment (SQA) &amp; Inspector Gaming Rubrics
              </h2>
              <p className="text-sm text-[#615951] mt-1">
                The National Quality Assurance Framework assesses 8 dimensions across 52 indicators.
                Below is the empirical ledger detailing how schools historically adapted file
                architecture vs. authentic classroom reality.
              </p>
            </div>

            <div className="space-y-4">
              {sqaList.map((s) => {
                let levels: Record<string, string> = {};
                try {
                  levels = JSON.parse(s.performance_levels_json);
                } catch {
                  levels = {};
                }

                return (
                  <div
                    key={s.indicator_id}
                    className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0e7d8]">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#a85022] uppercase tracking-wider">
                          Dimension {s.dimension_no}: {s.dimension_title_en}
                        </span>
                        <h3 className="font-serif font-bold text-lg text-[#1a1714] mt-0.5">
                          Indicator {s.indicator_no}: {s.title_en}
                        </h3>
                        <p className="text-xs text-[#73685e] font-sans">{s.title_si}</p>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#faf8f5] border border-[#ebdccb] text-[#73685e] self-start sm:self-auto">
                        {s.indicator_id}
                      </span>
                    </div>

                    {/* Performance Levels Grid */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#fcf5f2] border border-[#f5ded5] p-3 rounded-xl">
                        <div className="font-bold text-[#c93018] mb-1">
                          Level 1 (Unsatisfactory)
                        </div>
                        <div className="text-[#615951] leading-relaxed">
                          {levels.level_1 || 'No rubric'}
                        </div>
                      </div>
                      <div className="bg-[#fdf9f1] border border-[#f7eecf] p-3 rounded-xl">
                        <div className="font-bold text-[#824112] mb-1">Level 2 (Basic)</div>
                        <div className="text-[#615951] leading-relaxed">
                          {levels.level_2 || 'No rubric'}
                        </div>
                      </div>
                      <div className="bg-[#f2f7f4] border border-[#d6ebd9] p-3 rounded-xl">
                        <div className="font-bold text-[#246342] mb-1">Level 3 (Good)</div>
                        <div className="text-[#615951] leading-relaxed">
                          {levels.level_3 || 'No rubric'}
                        </div>
                      </div>
                      <div className="bg-[#eef4fb] border border-[#d2e4f7] p-3 rounded-xl">
                        <div className="font-bold text-[#1a3e6a] mb-1">Level 4 (Commendable)</div>
                        <div className="text-[#615951] leading-relaxed">
                          {levels.level_4 || 'No rubric'}
                        </div>
                      </div>
                    </div>

                    {/* Gaming Notes Alert */}
                    {s.historical_gaming_notes && (
                      <div className="mt-4 p-3 bg-[#fdf8f0] border-l-4 border-[#e8a342] rounded-r-xl text-xs text-[#73685e]">
                        <span className="font-bold text-[#1a1714]">
                          Historical Inspection Gaming:{' '}
                        </span>
                        {s.historical_gaming_notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 5: RESEARCH MONOGRAPHS ================= */}
        {activeTab === 'research' && (
          <div className="space-y-6">
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-3xl">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                    EdLove Foundation (edlove.org) • Research &amp; Field Observation Group
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
                    EdLove Education Research Archive ({researchList.length} Monographs)
                  </h2>
                  <p className="text-sm text-[#615951] mt-1.5 leading-relaxed">
                    Research sits fundamentally on the{' '}
                    <strong className="text-[#1a1714]">EdLove Foundation</strong> (
                    <a
                      href="https://edlove.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a85022] hover:underline font-semibold"
                    >
                      edlove.org
                    </a>
                    ), the apex entity holding systemic education research, the Gurudevi digital
                    sanctuary, and future charitable solidarity work. The Sri Lanka Education Atlas
                    (&quot;Urumaya&quot;) is one contextual empirical manifestation of this
                    research.
                  </p>
                </div>

                <div className="shrink-0">
                  <a
                    href="https://edlove.org/research"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a1714] hover:bg-[#2c241e] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Visit EdLove Research Hub</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {researchList.map((r) => (
                <div
                  key={r.resource_id}
                  className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6"
                >
                  <div className="max-w-4xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono font-semibold text-[#a85022] bg-[#fbf0e8] px-2 py-0.5 rounded-md">
                        {r.publication_date}
                      </span>
                      <span className="text-xs text-[#73685e] font-mono">{r.resource_id}</span>
                      <span className="text-xs uppercase px-2 py-0.5 rounded-md bg-[#faf8f5] text-[#73685e] border border-[#ebdccb]">
                        {r.content_format}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-xl text-[#1a1714]">{r.title}</h3>

                    <p className="text-sm text-[#615951] mt-2 leading-relaxed">{r.summary}</p>
                  </div>

                  <div className="shrink-0 flex flex-col gap-2">
                    <a
                      href="https://edlove.org/research"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#faf8f5] hover:bg-[#fffefb] border border-[#d6cbba] hover:border-[#a85022] text-xs font-semibold text-[#1a1714] transition-all"
                    >
                      <span>EdLove Hub</span>
                      <span>↗</span>
                    </a>
                    {r.canonical_url && (
                      <a
                        href={r.canonical_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono text-[#73685e] hover:text-[#a85022]"
                      >
                        <span>Local Vault</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: UGC UNIVERSITY ADMISSIONS & Z-SCORES ================= */}
        {activeTab === 'ugc' && (
          <div className="space-y-8">
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                Secondary-to-Tertiary Transition Seam
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
                University Grants Commission (UGC) District Quota &amp; Minimum Z-Scores
              </h2>
              <p className="text-sm text-[#615951] mt-2 leading-relaxed max-w-3xl">
                Sri Lanka university admissions allocate places via a statutory tripartite formula:
                <span className="font-semibold text-[#1a1714]"> 40% All-Island Merit</span>,
                <span className="font-semibold text-[#1a1714]"> 55% District Population Quota</span>
                , and
                <span className="font-semibold text-[#1a1714]">
                  {' '}
                  5% Disadvantaged District Quota
                </span>
                . This produces massive structural variance in qualifying Z-scores between urban
                centers and rural provinces.
              </p>

              {/* Student Eligibility Simulator */}
              <div className="mt-8 bg-[#faf8f5] border border-[#ebdccb] p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🎯</span>
                  <h3 className="font-serif font-bold text-base text-[#1a1714]">
                    Interactive G.C.E. A/L District Eligibility Predictor
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="sim-zscore-input"
                      className="block text-xs font-semibold text-[#73685e] uppercase tracking-wider mb-1"
                    >
                      Your Projected Z-Score
                    </label>
                    <input
                      id="sim-zscore-input"
                      type="number"
                      step="0.001"
                      value={simZScore}
                      onChange={(e) => setSimZScore(e.target.value)}
                      placeholder="e.g. 1.5500"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#d6cbba] bg-white font-mono font-bold text-[#1a1714]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sim-district-select"
                      className="block text-xs font-semibold text-[#73685e] uppercase tracking-wider mb-1"
                    >
                      Exam District (Where You Sat A/L)
                    </label>
                    <select
                      id="sim-district-select"
                      value={simDistrict}
                      onChange={(e) => setSimDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-[#d6cbba] bg-white font-medium text-[#1a1714]"
                    >
                      <option value="D_11">Colombo (Western)</option>
                      <option value="D_12">Gampaha (Western)</option>
                      <option value="D_13">Kalutara (Western)</option>
                      <option value="D_21">Kandy (Central)</option>
                      <option value="D_22">Matale (Central)</option>
                      <option value="D_23">Nuwara Eliya (Central • Disadvantaged)</option>
                      <option value="D_31">Galle (Southern)</option>
                      <option value="D_32">Matara (Southern)</option>
                      <option value="D_33">Hambantota (Southern)</option>
                      <option value="D_41">Jaffna (Northern)</option>
                      <option value="D_45">Kilinochchi (Northern • Disadvantaged)</option>
                      <option value="D_42">Mannar (Northern • Disadvantaged)</option>
                      <option value="D_43">Vavuniya (Northern • Disadvantaged)</option>
                      <option value="D_44">Mullaitivu (Northern • Disadvantaged)</option>
                      <option value="D_51">Batticaloa (Eastern • Disadvantaged)</option>
                      <option value="D_52">Ampara (Eastern • Disadvantaged)</option>
                      <option value="D_53">Trincomalee (Eastern • Disadvantaged)</option>
                      <option value="D_61">Kurunegala (North Western)</option>
                      <option value="D_62">Puttalam (North Western • Disadvantaged)</option>
                      <option value="D_71">Anuradhapura (North Central • Disadvantaged)</option>
                      <option value="D_72">Polonnaruwa (North Central • Disadvantaged)</option>
                      <option value="D_81">Badulla (Uva • Disadvantaged)</option>
                      <option value="D_82">Monaragala (Uva • Disadvantaged)</option>
                      <option value="D_91">Ratnapura (Sabaragamuwa)</option>
                      <option value="D_92">Kegalle (Sabaragamuwa)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="text-xs text-[#73685e]">
                      Evaluating against academic year{' '}
                      <span className="font-mono font-bold text-[#1a1714]">2023/2024</span> cutoffs
                      across state universities.
                    </div>
                  </div>
                </div>

                {/* Eligibility Output Cards */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { code: '001M', title: 'Medicine (MBBS)', stream: 'Biological' },
                    { code: '003E', title: 'Engineering (BSc Hons)', stream: 'Physical' },
                    { code: '006C', title: 'Computer Science', stream: 'Physical' },
                    { code: '004L', title: 'Law (LL.B)', stream: 'Arts' },
                  ].map((target) => {
                    const row = ugcCutoffs.find(
                      (c) => c.program_code === target.code && c.district_id === simDistrict,
                    );
                    const userZ = parseFloat(simZScore) || 0;
                    const cutZ = row ? row.min_z_score : 99;
                    const diff = (userZ - cutZ).toFixed(4);
                    const eligible = userZ >= cutZ;

                    return (
                      <div
                        key={target.code}
                        className={`p-3.5 rounded-xl border ${
                          eligible
                            ? 'bg-[#f0f8f3] border-[#c0e6cb]'
                            : 'bg-[#fdf5f2] border-[#f7d6cc]'
                        }`}
                      >
                        <div className="font-bold text-xs text-[#1a1714]">{target.title}</div>
                        <div className="text-[10px] text-[#73685e] mt-0.5">{target.stream}</div>

                        <div className="mt-2 font-mono">
                          <div className="text-[10px] text-[#73685e]">District Cutoff:</div>
                          <div className="font-bold text-sm text-[#1a1714]">
                            {row ? row.min_z_score.toFixed(4) : 'N/A'}
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-[#ebdccb]">
                          <span
                            className={`font-sans font-bold text-[10px] uppercase px-2 py-0.5 rounded-md ${
                              eligible ? 'bg-[#246342] text-white' : 'bg-[#c93018] text-white'
                            }`}
                          >
                            {eligible ? `Eligible (+${diff})` : `Deficit (${diff})`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Program Selector Pills */}
              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  { code: '001M', label: 'Medicine (MBBS)' },
                  { code: '003E', label: 'Engineering (BSc Hons)' },
                  { code: '006C', label: 'Computer Science' },
                  { code: '004L', label: 'Law (LL.B)' },
                ].map((p) => (
                  <button
                    key={p.code}
                    onClick={() => setSelectedUgcProgram(p.code)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedUgcProgram === p.code
                        ? 'bg-[#1a1714] text-white'
                        : 'bg-[#faf8f5] border border-[#d6cbba] text-[#615951] hover:bg-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* 25-District Cutoff Table for Selected Program */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#f0e7d8] text-[#73685e]">
                      <th className="py-2.5">District</th>
                      <th className="py-2.5">Affirmative Quota</th>
                      <th className="py-2.5">Minimum Z-Score</th>
                      <th className="py-2.5">All-Island Merit Benchmark</th>
                      <th className="py-2.5">Delta from Merit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ugcCutoffs
                      .filter((c) => c.program_code === selectedUgcProgram)
                      .map((c) => {
                        const delta = (c.merit_all_island_z_score - c.min_z_score).toFixed(4);
                        return (
                          <tr
                            key={c.cutoff_id}
                            className="border-b border-[#f7f2ea] hover:bg-[#faf8f5]"
                          >
                            <td className="py-2.5 font-bold text-[#1a1714]">{c.district_name}</td>
                            <td className="py-2.5">
                              {c.is_disadvantaged_district === 1 ? (
                                <span className="px-2 py-0.5 rounded-md bg-[#d6ebd9] text-[#246342] font-sans font-bold text-[10px]">
                                  Disadvantaged (5% Quota)
                                </span>
                              ) : (
                                <span className="text-[#a8a096] font-sans">
                                  General District (55%)
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 font-bold text-sm text-[#a85022]">
                              {c.min_z_score.toFixed(4)}
                            </td>
                            <td className="py-2.5 text-[#73685e]">
                              {c.merit_all_island_z_score.toFixed(4)}
                            </td>
                            <td className="py-2.5 text-[#73685e]">
                              {Number(delta) > 0 ? `-${delta} lower` : 'Merit Cutoff'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: HIGHER EDUCATION & VOCATIONAL MESH ================= */}
        {activeTab === 'tertiary' && (
          <div className="space-y-8">
            {/* Systemic Context Banner: The 128,000 Overflow Seam */}
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdccb] pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                      Post-Secondary Navigation Engine
                    </span>
                    <span className="text-xs text-[#73685e] font-mono">
                      128,000+ Annual Overflow Seam
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[#1a1714]">
                    Higher Education, Tertiary & Vocational Mesh
                  </h2>
                  <p className="text-sm text-[#615951] mt-1 max-w-3xl">
                    Out of ~170,000 students qualifying in G.C.E. A/Levels annually, only ~42,000
                    secure UGC State University intake. Over 128,000 qualified youth are left to
                    navigate tertiary alternatives. This sovereign mesh connects state ATIs, TVEC
                    NVQ ladders, technical colleges, and chartered guilds.
                  </p>
                </div>

                {/* 4 Pillars Summary Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-[#faf8f5] border border-[#e5dec9] p-2.5 rounded-xl">
                    <div className="font-bold text-base text-[#1a1714]">17</div>
                    <div className="text-[10px] text-[#73685e]">UGC Universities</div>
                  </div>
                  <div className="bg-[#faf8f5] border border-[#e5dec9] p-2.5 rounded-xl">
                    <div className="font-bold text-base text-[#246342]">19</div>
                    <div className="text-[10px] text-[#73685e]">SLIATE ATIs</div>
                  </div>
                  <div className="bg-[#faf8f5] border border-[#e5dec9] p-2.5 rounded-xl">
                    <div className="font-bold text-base text-[#a85022]">NVQ 1-7</div>
                    <div className="text-[10px] text-[#73685e]">TVEC Framework</div>
                  </div>
                  <div className="bg-[#faf8f5] border border-[#e5dec9] p-2.5 rounded-xl">
                    <div className="font-bold text-base text-[#1a3e6a]">6</div>
                    <div className="text-[10px] text-[#73685e]">Chartered Guilds</div>
                  </div>
                </div>
              </div>

              {/* Economic Divide & Tuition Transparency Matrix */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-[#f0f8f3] border border-[#c0e6cb]">
                  <div className="flex items-center justify-between font-bold text-sm text-[#246342]">
                    <span>State Free Education</span>
                    <span>Rs. 0</span>
                  </div>
                  <div className="text-[11px] text-[#2e593d] mt-1 font-medium">
                    UGC Universities & SLIATE ATIs & German Tech
                  </div>
                  <p className="text-[11px] text-[#4d735b] mt-2">
                    100% state-funded tuition + Mahapola bursary (Rs. 5,000/mo). Zero student debt
                    upon graduation, but strictly capped by annual intake limits (~42,000 UGC +
                    ~12,000 SLIATE).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#fcf8f0] border border-[#ecd9b5]">
                  <div className="flex items-center justify-between font-bold text-sm text-[#a85022]">
                    <span>Professional Chartered Guilds</span>
                    <span>Rs. 85k – 280k</span>
                  </div>
                  <div className="text-[11px] text-[#874618] mt-1 font-medium">
                    AAT Sri Lanka • CA Sri Lanka • CIMA • Law College
                  </div>
                  <p className="text-[11px] text-[#8a5d3b] mt-2">
                    Primary rural mobility engine. Minimal upfront examination fees while students
                    earn allowances during mandatory 3-year article clerkships. Fast-tracks directly
                    into corporate management.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f4f7fa] border border-[#cbd9e8]">
                  <div className="flex items-center justify-between font-bold text-sm text-[#1a3e6a]">
                    <span>Semi-State & Non-UGC Campuses</span>
                    <span>Rs. 1.8M – 2.8M</span>
                  </div>
                  <div className="text-[11px] text-[#2c4e77] mt-1 font-medium">
                    SLIIT • NSBM Green Uni • KDU Day Scholars • SLTC
                  </div>
                  <p className="text-[11px] text-[#4a6382] mt-2">
                    Degrees recognized under Ministry of Higher Education Act Sec 25A. Absorbs
                    ~35,000 students via private payment or the Ministry Interest-Free Student Loan
                    Scheme (IFSLS).
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-Views Switcher inside Tab 7 */}
            <div className="flex flex-wrap gap-2 border-b border-[#e5dec9] pb-3 text-xs font-semibold">
              <button
                onClick={() => setTertiarySubTab('overview')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  tertiarySubTab === 'overview'
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'bg-[#fffefb] border border-[#e5dec9] text-[#615951] hover:bg-[#faf8f5]'
                }`}
              >
                <span>🧭</span> Overview & NVQ Step-Ladder
              </button>
              <button
                onClick={() => setTertiarySubTab('tne')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  tertiarySubTab === 'tne'
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'bg-[#fffefb] border border-[#e5dec9] text-[#615951] hover:bg-[#faf8f5]'
                }`}
              >
                <span>🌐</span> Urban Private & TNE Transfer Funnel ({tneFunnels.length})
              </button>
              <button
                onClick={() => setTertiarySubTab('scholarships')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  tertiarySubTab === 'scholarships'
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'bg-[#fffefb] border border-[#e5dec9] text-[#615951] hover:bg-[#faf8f5]'
                }`}
              >
                <span>🎓</span> Scholarships & Aid ({scholarships.length})
              </button>
              <button
                onClick={() => setTertiarySubTab('facilities')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  tertiarySubTab === 'facilities'
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'bg-[#fffefb] border border-[#e5dec9] text-[#615951] hover:bg-[#faf8f5]'
                }`}
              >
                <span>🏛️</span> Campus Facilities & Leadership
              </button>
            </div>

            {/* SUB-VIEW 1: OVERVIEW & NVQ STEP-LADDER */}
            {tertiarySubTab === 'overview' && (
              <>
                {/* SECTION 2: THE INTERACTIVE NVQ QUALIFICATION STEP-LADDER (LEVELS 1-7) */}
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebdccb] pb-4">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#1a1714]">
                        The TVEC National Vocational Qualification (NVQ) Step-Ladder
                      </h3>
                      <p className="text-xs text-[#73685e] mt-0.5">
                        Climbing from Craftsman (Level 3-4) to Higher National Diploma (Level 6) and
                        Bachelor of Technology Degree (Level 7)
                      </p>
                    </div>
                    <div className="text-xs bg-[#eef5ee] text-[#246342] font-semibold px-3 py-1.5 rounded-lg border border-[#cce5cf]">
                      💡 O/L Leavers can graduate with a BTech without sitting A/Ls!
                    </div>
                  </div>

                  {/* Step-Ladder Interactive Visualizer */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-7 gap-2">
                    {nvqFramework.map((lvl) => {
                      const isSelected = selectedNvqStep === lvl.nvq_level;
                      const isDegree = lvl.nvq_level === 7;
                      const isDiploma = lvl.nvq_level >= 5;

                      return (
                        <button
                          key={lvl.nvq_level}
                          onClick={() => setSelectedNvqStep(isSelected ? null : lvl.nvq_level)}
                          className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#1a1714] text-white border-[#1a1714] shadow-md scale-[1.02]'
                              : isDegree
                                ? 'bg-[#fbf4ee] border-[#e8cbb0] hover:border-[#a85022]'
                                : isDiploma
                                  ? 'bg-[#f7f5ee] border-[#ddd7c4] hover:border-[#73685e]'
                                  : 'bg-[#faf8f5] border-[#ebdccb] hover:border-[#a8a096]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : isDegree
                                      ? 'bg-[#a85022] text-white'
                                      : 'bg-[#e8dbca] text-[#615951]'
                                }`}
                              >
                                NVQ {lvl.nvq_level}
                              </span>
                              {isDegree && <span className="text-xs">🎓</span>}
                            </div>
                            <div
                              className={`font-bold text-xs mt-2 line-clamp-2 ${isSelected ? 'text-white' : 'text-[#1a1714]'}`}
                            >
                              {lvl.level_name_en.split(':')[1]?.trim() || lvl.level_name_en}
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-black/10">
                            <div
                              className={`text-[10px] font-medium ${isSelected ? 'text-white/80' : 'text-[#73685e]'}`}
                            >
                              {lvl.equivalent_academic_tier}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Expanded NVQ Step Detail Card */}
                  {selectedNvqStep &&
                    (() => {
                      const step = nvqFramework.find((n) => n.nvq_level === selectedNvqStep);
                      if (!step) return null;
                      const bodies: string[] = step.apex_awarding_bodies_json
                        ? JSON.parse(step.apex_awarding_bodies_json)
                        : [];

                      return (
                        <div className="mt-5 p-5 bg-[#faf8f5] border border-[#e5dec9] rounded-xl text-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-sm text-[#1a1714] flex items-center gap-2">
                              <span className="bg-[#a85022] text-white px-2 py-0.5 rounded text-xs font-mono">
                                NVQ Level {step.nvq_level}
                              </span>
                              <span>{step.level_name_en}</span>
                              {step.level_name_si && (
                                <span className="text-[#73685e] font-serif font-normal">
                                  ({step.level_name_si})
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => setSelectedNvqStep(null)}
                              className="text-[#73685e] hover:text-[#1a1714] font-bold text-sm"
                            >
                              ✕ Close
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            <div>
                              <div className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                                Entry Requirement
                              </div>
                              <div className="text-xs text-[#1a1714] mt-1">
                                {step.entry_requirement}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                                Academic Equivalence
                              </div>
                              <div className="text-xs font-bold text-[#246342] mt-1">
                                {step.equivalent_academic_tier}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                                Typical Career Tier
                              </div>
                              <div className="text-xs text-[#1a1714] mt-1">
                                {step.typical_career_tier}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#ebdccb]">
                            <div className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider mb-1.5">
                              Apex Awarding Institutions & Bodies
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {bodies.map((b) => (
                                <span
                                  key={b}
                                  className="bg-white border border-[#d6cbba] px-2.5 py-1 rounded-md text-xs font-medium text-[#1a1714]"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </div>

                {/* SECTION 3: ALTERNATIVE PATHWAY SIMULATOR ("LIFE AFTER A/LS & O/LS") */}
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
                  <div className="border-b border-[#ebdccb] pb-4">
                    <h3 className="text-lg font-serif font-bold text-[#1a1714]">
                      Post-Secondary Transition Pathway Simulator
                    </h3>
                    <p className="text-xs text-[#73685e] mt-0.5">
                      Filter proven trajectories tailored to your examination cohort and academic
                      stream
                    </p>
                  </div>

                  {/* Filters Strip */}
                  <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Cohort Selector */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs font-bold text-[#73685e] mr-2 self-center">
                        Cohort:
                      </span>
                      {[
                        { id: 'al_qualified_ugc_unadmitted', label: 'Passed A/L (No Uni Seat)' },
                        { id: 'al_attempted_unqualified', label: 'Attempted A/L (Unqualified)' },
                        { id: 'ol_exit_direct', label: 'Direct G.C.E. O/L Exit' },
                      ].map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCohort(c.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            selectedCohort === c.id
                              ? 'bg-[#1a1714] text-white shadow-xs'
                              : 'bg-[#faf8f5] border border-[#d6cbba] text-[#615951] hover:bg-white'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>

                    {/* Stream Selector */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs font-bold text-[#73685e] mr-2 self-center">
                        Stream:
                      </span>
                      {[
                        { id: 'all', label: 'All Streams' },
                        { id: 'physical_science', label: 'Maths' },
                        { id: 'commerce', label: 'Commerce' },
                        { id: 'technology', label: 'Technology' },
                        { id: 'bio_science', label: 'Bio' },
                        { id: 'arts', label: 'Arts' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStream(s.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            selectedStream === s.id
                              ? 'bg-[#a85022] text-white'
                              : 'bg-[#faf8f5] border border-[#e5dec9] text-[#73685e] hover:bg-white'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pathway Cards Grid */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pathways
                      .filter((p) => {
                        if (selectedCohort && p.starting_cohort_status !== selectedCohort)
                          return false;
                        if (
                          selectedStream !== 'all' &&
                          p.academic_stream !== selectedStream &&
                          p.academic_stream !== 'any'
                        ) {
                          return false;
                        }
                        return true;
                      })
                      .map((p) => {
                        const costColor =
                          p.cost_profile === 'zero_cost_state_stipend'
                            ? 'bg-[#d6ebd9] text-[#246342]'
                            : p.cost_profile === 'moderate_professional'
                              ? 'bg-[#fbe9dc] text-[#a85022]'
                              : p.cost_profile === 'high_private'
                                ? 'bg-[#e2eaf4] text-[#1a3e6a]'
                                : 'bg-[#f4efe5] text-[#73685e]';

                        const costLabel =
                          p.cost_profile === 'zero_cost_state_stipend'
                            ? 'Free State (Stipend)'
                            : p.cost_profile === 'moderate_professional'
                              ? 'Low/Moderate Professional'
                              : p.cost_profile === 'high_private'
                                ? 'Self-Financed Private'
                                : 'Low Government Fee';

                        return (
                          <div
                            key={p.pathway_id}
                            className="bg-[#faf8f5] border border-[#e5dec9] p-5 rounded-xl flex flex-col justify-between hover:border-[#c5b8a3] transition-all"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-sm text-[#1a1714] leading-snug">
                                  {p.title_en}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider ${costColor}`}
                                >
                                  {costLabel}
                                </span>
                              </div>

                              <p className="text-xs text-[#615951] mt-2.5 leading-relaxed">
                                {p.description_en}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#ebdccb] space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-[#73685e]">Horizon to Work:</span>
                                <span className="font-bold font-mono text-[#1a1714]">
                                  {p.time_to_employment_months} Months
                                </span>
                              </div>

                              {p.strategic_advisory && (
                                <div className="bg-[#fffefb] border border-[#ebdccb] p-2.5 rounded-lg text-[11px] text-[#423c35] flex items-start gap-1.5">
                                  <span className="text-xs">📌</span>
                                  <span className="leading-snug">{p.strategic_advisory}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* SECTION 4: SOVEREIGN TERTIARY & VOCATIONAL INSTITUTIONS DIRECTORY */}
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdccb] pb-4">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#1a1714]">
                        Higher Education & Vocational Institutions Directory
                      </h3>
                      <p className="text-xs text-[#73685e] mt-0.5">
                        55 sovereign universities, technological institutes, technical colleges, and
                        chartered guilds
                      </p>
                    </div>

                    {/* Search in Directory */}
                    <div className="w-full md:w-72">
                      <input
                        type="text"
                        placeholder="Search institution or town..."
                        value={instSearch}
                        onChange={(e) => setInstSearch(e.target.value)}
                        className="w-full bg-[#faf8f5] border border-[#d6cbba] px-3 py-1.5 rounded-lg text-xs focus:outline-hidden focus:border-[#a85022]"
                      />
                    </div>
                  </div>

                  {/* Institution Type Filter Pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
                    {[
                      { id: 'all', label: `All Institutions (${tertiaryInstitutions.length})` },
                      { id: 'state_ugc_university', label: '17 State Universities' },
                      { id: 'state_technical_sliate', label: '19 SLIATE ATIs' },
                      { id: 'state_vocational_dtet', label: 'Technical Colleges & CGTTI' },
                      { id: 'state_non_ugc_institute', label: 'UNIVOTEC / Ocean Uni / KDU' },
                      { id: 'semi_state_private_degree', label: 'SLIIT / NSBM / CINEC' },
                      { id: 'professional_chartered_guild', label: 'Chartered Guilds (AAT / CA)' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedInstType(t.id)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          selectedInstType === t.id
                            ? 'bg-[#1a1714] text-white shadow-xs'
                            : 'bg-[#faf8f5] border border-[#e5dec9] text-[#73685e] hover:bg-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Institutions Cards Grid */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tertiaryInstitutions
                      .filter((inst) => {
                        if (selectedInstType !== 'all' && inst.inst_type !== selectedInstType)
                          return false;
                        if (instSearch.trim()) {
                          const q = instSearch.toLowerCase();
                          const matchName =
                            inst.name_en.toLowerCase().includes(q) ||
                            (inst.name_si && inst.name_si.toLowerCase().includes(q));
                          const matchTown =
                            inst.address_town && inst.address_town.toLowerCase().includes(q);
                          const matchNotes = inst.notes && inst.notes.toLowerCase().includes(q);
                          if (!matchName && !matchTown && !matchNotes) return false;
                        }
                        return true;
                      })
                      .map((inst) => {
                        const typeLabel =
                          inst.inst_type === 'state_ugc_university'
                            ? 'State UGC University'
                            : inst.inst_type === 'state_technical_sliate'
                              ? 'SLIATE ATI'
                              : inst.inst_type === 'professional_chartered_guild'
                                ? 'Chartered Guild'
                                : inst.inst_type === 'semi_state_private_degree'
                                  ? 'Semi-State / Private Degree'
                                  : inst.inst_type === 'state_vocational_dtet'
                                    ? 'Technical College / Apprentice'
                                    : 'State Non-UGC';

                        const typeColor =
                          inst.inst_type === 'state_ugc_university'
                            ? 'bg-[#d6ebd9] text-[#246342]'
                            : inst.inst_type === 'state_technical_sliate'
                              ? 'bg-[#e2eaf4] text-[#1a3e6a]'
                              : inst.inst_type === 'professional_chartered_guild'
                                ? 'bg-[#fbe9dc] text-[#a85022]'
                                : 'bg-[#f4efe5] text-[#73685e]';

                        return (
                          <div
                            key={inst.inst_id}
                            className="bg-[#faf8f5] border border-[#e5dec9] p-4 rounded-xl flex flex-col justify-between hover:border-[#c5b8a3] transition-all"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor}`}
                                >
                                  {typeLabel}
                                </span>
                                {inst.established_year && (
                                  <span className="text-[10px] font-mono text-[#a8a096]">
                                    Est. {inst.established_year}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-bold text-sm text-[#1a1714] mt-2 leading-snug">
                                {inst.name_en}
                              </h4>
                              {inst.name_si && (
                                <div className="text-xs text-[#73685e] font-serif mt-0.5">
                                  {inst.name_si}
                                </div>
                              )}

                              <div className="text-xs text-[#615951] mt-2 flex items-center gap-1.5">
                                <span>📍</span>
                                <span>{inst.address_town || 'Sri Lanka'}</span>
                                {inst.district_name && (
                                  <span className="text-[#a8a096]">({inst.district_name})</span>
                                )}
                              </div>

                              {inst.notes && (
                                <p className="text-[11px] text-[#73685e] mt-2.5 line-clamp-2 leading-relaxed">
                                  {inst.notes}
                                </p>
                              )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#ebdccb] flex items-center justify-between text-[11px]">
                              <span className="text-[#a8a096] font-mono">
                                {inst.annual_student_enrollment
                                  ? `~${inst.annual_student_enrollment.toLocaleString()} students`
                                  : 'Regulated'}
                              </span>
                              {inst.website_url && (
                                <a
                                  href={inst.website_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#a85022] hover:underline font-semibold flex items-center gap-1"
                                >
                                  <span>Official Portal</span>
                                  <span>↗</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}

            {/* SUB-VIEW 2: URBAN PRIVATE & TNE TRANSFER FUNNEL */}
            {tertiarySubTab === 'tne' && (
              <div className="space-y-6">
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdccb] pb-4">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#1a1714]">
                        Urban Private Higher Education & TNE Degree Transfer Funnel
                      </h3>
                      <p className="text-xs text-[#615951] mt-0.5 max-w-2xl">
                        10+ urban private campuses mapped across Colombo & Western Province with
                        4-year internal franchises and 1+2 / 2+2 transfer pipelines to Australia and
                        the UK.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {/* Model Filter */}
                      <select
                        value={tneModelFilter}
                        onChange={(e) => setTneModelFilter(e.target.value)}
                        className="bg-[#faf8f5] border border-[#d6cbba] px-3 py-1.5 rounded-lg text-xs focus:outline-hidden"
                      >
                        <option value="all">All Models</option>
                        <option value="4_year_internal_franchise">4-Year Internal Franchise</option>
                        <option value="1_plus_2_transfer">1+2 Transfer Pipeline</option>
                        <option value="2_plus_2_transfer">2+2 Transfer Pipeline</option>
                      </select>

                      {/* Country Filter */}
                      <select
                        value={tneCountryFilter}
                        onChange={(e) => setTneCountryFilter(e.target.value)}
                        className="bg-[#faf8f5] border border-[#d6cbba] px-3 py-1.5 rounded-lg text-xs focus:outline-hidden"
                      >
                        <option value="all">All Partner Countries</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>

                  {/* TNE Degree Funnels Grid */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tneFunnels
                      .filter((f) => {
                        if (tneModelFilter !== 'all' && f.award_model !== tneModelFilter)
                          return false;
                        if (
                          tneCountryFilter !== 'all' &&
                          f.foreign_partner_country !== tneCountryFilter
                        )
                          return false;
                        return true;
                      })
                      .map((f) => {
                        const isTransfer = f.award_model.includes('transfer');
                        return (
                          <div
                            key={f.funnel_id}
                            className="bg-[#faf8f5] border border-[#e5dec9] p-5 rounded-xl flex flex-col justify-between hover:border-[#c5b8a3] transition-all"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-sm text-[#1a1714]">
                                  {f.program_name}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                    isTransfer
                                      ? 'bg-[#fbe9dc] text-[#a85022]'
                                      : 'bg-[#e2eaf4] text-[#1a3e6a]'
                                  }`}
                                >
                                  {f.award_model.replace(/_/g, ' ').toUpperCase()}
                                </span>
                              </div>

                              <div className="mt-2 text-xs text-[#423c35] flex flex-wrap items-center gap-1.5 font-medium">
                                <span>🏛️ {f.local_institution_name}</span>
                                <span className="text-[#a8a096]">➔</span>
                                <span className="text-[#a85022] font-semibold">
                                  {f.foreign_partner_name} ({f.foreign_partner_country})
                                </span>
                              </div>

                              <div className="mt-2 text-[11px] text-[#73685e]">
                                <span className="font-semibold text-[#1a1714]">
                                  Awarding Authority:
                                </span>{' '}
                                {f.awarding_body_location} •{' '}
                                <span className="italic">{f.global_rank_band}</span>
                              </div>

                              {/* Cost Comparison Pill */}
                              <div className="mt-3 grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg bg-[#fffefb] border border-[#ebdccb]">
                                <div>
                                  <div className="text-[10px] text-[#73685e] uppercase font-bold">
                                    Local Cost (LKR)
                                  </div>
                                  <div className="font-bold font-mono text-sm text-[#1a1714]">
                                    Rs. {(f.local_cost_lkr / 1000000).toFixed(2)}M
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] text-[#73685e] uppercase font-bold">
                                    Foreign Cost
                                  </div>
                                  <div className="font-bold font-mono text-sm text-[#a85022]">
                                    {f.foreign_cost_estimate_usd && f.foreign_cost_estimate_usd > 0
                                      ? `~$${f.foreign_cost_estimate_usd.toLocaleString()} USD`
                                      : 'Rs. 0 (100% Local)'}
                                  </div>
                                </div>
                              </div>

                              {/* Post-Study Work Rights */}
                              <div className="mt-2.5 text-xs text-[#246342] bg-[#f0f8f3] border border-[#c0e6cb] p-2 rounded-lg">
                                <span className="font-bold">🛂 Post-Study Work: </span>
                                <span>{f.post_study_work_rights}</span>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#ebdccb] space-y-2 text-[11px]">
                              <div className="text-[#615951] leading-relaxed">
                                💡 {f.strategic_advisory}
                              </div>
                              {f.partner_portal && (
                                <ExternalPortalLink
                                  href={f.partner_portal}
                                  label="Foreign Partner Website"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: SCHOLARSHIPS & FINANCIAL AID LEDGER */}
            {tertiarySubTab === 'scholarships' && (
              <div className="space-y-6">
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdccb] pb-4">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#1a1714]">
                        Higher Education & Postgraduate Scholarships Ledger
                      </h3>
                      <p className="text-xs text-[#615951] mt-0.5 max-w-2xl">
                        Comprehensive sovereign directory of undergraduate, master\'s, and doctoral
                        scholarships spanning state bursaries, bilateral foreign government awards,
                        and corporate sponsorships.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {/* Academic Level Filter */}
                      <select
                        value={schLevelFilter}
                        onChange={(e) => setSchLevelFilter(e.target.value)}
                        className="bg-[#faf8f5] border border-[#d6cbba] px-3 py-1.5 rounded-lg text-xs focus:outline-hidden"
                      >
                        <option value="all">All Degrees</option>
                        <option value="bachelors">Bachelors (Undergraduate)</option>
                        <option value="masters">Masters / Postgrad</option>
                        <option value="phd">PhD / Research</option>
                      </select>

                      {/* Funding Tier Filter */}
                      <select
                        value={schTierFilter}
                        onChange={(e) => setSchTierFilter(e.target.value)}
                        className="bg-[#faf8f5] border border-[#d6cbba] px-3 py-1.5 rounded-lg text-xs focus:outline-hidden"
                      >
                        <option value="all">All Funding Tiers</option>
                        <option value="state_statutory_national">National State Scheme</option>
                        <option value="bilateral_foreign_government">
                          Bilateral Foreign Government
                        </option>
                        <option value="corporate_industrial_sponsorship">
                          Corporate / Industry Sponsored
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Scholarships Grid */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scholarships
                      .filter((sc) => {
                        if (
                          schLevelFilter !== 'all' &&
                          sc.academic_level !== schLevelFilter &&
                          sc.academic_level !== 'all_levels' &&
                          sc.academic_level !== 'bachelors_and_masters'
                        )
                          return false;
                        if (schTierFilter !== 'all' && sc.funding_tier !== schTierFilter)
                          return false;
                        return true;
                      })
                      .map((sc) => {
                        const isFullRide =
                          sc.coverage_scope.includes('full_ride') ||
                          sc.coverage_scope.includes('full_tuition');
                        return (
                          <div
                            key={sc.scholarship_id}
                            className="bg-[#faf8f5] border border-[#e5dec9] p-5 rounded-xl flex flex-col justify-between hover:border-[#c5b8a3] transition-all"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-sm text-[#1a1714] leading-snug">
                                  {sc.title_en}
                                </h4>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                    isFullRide
                                      ? 'bg-[#d6ebd9] text-[#246342]'
                                      : 'bg-[#e2eaf4] text-[#1a3e6a]'
                                  }`}
                                >
                                  {sc.academic_level.toUpperCase()}
                                </span>
                              </div>

                              <div className="mt-1 text-xs text-[#73685e] font-serif">
                                {sc.title_si}
                              </div>

                              <div className="mt-2 text-xs text-[#a85022] font-semibold">
                                🏛️ Awarding Body: {sc.awarding_entity}
                              </div>

                              <div className="mt-2 text-xs text-[#423c35] flex items-center gap-1.5">
                                <span>🌍 Destinations:</span>
                                <span className="font-medium text-[#1a1714]">
                                  {sc.eligible_destinations}
                                </span>
                              </div>

                              {/* Coverage Scope & Value */}
                              <div className="mt-3 p-2.5 rounded-lg bg-[#fffefb] border border-[#ebdccb] text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[#73685e]">Coverage:</span>
                                  <span className="font-bold text-[#246342]">
                                    {sc.coverage_scope.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                </div>
                                {sc.approx_annual_value_lkr && sc.approx_annual_value_lkr > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#73685e]">Approx Value:</span>
                                    <span className="font-bold font-mono text-[#a85022]">
                                      ~Rs. {(sc.approx_annual_value_lkr / 1000000).toFixed(2)}M /
                                      year
                                    </span>
                                  </div>
                                )}
                                {sc.annual_quota_slots && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#73685e]">Annual Quota:</span>
                                    <span className="font-bold font-mono text-[#1a1714]">
                                      {sc.annual_quota_slots} Slots
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Eligibility Criteria */}
                              <div className="mt-3 text-xs text-[#615951] leading-relaxed">
                                <span className="font-bold text-[#1a1714]">Criteria: </span>
                                <span>{sc.eligibility_criteria}</span>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[#ebdccb] space-y-2 text-[11px]">
                              <div className="text-[#615951]">
                                📅 <span className="font-semibold">Application Window:</span>{' '}
                                {sc.application_window}
                              </div>
                              {sc.strategic_advisory && (
                                <div className="text-[#423c35] bg-[#fffefb] p-2 rounded-md border border-[#ebdccb]">
                                  📌 {sc.strategic_advisory}
                                </div>
                              )}
                              {sc.official_portal_url && (
                                <ExternalPortalLink
                                  href={sc.official_portal_url}
                                  label="Official Application Portal"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 4: CAMPUS FACILITIES & GOVERNANCE */}
            {tertiarySubTab === 'facilities' && (
              <div className="space-y-6">
                {/* Leadership & Tenures (Vice Chancellors & Rectors) */}
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
                  <div className="border-b border-[#ebdccb] pb-4">
                    <h3 className="text-lg font-serif font-bold text-[#1a1714]">
                      Higher Education Governance: Living Roll of Honor
                    </h3>
                    <p className="text-xs text-[#615951] mt-0.5">
                      Vice Chancellors, Rectors, and academic executive leadership across state
                      universities and private institutions
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    {leadership.map((l) => (
                      <div
                        key={l.occupancy_id}
                        className="bg-[#faf8f5] border border-[#e5dec9] p-4 rounded-xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d6ebd9] text-[#246342]">
                              {l.role_title_en}
                            </span>
                            <span className="text-[10px] font-mono text-[#a8a096]">
                              Since {l.valid_from}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-[#1a1714] mt-2">
                            {l.honors_prefix} {l.canonical_name}
                          </h4>
                          {l.canonical_name_si && (
                            <div className="text-xs text-[#73685e] font-serif">
                              {l.canonical_name_si}
                            </div>
                          )}

                          <div className="text-xs font-semibold text-[#a85022] mt-1.5">
                            🏛️ {l.entity_name}
                          </div>

                          {l.qualifications_json && (
                            <div className="mt-2 text-[11px] text-[#615951] font-mono">
                              {JSON.parse(l.qualifications_json).join(' • ')}
                            </div>
                          )}

                          {l.biographical_notes && (
                            <p className="mt-2 text-[11px] text-[#73685e] line-clamp-3 leading-relaxed">
                              {l.biographical_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campus Facilities & Advanced Infrastructure */}
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
                  <div className="border-b border-[#ebdccb] pb-4">
                    <h3 className="text-lg font-serif font-bold text-[#1a1714]">
                      Physical Campus Facilities & Advanced Infrastructure
                    </h3>
                    <p className="text-xs text-[#615951] mt-0.5">
                      Research supercomputing laboratories, clinical teaching hospitals, university
                      library systems, and sports complexes
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    {facilities.map((fac) => {
                      const features: string[] = fac.features_json
                        ? JSON.parse(fac.features_json)
                        : [];
                      return (
                        <div
                          key={fac.facility_id}
                          className="bg-[#faf8f5] border border-[#e5dec9] p-4 rounded-xl flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e2eaf4] text-[#1a3e6a] uppercase">
                                {fac.facility_type.replace(/_/g, ' ')}
                              </span>
                              {fac.capacity_units && (
                                <span className="text-[10px] font-mono text-[#a85022] font-bold">
                                  {fac.capacity_units.toLocaleString()} Units
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-sm text-[#1a1714] mt-2 leading-snug">
                              {fac.name_en}
                            </h4>
                            {fac.name_si && (
                              <div className="text-xs text-[#73685e] font-serif">{fac.name_si}</div>
                            )}

                            <div className="text-xs font-semibold text-[#a85022] mt-1">
                              🏛️ {fac.institution_name_en}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-1">
                              {features.map((feat) => (
                                <span
                                  key={feat}
                                  className="text-[10px] bg-white border border-[#ebdccb] px-2 py-0.5 rounded-md text-[#423c35]"
                                >
                                  ✓ {feat}
                                </span>
                              ))}
                            </div>

                            {fac.notes && (
                              <p className="mt-2.5 text-[11px] text-[#73685e] leading-relaxed">
                                {fac.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 10: CIVIC MOVEMENTS, DAHAM PASAL & RESOURCE DISPARITIES ================= */}
        {activeTab === 'movements' && (
          <div className="space-y-8">
            {/* Header / Dossier Overview */}
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-3xl">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                    Sovereign Co-Curricular &amp; Civil Society Infrastructure
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1714] mt-2">
                    Civic Youth Movements, Sunday Religious Education &amp; Spatial Disparities
                  </h2>
                  <p className="text-sm text-[#615951] mt-1.5 leading-relaxed">
                    Sri Lankan childhood development is anchored by parallel voluntary institutions
                    operating outside formal classrooms: uniformed youth corps (Scouting, Guiding,
                    Parisara Niyamu), the weekend faith-based network (Daham Pasal, Araneri,
                    Catechism, Ahadiyyah), and extreme spatial inequalities in sports facilities,
                    aesthetic teachers, safe drinking water, and A/L Science access.
                  </p>
                </div>
              </div>

              {/* Apex Macro Statistics */}
              <div className="mt-6 pt-6 border-t border-[#ebdccb] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#a85022]">
                    {movementsSummary
                      ? (movementsSummary.total_cadre / 1000).toFixed(0) + 'k+'
                      : '441k+'}
                  </div>
                  <div className="text-xs text-[#73685e] mt-0.5 font-medium">
                    Uniformed Youth Cadre
                  </div>
                </div>
                <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#246342]">
                    {movementsSummary
                      ? (movementsSummary.total_dhamma_students / 1e6).toFixed(2) + 'M'
                      : '2.71M'}
                  </div>
                  <div className="text-xs text-[#73685e] mt-0.5 font-medium">
                    Sunday Religious Students
                  </div>
                </div>
                <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#1a3e6a]">
                    {movementsSummary
                      ? (movementsSummary.total_dhamma_teachers / 1000).toFixed(0) + 'k+'
                      : '177k+'}
                  </div>
                  <div className="text-xs text-[#73685e] mt-0.5 font-medium">
                    Volunteer Faith Teachers
                  </div>
                </div>
                <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#824112]">
                    &lt;40 Pools
                  </div>
                  <div className="text-xs text-[#73685e] mt-0.5 font-medium">
                    National Swimming Pools
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Tabs Switcher */}
            <div className="flex flex-wrap gap-2 border-b border-[#e5dec9] pb-3">
              <button
                onClick={() => setMovementsSubTab('movements_overview')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  movementsSubTab === 'movements_overview'
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'bg-[#faf8f5] border border-[#ebdccb] text-[#615951] hover:bg-white'
                }`}
              >
                <span>🏕️</span> Uniformed &amp; Civic Movements ({movementsList.length})
              </button>
              <button
                onClick={() => setMovementsSubTab('dhamma_pasal')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  movementsSubTab === 'dhamma_pasal'
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'bg-[#faf8f5] border border-[#ebdccb] text-[#615951] hover:bg-white'
                }`}
              >
                <span>🛕</span> Sunday Religious Schools / Daham Pasal ({dhammaList.length}{' '}
                Networks)
              </button>
              <button
                onClick={() => setMovementsSubTab('resource_disparity')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  movementsSubTab === 'resource_disparity'
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'bg-[#faf8f5] border border-[#ebdccb] text-[#615951] hover:bg-white'
                }`}
              >
                <span>⚖️</span> School Resource &amp; Teacher Disparity Matrix (
                {resourceProfiles.length} Profiles)
              </button>
            </div>

            {/* ================= SUB-TAB 1: UNIFORMED & CIVIC MOVEMENTS ================= */}
            {movementsSubTab === 'movements_overview' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-[#fffefb] border border-[#e5dec9] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'All Movements' },
                      { id: 'scouting_guiding', label: 'Scouting & Guiding' },
                      { id: 'environmental_pioneer', label: 'Environmental (CEA)' },
                      { id: 'first_aid_humanitarian', label: 'First Aid & Humanitarian' },
                      { id: 'civic_traffic_cadet', label: 'Traffic & Cadet Police' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setMovementTypeFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          movementTypeFilter === f.id
                            ? 'bg-[#1a1714] text-white'
                            : 'bg-[#faf8f5] border border-[#ebdccb] text-[#615951] hover:bg-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Search movement, award, or emblem..."
                    value={movementsSearch}
                    onChange={(e) => setMovementsSearch(e.target.value)}
                    className="px-3.5 py-2 bg-[#faf8f5] border border-[#e5dec9] rounded-xl text-xs w-full md:w-64 focus:outline-hidden focus:ring-1 focus:ring-[#a85022]"
                  />
                </div>

                {/* Movements Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {movementsList
                    .filter(
                      (m) => movementTypeFilter === 'all' || m.movement_type === movementTypeFilter,
                    )
                    .filter((m) => {
                      if (!movementsSearch.trim()) return true;
                      const q = movementsSearch.toLowerCase();
                      return (
                        m.name_en.toLowerCase().includes(q) ||
                        (m.name_si && m.name_si.toLowerCase().includes(q)) ||
                        m.governing_body.toLowerCase().includes(q) ||
                        (m.highest_honor_award && m.highest_honor_award.toLowerCase().includes(q))
                      );
                    })
                    .map((m) => {
                      let pillars: string[] = [];
                      try {
                        pillars = JSON.parse(m.core_pillars_json || '[]');
                      } catch {
                        pillars = [];
                      }

                      return (
                        <div
                          key={m.movement_id}
                          className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl flex flex-col justify-between shadow-xs"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#eaf1fb] text-[#1a3e6a] border border-[#cdddf2]">
                                {m.movement_type.replace(/_/g, ' ')}
                              </span>
                              {m.annual_student_cadre_est && (
                                <span className="text-xs font-mono font-bold text-[#a85022]">
                                  ~{m.annual_student_cadre_est.toLocaleString()} Cadre
                                </span>
                              )}
                            </div>

                            <h3 className="font-serif font-bold text-lg text-[#1a1714] leading-snug">
                              {m.name_en}
                            </h3>
                            {m.name_si && (
                              <div className="text-xs text-[#73685e] font-serif mt-0.5">
                                {m.name_si}
                              </div>
                            )}
                            {m.founding_year && (
                              <div className="text-xs text-[#824112] font-mono mt-1">
                                Est. {m.founding_year} • {m.governing_body}
                              </div>
                            )}

                            {m.highest_honor_award && (
                              <div className="mt-3 bg-[#fdf5ea] border border-[#f5e3c2] p-2.5 rounded-xl text-xs text-[#915809]">
                                <span className="font-bold">🎖️ Apex Honor: </span>
                                {m.highest_honor_award}
                              </div>
                            )}

                            {m.uniform_and_insignia && (
                              <div className="mt-3 text-xs text-[#615951]">
                                <span className="font-semibold text-[#1a1714]">
                                  Uniform &amp; Insignia:{' '}
                                </span>
                                {m.uniform_and_insignia}
                              </div>
                            )}

                            {pillars.length > 0 && (
                              <div className="mt-4">
                                <div className="text-xs font-bold text-[#1a1714] mb-1.5">
                                  Core Pillars &amp; Competencies:
                                </div>
                                <ul className="list-disc list-inside text-xs text-[#615951] space-y-1">
                                  {pillars.map((p) => (
                                    <li key={p}>{p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {m.civic_role_notes && (
                              <div className="mt-4 p-3 bg-[#faf8f5] border border-[#ebdccb] rounded-xl text-xs text-[#615951] leading-relaxed">
                                💡 {m.civic_role_notes}
                              </div>
                            )}
                          </div>

                          <div className="mt-6 pt-4 border-t border-[#f0e7d8] flex items-center justify-between text-xs">
                            <span className="text-[#8e857b] font-mono">{m.movement_id}</span>
                            {m.official_portal && (
                              <a
                                href={m.official_portal}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-[#a85022] hover:underline flex items-center gap-1"
                              >
                                <span>Official Portal</span>
                                <span>↗</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ================= SUB-TAB 2: SUNDAY RELIGIOUS SCHOOLS (DAHAM PASAL) ================= */}
            {movementsSubTab === 'dhamma_pasal' && (
              <div className="space-y-6">
                {/* Intro card */}
                <div className="bg-[#faf8f5] border border-[#ebdccb] p-6 rounded-2xl">
                  <h3 className="font-serif font-bold text-lg text-[#1a1714]">
                    The Sunday Moral Safety Net: 2.7 Million Children in Volunteer Care
                  </h3>
                  <p className="text-xs sm:text-sm text-[#615951] mt-1.5 leading-relaxed">
                    Across 14,000+ village temples, Hindu kovils, Christian churches, and local
                    mosques, more than 177,000 volunteer monks, priests, and elders teach morality,
                    scriptural literacy, and cultural self-restraint every Sunday morning. This
                    parallel religious infrastructure carries zero recurrent payroll on the National
                    Treasury while serving as the primary civic anchor for children in rural
                    communities.
                  </p>
                </div>

                {/* Filters */}
                <div className="bg-[#fffefb] border border-[#e5dec9] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'All Faith Traditions' },
                      { id: 'buddhism', label: 'Buddhism (Daham Pasal)' },
                      { id: 'hinduism', label: 'Hinduism (Araneri)' },
                      { id: 'christianity_catholic', label: 'Christianity (Sunday School)' },
                      { id: 'islam', label: 'Islam (Ahadiyyah)' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setDhammaFaithFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          dhammaFaithFilter === f.id
                            ? 'bg-[#1a1714] text-white'
                            : 'bg-[#faf8f5] border border-[#ebdccb] text-[#615951] hover:bg-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Search tradition or exam..."
                    value={movementsSearch}
                    onChange={(e) => setMovementsSearch(e.target.value)}
                    className="px-3.5 py-2 bg-[#faf8f5] border border-[#e5dec9] rounded-xl text-xs w-full md:w-64 focus:outline-hidden focus:ring-1 focus:ring-[#a85022]"
                  />
                </div>

                {/* Dhamma Networks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dhammaList
                    .filter(
                      (d) => dhammaFaithFilter === 'all' || d.faith_tradition === dhammaFaithFilter,
                    )
                    .filter((d) => {
                      if (!movementsSearch.trim()) return true;
                      const q = movementsSearch.toLowerCase();
                      return (
                        d.name_en.toLowerCase().includes(q) ||
                        (d.name_si && d.name_si.toLowerCase().includes(q)) ||
                        (d.operating_venues && d.operating_venues.toLowerCase().includes(q)) ||
                        (d.national_examination_framework &&
                          d.national_examination_framework.toLowerCase().includes(q))
                      );
                    })
                    .map((d) => {
                      const faithColors =
                        d.faith_tradition === 'buddhism'
                          ? 'bg-[#fdf5ea] text-[#915809] border-[#f5e3c2]'
                          : d.faith_tradition === 'hinduism'
                            ? 'bg-[#fbe9dc] text-[#a85022] border-[#f0d6c5]'
                            : d.faith_tradition === 'christianity_catholic'
                              ? 'bg-[#eaf1fb] text-[#1a3e6a] border-[#cdddf2]'
                              : 'bg-[#d6ebd9] text-[#246342] border-[#b9dec0]';

                      return (
                        <div
                          key={d.network_id}
                          className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${faithColors}`}
                              >
                                {d.faith_tradition.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs font-mono font-bold text-[#246342]">
                                {(d.estimated_student_enrollment / 1000).toFixed(0)}k+ Children
                              </span>
                            </div>

                            <h3 className="font-serif font-bold text-xl text-[#1a1714]">
                              {d.name_en}
                            </h3>
                            {d.name_si && (
                              <div className="text-xs text-[#73685e] font-serif mt-0.5">
                                {d.name_si}
                              </div>
                            )}
                            {d.name_ta && (
                              <div className="text-xs text-[#73685e] font-sans mt-0.5">
                                {d.name_ta}
                              </div>
                            )}

                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
                              <div className="bg-[#faf8f5] border border-[#ebdccb] p-3 rounded-xl">
                                <div className="text-[#73685e]">Operating Units</div>
                                <div className="text-sm font-bold text-[#1a1714] mt-0.5">
                                  {d.estimated_school_units.toLocaleString()} Units
                                </div>
                              </div>
                              <div className="bg-[#faf8f5] border border-[#ebdccb] p-3 rounded-xl">
                                <div className="text-[#73685e]">Volunteer Force</div>
                                <div className="text-sm font-bold text-[#a85022] mt-0.5">
                                  {d.volunteer_teaching_force_est
                                    ? d.volunteer_teaching_force_est.toLocaleString() + ' Mentors'
                                    : 'N/A'}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2 text-xs text-[#615951]">
                              <div>
                                <span className="font-semibold text-[#1a1714]">
                                  🏛️ Governing State Dept:{' '}
                                </span>
                                {d.governing_state_department}
                              </div>
                              <div>
                                <span className="font-semibold text-[#1a1714]">
                                  📍 Operating Venues:{' '}
                                </span>
                                {d.operating_venues}
                              </div>
                              {d.national_examination_framework && (
                                <div>
                                  <span className="font-semibold text-[#1a1714]">
                                    📜 National Examination:{' '}
                                  </span>
                                  {d.national_examination_framework}
                                </div>
                              )}
                            </div>

                            {d.sociological_role_notes && (
                              <div className="mt-4 p-3 bg-[#faf8f5] border border-[#ebdccb] rounded-xl text-xs text-[#615951] leading-relaxed">
                                💡 {d.sociological_role_notes}
                              </div>
                            )}
                          </div>

                          <div className="mt-6 pt-4 border-t border-[#f0e7d8] text-[11px] text-[#8e857b] font-mono">
                            Network Registry: {d.network_id}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ================= SUB-TAB 3: SPATIAL RESOURCE & SPECIALIST TEACHER DISPARITY MATRIX ================= */}
            {movementsSubTab === 'resource_disparity' && (
              <div className="space-y-6">
                {/* Disparity Structural Manifesto Card */}
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022]">
                    Empirical Ground-Truth
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#1a1714] mt-1">
                    The 4 Structural Fault Lines of Sri Lankan Schooling
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-xs">
                    <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
                      <div className="font-bold text-[#a85022] mb-1">1. Sports Oligarchy</div>
                      <p className="text-[#615951] leading-relaxed">
                        Fewer than 40 school swimming pools and ~60 turf cricket pitches exist
                        nationwide. Rural schools compete on steep gravel slopes and muddy
                        volleyball courts.
                      </p>
                    </div>
                    <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
                      <div className="font-bold text-[#a85022] mb-1">
                        2. Aesthetic Forced Default
                      </div>
                      <p className="text-[#615951] leading-relaxed">
                        Urban 1AB schools enjoy surplus music and dance teachers, while rural Type
                        2/3 schools have zero specialist teachers, forcing students into Art by
                        administrative default.
                      </p>
                    </div>
                    <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
                      <div className="font-bold text-[#a85022] mb-1">3. A/L Science Chokepoint</div>
                      <p className="text-[#615951] leading-relaxed">
                        Over 8,900 schools (&gt;89%) are legally and structurally locked out of
                        teaching A/L Science. Only ~1,029 1AB schools have certified science
                        laboratories.
                      </p>
                    </div>
                    <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
                      <div className="font-bold text-[#a85022] mb-1">
                        4. WASH &amp; Nutrition Divide
                      </div>
                      <p className="text-[#615951] leading-relaxed">
                        Metropolitan schools drink municipal tap water while North Central / dry
                        zone schools require community RO filtration plants to prevent chronic
                        kidney disease (CKDu).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-[#fffefb] border border-[#e5dec9] p-4 sm:p-5 rounded-2xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#73685e] mb-1">Sports Tier</label>
                      <select
                        value={sportsTierFilter}
                        onChange={(e) => setSportsTierFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#ebdccb] bg-[#faf8f5]"
                      >
                        <option value="all">All Sports Tiers</option>
                        <option value="olympic_turf_complex">Olympic Turf Complex</option>
                        <option value="grass_ground_matting">Grass Ground Matting</option>
                        <option value="gravel_volleyball_only">Gravel Volleyball Only</option>
                        <option value="zero_playground">Zero Playground</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#73685e] mb-1">
                        Aesthetic Staffing
                      </label>
                      <select
                        value={aestheticStatusFilter}
                        onChange={(e) => setAestheticStatusFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#ebdccb] bg-[#faf8f5]"
                      >
                        <option value="all">All Aesthetic Statuses</option>
                        <option value="surplus">Surplus Staff</option>
                        <option value="balanced">Balanced</option>
                        <option value="deficit_music_dance_missing">
                          Deficit: Music/Dance Missing
                        </option>
                        <option value="severe_shortage_art_only">Severe Shortage: Art Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#73685e] mb-1">
                        A/L Science Capable
                      </label>
                      <select
                        value={scienceCapableFilter}
                        onChange={(e) => setScienceCapableFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#ebdccb] bg-[#faf8f5]"
                      >
                        <option value="all">All Capabilities</option>
                        <option value="1">1AB Capable (Science)</option>
                        <option value="0">Locked Out (No Science)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#73685e] mb-1">
                        Swimming Pool
                      </label>
                      <select
                        value={poolFilter}
                        onChange={(e) => setPoolFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#ebdccb] bg-[#faf8f5]"
                      >
                        <option value="all">All Facilities</option>
                        <option value="1">Has Swimming Pool</option>
                        <option value="0">No Swimming Pool</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#73685e] mb-1">
                        Drinking Water
                      </label>
                      <select
                        value={waterSourceFilter}
                        onChange={(e) => setWaterSourceFilter(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#ebdccb] bg-[#faf8f5]"
                      >
                        <option value="all">All Water Sources</option>
                        <option value="pipe_borne_safe">Pipe-Borne Safe</option>
                        <option value="ro_filtration_plant">RO Filtration Plant (CKDu)</option>
                        <option value="tube_well_tested">Tube Well Tested</option>
                        <option value="unprotected_source_deficit">Unprotected Deficit</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#f0e7d8] flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Search school name, census no, or notes..."
                      value={disparitySearch}
                      onChange={(e) => setDisparitySearch(e.target.value)}
                      className="px-3.5 py-1.5 bg-[#faf8f5] border border-[#e5dec9] rounded-xl text-xs w-full sm:w-80 focus:outline-hidden focus:ring-1 focus:ring-[#a85022]"
                    />
                    <div className="text-xs text-[#73685e] font-mono">
                      {resourceProfiles.length} Representative Profiles Evaluated
                    </div>
                  </div>
                </div>

                {/* Profiles Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resourceProfiles
                    .filter(
                      (p) =>
                        sportsTierFilter === 'all' ||
                        p.sports_infrastructure_tier === sportsTierFilter,
                    )
                    .filter(
                      (p) =>
                        aestheticStatusFilter === 'all' ||
                        p.aesthetic_teacher_status === aestheticStatusFilter,
                    )
                    .filter(
                      (p) =>
                        scienceCapableFilter === 'all' ||
                        String(p.al_science_capable) === scienceCapableFilter,
                    )
                    .filter(
                      (p) =>
                        poolFilter === 'all' || String(p.swimming_pool_available) === poolFilter,
                    )
                    .filter(
                      (p) =>
                        waterSourceFilter === 'all' ||
                        p.drinking_water_source === waterSourceFilter,
                    )
                    .filter((p) => {
                      if (!disparitySearch.trim()) return true;
                      const q = disparitySearch.toLowerCase();
                      return (
                        p.school_name.toLowerCase().includes(q) ||
                        (p.school_name_si && p.school_name_si.toLowerCase().includes(q)) ||
                        p.school_census_no.toLowerCase().includes(q) ||
                        p.district.toLowerCase().includes(q) ||
                        (p.notes && p.notes.toLowerCase().includes(q))
                      );
                    })
                    .map((p) => {
                      let sports: string[] = [];
                      let aesthetics: string[] = [];
                      let movements: string[] = [];
                      try {
                        sports = JSON.parse(p.sports_offered_json || '[]');
                      } catch {
                        sports = [];
                      }
                      try {
                        aesthetics = JSON.parse(p.aesthetic_streams_available_json || '[]');
                      } catch {
                        aesthetics = [];
                      }
                      try {
                        movements = JSON.parse(p.co_curricular_units_json || '[]');
                      } catch {
                        movements = [];
                      }

                      return (
                        <div
                          key={p.profile_id}
                          className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl flex flex-col justify-between shadow-xs"
                        >
                          <div>
                            {/* School Header */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="font-mono text-xs font-bold text-[#824112] bg-[#fbf0e8] px-2 py-0.5 rounded-md">
                                {p.school_census_no}
                              </span>
                              <div className="flex gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#faf8f5] border border-[#ebdccb] text-[#615951]">
                                  {p.district}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#eaf1fb] text-[#1a3e6a]">
                                  {p.school_type}
                                </span>
                              </div>
                            </div>

                            <h3 className="font-serif font-bold text-lg text-[#1a1714] leading-snug">
                              {p.school_name}
                            </h3>
                            {p.school_name_si && (
                              <div className="text-xs text-[#73685e] font-serif mt-0.5">
                                {p.school_name_si}
                              </div>
                            )}

                            {/* Enrolment metrics */}
                            <div className="mt-2 text-xs text-[#73685e] font-mono">
                              Students:{' '}
                              <span className="font-bold text-[#1a1714]">
                                {p.student_count?.toLocaleString()}
                              </span>{' '}
                              • Teachers:{' '}
                              <span className="font-bold text-[#1a1714]">{p.teacher_count}</span>
                            </div>

                            {/* Fault Line Badges Strip */}
                            <div className="mt-4 space-y-2">
                              {/* 1. Sports Tier */}
                              <div className="bg-[#faf8f5] border border-[#ebdccb] p-2.5 rounded-xl text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[#73685e] font-medium">
                                    Sports Complex:
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                      p.sports_infrastructure_tier === 'olympic_turf_complex'
                                        ? 'bg-[#d6ebd9] text-[#246342]'
                                        : p.sports_infrastructure_tier === 'grass_ground_matting'
                                          ? 'bg-[#eaf1fb] text-[#1a3e6a]'
                                          : 'bg-[#fdf0d5] text-[#b0730d]'
                                    }`}
                                  >
                                    {p.sports_infrastructure_tier.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div className="flex gap-2 text-[11px] font-mono">
                                  <span>
                                    🏊 Pool:{' '}
                                    <strong>
                                      {p.swimming_pool_available ? '✓ Yes' : '✗ None'}
                                    </strong>
                                  </span>
                                  <span>
                                    🏏 Turf:{' '}
                                    <strong>
                                      {p.cricket_turf_available ? '✓ Turf' : '✗ Matting/None'}
                                    </strong>
                                  </span>
                                </div>
                                {sports.length > 0 && (
                                  <div className="mt-1 text-[10px] text-[#73685e]">
                                    Sports: {sports.join(', ')}
                                  </div>
                                )}
                              </div>

                              {/* 2. Aesthetic Status */}
                              <div
                                className={`p-2.5 rounded-xl text-xs border ${
                                  p.aesthetic_teacher_status === 'severe_shortage_art_only'
                                    ? 'bg-[#fcf5f2] border-[#f5ded5] text-[#c93018]'
                                    : p.aesthetic_teacher_status === 'deficit_music_dance_missing'
                                      ? 'bg-[#fdf9f1] border-[#f7eecf] text-[#824112]'
                                      : 'bg-[#f2f7f4] border-[#d6ebd9] text-[#246342]'
                                }`}
                              >
                                <div className="font-bold">
                                  {p.aesthetic_teacher_status === 'severe_shortage_art_only'
                                    ? '⚠️ Severe Shortage: Forced into Art by Default'
                                    : p.aesthetic_teacher_status === 'deficit_music_dance_missing'
                                      ? '⚠️ Deficit: Music/Dance Missing'
                                      : p.aesthetic_teacher_status === 'surplus'
                                        ? '✓ Surplus Specialist Teachers'
                                        : '✓ Balanced Aesthetic Staff'}
                                </div>
                                <div className="mt-1 text-[11px]">
                                  Offered: {aesthetics.join(', ')}
                                </div>
                              </div>

                              {/* 3. A/L Science & Computers */}
                              <div className="flex gap-2 text-xs">
                                <div
                                  className={`flex-1 p-2 rounded-xl border text-center font-bold ${
                                    p.al_science_capable
                                      ? 'bg-[#eaf1fb] border-[#cdddf2] text-[#1a3e6a]'
                                      : 'bg-[#faf8f5] border-[#ebdccb] text-[#73685e]'
                                  }`}
                                >
                                  {p.al_science_capable
                                    ? '🔬 A/L Science Capable'
                                    : '🚫 No A/L Science'}
                                </div>
                                <div className="p-2 rounded-xl border border-[#ebdccb] bg-[#faf8f5] text-center font-mono">
                                  💻 <strong>{p.functional_computer_terminals}</strong> PCs
                                </div>
                              </div>

                              {/* 4. Drinking Water & Meals */}
                              <div className="bg-[#faf8f5] border border-[#ebdccb] p-2.5 rounded-xl text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-[#73685e]">Water Source:</span>
                                  <span className="font-semibold text-[#1a1714]">
                                    {p.drinking_water_source.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#73685e]">Midday Meal Beneficiary:</span>
                                  <span
                                    className={`font-bold ${p.midday_meal_beneficiary ? 'text-[#246342]' : 'text-[#73685e]'}`}
                                  >
                                    {p.midday_meal_beneficiary
                                      ? '✓ Free Lunch Provided'
                                      : '✗ No State Lunch'}
                                  </span>
                                </div>
                              </div>

                              {/* 5. Co-Curricular Units */}
                              {movements.length > 0 && (
                                <div className="text-[11px] text-[#615951]">
                                  <span className="font-bold text-[#1a1714]">
                                    Active Co-Curriculars:{' '}
                                  </span>
                                  {movements.join(' • ')}
                                </div>
                              )}

                              {/* Notes */}
                              {p.notes && (
                                <p className="text-[11px] text-[#73685e] bg-white border border-[#ebdccb] p-2 rounded-lg leading-relaxed">
                                  {p.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-[#f0e7d8] flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#8e857b]">
                              Profile: {p.profile_id}
                            </span>
                            <Link
                              href={`/atlas/school/${p.school_census_no}`}
                              className="text-xs font-bold text-[#a85022] hover:underline flex items-center gap-1"
                            >
                              <span>View Dossier</span>
                              <span>→</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 11: SYSTEMANTICS & RELATIONAL COMPASS ================= */}
        {activeTab === 'compass' && (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                      Cybernetic Realism • POSIWID
                    </span>
                    <span className="text-xs text-[#824112] font-mono bg-[#f5eee1] px-2 py-0.5 rounded border border-[#e8dbca]">
                      Systemantics Analytical Framework
                    </span>
                    <span className="text-xs text-[#246342] font-mono bg-[#ebf5ef] px-2 py-0.5 rounded border border-[#c3e3cf]">
                      C-ARI Ground Truth Engine
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1714]">
                    Systemantics &amp; Relational Compass
                  </h2>
                  <p className="text-sm text-[#615951] mt-2 leading-relaxed">
                    Unmasking the cybernetic reality of Sri Lankan education beyond aggregate
                    statistical illusions. This compass balances the life-saving material floor
                    (universal nutrition, literacy, social flattening) against the relentless Red
                    Queen credential treadmill, Ratio Theater deltas, and the physical limits of
                    centralized logistics.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <a
                    href="https://edlove.org/research"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1a1714] hover:bg-[#2c241e] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Read Canonical Treatises</span>
                    <span>↗</span>
                  </a>
                  <span className="text-[11px] text-[#73685e] text-center font-mono">
                    Stafford Beer • Gall • Hirsch
                  </span>
                </div>
              </div>

              {/* Substrate Metrics Ribbon */}
              <div className="mt-6 pt-6 border-t border-[#f0e7d8] grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#ebdccb]">
                  <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                    Grounded Substrate
                  </span>
                  <span className="text-lg font-serif font-bold text-[#1a1714]">9,962 Schools</span>
                  <span className="text-[11px] text-[#615951] block mt-0.5">
                    Physical distribution points
                  </span>
                </div>
                <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#ebdccb]">
                  <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                    Thermodynamic Floor
                  </span>
                  <span className="text-lg font-serif font-bold text-[#246342]">
                    1.6M Midday Meals
                  </span>
                  <span className="text-[11px] text-[#615951] block mt-0.5">
                    Universal caloric anchor
                  </span>
                </div>
                <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#ebdccb]">
                  <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                    Ratio Theater Delta
                  </span>
                  <span className="text-lg font-serif font-bold text-[#c93018]">+26.4 Delta</span>
                  <span className="text-[11px] text-[#615951] block mt-0.5">
                    48:1 room vs 1:21 nominal
                  </span>
                </div>
                <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#ebdccb]">
                  <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                    Shadow Treasury Gap
                  </span>
                  <span className="text-lg font-serif font-bold text-[#a85022]">
                    Rs. 68.5M vs 24K
                  </span>
                  <span className="text-[11px] text-[#615951] block mt-0.5">
                    Urban SDS vs Estate Primary
                  </span>
                </div>
              </div>
            </div>

            {/* 1. THE DIALECTIC OF THE FLOOR VS. THE RED QUEEN */}
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                  Dialectical Synthesis
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                  The Dialectic of the Floor and the Red Queen
                </h3>
                <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-3xl">
                  A systemic critique that ignores the material floor is cruel; a defense that
                  ignores the Red Queen race is blind. Here is the structural tension at the core of
                  free education in Sri Lanka:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* The Floor Column */}
                <div className="bg-[#f7faf8] border-2 border-[#246342]/40 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-[#246342] tracking-wider bg-[#ebf5ef] px-2.5 py-1 rounded-md border border-[#c3e3cf]">
                      The Material Floor (Positive Functions)
                    </span>
                    <span className="text-xs font-mono text-[#246342] font-bold">Upliftment</span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#1a1714]">
                    The Life-Saving Floor: Nutrition, Literacy &amp; Basic Flattening
                  </h4>
                  <ul className="space-y-3 text-xs sm:text-sm text-[#3d3833] leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-[#246342] font-bold">✓</span>
                      <div>
                        <strong className="text-[#1a1714]">Universal Caloric Anchor:</strong> The
                        free mid-day meal (<span className="italic">Daval Ahāra</span>) sustains
                        over 1.6 million primary students, preventing acute wasting in rural and
                        plantation communities where food poverty exceeds 40%.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#246342] font-bold">✓</span>
                      <div>
                        <strong className="text-[#1a1714]">
                          The White Uniform (<span className="italic">Sudu Enduma</span>):
                        </strong>{' '}
                        Flattens caste, class, and estate distinctions during school hours,
                        establishing a shared civic baseline of dignity for every child regardless
                        of household income.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#246342] font-bold">✓</span>
                      <div>
                        <strong className="text-[#1a1714]">Universal Adult Literacy:</strong>{' '}
                        Maintained adult literacy above 92.5% for decades, paired with school dental
                        clinics and immunization drives that built Sri Lanka&apos;s celebrated PQLI
                        indicators.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#246342] font-bold">✓</span>
                      <div>
                        <strong className="text-[#1a1714]">
                          Micro-Validity of Upward Mobility:
                        </strong>{' '}
                        Real escape velocity for individual rural strivers (
                        <span className="italic">pahasukam nathi daruwan</span>) who reach state
                        medical, engineering, and administrative cadres through pure meritocratic
                        grit.
                      </div>
                    </li>
                  </ul>
                </div>

                {/* The Red Queen Column */}
                <div className="bg-[#fdfaf8] border-2 border-[#c93018]/40 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-[#c93018] tracking-wider bg-[#fbeeed] px-2.5 py-1 rounded-md border border-[#f5c7c2]">
                      The Red Queen (Systemic Pathologies)
                    </span>
                    <span className="text-xs font-mono text-[#c93018] font-bold">Escalation</span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#1a1714]">
                    The Positional Treadmill: Credential Inflation &amp; Burnout
                  </h4>
                  <ul className="space-y-3 text-xs sm:text-sm text-[#3d3833] leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-[#c93018] font-bold">⚠</span>
                      <div>
                        <strong className="text-[#1a1714]">
                          Fred Hirsch Positional Competition:
                        </strong>{' '}
                        Because high-wage modern jobs remain strictly bounded, credentials suffer
                        rapid inflation. When everyone stands on their tiptoes at the parade, nobody
                        sees better, but everyone&apos;s legs ache.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c93018] font-bold">⚠</span>
                      <div>
                        <strong className="text-[#1a1714]">The Van Valen Red Queen Effect:</strong>{' '}
                        &quot;It takes all the running you can do, to keep in the same place.&quot;
                        The Grade 5 Scholarship that once guaranteed security now merely qualifies a
                        child to enter another 8-year gauntlet of tuition.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c93018] font-bold">⚠</span>
                      <div>
                        <strong className="text-[#1a1714]">
                          The Transclasse Alienation of Climbers:
                        </strong>{' '}
                        Rural strivers who climb the pyramid find themselves dislocated from their
                        village roots, while facing subtle linguistic and social gatekeeping (
                        <span className="italic">Kaduwa</span>) in the Colombo
                        corporate/administrative elite.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c93018] font-bold">⚠</span>
                      <div>
                        <strong className="text-[#1a1714]">Metabolic Cortisol Saturation:</strong>{' '}
                        12-to-14 hour schedules combining school, double-tuition, and homework
                        create chronic sleep deprivation, anxiety, and metabolic burnout in 10-to-18
                        year olds.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. THE TWO BENCHMARK ARCHETYPES */}
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                    Empirical Benchmarks
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                    The Two Archetypes: Colombo 1AB Flagship vs. Nuwara Eliya Type 3 Primary
                  </h3>
                  <p className="text-xs sm:text-sm text-[#615951] mt-1">
                    Directly comparing official state statistics against the ground truth substrate
                    of real classroom density and shadow economics.
                  </p>
                </div>

                <div className="flex gap-2 bg-[#f5eee1] p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCompassArchetype('urban')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      compassArchetype === 'urban'
                        ? 'bg-[#1a1714] text-white shadow-xs'
                        : 'text-[#615951] hover:text-[#1a1714]'
                    }`}
                  >
                    🏢 Colombo 1AB (Dharmapala)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompassArchetype('rural')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      compassArchetype === 'rural'
                        ? 'bg-[#1a1714] text-white shadow-xs'
                        : 'text-[#615951] hover:text-[#1a1714]'
                    }`}
                  >
                    🍃 Nuwara Eliya Type 3 (Warleigh)
                  </button>
                </div>
              </div>

              {compassArchetype === 'urban' ? (
                /* Urban Benchmark: Dharmapala Vidyalaya */
                <div className="border border-[#ebdccb] bg-[#faf8f5] p-6 rounded-2xl space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#ebdccb] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#a85022]">
                          Census: 01002
                        </span>
                        <span className="text-xs bg-[#ebdccb] text-[#1a1714] px-2 py-0.5 rounded font-semibold">
                          1AB National School
                        </span>
                        <span className="text-xs bg-[#fbeeed] text-[#c93018] px-2 py-0.5 rounded font-semibold">
                          Overcrowded Flagship
                        </span>
                      </div>
                      <h4 className="text-xl font-serif font-bold text-[#1a1714] mt-1">
                        Dharmapala Vidyalaya, Pannipitiya (Western Province)
                      </h4>
                      <p className="text-xs text-[#73685e] mt-0.5">
                        Enrollment: 5,200 pupils • 240 teachers • Sinhala Medium • Primary through
                        A/L
                      </p>
                    </div>

                    <Link
                      href="/atlas/school/01002"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#a85022] hover:bg-[#8f3e15] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                    >
                      <span>View School Dossier</span>
                      <span>→</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                        Official SQA Audit
                      </span>
                      <div className="text-2xl font-serif font-bold text-[#1a1714] mt-1">
                        94.2 / 100
                      </div>
                      <span className="text-xs font-semibold text-[#246342]">
                        Grade A (State Pride)
                      </span>
                      <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                        Evaluated on sports facilities, A/L pass tallies, and documented
                        institutional compliance.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border-2 border-[#a85022]">
                      <span className="text-[10px] uppercase font-bold text-[#a85022] tracking-wider block">
                        Grounded C-ARI Score
                      </span>
                      <div className="text-2xl font-serif font-bold text-[#a85022] mt-1">
                        52.4 / 100
                      </div>
                      <span className="text-xs font-semibold text-[#824112]">
                        Severe Relational Scarcity
                      </span>
                      <p className="text-[11px] text-[#615951] mt-1.5 leading-relaxed">
                        Severe crowd congestion, high student-to-bench density, and near-total
                        reliance on outside tuition.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                        Ratio Theater Delta (Δ)
                      </span>
                      <div className="text-2xl font-mono font-bold text-[#c93018] mt-1">+26.4</div>
                      <span className="text-xs font-semibold text-[#1a1714]">
                        Nominal 1:21.6 vs 48:1 Room
                      </span>
                      <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                        Individual child attunement probability:{' '}
                        <strong className="text-[#1a1714]">~2.1%</strong> per 40-minute period.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                        SDS Shadow Treasury
                      </span>
                      <div className="text-2xl font-mono font-bold text-[#1a1714] mt-1">
                        Rs. 68.5M
                      </div>
                      <span className="text-xs font-semibold text-[#a85022]">
                        44% of Capital Inflow
                      </span>
                      <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                        Parents privately finance laboratories, electricity bills, AC units, and
                        security guards.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#f0e7d8] p-4 rounded-xl text-xs sm:text-sm text-[#403933] leading-relaxed">
                    <strong className="text-[#1a1714]">POSIWID Diagnostic:</strong> The system works
                    as an industrial sorting machine. The state school provides the legitimate
                    credential and testing registration, while the real teaching has been outsourced
                    to the shadow tuition industry in Nugegoda and Maharagama, funded by parental
                    sacrifice.
                  </div>
                </div>
              ) : (
                /* Rural Benchmark: Warleigh Tamil Vidyalaya */
                <div className="border border-[#ebdccb] bg-[#faf8f5] p-6 rounded-2xl space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#ebdccb] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#a85022]">
                          Census: 18042
                        </span>
                        <span className="text-xs bg-[#ebdccb] text-[#1a1714] px-2 py-0.5 rounded font-semibold">
                          Type 3 Primary School
                        </span>
                        <span className="text-xs bg-[#ebf5ef] text-[#246342] px-2 py-0.5 rounded font-semibold">
                          Estate Community Anchor
                        </span>
                      </div>
                      <h4 className="text-xl font-serif font-bold text-[#1a1714] mt-1">
                        Warleigh Tamil Vidyalaya, Dickoya (Central Province)
                      </h4>
                      <p className="text-xs text-[#73685e] mt-0.5">
                        Enrollment: 42 pupils • 3 teachers • Tamil Medium • Primary (Grades 1–5
                        Multi-grade)
                      </p>
                    </div>

                    <Link
                      href="/atlas/school/18042"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#246342] hover:bg-[#1c4d33] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                    >
                      <span>View School Dossier</span>
                      <span>→</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                        Official SQA Audit
                      </span>
                      <div className="text-2xl font-serif font-bold text-[#c93018] mt-1">
                        48.6 / 100
                      </div>
                      <span className="text-xs font-semibold text-[#c93018]">
                        Grade D (Bureaucratic Failure)
                      </span>
                      <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                        Penalized by the state for lacking science labs, computer rooms, and
                        specialist sports instructors.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border-2 border-[#246342]">
                      <span className="text-[10px] uppercase font-bold text-[#246342] tracking-wider block">
                        Grounded C-ARI Score
                      </span>
                      <div className="text-2xl font-serif font-bold text-[#246342] mt-1">
                        86.1 / 100
                      </div>
                      <span className="text-xs font-semibold text-[#246342]">
                        Heroic Attunement &amp; Care
                      </span>
                      <p className="text-[11px] text-[#615951] mt-1.5 leading-relaxed">
                        High relational proximity, genuine multi-grade pastoral care, and
                        life-saving daily caloric floor.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                        Ratio Theater Delta (Δ)
                      </span>
                      <div className="text-2xl font-mono font-bold text-[#246342] mt-1">
                        0.0 (True 14:1)
                      </div>
                      <span className="text-xs font-semibold text-[#1a1714]">
                        No Statistical Illusion
                      </span>
                      <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                        Individual child attunement probability:{' '}
                        <strong className="text-[#1a1714]">~7.1% – 15.0%</strong> per 40-minute
                        period.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                        SDS Shadow Treasury
                      </span>
                      <div className="text-2xl font-mono font-bold text-[#1a1714] mt-1">
                        Rs. 24,000
                      </div>
                      <span className="text-xs font-semibold text-[#73685e]">
                        0% Private Capital Inflow
                      </span>
                      <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                        Parents are daily tea plantation pluckers earning Rs. 1,000/day. No alumni
                        endowment exists.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#ebf5ef] p-4 rounded-xl text-xs sm:text-sm text-[#1e4d34] leading-relaxed">
                    <strong className="text-[#1a1714]">POSIWID Diagnostic:</strong> Despite official
                    SQA condemnation, this school is a thermodynamic sanctuary. The 3 teachers
                    notice when a child is feverish or hungry, feed them the state meal, and provide
                    human safety. The state audit measures what it values (bureaucratic artifacts),
                    but misses what sustains life.
                  </div>
                </div>
              )}
            </div>

            {/* 3. MULTI-AGENT STANDPOINT EPISTEMOLOGY MATRIX */}
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                    Standpoint Epistemology
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                    5-Way Systemic Standpoint Matrix
                  </h3>
                  <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-3xl">
                    Truth in complex human systems depends on where you stand. Select an actor to
                    experience their lived reality, operational anxiety, and metabolic expenditure:
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 bg-[#f5eee1] p-1.5 rounded-xl text-xs font-semibold">
                  {(['child', 'parent', 'teacher', 'tutor', 'bureaucrat'] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setCompassStandpoint(s)}
                      className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                        compassStandpoint === s
                          ? 'bg-[#1a1714] text-white shadow-xs'
                          : 'text-[#615951] hover:text-[#1a1714]'
                      }`}
                    >
                      {s === 'child' && '🧒 Child'}
                      {s === 'parent' && '👨‍👩‍👧 Parent'}
                      {s === 'teacher' && '👩‍🏫 Teacher'}
                      {s === 'tutor' && '🧑‍🏫 Tuition Master'}
                      {s === 'bureaucrat' && '🏛️ Bureaucrat'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#faf8f5] border border-[#ebdccb] p-6 rounded-2xl">
                {compassStandpoint === 'child' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🧒</span>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-[#1a1714]">
                          The Child: Somatic Strain, Hyper-Competition &amp; Play Scarcity
                        </h4>
                        <span className="text-xs font-mono text-[#a85022]">
                          Primary Recipient • Zero Systemic Voice
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#3d3833] leading-relaxed pt-2">
                      <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                        <strong className="text-[#1a1714] block mb-1">
                          Urban Student Lived Horizon:
                        </strong>
                        Wakes up at 4:45 AM for the cramped school van. Spends 6 hours in a
                        classroom of 48 under corrugated asbestos. Rushes to tuition until 8:30 PM.
                        Lives under chronic cortisol elevation, terrified of failing the Grade 5
                        Scholarship or O/L, with little time for spontaneous play or restorative
                        sleep.
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                        <strong className="text-[#1a1714] block mb-1">
                          Rural / Estate Student Lived Horizon:
                        </strong>
                        Walks 3–5 km on estate or village paths. Enters a multi-grade classroom
                        where 1 teacher handles Grades 2 and 3 simultaneously. Enjoys greater
                        emotional safety and teacher attunement, but experiences the humiliation of
                        lacking revision papers, English fluency, or shoes during inter-school
                        sports.
                      </div>
                    </div>
                  </div>
                )}

                {compassStandpoint === 'parent' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👨‍👩‍👧</span>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-[#1a1714]">
                          The Parent: Positional Panic, Debt &amp; Transgenerational Sacrifice
                        </h4>
                        <span className="text-xs font-mono text-[#a85022]">
                          Primary Underwriter • Economic Risk Bearer
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#3d3833] leading-relaxed pt-2">
                      <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                        <strong className="text-[#1a1714] block mb-1">
                          Urban / Suburban Middle-Class Parent:
                        </strong>
                        Spends 25% to 45% of total household take-home income on private tuition
                        fees, school development society (SDS) donations, and school transport.
                        Lives under intense social shame if their child falls out of the A/L Science
                        stream.
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                        <strong className="text-[#1a1714] block mb-1">
                          Rural / Agrarian / Estate Parent:
                        </strong>
                        Cannot afford tuition centers in town. Sacrifices gold jewelry or takes
                        microfinance loans at 36% APR to buy past papers and boarding fees during
                        the child&apos;s final A/L exam year, hoping the child will escape manual
                        labor.
                      </div>
                    </div>
                  </div>
                )}

                {compassStandpoint === 'teacher' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">👩‍🏫</span>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-[#1a1714]">
                          The Classroom Teacher: Syllabus Rush, Crowd Control &amp; Burnout
                        </h4>
                        <span className="text-xs font-mono text-[#a85022]">
                          Frontline Labor • Emotional Shock Absorber
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#3d3833] leading-relaxed pt-2">
                      <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                        <strong className="text-[#1a1714] block mb-1">
                          Urban School Teacher Dilemma:
                        </strong>
                        Faces 45–50 students in a 40-minute period (less than 50 seconds per child).
                        Must rush through the mandatory syllabus (
                        <span className="italic">Pādam Maḷāva</span>) to satisfy zonal inspectors,
                        knowing the children will learn the actual concepts in evening tuition
                        classes anyway.
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                        <strong className="text-[#1a1714] block mb-1">
                          Rural / Remote School Teacher Dilemma:
                        </strong>
                        Must teach subjects outside their training (e.g., an arts graduate teaching
                        primary mathematics and English). Suffers deep emotional exhaustion seeing
                        children arrive unfed and barefoot, spending personal salary to purchase
                        exercise books and pencils for destitute pupils.
                      </div>
                    </div>
                  </div>
                )}

                {compassStandpoint === 'tutor' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🧑‍🏫</span>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-[#1a1714]">
                          The Tuition Master / Mudalali: Industrial Monetization of State Deficit
                        </h4>
                        <span className="text-xs font-mono text-[#a85022]">
                          Parallel Commercial Machine • Market Monopolist
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#3d3833] leading-relaxed pt-2">
                      <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                        <strong className="text-[#1a1714] block mb-1">
                          Mega-Hall Commercial Architecture:
                        </strong>
                        Rents air-conditioned cinema-style auditoriums holding 1,500 to 3,000
                        students. Combines exam paper prediction, charismatic stage performance,
                        emotional motivation, and psychological monetization of parental fear.
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                        <strong className="text-[#1a1714] block mb-1">
                          Cybernetic Role in the System:
                        </strong>
                        Functions as the true curriculum engine of Sri Lanka. While the state MoE
                        issues guidelines, the tuition master decides which past-paper questions are
                        drilled, effectively controlling national student study behavior.
                      </div>
                    </div>
                  </div>
                )}

                {compassStandpoint === 'bureaucrat' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🏛️</span>
                      <div>
                        <h4 className="font-serif font-bold text-lg text-[#1a1714]">
                          The State Bureaucrat: Macro Auditing, Spreadsheets &amp; Circular Defense
                        </h4>
                        <span className="text-xs font-mono text-[#a85022]">
                          Isurupaya MoE • Administrative Optimizer
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#3d3833] leading-relaxed pt-2">
                      <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                        <strong className="text-[#1a1714] block mb-1">
                          Administrative Incentives:
                        </strong>
                        Optimizes for macro aggregate indicators: maintaining a nominal national
                        student-teacher ratio of 1:17, ensuring 100% textbook dispatch before
                        January, and printing national exam papers without leaks.
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                        <strong className="text-[#1a1714] block mb-1">
                          Institutional Blindspot:
                        </strong>
                        Completely blind to physical classroom room density and the emotional toll
                        on rural teachers. Measures success by the volume of completed circulars and
                        SQA audit forms filed, rather than the relational attunement of classrooms.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. THE LOGISTICS OF EDUCATION: TRUNK LINES & THE LAST MILE */}
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                  Logistics &amp; Distribution Architecture
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                  The Logistics of Education: Trunk Lines, Zonal Hubs &amp; The Last Mile
                </h3>
                <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-3xl">
                  Framing education as a physical logistics and freight problem reveals why
                  centralized solutions fail and exposes the fallacy of &quot;zero marginal
                  cost&quot; digital learning.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Tier 1: Trunk Lines */}
                <div className="bg-[#faf8f5] border border-[#ebdccb] p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                      Tier 1: Central Trunk
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1a1714]">
                      Isurupaya / NIE
                    </span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#1a1714]">
                    Centralized Trunk Lines
                  </h4>
                  <p className="text-xs text-[#615951] leading-relaxed">
                    National curriculum design, syllabi printing, textbook production, and national
                    O/L and A/L examinations.
                  </p>
                  <div className="pt-2 border-t border-[#ebdccb] text-[11px] text-[#73685e] space-y-1">
                    <div>
                      <strong>Marginal Cost:</strong> Near zero (bulk printing &amp; broadcasting).
                    </div>
                    <div>
                      <strong>Capability:</strong> Exceptional at standardization.
                    </div>
                    <div>
                      <strong>Failure Mode:</strong> Completely context-blind.
                    </div>
                  </div>
                </div>

                {/* Tier 2: Zonal Hubs */}
                <div className="bg-[#faf8f5] border border-[#ebdccb] p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                      Tier 2: Regional Relay
                    </span>
                    <span className="text-xs font-mono font-bold text-[#a85022]">
                      100 Zonal Offices
                    </span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#1a1714]">
                    Regional Distribution Hubs
                  </h4>
                  <p className="text-xs text-[#615951] leading-relaxed">
                    Teacher transfers, circular compliance, school inspections, distribution of
                    laboratory kits and sports equipment.
                  </p>
                  <div className="pt-2 border-t border-[#ebdccb] text-[11px] text-[#73685e] space-y-1">
                    <div>
                      <strong>Marginal Cost:</strong> High bureaucratic friction &amp; paper
                      latency.
                    </div>
                    <div>
                      <strong>Capability:</strong> Regional administrative oversight.
                    </div>
                    <div>
                      <strong>Failure Mode:</strong> Patronage, delayed transfers, paper audits.
                    </div>
                  </div>
                </div>

                {/* Tier 3: The Last Mile */}
                <div className="bg-[#fbf7f0] border-2 border-[#a85022] p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#a85022] tracking-wider">
                      Tier 3: The Edge
                    </span>
                    <span className="text-xs font-mono font-bold text-[#a85022]">
                      9,962 Schools
                    </span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#1a1714]">
                    The Human Last Mile
                  </h4>
                  <p className="text-xs text-[#615951] leading-relaxed">
                    215,000 classrooms where a teacher looks a child in the eye, serves a meal, and
                    co-regulates emotion.
                  </p>
                  <div className="pt-2 border-t border-[#ebdccb] text-[11px] text-[#73685e] space-y-1">
                    <div>
                      <strong>Marginal Cost:</strong> High metabolic &amp; somatic labor.
                    </div>
                    <div>
                      <strong>Capability:</strong> True human development &amp; pastoral care.
                    </div>
                    <div>
                      <strong>Failure Mode:</strong> Cannot be compressed or automated.
                    </div>
                  </div>
                </div>
              </div>

              {/* The AI Fallacy Callout */}
              <div className="bg-[#fff9f5] border border-[#f5c7c2] p-5 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#c93018] uppercase tracking-wider">
                    The Convivial Limit:
                  </span>
                  <span className="text-xs font-serif font-bold text-[#1a1714]">
                    Why Generative AI Cannot Solve the Last Mile
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#403933] leading-relaxed">
                  Techno-solutionists claim generative AI offers &quot;zero marginal cost personal
                  tutors&quot; for every child. This confuses <em>information reproduction</em> with{' '}
                  <em>human education</em>. Education is not data retrieval; it is somatic presence,
                  relational co-regulation, and biological nurture. An LLM cannot feed a hungry
                  child in Nuwara Eliya, notice silent despair, or hold a classroom in loving
                  stillness. AI can augment the teacher&apos;s administrative burden (exoskeleton),
                  but it can never replace the human holding environment of the last mile.
                </p>
              </div>
            </div>

            {/* 5. THE RED QUEEN CREDENTIAL LADDER */}
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                  Historical Trajectory
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                  The Red Queen Credential Escalation Ladder (1960–2026)
                </h3>
                <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-3xl">
                  Tracing how the positional value of educational credentials has decayed over six
                  decades of hyper-credentialism:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#ebdccb]">
                  <span className="text-xs font-mono font-bold text-[#73685e] block">
                    1960s • Post-Independence
                  </span>
                  <div className="text-lg font-serif font-bold text-[#1a1714] mt-1">
                    Grade 5 / O-Level
                  </div>
                  <p className="text-xs text-[#615951] mt-2 leading-relaxed">
                    Passing the O-Level or Grade 5 Scholarship guaranteed a permanent government
                    clerical job or village teacher post. Credential was a scarce, high-yield ticket
                    to the middle class.
                  </p>
                </div>

                <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#ebdccb]">
                  <span className="text-xs font-mono font-bold text-[#73685e] block">
                    1980s • Open Economy
                  </span>
                  <div className="text-lg font-serif font-bold text-[#1a1714] mt-1">
                    A-Level &amp; State Degree
                  </div>
                  <p className="text-xs text-[#615951] mt-2 leading-relaxed">
                    O-Level became table stakes. A-Level pass required for bank clerk posts; state
                    university degree guaranteed rapid promotion into civil service or corporate
                    management.
                  </p>
                </div>

                <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#ebdccb]">
                  <span className="text-xs font-mono font-bold text-[#73685e] block">
                    2000s • IT &amp; Private TNE
                  </span>
                  <div className="text-lg font-serif font-bold text-[#1a1714] mt-1">
                    Degree + CIMA / SLIIT
                  </div>
                  <p className="text-xs text-[#615951] mt-2 leading-relaxed">
                    State degree diluted. Professional accounting (CIMA/ACCA), private IT degrees,
                    and English fluency (<span className="italic">Kaduwa</span>) became mandatory to
                    avoid unemployment.
                  </p>
                </div>

                <div className="bg-[#fbf7f0] p-5 rounded-xl border-2 border-[#a85022]">
                  <span className="text-xs font-mono font-bold text-[#a85022] block">
                    2026 • Hyper-Inflation
                  </span>
                  <div className="text-lg font-serif font-bold text-[#a85022] mt-1">
                    Master&apos;s + Global Portfolio
                  </div>
                  <p className="text-xs text-[#615951] mt-2 leading-relaxed">
                    First degrees are universal hygiene factors. Entry into elite jobs requires
                    foreign credentials, AI certifications, and social capital. O/L and A/L are
                    merely screening filters.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. WHATSAPP BOT & OMNICHANNEL EXOSKELETON CALLOUT */}
            <div className="bg-[#1a1714] text-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-widest font-bold text-[#f5eee1] bg-[#332b24] px-2.5 py-0.5 rounded-full border border-[#4d4036]">
                      Omnichannel Edge Gateway
                    </span>
                    <span className="text-xs text-[#a85022] font-mono">Meta Cloud API v21.0</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    EdLove WhatsApp Ground Truth Bot &amp; Teacher Exoskeleton
                  </h3>
                  <p className="text-xs sm:text-sm text-[#b8ada2] mt-1 max-w-2xl leading-relaxed">
                    Bridging the digital divide by bringing the 9,962-school Education Atlas
                    directly to WhatsApp—the only zero-friction platform with 100% household
                    penetration in Sri Lanka.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <div className="bg-[#2c241e] border border-[#4d4036] p-3 rounded-xl text-center">
                    <span className="text-[10px] text-[#b8ada2] uppercase tracking-wider block">
                      Terminal Simulator
                    </span>
                    <span className="text-xs font-mono font-bold text-[#f5eee1]">
                      whatsapp-simulator.mjs
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#241f1a] border border-[#3d332a] p-4 rounded-xl">
                  <span className="text-xs font-bold text-[#f5eee1] flex items-center gap-1.5 mb-1">
                    <span>📱</span> Civic School Ground Truth Bot (Parents)
                  </span>
                  <p className="text-xs text-[#b8ada2] leading-relaxed">
                    Send{' '}
                    <code className="text-[#f5eee1] bg-[#1a1714] px-1.5 py-0.5 rounded font-mono">
                      Dharmapala
                    </code>{' '}
                    or{' '}
                    <code className="text-[#f5eee1] bg-[#1a1714] px-1.5 py-0.5 rounded font-mono">
                      01002
                    </code>{' '}
                    to WhatsApp. Receive an instant C-ARI score card, real classroom density (48:1),
                    Ratio Theater Delta, and shadow tuition breakdown at zero data cost.
                  </p>
                </div>

                <div className="bg-[#241f1a] border border-[#3d332a] p-4 rounded-xl">
                  <span className="text-xs font-bold text-[#f5eee1] flex items-center gap-1.5 mb-1">
                    <span>🎙️</span> Voice-to-Ledger Exoskeleton (Teachers)
                  </span>
                  <p className="text-xs text-[#b8ada2] leading-relaxed">
                    Teacher sends a 30-second voice note in Sinhala or Tamil. Whisper/Gemini
                    extracts structured JSON, auto-populating the daily lesson record (
                    <span className="italic">Pādam Satahana</span>) and attendance without touching
                    a browser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 12: SPATIAL CARTOGRAPHY ================= */}
        {activeTab === 'spatial' && (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                      Multi-Scale Spatial Cartography
                    </span>
                    <span className="text-xs text-[#824112] font-mono bg-[#f5eee1] px-2 py-0.5 rounded border border-[#e8dbca]">
                      Holonic Geography
                    </span>
                    <span className="text-xs text-[#246342] font-mono bg-[#ebf5ef] px-2 py-0.5 rounded border border-[#c3e3cf]">
                      9,960 Coordinate Substrate
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1714]">
                    Spatial Cartography: Global Paradigms &amp; National Ground Truth
                  </h2>
                  <p className="text-sm text-[#615951] mt-2 leading-relaxed">
                    Navigating education across nested spatial scales: from comparative planetary
                    systems (EdLove Foundation) down to Sri Lanka&apos;s 25 administrative
                    districts, 100 zonal distribution hubs, and 9,960 physical classroom gates.
                  </p>
                </div>

                {/* Scale Lens Switcher */}
                <div className="shrink-0 flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                    Holonic Scale Lens
                  </span>
                  <div className="flex flex-wrap gap-1.5 bg-[#f5eee1] p-1.5 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSpatialScaleLens('global')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        spatialScaleLens === 'global'
                          ? 'bg-[#1a1714] text-white shadow-xs'
                          : 'text-[#615951] hover:text-[#1a1714]'
                      }`}
                    >
                      🌍 Global (Scale 0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpatialScaleLens('national')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        spatialScaleLens === 'national'
                          ? 'bg-[#1a1714] text-white shadow-xs'
                          : 'text-[#615951] hover:text-[#1a1714]'
                      }`}
                    >
                      🇱🇰 National (Scale 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpatialScaleLens('zonal')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        spatialScaleLens === 'zonal'
                          ? 'bg-[#1a1714] text-white shadow-xs'
                          : 'text-[#615951] hover:text-[#1a1714]'
                      }`}
                    >
                      📍 Zonal &amp; Local (Scale 2–3)
                    </button>
                  </div>
                </div>
              </div>

              {/* Metric Filter Bar for National & Zonal views */}
              {spatialScaleLens !== 'global' && (
                <div className="mt-6 pt-6 border-t border-[#f0e7d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#73685e]">Spatial Metric Gradient:</span>
                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setSpatialMetricView('delta')}
                      className={`px-3 py-1 rounded-lg border transition-all ${
                        spatialMetricView === 'delta'
                          ? 'bg-[#c93018] text-white border-[#c93018] font-bold'
                          : 'bg-[#faf8f5] text-[#615951] border-[#ebdccb] hover:text-[#1a1714]'
                      }`}
                    >
                      ⚠️ Ratio Theater Delta (Δ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpatialMetricView('cari')}
                      className={`px-3 py-1 rounded-lg border transition-all ${
                        spatialMetricView === 'cari'
                          ? 'bg-[#246342] text-white border-[#246342] font-bold'
                          : 'bg-[#faf8f5] text-[#615951] border-[#ebdccb] hover:text-[#1a1714]'
                      }`}
                    >
                      💡 Grounded C-ARI Score
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpatialMetricView('meal')}
                      className={`px-3 py-1 rounded-lg border transition-all ${
                        spatialMetricView === 'meal'
                          ? 'bg-[#824112] text-white border-[#824112] font-bold'
                          : 'bg-[#faf8f5] text-[#615951] border-[#ebdccb] hover:text-[#1a1714]'
                      }`}
                    >
                      🍲 Free Midday Meal Floor
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpatialMetricView('tuition')}
                      className={`px-3 py-1 rounded-lg border transition-all ${
                        spatialMetricView === 'tuition'
                          ? 'bg-[#a85022] text-white border-[#a85022] font-bold'
                          : 'bg-[#faf8f5] text-[#615951] border-[#ebdccb] hover:text-[#1a1714]'
                      }`}
                    >
                      💰 Shadow Tuition Burden
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ================= SCALE 0: GLOBAL COMPARATIVE ATLAS ================= */}
            {spatialScaleLens === 'global' && (
              <div className="space-y-6">
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                        Scale 0 • Planetary Atlas (EdLove Foundation)
                      </span>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                        Comparative Planetary Educational Systems
                      </h3>
                      <p className="text-xs sm:text-sm text-[#615951] mt-1">
                        Auditing public educational investment, shadow education penetration, and
                        foundational paradigms across 10 global systems:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {GLOBAL_COMPARATIVE_SYSTEMS.map((c) => (
                      <div
                        key={c.isoCode}
                        className={`p-5 rounded-xl border transition-all ${
                          c.isoCode === 'LKA'
                            ? 'bg-[#fbf7f0] border-2 border-[#a85022] shadow-xs'
                            : 'bg-[#faf8f5] border-[#ebdccb]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-[#a85022]">
                            {c.isoCode}
                          </span>
                          <span className="text-[10px] bg-white text-[#73685e] px-2 py-0.5 rounded border border-[#e5dec9] font-semibold">
                            {c.region}
                          </span>
                        </div>
                        <h4 className="text-base font-serif font-bold text-[#1a1714] mt-1">
                          {c.name}
                        </h4>

                        <div className="mt-3 pt-3 border-t border-[#e8dbca] space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#73685e]">Public Spend (% GDP):</span>
                            <strong
                              className={
                                c.publicEducationSpendPctGdp < 2.5
                                  ? 'text-[#c93018]'
                                  : 'text-[#246342]'
                              }
                            >
                              {c.publicEducationSpendPctGdp}%
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#73685e]">Shadow Tuition Penetration:</span>
                            <strong
                              className={
                                c.shadowEducationPrevalencePct > 60
                                  ? 'text-[#c93018]'
                                  : 'text-[#246342]'
                              }
                            >
                              {c.shadowEducationPrevalencePct}%
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#73685e]">Primary Nominal STR:</span>
                            <strong className="text-[#1a1714]">1:{c.primarySchoolStr}</strong>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#e8dbca] text-[11px] text-[#615951] leading-relaxed">
                          <strong className="text-[#1a1714] block">Epistemic Paradigm:</strong>
                          {c.epistemicParadigm}
                        </div>

                        <div className="mt-2 text-[10px] text-[#73685e]">
                          <span className="font-bold text-[#1a1714]">Key Architectures: </span>
                          {c.notablePlatforms.join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#f0e7d8] p-4 rounded-xl text-xs sm:text-sm text-[#403933] leading-relaxed mt-4">
                    <strong className="text-[#1a1714]">Planetary Diagnostic:</strong> Sri Lanka is
                    unique globally. With state educational expenditure at just{' '}
                    <strong className="text-[#c93018]">1.8% of GDP</strong> (comparable to Pakistan
                    at 1.7%), it sustains East Asian-level shadow tuition dependency (
                    <strong className="text-[#c93018]">82.4%</strong>, comparable to South Korea at
                    78.3%). Families privately bridge the state fiscal deficit, creating intense
                    positional burnout.
                  </div>
                </div>
              </div>
            )}

            {/* ================= SCALE 1: NATIONAL SOVEREIGN ATLAS (SRI LANKA 25 DISTRICTS) ================= */}
            {spatialScaleLens === 'national' && (
              <div className="space-y-6">
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                        Scale 1 • National Sovereign Atlas (Sri Lanka)
                      </span>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                        25-District Spatial Choropleth Matrix
                      </h3>
                      <p className="text-xs sm:text-sm text-[#615951] mt-1">
                        Click any district to view its grounded educational scorecard, then drill
                        down into zonal clusters and school gates:
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-[#73685e]">Selected:</span>
                      <strong className="text-[#a85022]">
                        {SRI_LANKA_DISTRICTS.find((d) => d.code === selectedSpatialDistrict)
                          ?.name || 'Colombo'}
                      </strong>
                    </div>
                  </div>

                  {/* 25-District Vector Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {SRI_LANKA_DISTRICTS.map((d) => {
                      const isSelected = selectedSpatialDistrict === d.code;
                      let metricValueText = '';
                      let badgeColor = 'text-[#1a1714]';

                      if (spatialMetricView === 'delta') {
                        metricValueText = `Δ +${d.avgRatioTheaterDelta.toFixed(1)}`;
                        badgeColor =
                          d.avgRatioTheaterDelta > 20
                            ? 'text-[#c93018] font-bold'
                            : d.avgRatioTheaterDelta < 5
                              ? 'text-[#246342]'
                              : 'text-[#824112]';
                      } else if (spatialMetricView === 'cari') {
                        metricValueText = `C-ARI ${d.avgCariScore.toFixed(1)}`;
                        badgeColor =
                          d.avgCariScore > 75 ? 'text-[#246342] font-bold' : 'text-[#a85022]';
                      } else if (spatialMetricView === 'meal') {
                        metricValueText = `${d.middayMealCoveragePct}% Meal`;
                        badgeColor =
                          d.middayMealCoveragePct > 70
                            ? 'text-[#246342] font-bold'
                            : 'text-[#73685e]';
                      } else if (spatialMetricView === 'tuition') {
                        metricValueText = `Rs. ${(d.shadowTuitionMonthlyPerChildLkr / 1000).toFixed(0)}k/mo`;
                        badgeColor =
                          d.shadowTuitionMonthlyPerChildLkr > 20000
                            ? 'text-[#c93018] font-bold'
                            : 'text-[#246342]';
                      }

                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => setSelectedSpatialDistrict(d.code)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#1a1714] text-white border-[#1a1714] shadow-sm scale-[1.02]'
                              : 'bg-[#faf8f5] hover:bg-[#f5eee1] border-[#ebdccb] text-[#1a1714]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                              <span>{d.code}</span>
                              <span>{d.provinceName.substring(0, 4)}</span>
                            </div>
                            <span className="font-serif font-bold text-sm block mt-1 truncate">
                              {d.name}
                            </span>
                          </div>
                          <div className="mt-3 pt-2 border-t border-current/20 flex items-center justify-between text-[11px]">
                            <span className="opacity-70">{d.totalSchools} sch</span>
                            <span className={isSelected ? 'text-[#f5eee1] font-bold' : badgeColor}>
                              {metricValueText}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active District Focus Dossier Card */}
                  {(() => {
                    const activeDistrict =
                      SRI_LANKA_DISTRICTS.find((d) => d.code === selectedSpatialDistrict) ||
                      SRI_LANKA_DISTRICTS[0];
                    if (!activeDistrict) return null;

                    return (
                      <div className="bg-[#faf8f5] border-2 border-[#a85022] p-6 rounded-2xl space-y-5 shadow-xs">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#ebdccb] pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#a85022]">
                                {activeDistrict.id} ({activeDistrict.code})
                              </span>
                              <span className="text-xs bg-[#ebdccb] text-[#1a1714] px-2 py-0.5 rounded font-semibold">
                                {activeDistrict.provinceName} Province
                              </span>
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-[#1a1714] mt-1">
                              {activeDistrict.name} ({activeDistrict.nameSi})
                            </h4>
                            <p className="text-xs text-[#73685e] mt-0.5">
                              Centroid: {activeDistrict.centroid.lat.toFixed(4)}° N,{' '}
                              {activeDistrict.centroid.lng.toFixed(4)}° E • Total Enrollment:{' '}
                              {activeDistrict.totalStudents.toLocaleString()} students across{' '}
                              {activeDistrict.totalSchools} schools
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSpatialScaleLens('zonal')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#a85022] hover:bg-[#8f3e15] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                          >
                            <span>Drill Down to Zonal &amp; School Pins</span>
                            <span>→</span>
                          </button>
                        </div>

                        {/* Comparative Diagnostic Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-[#ebdccb]">
                            <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                              Ratio Theater Delta (Δ)
                            </span>
                            <div className="text-2xl font-mono font-bold text-[#c93018] mt-1">
                              +{activeDistrict.avgRatioTheaterDelta.toFixed(1)}
                            </div>
                            <span className="text-[11px] text-[#73685e] block mt-0.5">
                              Nominal 1:{activeDistrict.avgOfficialStr.toFixed(1)} vs{' '}
                              {activeDistrict.avgRoomDensity.toFixed(0)}:1 Room
                            </span>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-[#ebdccb]">
                            <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                              Grounded C-ARI Score
                            </span>
                            <div className="text-2xl font-serif font-bold text-[#246342] mt-1">
                              {activeDistrict.avgCariScore.toFixed(1)} / 100
                            </div>
                            <span className="text-[11px] text-[#73685e] block mt-0.5">
                              Relational attunement index
                            </span>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-[#ebdccb]">
                            <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                              Est. Shadow Tuition
                            </span>
                            <div className="text-2xl font-mono font-bold text-[#a85022] mt-1">
                              Rs. {activeDistrict.shadowTuitionMonthlyPerChildLkr.toLocaleString()}
                            </div>
                            <span className="text-[11px] text-[#73685e] block mt-0.5">
                              Per child out-of-pocket / mo
                            </span>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-[#ebdccb]">
                            <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                              Midday Meal Coverage
                            </span>
                            <div className="text-2xl font-serif font-bold text-[#1a1714] mt-1">
                              {activeDistrict.middayMealCoveragePct.toFixed(0)}%
                            </div>
                            <span className="text-[11px] text-[#73685e] block mt-0.5">
                              Primary caloric safety net
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ================= SCALE 2 & 3: ZONAL & LOCAL SCHOOL PINS ================= */}
            {spatialScaleLens === 'zonal' && (
              <div className="space-y-6">
                <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                        Scale 2 &amp; 3 • Zonal Logistics &amp; School Gate Coordinates
                      </span>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                        School Gate GPS &amp; Coordinate Precision Substrate
                      </h3>
                      <p className="text-xs sm:text-sm text-[#615951] mt-1">
                        Viewing schools in{' '}
                        <strong className="text-[#1a1714]">
                          {
                            SRI_LANKA_DISTRICTS.find((d) => d.code === selectedSpatialDistrict)
                              ?.name
                          }{' '}
                          District
                        </strong>
                        . Every pin displays physical GPS coordinates and ground-truth verification
                        status:
                      </p>
                    </div>

                    {/* District Selector Switcher */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="spatial-district-selector"
                        className="text-xs font-semibold text-[#73685e]"
                      >
                        District:
                      </label>
                      <select
                        id="spatial-district-selector"
                        value={selectedSpatialDistrict}
                        onChange={(e) => setSelectedSpatialDistrict(e.target.value)}
                        className="bg-[#faf8f5] border border-[#ebdccb] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1a1714]"
                      >
                        {SRI_LANKA_DISTRICTS.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.name} ({d.totalSchools} schools)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Citizen-Sensor Ground-Truth Gate Ping Protocol Callout */}
                  <div className="bg-[#fbf7f0] border border-[#e8dbca] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <strong className="text-[#1a1714] block">
                        Sovereign Coordinate Precision Hierarchy:
                      </strong>
                      <span className="text-[#615951]">
                        <span className="text-[#246342] font-bold">✅ Surveyed Gate GPS:</span>{' '}
                        Hardware sensor verified at physical school entrance. •{' '}
                        <span className="text-[#c93018] font-bold">
                          ⚠️ Tentative Village Centroid:
                        </span>{' '}
                        Unverified census postal coordinate.
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#a85022] bg-white px-2.5 py-1 rounded border border-[#ebdccb] shrink-0">
                      POST /api/atlas (verify-location)
                    </span>
                  </div>

                  {/* School Pins Directory */}
                  {spatialLoading ? (
                    <div className="py-12 text-center text-[#73685e]">
                      <div className="inline-block animate-spin w-6 h-6 border-2 border-[#a85022] border-t-transparent rounded-full mb-2"></div>
                      <p className="text-xs font-mono">
                        Querying spatial coordinates for {selectedSpatialDistrict}...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#73685e] px-1">
                        <span>Showing {spatialSchools.length} schools in this district</span>
                        <span className="font-mono">
                          Substrate: atlas_staging.db (9,960 GPS records)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {spatialSchools.map((s) => {
                          const isVerified = s.coord_precision === 'ground_truthed';

                          return (
                            <div
                              key={s.census_no}
                              className="bg-[#faf8f5] border border-[#ebdccb] p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-[#a85022] transition-colors"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-mono font-bold text-[#a85022]">
                                    #{s.census_no}
                                  </span>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                      isVerified
                                        ? 'bg-[#ebf5ef] text-[#246342]'
                                        : 'bg-[#fbeeed] text-[#c93018]'
                                    }`}
                                  >
                                    {isVerified ? '✅ Surveyed Gate' : '⚠️ Tentative Centroid'}
                                  </span>
                                </div>

                                <h5 className="font-serif font-bold text-sm text-[#1a1714] mt-1.5 leading-snug">
                                  {s.name}
                                </h5>
                                {s.name_si && (
                                  <span className="text-xs text-[#73685e] block mt-0.5">
                                    {s.name_si}
                                  </span>
                                )}

                                <div className="mt-2 text-[11px] text-[#615951] space-y-0.5">
                                  <div>
                                    Category:{' '}
                                    <strong className="text-[#1a1714]">
                                      {s.category} ({s.type})
                                    </strong>
                                  </div>
                                  <div>
                                    Enrollment:{' '}
                                    <strong className="text-[#1a1714]">
                                      {(s.total_students || 350).toLocaleString()} students
                                    </strong>
                                  </div>
                                  <div className="font-mono text-[10px] text-[#73685e]">
                                    GPS: {Number(s.latitude).toFixed(4)}° N,{' '}
                                    {Number(s.longitude).toFixed(4)}° E
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-[#ebdccb] flex items-center justify-between">
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-[#73685e] hover:text-[#1a1714] flex items-center gap-1 font-mono"
                                >
                                  <span>Pin</span>
                                  <span>↗</span>
                                </a>

                                <Link
                                  href={`/atlas/school/${s.census_no}`}
                                  className="text-xs font-bold text-[#a85022] hover:underline flex items-center gap-1"
                                >
                                  <span>View Dossier</span>
                                  <span>→</span>
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
