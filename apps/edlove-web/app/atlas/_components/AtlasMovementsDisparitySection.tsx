'use client';

import Link from 'next/link';
import React from 'react';
import type { DistributionStats, SchoolResourceProfile } from '../_types/atlas.types';

export interface AtlasMovementsDisparitySectionProps {
  distributionStats: DistributionStats | null;
  sportsTierFilter: string;
  setSportsTierFilter: (f: string) => void;
  waterSourceFilter: string;
  setWaterSourceFilter: (f: string) => void;
  scienceCapableFilter: string;
  setScienceCapableFilter: (f: string) => void;
  poolFilter: string;
  setPoolFilter: (f: string) => void;
  aestheticStatusFilter: string;
  setAestheticStatusFilter: (f: string) => void;
  disparitySearch: string;
  setDisparitySearch: (s: string) => void;
  resourceProfiles: SchoolResourceProfile[];
}

export function AtlasMovementsDisparitySection({
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
  resourceProfiles,
}: AtlasMovementsDisparitySectionProps) {
  return (
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
              Fewer than 40 school swimming pools and ~60 turf cricket pitches exist nationwide.
              Rural schools compete on steep gravel slopes and muddy volleyball courts.
            </p>
          </div>
          <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
            <div className="font-bold text-[#a85022] mb-1">2. Aesthetic Forced Default</div>
            <p className="text-[#615951] leading-relaxed">
              Urban 1AB schools enjoy surplus music and dance teachers, while rural Type 2/3 schools
              have zero specialist teachers, forcing students into Art by administrative default.
            </p>
          </div>
          <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
            <div className="font-bold text-[#a85022] mb-1">3. A/L Science Chokepoint</div>
            <p className="text-[#615951] leading-relaxed">
              Over 8,900 schools (&gt;89%) are legally and structurally locked out of teaching A/L
              Science. Only ~1,029 1AB schools have certified science laboratories.
            </p>
          </div>
          <div className="bg-[#faf8f5] border border-[#ebdccb] p-3.5 rounded-xl">
            <div className="font-bold text-[#a85022] mb-1">4. WASH &amp; Nutrition Divide</div>
            <p className="text-[#615951] leading-relaxed">
              Metropolitan schools drink municipal tap water while North Central / dry zone schools
              require community RO filtration plants to prevent chronic kidney disease (CKDu).
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
            <label className="block font-semibold text-[#73685e] mb-1">Aesthetic Staffing</label>
            <select
              value={aestheticStatusFilter}
              onChange={(e) => setAestheticStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#ebdccb] bg-[#faf8f5]"
            >
              <option value="all">All Aesthetic Statuses</option>
              <option value="surplus">Surplus Staff</option>
              <option value="balanced">Balanced</option>
              <option value="deficit_music_dance_missing">Deficit: Music/Dance Missing</option>
              <option value="severe_shortage_art_only">Severe Shortage: Art Only</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#73685e] mb-1">A/L Science Capable</label>
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
            <label className="block font-semibold text-[#73685e] mb-1">Swimming Pool</label>
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
            <label className="block font-semibold text-[#73685e] mb-1">Drinking Water</label>
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
            (p) => sportsTierFilter === 'all' || p.sports_infrastructure_tier === sportsTierFilter,
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
          .filter((p) => poolFilter === 'all' || String(p.swimming_pool_available) === poolFilter)
          .filter(
            (p) => waterSourceFilter === 'all' || p.drinking_water_source === waterSourceFilter,
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
                    • Teachers: <span className="font-bold text-[#1a1714]">{p.teacher_count}</span>
                  </div>

                  {/* Fault Line Badges Strip */}
                  <div className="mt-4 space-y-2">
                    {/* 1. Sports Tier */}
                    <div className="bg-[#faf8f5] border border-[#ebdccb] p-2.5 rounded-xl text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#73685e] font-medium">Sports Complex:</span>
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
                          🏊 Pool: <strong>{p.swimming_pool_available ? '✓ Yes' : '✗ None'}</strong>
                        </span>
                        <span>
                          🏏 Turf:{' '}
                          <strong>{p.cricket_turf_available ? '✓ Turf' : '✗ Matting/None'}</strong>
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
                      <div className="mt-1 text-[11px]">Offered: {aesthetics.join(', ')}</div>
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
                        {p.al_science_capable ? '🔬 A/L Science Capable' : '🚫 No A/L Science'}
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
                          {p.midday_meal_beneficiary ? '✓ Free Lunch Provided' : '✗ No State Lunch'}
                        </span>
                      </div>
                    </div>

                    {/* 5. Co-Curricular Units */}
                    {movements.length > 0 && (
                      <div className="text-[11px] text-[#615951]">
                        <span className="font-bold text-[#1a1714]">Active Co-Curriculars: </span>
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
  );
}
