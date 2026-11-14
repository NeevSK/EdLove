'use client';

import React from 'react';
import type { EdTechItem } from '../_types/atlas.types';

export interface AtlasEdTechTabProps {
  edtechList: EdTechItem[];
}

export function AtlasEdTechTab({ edtechList }: AtlasEdTechTabProps) {
  return (
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
  );
}
