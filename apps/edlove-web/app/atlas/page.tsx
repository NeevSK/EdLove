'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { AtlasCharitiesTab } from './_components/AtlasCharitiesTab';
import { AtlasCompassTab } from './_components/AtlasCompassTab';
import { AtlasCompetitionsTab } from './_components/AtlasCompetitionsTab';
import { AtlasEdTechTab } from './_components/AtlasEdTechTab';
import { AtlasFinanceTab } from './_components/AtlasFinanceTab';
import { AtlasMeshTab } from './_components/AtlasMeshTab';
import { AtlasMovementsTab } from './_components/AtlasMovementsTab';
import { AtlasResearchTab } from './_components/AtlasResearchTab';
import { AtlasSpatialTab } from './_components/AtlasSpatialTab';
import { AtlasSqaTab } from './_components/AtlasSqaTab';
import { AtlasTertiaryTab } from './_components/AtlasTertiaryTab';
import { AtlasUgcTab } from './_components/AtlasUgcTab';
import { ExternalPortalLink } from './_components/ExternalPortalLink';
import type {
  BudgetProfile,
  CampusFacility,
  CoCurricularMovement,
  DhammaSchoolNetwork,
  DistributionStats,
  EdTechItem,
  EducationCharity,
  GovernmentBudget,
  HigherEdScholarshipItem,
  MovementsSummary,
  NationalCompetition,
  NvqLevel,
  ResearchMonograph,
  SchoolItem,
  SchoolResourceProfile,
  SqaIndicator,
  TertiaryInstitution,
  TertiaryProgram,
  TneDegreeFunnelItem,
  TransitionPathway,
  UgcCutoff,
  UgcProgram,
  UniversityLeader,
} from './_types/atlas.types';

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
          <AtlasMeshTab
            stats={stats}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            schools={schools}
            schoolsCount={schoolsCount}
            loading={loading}
          />
        )}

        {/* ================= TAB 2: PUBLIC FINANCE & SDS TREASURY ================= */}
        {activeTab === 'finance' && (
          <AtlasFinanceTab
            financeSubTab={financeSubTab}
            setFinanceSubTab={setFinanceSubTab}
            govTierFilter={govTierFilter}
            setGovTierFilter={setGovTierFilter}
            budgets={budgets}
            govBudgets={govBudgets}
          />
        )}

        {/* ================= TAB: CHARITIES, NGOS & FOUNDATIONS ================= */}
        {activeTab === 'charities' && (
          <AtlasCharitiesTab
            charitiesList={charitiesList}
            charityTypeFilter={charityTypeFilter}
            setCharityTypeFilter={setCharityTypeFilter}
            charityFocusFilter={charityFocusFilter}
            setCharityFocusFilter={setCharityFocusFilter}
            charitySearch={charitySearch}
            setCharitySearch={setCharitySearch}
          />
        )}

        {/* ================= TAB: COMPETITIONS, DERBIES & AESTHETICS ================= */}
        {activeTab === 'competitions' && (
          <AtlasCompetitionsTab
            competitionsList={competitionsList}
            compCategoryFilter={compCategoryFilter}
            setCompCategoryFilter={setCompCategoryFilter}
            compSearch={compSearch}
            setCompSearch={setCompSearch}
          />
        )}

        {/* ================= TAB 3: EDTECH & PEDAGOGY CATALOG ================= */}
        {activeTab === 'edtech' && <AtlasEdTechTab edtechList={edtechList} />}

        {/* ================= TAB 4: SQA 52-INDICATOR MATRIX ================= */}
        {activeTab === 'sqa' && <AtlasSqaTab sqaList={sqaList} />}

        {/* ================= TAB 5: RESEARCH MONOGRAPHS ================= */}
        {activeTab === 'research' && <AtlasResearchTab researchList={researchList} />}

        {/* ================= TAB 6: UGC UNIVERSITY ADMISSIONS & Z-SCORES ================= */}
        {activeTab === 'ugc' && (
          <AtlasUgcTab
            ugcPrograms={ugcPrograms}
            ugcCutoffs={ugcCutoffs}
            selectedUgcProgram={selectedUgcProgram}
            setSelectedUgcProgram={setSelectedUgcProgram}
            simZScore={simZScore}
            setSimZScore={setSimZScore}
            simDistrict={simDistrict}
            setSimDistrict={setSimDistrict}
          />
        )}

        {/* ================= TAB 7: HIGHER EDUCATION & VOCATIONAL MESH ================= */}
        {activeTab === 'tertiary' && (
          <AtlasTertiaryTab
            tertiarySubTab={tertiarySubTab}
            setTertiarySubTab={setTertiarySubTab}
            tertiaryInstitutions={tertiaryInstitutions}
            tertiaryPrograms={tertiaryPrograms}
            nvqFramework={nvqFramework}
            pathways={pathways}
            selectedInstType={selectedInstType}
            setSelectedInstType={setSelectedInstType}
            instSearch={instSearch}
            setInstSearch={setInstSearch}
            selectedCohort={selectedCohort}
            setSelectedCohort={setSelectedCohort}
            selectedStream={selectedStream}
            setSelectedStream={setSelectedStream}
            selectedNvqStep={selectedNvqStep}
            setSelectedNvqStep={setSelectedNvqStep}
            tneFunnels={tneFunnels}
            scholarships={scholarships}
            facilities={facilities}
            leadership={leadership}
            tneModelFilter={tneModelFilter}
            setTneModelFilter={setTneModelFilter}
            tneCountryFilter={tneCountryFilter}
            setTneCountryFilter={setTneCountryFilter}
            schLevelFilter={schLevelFilter}
            setSchLevelFilter={setSchLevelFilter}
            schTierFilter={schTierFilter}
            setSchTierFilter={setSchTierFilter}
          />
        )}

        {/* ================= TAB 10: CIVIC MOVEMENTS, DAHAM PASAL & RESOURCE DISPARITIES ================= */}
        {activeTab === 'movements' && (
          <AtlasMovementsTab
            movementsSubTab={movementsSubTab}
            setMovementsSubTab={setMovementsSubTab}
            movementsList={movementsList}
            dhammaList={dhammaList}
            movementsSummary={movementsSummary}
            movementTypeFilter={movementTypeFilter}
            setMovementTypeFilter={setMovementTypeFilter}
            dhammaFaithFilter={dhammaFaithFilter}
            setDhammaFaithFilter={setDhammaFaithFilter}
            movementsSearch={movementsSearch}
            setMovementsSearch={setMovementsSearch}
            resourceProfiles={resourceProfiles}
            distributionStats={distributionStats}
            sportsTierFilter={sportsTierFilter}
            setSportsTierFilter={setSportsTierFilter}
            waterSourceFilter={waterSourceFilter}
            setWaterSourceFilter={setWaterSourceFilter}
            scienceCapableFilter={scienceCapableFilter}
            setScienceCapableFilter={setScienceCapableFilter}
            poolFilter={poolFilter}
            setPoolFilter={setPoolFilter}
            aestheticStatusFilter={aestheticStatusFilter}
            setAestheticStatusFilter={setAestheticStatusFilter}
            disparitySearch={disparitySearch}
            setDisparitySearch={setDisparitySearch}
          />
        )}

        {/* ================= TAB 11: SYSTEMANTICS & RELATIONAL COMPASS ================= */}
        {activeTab === 'compass' && (
          <AtlasCompassTab
            compassStandpoint={compassStandpoint}
            setCompassStandpoint={setCompassStandpoint}
            compassArchetype={compassArchetype}
            setCompassArchetype={setCompassArchetype}
          />
        )}

        {/* ================= TAB 12: SPATIAL CARTOGRAPHY ================= */}
        {activeTab === 'spatial' && (
          <AtlasSpatialTab
            spatialScaleLens={spatialScaleLens}
            setSpatialScaleLens={setSpatialScaleLens}
            selectedSpatialDistrict={selectedSpatialDistrict}
            setSelectedSpatialDistrict={setSelectedSpatialDistrict}
            spatialMetricView={spatialMetricView}
            setSpatialMetricView={setSpatialMetricView}
            spatialSchools={spatialSchools}
            spatialLoading={spatialLoading}
          />
        )}
      </main>
    </div>
  );
}
