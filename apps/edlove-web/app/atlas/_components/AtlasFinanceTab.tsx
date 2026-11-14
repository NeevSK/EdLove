'use client';

import React from 'react';
import type { BudgetProfile, GovernmentBudget } from '../_types/atlas.types';

export interface AtlasFinanceTabProps {
  financeSubTab: 'school_micro' | 'gov_macro';
  setFinanceSubTab: (subTab: 'school_micro' | 'gov_macro') => void;
  govTierFilter: string;
  setGovTierFilter: (filter: string) => void;
  budgets: BudgetProfile[];
  govBudgets: GovernmentBudget[];
}

export function AtlasFinanceTab({
  financeSubTab,
  setFinanceSubTab,
  govTierFilter,
  setGovTierFilter,
  budgets,
  govBudgets,
}: AtlasFinanceTabProps) {
  return (
    <div className="space-y-8">
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f0e7d8] pb-6">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
              National & School Public Finance
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
              Fiscal Ledger: Central Treasury, 9 Provincial Councils & SDS Inversion
            </h2>
            <p className="text-sm text-[#615951] mt-1">
              Exposing the two-tier structure of Sri Lankan education spending: Central Treasury
              &amp; Provincial devolved budgets vs. the private School Development Society (SDS)
              shadow economy.
            </p>
          </div>

          {/* Sub-view toggle */}
          <div className="flex items-center gap-2 bg-[#f5eee1] p-1.5 rounded-xl border border-[#e8dbca] self-start md:self-auto">
            <button
              onClick={() => setFinanceSubTab('school_micro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                financeSubTab === 'school_micro'
                  ? 'bg-[#1a1714] text-white shadow-xs'
                  : 'text-[#615951] hover:text-[#1a1714]'
              }`}
            >
              🏫 School Micro-Finance ({budgets.length})
            </button>
            <button
              onClick={() => setFinanceSubTab('gov_macro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                financeSubTab === 'gov_macro'
                  ? 'bg-[#1a1714] text-white shadow-xs'
                  : 'text-[#615951] hover:text-[#1a1714]'
              }`}
            >
              🏛️ Government Budgets ({govBudgets.length})
            </button>
          </div>
        </div>

        {/* VIEW 1: SCHOOL MICRO-FINANCE (SDS VS TREASURY) */}
        {financeSubTab === 'school_micro' && (
          <div className="mt-6 space-y-6">
            <div className="bg-[#faf8f5] border border-[#e8dbca] p-4 rounded-xl text-xs text-[#615951] leading-relaxed">
              💡 <strong>The School Inversion Multiplier:</strong> In elite national schools (Royal,
              Visakha, Central College Jaffna), parental donations and alumni endowments raise{' '}
              <strong>5x to 7x more</strong> non-salary capital than the government allocates. In
              rural agrarian and plantation estate schools (Type 2 and Type 3), SDS collections are
              virtually zero, leaving schools unable to afford electricity or question paper
              photocopying.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((b) => (
                <div
                  key={b.budget_id}
                  className="bg-[#faf8f5] border border-[#e8dbca] p-6 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono font-bold text-[#824112]">
                        {b.school_census_no}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#eaf1fb] text-[#1a3e6a]">
                        {b.school_category} • {b.school_type}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-[#1a1714]">{b.school_name}</h3>
                    <p className="text-xs text-[#73685e] mt-1">{b.notes}</p>

                    <div className="mt-6 space-y-2.5 font-mono text-xs">
                      <div className="flex justify-between py-1 border-b border-[#ebdccb]">
                        <span className="text-[#73685e]">State Recurrent (Salaries):</span>
                        <span className="font-bold">
                          Rs. {(b.treasury_recurrent_lkr / 1e6).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#ebdccb]">
                        <span className="text-[#73685e]">State Capital Allocation:</span>
                        <span className="font-bold">
                          Rs. {(b.treasury_capital_lkr / 1e6).toFixed(2)}M
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#ebdccb]">
                        <span className="text-[#73685e]">SDS Facility Fees:</span>
                        <span className="font-bold">
                          Rs. {(b.sds_facility_fees_lkr / 1e6).toFixed(2)}M
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#ebdccb]">
                        <span className="text-[#73685e]">SDS Alumni &amp; Endowments:</span>
                        <span className="font-bold">
                          Rs.{' '}
                          {(
                            (b.sds_donations_and_events_lkr + b.sds_alumni_endowments_lkr) /
                            1e6
                          ).toFixed(1)}
                          M
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 bg-[#f3e8d9] px-2 rounded-lg text-sm">
                        <span className="font-sans font-semibold text-[#1a1714]">
                          Total SDS Revenue:
                        </span>
                        <span className="font-bold text-[#a85022]">
                          Rs. {(b.sds_total_revenue_lkr / 1e6).toFixed(2)}M
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#ebdccb]">
                    <div className="text-xs text-[#73685e] mb-1">
                      Financial Inversion Multiplier:
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono text-[#a85022]">
                        {b.sds_to_treasury_ratio}x
                      </span>
                      <span className="text-xs text-[#73685e]">
                        {b.sds_to_treasury_ratio > 1.0
                          ? 'SDS exceeds state capital!'
                          : 'Deficit / Dependent'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: GOVERNMENT MACRO BUDGETS */}
        {financeSubTab === 'gov_macro' && (
          <div className="mt-6 space-y-6">
            {/* Macro Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#faf8f5] border border-[#e8dbca] p-4 rounded-xl">
                <div className="text-xs text-[#73685e]">Central Ministry (General Ed)</div>
                <div className="text-xl font-bold font-mono text-[#a85022] mt-1">Rs. 237.0B</div>
                <div className="text-[11px] text-[#615951] mt-0.5">
                  Recurrent: Rs. 205B | Capital: Rs. 32B
                </div>
              </div>
              <div className="bg-[#faf8f5] border border-[#e8dbca] p-4 rounded-xl">
                <div className="text-xs text-[#73685e]">Higher Education (UGC & Unis)</div>
                <div className="text-xl font-bold font-mono text-[#1a3e6a] mt-1">Rs. 112.7B</div>
                <div className="text-[11px] text-[#615951] mt-0.5">
                  17 State Unis & 19 SLIATE ATIs
                </div>
              </div>
              <div className="bg-[#faf8f5] border border-[#e8dbca] p-4 rounded-xl">
                <div className="text-xs text-[#73685e]">Provincial Devolved (9 Provinces)</div>
                <div className="text-xl font-bold font-mono text-[#246342] mt-1">~Rs. 370.0B</div>
                <div className="text-[11px] text-[#615951] mt-0.5">
                  &gt;88% allocated to teacher payroll
                </div>
              </div>
              <div className="bg-[#faf8f5] border border-[#e8dbca] p-4 rounded-xl">
                <div className="text-xs text-[#73685e]">National School Midday Meals</div>
                <div className="text-xl font-bold font-mono text-[#824112] mt-1">Rs. 16.5B</div>
                <div className="text-[11px] text-[#615951] mt-0.5">
                  1.6M Primary Students across 9,134 schools
                </div>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 border-b border-[#f0e7d8] pb-3">
              <button
                onClick={() => setGovTierFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  govTierFilter === 'all'
                    ? 'bg-[#1a1714] text-white'
                    : 'bg-[#f5eee1] text-[#615951]'
                }`}
              >
                All Budgets ({govBudgets.length})
              </button>
              <button
                onClick={() => setGovTierFilter('central_treasury_line_ministry')}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  govTierFilter === 'central_treasury_line_ministry'
                    ? 'bg-[#1a1714] text-white'
                    : 'bg-[#f5eee1] text-[#615951]'
                }`}
              >
                Central Line Ministries
              </button>
              <button
                onClick={() => setGovTierFilter('provincial_council_devolved')}
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  govTierFilter === 'provincial_council_devolved'
                    ? 'bg-[#1a1714] text-white'
                    : 'bg-[#f5eee1] text-[#615951]'
                }`}
              >
                9 Provincial Councils
              </button>
            </div>

            {/* Government Budgets Table / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {govBudgets
                .filter((b) => govTierFilter === 'all' || b.budget_tier === govTierFilter)
                .map((b) => {
                  const welfare = b.welfare_transfers_json
                    ? JSON.parse(b.welfare_transfers_json)
                    : null;
                  const heads = b.primary_spending_heads_json
                    ? JSON.parse(b.primary_spending_heads_json)
                    : [];
                  return (
                    <div
                      key={b.budget_record_id}
                      className="bg-[#faf8f5] border border-[#e8dbca] p-5 rounded-2xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#f3e8d9] text-[#824112]">
                            FY {b.fiscal_year} • {b.budget_tier.replace(/_/g, ' ')}
                          </span>
                          {b.gdp_share_percent && (
                            <span className="text-xs font-mono font-bold text-[#246342]">
                              {b.gdp_share_percent}% GDP
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif font-bold text-base text-[#1a1714]">
                          {b.entity_name_en}
                        </h3>
                        <p className="text-xs text-[#73685e] mt-1">{b.notes}</p>

                        <div className="mt-4 p-3 bg-white border border-[#ebdccb] rounded-xl space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#73685e]">Recurrent Spend:</span>
                            <span className="font-bold">
                              Rs. {(b.recurrent_budget_lkr / 1e9).toFixed(2)} Billion
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#73685e]">Capital Spend:</span>
                            <span className="font-bold">
                              Rs. {(b.capital_budget_lkr / 1e9).toFixed(2)} Billion
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-[#ebdccb] text-[#a85022] font-bold">
                            <span>Total Allocation:</span>
                            <span>Rs. {(b.total_allocation_lkr / 1e9).toFixed(2)} Billion</span>
                          </div>
                        </div>

                        {welfare && (
                          <div className="mt-3">
                            <div className="text-[11px] font-bold text-[#824112] mb-1">
                              Key Welfare Transfers:
                            </div>
                            <div className="flex flex-wrap gap-1 text-[10px]">
                              {Object.entries(welfare).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="bg-[#fffefb] border border-[#ebdccb] px-2 py-0.5 rounded text-[#423c35]"
                                >
                                  {k.replace(/_lkr/g, '').replace(/_/g, ' ')}: Rs.{' '}
                                  {((v as number) / 1e6).toFixed(0)}M
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {heads.length > 0 && (
                          <div className="mt-3">
                            <div className="text-[11px] font-bold text-[#73685e] mb-1">
                              Primary Expenditure Heads:
                            </div>
                            <ul className="list-disc list-inside text-[11px] text-[#615951] space-y-0.5">
                              {heads.map((h: string) => (
                                <li key={h}>{h}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#ebdccb] text-[10px] text-[#8e857b] font-mono">
                        Source: {b.source_citation}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
