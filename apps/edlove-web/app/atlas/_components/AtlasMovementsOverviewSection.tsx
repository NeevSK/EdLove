'use client';

import React from 'react';
import type { CoCurricularMovement } from '../_types/atlas.types';

export interface AtlasMovementsOverviewSectionProps {
  movementTypeFilter: string;
  setMovementTypeFilter: (f: string) => void;
  movementsSearch: string;
  setMovementsSearch: (s: string) => void;
  movementsList: CoCurricularMovement[];
}

export function AtlasMovementsOverviewSection({
  movementTypeFilter,
  setMovementTypeFilter,
  movementsSearch,
  setMovementsSearch,
  movementsList,
}: AtlasMovementsOverviewSectionProps) {
  return (
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
          .filter((m) => movementTypeFilter === 'all' || m.movement_type === movementTypeFilter)
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
                    <div className="text-xs text-[#73685e] font-serif mt-0.5">{m.name_si}</div>
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
                      <span className="font-semibold text-[#1a1714]">Uniform &amp; Insignia: </span>
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
  );
}
