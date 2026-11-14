'use client';

import React from 'react';
import type {
  CampusFacility,
  HigherEdScholarshipItem,
  NvqLevel,
  TertiaryInstitution,
  TertiaryProgram,
  TneDegreeFunnelItem,
  TransitionPathway,
  UniversityLeader,
} from '../_types/atlas.types';
import { AtlasTertiaryFacilitiesSection } from './AtlasTertiaryFacilitiesSection';
import { AtlasTertiaryOverviewSection } from './AtlasTertiaryOverviewSection';
import { AtlasTertiaryScholarshipsSection } from './AtlasTertiaryScholarshipsSection';
import { AtlasTertiaryTneSection } from './AtlasTertiaryTneSection';

export interface AtlasTertiaryTabProps {
  tertiarySubTab: 'overview' | 'tne' | 'scholarships' | 'facilities';
  setTertiarySubTab: (subTab: 'overview' | 'tne' | 'scholarships' | 'facilities') => void;
  tertiaryInstitutions: TertiaryInstitution[];
  tertiaryPrograms: TertiaryProgram[];
  nvqFramework: NvqLevel[];
  pathways: TransitionPathway[];
  selectedInstType: string;
  setSelectedInstType: (type: string) => void;
  instSearch: string;
  setInstSearch: (search: string) => void;
  selectedCohort: string;
  setSelectedCohort: (cohort: string) => void;
  selectedStream: string;
  setSelectedStream: (stream: string) => void;
  selectedNvqStep: number | null;
  setSelectedNvqStep: (step: number | null) => void;
  tneFunnels: TneDegreeFunnelItem[];
  scholarships: HigherEdScholarshipItem[];
  facilities: CampusFacility[];
  leadership: UniversityLeader[];
  tneModelFilter: string;
  setTneModelFilter: (filter: string) => void;
  tneCountryFilter: string;
  setTneCountryFilter: (filter: string) => void;
  schLevelFilter: string;
  setSchLevelFilter: (filter: string) => void;
  schTierFilter: string;
  setSchTierFilter: (filter: string) => void;
}

export function AtlasTertiaryTab({
  tertiarySubTab,
  setTertiarySubTab,
  tertiaryInstitutions,
  tertiaryPrograms,
  nvqFramework,
  pathways,
  selectedInstType,
  setSelectedInstType,
  instSearch,
  setInstSearch,
  selectedCohort,
  setSelectedCohort,
  selectedStream,
  setSelectedStream,
  selectedNvqStep,
  setSelectedNvqStep,
  tneFunnels,
  scholarships,
  facilities,
  leadership,
  tneModelFilter,
  setTneModelFilter,
  tneCountryFilter,
  setTneCountryFilter,
  schLevelFilter,
  setSchLevelFilter,
  schTierFilter,
  setSchTierFilter,
}: AtlasTertiaryTabProps) {
  return (
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
              Out of ~170,000 students qualifying in G.C.E. A/Levels annually, only ~42,000 secure
              UGC State University intake. Over 128,000 qualified youth are left to navigate
              tertiary alternatives. This sovereign mesh connects state ATIs, TVEC NVQ ladders,
              technical colleges, and chartered guilds.
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
              100% state-funded tuition + Mahapola bursary (Rs. 5,000/mo). Zero student debt upon
              graduation, but strictly capped by annual intake limits (~42,000 UGC + ~12,000
              SLIATE).
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
              Primary rural mobility engine. Minimal upfront examination fees while students earn
              allowances during mandatory 3-year article clerkships. Fast-tracks directly into
              corporate management.
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
              Degrees recognized under Ministry of Higher Education Act Sec 25A. Absorbs ~35,000
              students via private payment or the Ministry Interest-Free Student Loan Scheme
              (IFSLS).
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
        <AtlasTertiaryOverviewSection
          selectedCohort={selectedCohort}
          setSelectedCohort={setSelectedCohort}
          selectedStream={selectedStream}
          setSelectedStream={setSelectedStream}
          pathways={pathways}
          selectedInstType={selectedInstType}
          setSelectedInstType={setSelectedInstType}
          instSearch={instSearch}
          setInstSearch={setInstSearch}
          tertiaryInstitutions={tertiaryInstitutions}
          tertiaryPrograms={tertiaryPrograms}
          selectedNvqStep={selectedNvqStep}
          setSelectedNvqStep={setSelectedNvqStep}
          nvqFramework={nvqFramework}
        />
      )}
      {tertiarySubTab === 'tne' && (
        <AtlasTertiaryTneSection
          tneModelFilter={tneModelFilter}
          setTneModelFilter={setTneModelFilter}
          tneCountryFilter={tneCountryFilter}
          setTneCountryFilter={setTneCountryFilter}
          tneFunnels={tneFunnels}
        />
      )}
      {tertiarySubTab === 'scholarships' && (
        <AtlasTertiaryScholarshipsSection
          schLevelFilter={schLevelFilter}
          setSchLevelFilter={setSchLevelFilter}
          schTierFilter={schTierFilter}
          setSchTierFilter={setSchTierFilter}
          scholarships={scholarships}
        />
      )}
      {tertiarySubTab === 'facilities' && (
        <AtlasTertiaryFacilitiesSection facilities={facilities} leadership={leadership} />
      )}
    </div>
  );
}
