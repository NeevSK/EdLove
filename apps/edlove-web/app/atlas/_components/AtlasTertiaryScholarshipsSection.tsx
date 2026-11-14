'use client';

import React from 'react';
import type { HigherEdScholarshipItem } from '../_types/atlas.types';

export interface AtlasTertiaryScholarshipsSectionProps {
  schLevelFilter: string;
  setSchLevelFilter: (f: string) => void;
  schTierFilter: string;
  setSchTierFilter: (f: string) => void;
  scholarships: HigherEdScholarshipItem[];
}

export function AtlasTertiaryScholarshipsSection({
  schLevelFilter,
  setSchLevelFilter,
  schTierFilter,
  setSchTierFilter,
  scholarships,
}: AtlasTertiaryScholarshipsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdccb] pb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#1a1714]">
              Higher Education & Postgraduate Scholarships Ledger
            </h3>
            <p className="text-xs text-[#615951] mt-0.5 max-w-2xl">
              Comprehensive sovereign directory of undergraduate, master\'s, and doctoral
              scholarships spanning state bursaries, bilateral foreign government awards, and
              corporate sponsorships.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {/* Academic Level Filter */}
            <select
              value={schLevelFilter}
              onChange={(e) => setSchLevelFilter(e.target.value)}
              className="bg-[#faf8f5] border border-[#d6cbba] px-3 py-1.5 rounded-lg text-xs focus:outline-hidden"
            >
              <option value="all">All Degrees</option>
              <option value="bachelors">Bachelors (Undergraduate)</option>
              <option value="masters">Masters / Postgrad</option>
              <option value="phd">PhD / Research</option>
            </select>

            {/* Funding Tier Filter */}
            <select
              value={schTierFilter}
              onChange={(e) => setSchTierFilter(e.target.value)}
              className="bg-[#faf8f5] border border-[#d6cbba] px-3 py-1.5 rounded-lg text-xs focus:outline-hidden"
            >
              <option value="all">All Funding Tiers</option>
              <option value="state_statutory_national">National State Scheme</option>
              <option value="bilateral_foreign_government">Bilateral Foreign Government</option>
              <option value="corporate_industrial_sponsorship">
                Corporate / Industry Sponsored
              </option>
            </select>
          </div>
        </div>

        {/* Scholarships Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {scholarships
            .filter((sc) => {
              if (
                schLevelFilter !== 'all' &&
                sc.academic_level !== schLevelFilter &&
                sc.academic_level !== 'all_levels' &&
                sc.academic_level !== 'bachelors_and_masters'
              )
                return false;
              if (schTierFilter !== 'all' && sc.funding_tier !== schTierFilter) return false;
              return true;
            })
            .map((sc) => {
              const isFullRide =
                sc.coverage_scope.includes('full_ride') ||
                sc.coverage_scope.includes('full_tuition');
              return (
                <div
                  key={sc.scholarship_id}
                  className="bg-[#faf8f5] border border-[#e5dec9] p-5 rounded-xl flex flex-col justify-between hover:border-[#c5b8a3] transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-[#1a1714] leading-snug">
                        {sc.title_en}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          isFullRide ? 'bg-[#d6ebd9] text-[#246342]' : 'bg-[#e2eaf4] text-[#1a3e6a]'
                        }`}
                      >
                        {sc.academic_level.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-[#73685e] font-serif">{sc.title_si}</div>

                    <div className="mt-2 text-xs text-[#a85022] font-semibold">
                      🏛️ Awarding Body: {sc.awarding_entity}
                    </div>

                    <div className="mt-2 text-xs text-[#423c35] flex items-center gap-1.5">
                      <span>🌍 Destinations:</span>
                      <span className="font-medium text-[#1a1714]">{sc.eligible_destinations}</span>
                    </div>

                    {/* Coverage Scope & Value */}
                    <div className="mt-3 p-2.5 rounded-lg bg-[#fffefb] border border-[#ebdccb] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#73685e]">Coverage:</span>
                        <span className="font-bold text-[#246342]">
                          {sc.coverage_scope.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      {sc.approx_annual_value_lkr && sc.approx_annual_value_lkr > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#73685e]">Approx Value:</span>
                          <span className="font-bold font-mono text-[#a85022]">
                            ~Rs. {(sc.approx_annual_value_lkr / 1000000).toFixed(2)}M / year
                          </span>
                        </div>
                      )}
                      {sc.annual_quota_slots && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#73685e]">Annual Quota:</span>
                          <span className="font-bold font-mono text-[#1a1714]">
                            {sc.annual_quota_slots} Slots
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Eligibility Criteria */}
                    <div className="mt-3 text-xs text-[#615951] leading-relaxed">
                      <span className="font-bold text-[#1a1714]">Criteria: </span>
                      <span>{sc.eligibility_criteria}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#ebdccb] space-y-2 text-[11px]">
                    <div className="text-[#615951]">
                      📅 <span className="font-semibold">Application Window:</span>{' '}
                      {sc.application_window}
                    </div>
                    {sc.strategic_advisory && (
                      <div className="text-[#423c35] bg-[#fffefb] p-2 rounded-md border border-[#ebdccb]">
                        📌 {sc.strategic_advisory}
                      </div>
                    )}
                    {sc.official_portal_url && (
                      <ExternalPortalLink
                        href={sc.official_portal_url}
                        label="Official Application Portal"
                      />
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
