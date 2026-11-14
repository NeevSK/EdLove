'use client';

import React from 'react';
import type { NationalCompetition } from '../_types/atlas.types';

export interface AtlasCompetitionsTabProps {
  competitionsList: NationalCompetition[];
  compCategoryFilter: string;
  setCompCategoryFilter: (f: string) => void;
  compSearch: string;
  setCompSearch: (s: string) => void;
}

export function AtlasCompetitionsTab({
  competitionsList,
  compCategoryFilter,
  setCompCategoryFilter,
  compSearch,
  setCompSearch,
}: AtlasCompetitionsTabProps) {
  return (
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
              The living traditions of Sri Lankan student achievement: All-Island athletic meets,
              centuries-old cricket derbies, Shakespeare drama, classical Kandyan/Bharatanatyam
              dance, and International Olympiad qualifiers.
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
              (c.flagship_trophy_or_award && c.flagship_trophy_or_award.toLowerCase().includes(q))
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
  );
}
