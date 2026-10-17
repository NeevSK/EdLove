'use client';

import Link from 'next/link';
import React from 'react';
import type {
  CoCurricularMovement,
  DhammaSchoolNetwork,
  DistributionStats,
  MovementsSummary,
  SchoolResourceProfile,
} from '../_types/atlas.types';
import { AtlasMovementsDhammaSection } from './AtlasMovementsDhammaSection';
import { AtlasMovementsDisparitySection } from './AtlasMovementsDisparitySection';
import { AtlasMovementsOverviewSection } from './AtlasMovementsOverviewSection';

export interface AtlasMovementsTabProps {
  movementsSubTab: 'movements_overview' | 'dhamma_pasal' | 'resource_disparity';
  setMovementsSubTab: (
    subTab: 'movements_overview' | 'dhamma_pasal' | 'resource_disparity',
  ) => void;
  movementsList: CoCurricularMovement[];
  dhammaList: DhammaSchoolNetwork[];
  movementsSummary: MovementsSummary | null;
  movementTypeFilter: string;
  setMovementTypeFilter: (filter: string) => void;
  dhammaFaithFilter: string;
  setDhammaFaithFilter: (filter: string) => void;
  movementsSearch: string;
  setMovementsSearch: (search: string) => void;
  resourceProfiles: SchoolResourceProfile[];
  distributionStats: DistributionStats | null;
  sportsTierFilter: string;
  setSportsTierFilter: (filter: string) => void;
  waterSourceFilter: string;
  setWaterSourceFilter: (filter: string) => void;
  scienceCapableFilter: string;
  setScienceCapableFilter: (filter: string) => void;
  poolFilter: string;
  setPoolFilter: (filter: string) => void;
  aestheticStatusFilter: string;
  setAestheticStatusFilter: (filter: string) => void;
  disparitySearch: string;
  setDisparitySearch: (search: string) => void;
}

export function AtlasMovementsTab({
  movementsSubTab,
  setMovementsSubTab,
  movementsList,
  dhammaList,
  movementsSummary,
  movementTypeFilter,
  setMovementTypeFilter,
  dhammaFaithFilter,
  setDhammaFaithFilter,
  movementsSearch,
  setMovementsSearch,
  resourceProfiles,
  distributionStats,
  sportsTierFilter,
  setSportsTierFilter,
  waterSourceFilter,
  setWaterSourceFilter,
  scienceCapableFilter,
  setScienceCapableFilter,
  poolFilter,
  setPoolFilter,
  aestheticStatusFilter,
  setAestheticStatusFilter,
  disparitySearch,
  setDisparitySearch,
}: AtlasMovementsTabProps) {
  return (
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
              Parisara Niyamu), the weekend faith-based network (Daham Pasal, Araneri, Catechism,
              Ahadiyyah), and extreme spatial inequalities in sports facilities, aesthetic teachers,
              safe drinking water, and A/L Science access.
            </p>
          </div>
        </div>

        {/* Apex Macro Statistics */}
        <div className="mt-6 pt-6 border-t border-[#ebdccb] grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#a85022]">
              {movementsSummary ? (movementsSummary.total_cadre / 1000).toFixed(0) + 'k+' : '441k+'}
            </div>
            <div className="text-xs text-[#73685e] mt-0.5 font-medium">Uniformed Youth Cadre</div>
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
            <div className="text-xs text-[#73685e] mt-0.5 font-medium">National Swimming Pools</div>
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
          <span>🛕</span> Sunday Religious Schools / Daham Pasal ({dhammaList.length} Networks)
        </button>
        <button
          onClick={() => setMovementsSubTab('resource_disparity')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            movementsSubTab === 'resource_disparity'
              ? 'bg-[#1a1714] text-white shadow-xs'
              : 'bg-[#faf8f5] border border-[#ebdccb] text-[#615951] hover:bg-white'
          }`}
        >
          <span>⚖️</span> School Resource &amp; Teacher Disparity Matrix ({resourceProfiles.length}{' '}
          Profiles)
        </button>
      </div>

      {/* ================= SUB-TAB 1: UNIFORMED & CIVIC MOVEMENTS ================= */}
      {movementsSubTab === 'movements_overview' && (
        <AtlasMovementsOverviewSection
          movementTypeFilter={movementTypeFilter}
          setMovementTypeFilter={setMovementTypeFilter}
          movementsSearch={movementsSearch}
          setMovementsSearch={setMovementsSearch}
          movementsList={movementsList}
        />
      )}
      {movementsSubTab === 'dhamma_pasal' && (
        <AtlasMovementsDhammaSection
          dhammaFaithFilter={dhammaFaithFilter}
          setDhammaFaithFilter={setDhammaFaithFilter}
          movementsSearch={movementsSearch}
          setMovementsSearch={setMovementsSearch}
          dhammaList={dhammaList}
        />
      )}
      {movementsSubTab === 'resource_disparity' && (
        <AtlasMovementsDisparitySection
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
          resourceProfiles={resourceProfiles}
        />
      )}
    </div>
  );
}
