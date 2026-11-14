'use client';

import React from 'react';
import type { TneDegreeFunnelItem } from '../_types/atlas.types';

export interface AtlasTertiaryTneSectionProps {
  tneModelFilter: string;
  setTneModelFilter: (f: string) => void;
  tneCountryFilter: string;
  setTneCountryFilter: (f: string) => void;
  tneFunnels: TneDegreeFunnelItem[];
}

export function AtlasTertiaryTneSection({
  tneModelFilter,
  setTneModelFilter,
  tneCountryFilter,
  setTneCountryFilter,
  tneFunnels,
}: AtlasTertiaryTneSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdccb] pb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#1a1714]">
              Urban Private Higher Education & TNE Degree Transfer Funnel
            </h3>
            <p className="text-xs text-[#615951] mt-0.5 max-w-2xl">
              10+ urban private campuses mapped across Colombo & Western Province with 4-year
              internal franchises and 1+2 / 2+2 transfer pipelines to Australia and the UK.
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
              if (tneModelFilter !== 'all' && f.award_model !== tneModelFilter) return false;
              if (tneCountryFilter !== 'all' && f.foreign_partner_country !== tneCountryFilter)
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
                      <span className="font-bold text-sm text-[#1a1714]">{f.program_name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          isTransfer ? 'bg-[#fbe9dc] text-[#a85022]' : 'bg-[#e2eaf4] text-[#1a3e6a]'
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
                      <span className="font-semibold text-[#1a1714]">Awarding Authority:</span>{' '}
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
                    <div className="text-[#615951] leading-relaxed">💡 {f.strategic_advisory}</div>
                    {f.partner_portal && (
                      <ExternalPortalLink href={f.partner_portal} label="Foreign Partner Website" />
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
