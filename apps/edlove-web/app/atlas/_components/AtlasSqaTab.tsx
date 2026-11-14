'use client';

import React from 'react';
import type { SqaIndicator } from '../_types/atlas.types';

export interface AtlasSqaTabProps {
  sqaList: SqaIndicator[];
}

export function AtlasSqaTab({ sqaList }: AtlasSqaTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
        <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
          National Inspection Audit
        </span>
        <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
          School Quality Assessment (SQA) &amp; Inspector Gaming Rubrics
        </h2>
        <p className="text-sm text-[#615951] mt-1">
          The National Quality Assurance Framework assesses 8 dimensions across 52 indicators. Below
          is the empirical ledger detailing how schools historically adapted file architecture vs.
          authentic classroom reality.
        </p>
      </div>

      <div className="space-y-4">
        {sqaList.map((s) => {
          let levels: Record<string, string> = {};
          try {
            levels = JSON.parse(s.performance_levels_json);
          } catch {
            levels = {};
          }

          return (
            <div
              key={s.indicator_id}
              className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0e7d8]">
                <div>
                  <span className="text-xs font-mono font-bold text-[#a85022] uppercase tracking-wider">
                    Dimension {s.dimension_no}: {s.dimension_title_en}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#1a1714] mt-0.5">
                    Indicator {s.indicator_no}: {s.title_en}
                  </h3>
                  <p className="text-xs text-[#73685e] font-sans">{s.title_si}</p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#faf8f5] border border-[#ebdccb] text-[#73685e] self-start sm:self-auto">
                  {s.indicator_id}
                </span>
              </div>

              {/* Performance Levels Grid */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#fcf5f2] border border-[#f5ded5] p-3 rounded-xl">
                  <div className="font-bold text-[#c93018] mb-1">Level 1 (Unsatisfactory)</div>
                  <div className="text-[#615951] leading-relaxed">
                    {levels.level_1 || 'No rubric'}
                  </div>
                </div>
                <div className="bg-[#fdf9f1] border border-[#f7eecf] p-3 rounded-xl">
                  <div className="font-bold text-[#824112] mb-1">Level 2 (Basic)</div>
                  <div className="text-[#615951] leading-relaxed">
                    {levels.level_2 || 'No rubric'}
                  </div>
                </div>
                <div className="bg-[#f2f7f4] border border-[#d6ebd9] p-3 rounded-xl">
                  <div className="font-bold text-[#246342] mb-1">Level 3 (Good)</div>
                  <div className="text-[#615951] leading-relaxed">
                    {levels.level_3 || 'No rubric'}
                  </div>
                </div>
                <div className="bg-[#eef4fb] border border-[#d2e4f7] p-3 rounded-xl">
                  <div className="font-bold text-[#1a3e6a] mb-1">Level 4 (Commendable)</div>
                  <div className="text-[#615951] leading-relaxed">
                    {levels.level_4 || 'No rubric'}
                  </div>
                </div>
              </div>

              {/* Gaming Notes Alert */}
              {s.historical_gaming_notes && (
                <div className="mt-4 p-3 bg-[#fdf8f0] border-l-4 border-[#e8a342] rounded-r-xl text-xs text-[#73685e]">
                  <span className="font-bold text-[#1a1714]">Historical Inspection Gaming: </span>
                  {s.historical_gaming_notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
