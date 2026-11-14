'use client';

import React from 'react';
import type { UgcCutoff, UgcProgram } from '../_types/atlas.types';

export interface AtlasUgcTabProps {
  ugcPrograms: UgcProgram[];
  ugcCutoffs: UgcCutoff[];
  selectedUgcProgram: string;
  setSelectedUgcProgram: (p: string) => void;
  simZScore: string;
  setSimZScore: (z: string) => void;
  simDistrict: string;
  setSimDistrict: (d: string) => void;
}

export function AtlasUgcTab({
  ugcPrograms,
  ugcCutoffs,
  selectedUgcProgram,
  setSelectedUgcProgram,
  simZScore,
  setSimZScore,
  simDistrict,
  setSimDistrict,
}: AtlasUgcTabProps) {
  return (
    <div className="space-y-8">
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
        <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
          Secondary-to-Tertiary Transition Seam
        </span>
        <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
          University Grants Commission (UGC) District Quota &amp; Minimum Z-Scores
        </h2>
        <p className="text-sm text-[#615951] mt-2 leading-relaxed max-w-3xl">
          Sri Lanka university admissions allocate places via a statutory tripartite formula:
          <span className="font-semibold text-[#1a1714]"> 40% All-Island Merit</span>,
          <span className="font-semibold text-[#1a1714]"> 55% District Population Quota</span>, and
          <span className="font-semibold text-[#1a1714]"> 5% Disadvantaged District Quota</span>.
          This produces massive structural variance in qualifying Z-scores between urban centers and
          rural provinces.
        </p>

        {/* Student Eligibility Simulator */}
        <div className="mt-8 bg-[#faf8f5] border border-[#ebdccb] p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎯</span>
            <h3 className="font-serif font-bold text-base text-[#1a1714]">
              Interactive G.C.E. A/L District Eligibility Predictor
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="sim-zscore-input"
                className="block text-xs font-semibold text-[#73685e] uppercase tracking-wider mb-1"
              >
                Your Projected Z-Score
              </label>
              <input
                id="sim-zscore-input"
                type="number"
                step="0.001"
                value={simZScore}
                onChange={(e) => setSimZScore(e.target.value)}
                placeholder="e.g. 1.5500"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#d6cbba] bg-white font-mono font-bold text-[#1a1714]"
              />
            </div>

            <div>
              <label
                htmlFor="sim-district-select"
                className="block text-xs font-semibold text-[#73685e] uppercase tracking-wider mb-1"
              >
                Exam District (Where You Sat A/L)
              </label>
              <select
                id="sim-district-select"
                value={simDistrict}
                onChange={(e) => setSimDistrict(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#d6cbba] bg-white font-medium text-[#1a1714]"
              >
                <option value="D_11">Colombo (Western)</option>
                <option value="D_12">Gampaha (Western)</option>
                <option value="D_13">Kalutara (Western)</option>
                <option value="D_21">Kandy (Central)</option>
                <option value="D_22">Matale (Central)</option>
                <option value="D_23">Nuwara Eliya (Central • Disadvantaged)</option>
                <option value="D_31">Galle (Southern)</option>
                <option value="D_32">Matara (Southern)</option>
                <option value="D_33">Hambantota (Southern)</option>
                <option value="D_41">Jaffna (Northern)</option>
                <option value="D_45">Kilinochchi (Northern • Disadvantaged)</option>
                <option value="D_42">Mannar (Northern • Disadvantaged)</option>
                <option value="D_43">Vavuniya (Northern • Disadvantaged)</option>
                <option value="D_44">Mullaitivu (Northern • Disadvantaged)</option>
                <option value="D_51">Batticaloa (Eastern • Disadvantaged)</option>
                <option value="D_52">Ampara (Eastern • Disadvantaged)</option>
                <option value="D_53">Trincomalee (Eastern • Disadvantaged)</option>
                <option value="D_61">Kurunegala (North Western)</option>
                <option value="D_62">Puttalam (North Western • Disadvantaged)</option>
                <option value="D_71">Anuradhapura (North Central • Disadvantaged)</option>
                <option value="D_72">Polonnaruwa (North Central • Disadvantaged)</option>
                <option value="D_81">Badulla (Uva • Disadvantaged)</option>
                <option value="D_82">Monaragala (Uva • Disadvantaged)</option>
                <option value="D_91">Ratnapura (Sabaragamuwa)</option>
                <option value="D_92">Kegalle (Sabaragamuwa)</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-xs text-[#73685e]">
                Evaluating against academic year{' '}
                <span className="font-mono font-bold text-[#1a1714]">2023/2024</span> cutoffs across
                state universities.
              </div>
            </div>
          </div>

          {/* Eligibility Output Cards */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { code: '001M', title: 'Medicine (MBBS)', stream: 'Biological' },
              { code: '003E', title: 'Engineering (BSc Hons)', stream: 'Physical' },
              { code: '006C', title: 'Computer Science', stream: 'Physical' },
              { code: '004L', title: 'Law (LL.B)', stream: 'Arts' },
            ].map((target) => {
              const row = ugcCutoffs.find(
                (c) => c.program_code === target.code && c.district_id === simDistrict,
              );
              const userZ = parseFloat(simZScore) || 0;
              const cutZ = row ? row.min_z_score : 99;
              const diff = (userZ - cutZ).toFixed(4);
              const eligible = userZ >= cutZ;

              return (
                <div
                  key={target.code}
                  className={`p-3.5 rounded-xl border ${
                    eligible ? 'bg-[#f0f8f3] border-[#c0e6cb]' : 'bg-[#fdf5f2] border-[#f7d6cc]'
                  }`}
                >
                  <div className="font-bold text-xs text-[#1a1714]">{target.title}</div>
                  <div className="text-[10px] text-[#73685e] mt-0.5">{target.stream}</div>

                  <div className="mt-2 font-mono">
                    <div className="text-[10px] text-[#73685e]">District Cutoff:</div>
                    <div className="font-bold text-sm text-[#1a1714]">
                      {row ? row.min_z_score.toFixed(4) : 'N/A'}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#ebdccb]">
                    <span
                      className={`font-sans font-bold text-[10px] uppercase px-2 py-0.5 rounded-md ${
                        eligible ? 'bg-[#246342] text-white' : 'bg-[#c93018] text-white'
                      }`}
                    >
                      {eligible ? `Eligible (+${diff})` : `Deficit (${diff})`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Program Selector Pills */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { code: '001M', label: 'Medicine (MBBS)' },
            { code: '003E', label: 'Engineering (BSc Hons)' },
            { code: '006C', label: 'Computer Science' },
            { code: '004L', label: 'Law (LL.B)' },
          ].map((p) => (
            <button
              key={p.code}
              onClick={() => setSelectedUgcProgram(p.code)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedUgcProgram === p.code
                  ? 'bg-[#1a1714] text-white'
                  : 'bg-[#faf8f5] border border-[#d6cbba] text-[#615951] hover:bg-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 25-District Cutoff Table for Selected Program */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#f0e7d8] text-[#73685e]">
                <th className="py-2.5">District</th>
                <th className="py-2.5">Affirmative Quota</th>
                <th className="py-2.5">Minimum Z-Score</th>
                <th className="py-2.5">All-Island Merit Benchmark</th>
                <th className="py-2.5">Delta from Merit</th>
              </tr>
            </thead>
            <tbody>
              {ugcCutoffs
                .filter((c) => c.program_code === selectedUgcProgram)
                .map((c) => {
                  const delta = (c.merit_all_island_z_score - c.min_z_score).toFixed(4);
                  return (
                    <tr key={c.cutoff_id} className="border-b border-[#f7f2ea] hover:bg-[#faf8f5]">
                      <td className="py-2.5 font-bold text-[#1a1714]">{c.district_name}</td>
                      <td className="py-2.5">
                        {c.is_disadvantaged_district === 1 ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#d6ebd9] text-[#246342] font-sans font-bold text-[10px]">
                            Disadvantaged (5% Quota)
                          </span>
                        ) : (
                          <span className="text-[#a8a096] font-sans">General District (55%)</span>
                        )}
                      </td>
                      <td className="py-2.5 font-bold text-sm text-[#a85022]">
                        {c.min_z_score.toFixed(4)}
                      </td>
                      <td className="py-2.5 text-[#73685e]">
                        {c.merit_all_island_z_score.toFixed(4)}
                      </td>
                      <td className="py-2.5 text-[#73685e]">
                        {Number(delta) > 0 ? `-${delta} lower` : 'Merit Cutoff'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
