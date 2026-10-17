'use client';

import React from 'react';
import type { DhammaSchoolNetwork } from '../_types/atlas.types';

export interface AtlasMovementsDhammaSectionProps {
  dhammaFaithFilter: string;
  setDhammaFaithFilter: (f: string) => void;
  movementsSearch: string;
  setMovementsSearch: (s: string) => void;
  dhammaList: DhammaSchoolNetwork[];
}

export function AtlasMovementsDhammaSection({
  dhammaFaithFilter,
  setDhammaFaithFilter,
  movementsSearch,
  setMovementsSearch,
  dhammaList,
}: AtlasMovementsDhammaSectionProps) {
  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="bg-[#faf8f5] border border-[#ebdccb] p-6 rounded-2xl">
        <h3 className="font-serif font-bold text-lg text-[#1a1714]">
          The Sunday Moral Safety Net: 2.7 Million Children in Volunteer Care
        </h3>
        <p className="text-xs sm:text-sm text-[#615951] mt-1.5 leading-relaxed">
          Across 14,000+ village temples, Hindu kovils, Christian churches, and local mosques, more
          than 177,000 volunteer monks, priests, and elders teach morality, scriptural literacy, and
          cultural self-restraint every Sunday morning. This parallel religious infrastructure
          carries zero recurrent payroll on the National Treasury while serving as the primary civic
          anchor for children in rural communities.
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
          .filter((d) => dhammaFaithFilter === 'all' || d.faith_tradition === dhammaFaithFilter)
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

                  <h3 className="font-serif font-bold text-xl text-[#1a1714]">{d.name_en}</h3>
                  {d.name_si && (
                    <div className="text-xs text-[#73685e] font-serif mt-0.5">{d.name_si}</div>
                  )}
                  {d.name_ta && (
                    <div className="text-xs text-[#73685e] font-sans mt-0.5">{d.name_ta}</div>
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
                      <span className="font-semibold text-[#1a1714]">🏛️ Governing State Dept: </span>
                      {d.governing_state_department}
                    </div>
                    <div>
                      <span className="font-semibold text-[#1a1714]">📍 Operating Venues: </span>
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
  );
}
