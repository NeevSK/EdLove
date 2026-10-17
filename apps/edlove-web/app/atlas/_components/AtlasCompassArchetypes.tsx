'use client';

import React from 'react';

export interface AtlasCompassArchetypesProps {
  compassArchetype: 'urban' | 'rural';
  setCompassArchetype: (archetype: 'urban' | 'rural') => void;
}

export function AtlasCompassArchetypes({
  compassArchetype,
  setCompassArchetype,
}: AtlasCompassArchetypesProps) {
  return (
    <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
            Empirical Benchmarks
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
            The Two Archetypes: Colombo 1AB Flagship vs. Nuwara Eliya Type 3 Primary
          </h3>
          <p className="text-xs sm:text-sm text-[#615951] mt-1">
            Directly comparing official state statistics against the ground truth substrate of real
            classroom density and shadow economics.
          </p>
        </div>

        <div className="flex gap-2 bg-[#f5eee1] p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setCompassArchetype('urban')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              compassArchetype === 'urban'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:text-[#1a1714]'
            }`}
          >
            🏢 Colombo 1AB (Dharmapala)
          </button>
          <button
            type="button"
            onClick={() => setCompassArchetype('rural')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              compassArchetype === 'rural'
                ? 'bg-[#1a1714] text-white shadow-xs'
                : 'text-[#615951] hover:text-[#1a1714]'
            }`}
          >
            🍃 Nuwara Eliya Type 3 (Warleigh)
          </button>
        </div>
      </div>

      {compassArchetype === 'urban' ? (
        /* Urban Benchmark: Dharmapala Vidyalaya */
        <div className="border border-[#ebdccb] bg-[#faf8f5] p-6 rounded-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#ebdccb] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#a85022]">Census: 01002</span>
                <span className="text-xs bg-[#ebdccb] text-[#1a1714] px-2 py-0.5 rounded font-semibold">
                  1AB National School
                </span>
                <span className="text-xs bg-[#fbeeed] text-[#c93018] px-2 py-0.5 rounded font-semibold">
                  Overcrowded Flagship
                </span>
              </div>
              <h4 className="text-xl font-serif font-bold text-[#1a1714] mt-1">
                Dharmapala Vidyalaya, Pannipitiya (Western Province)
              </h4>
              <p className="text-xs text-[#73685e] mt-0.5">
                Enrollment: 5,200 pupils • 240 teachers • Sinhala Medium • Primary through A/L
              </p>
            </div>

            <Link
              href="/atlas/school/01002"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#a85022] hover:bg-[#8f3e15] text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <span>View School Dossier</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
              <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                Official SQA Audit
              </span>
              <div className="text-2xl font-serif font-bold text-[#1a1714] mt-1">94.2 / 100</div>
              <span className="text-xs font-semibold text-[#246342]">Grade A (State Pride)</span>
              <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                Evaluated on sports facilities, A/L pass tallies, and documented institutional
                compliance.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-[#a85022]">
              <span className="text-[10px] uppercase font-bold text-[#a85022] tracking-wider block">
                Grounded C-ARI Score
              </span>
              <div className="text-2xl font-serif font-bold text-[#a85022] mt-1">52.4 / 100</div>
              <span className="text-xs font-semibold text-[#824112]">
                Severe Relational Scarcity
              </span>
              <p className="text-[11px] text-[#615951] mt-1.5 leading-relaxed">
                Severe crowd congestion, high student-to-bench density, and near-total reliance on
                outside tuition.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
              <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                Ratio Theater Delta (Δ)
              </span>
              <div className="text-2xl font-mono font-bold text-[#c93018] mt-1">+26.4</div>
              <span className="text-xs font-semibold text-[#1a1714]">
                Nominal 1:21.6 vs 48:1 Room
              </span>
              <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                Individual child attunement probability:{' '}
                <strong className="text-[#1a1714]">~2.1%</strong> per 40-minute period.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
              <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                SDS Shadow Treasury
              </span>
              <div className="text-2xl font-mono font-bold text-[#1a1714] mt-1">Rs. 68.5M</div>
              <span className="text-xs font-semibold text-[#a85022]">44% of Capital Inflow</span>
              <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                Parents privately finance laboratories, electricity bills, AC units, and security
                guards.
              </p>
            </div>
          </div>

          <div className="bg-[#f0e7d8] p-4 rounded-xl text-xs sm:text-sm text-[#403933] leading-relaxed">
            <strong className="text-[#1a1714]">POSIWID Diagnostic:</strong> The system works as an
            industrial sorting machine. The state school provides the legitimate credential and
            testing registration, while the real teaching has been outsourced to the shadow tuition
            industry in Nugegoda and Maharagama, funded by parental sacrifice.
          </div>
        </div>
      ) : (
        /* Rural Benchmark: Warleigh Tamil Vidyalaya */
        <div className="border border-[#ebdccb] bg-[#faf8f5] p-6 rounded-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#ebdccb] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#a85022]">Census: 18042</span>
                <span className="text-xs bg-[#ebdccb] text-[#1a1714] px-2 py-0.5 rounded font-semibold">
                  Type 3 Primary School
                </span>
                <span className="text-xs bg-[#ebf5ef] text-[#246342] px-2 py-0.5 rounded font-semibold">
                  Estate Community Anchor
                </span>
              </div>
              <h4 className="text-xl font-serif font-bold text-[#1a1714] mt-1">
                Warleigh Tamil Vidyalaya, Dickoya (Central Province)
              </h4>
              <p className="text-xs text-[#73685e] mt-0.5">
                Enrollment: 42 pupils • 3 teachers • Tamil Medium • Primary (Grades 1–5 Multi-grade)
              </p>
            </div>

            <Link
              href="/atlas/school/18042"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#246342] hover:bg-[#1c4d33] text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <span>View School Dossier</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
              <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                Official SQA Audit
              </span>
              <div className="text-2xl font-serif font-bold text-[#c93018] mt-1">48.6 / 100</div>
              <span className="text-xs font-semibold text-[#c93018]">
                Grade D (Bureaucratic Failure)
              </span>
              <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                Penalized by the state for lacking science labs, computer rooms, and specialist
                sports instructors.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-[#246342]">
              <span className="text-[10px] uppercase font-bold text-[#246342] tracking-wider block">
                Grounded C-ARI Score
              </span>
              <div className="text-2xl font-serif font-bold text-[#246342] mt-1">86.1 / 100</div>
              <span className="text-xs font-semibold text-[#246342]">
                Heroic Attunement &amp; Care
              </span>
              <p className="text-[11px] text-[#615951] mt-1.5 leading-relaxed">
                High relational proximity, genuine multi-grade pastoral care, and life-saving daily
                caloric floor.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
              <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                Ratio Theater Delta (Δ)
              </span>
              <div className="text-2xl font-mono font-bold text-[#246342] mt-1">
                0.0 (True 14:1)
              </div>
              <span className="text-xs font-semibold text-[#1a1714]">No Statistical Illusion</span>
              <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                Individual child attunement probability:{' '}
                <strong className="text-[#1a1714]">~7.1% – 15.0%</strong> per 40-minute period.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
              <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                SDS Shadow Treasury
              </span>
              <div className="text-2xl font-mono font-bold text-[#1a1714] mt-1">Rs. 24,000</div>
              <span className="text-xs font-semibold text-[#73685e]">
                0% Private Capital Inflow
              </span>
              <p className="text-[11px] text-[#73685e] mt-1.5 leading-relaxed">
                Parents are daily tea plantation pluckers earning Rs. 1,000/day. No alumni endowment
                exists.
              </p>
            </div>
          </div>

          <div className="bg-[#ebf5ef] p-4 rounded-xl text-xs sm:text-sm text-[#1e4d34] leading-relaxed">
            <strong className="text-[#1a1714]">POSIWID Diagnostic:</strong> Despite official SQA
            condemnation, this school is a thermodynamic sanctuary. The 3 teachers notice when a
            child is feverish or hungry, feed them the state meal, and provide human safety. The
            state audit measures what it values (bureaucratic artifacts), but misses what sustains
            life.
          </div>
        </div>
      )}
    </div>
  );
}
