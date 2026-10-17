'use client';

import React from 'react';
import type { EducationCharity } from '../_types/atlas.types';

export interface AtlasCharitiesTabProps {
  charitiesList: EducationCharity[];
  charityTypeFilter: string;
  setCharityTypeFilter: (f: string) => void;
  charityFocusFilter: string;
  setCharityFocusFilter: (f: string) => void;
  charitySearch: string;
  setCharitySearch: (s: string) => void;
}

export function AtlasCharitiesTab({
  charitiesList,
  charityTypeFilter,
  setCharityTypeFilter,
  charityFocusFilter,
  setCharityFocusFilter,
  charitySearch,
  setCharitySearch,
}: AtlasCharitiesTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
              Civic Solidarity &amp; Development Partners
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
              Educational Charities, Foundations &amp; Development Partners ({charitiesList.length})
            </h2>
            <p className="text-sm text-[#615951] mt-1">
              Audited directory of international multilaterals, civil society foundations, corporate
              CSR trusts, and development bank projects funding public education across Sri Lanka.
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
                  {c.name_si && <div className="text-xs text-[#73685e] mt-0.5">{c.name_si}</div>}

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#824112]">
                    <span>🎯 Focus:</span>
                    <span className="font-semibold">{c.thematic_focus.replace(/_/g, ' ')}</span>
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
  );
}
