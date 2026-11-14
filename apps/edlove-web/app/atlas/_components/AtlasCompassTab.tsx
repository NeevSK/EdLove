'use client';

import React from 'react';
import { AtlasCompassArchetypes } from './AtlasCompassArchetypes';
import { AtlasCompassLogistics } from './AtlasCompassLogistics';
import { AtlasCompassStandpoints } from './AtlasCompassStandpoints';

export interface AtlasCompassTabProps {
  compassStandpoint: 'child' | 'parent' | 'teacher' | 'tutor' | 'bureaucrat';
  setCompassStandpoint: (
    standpoint: 'child' | 'parent' | 'teacher' | 'tutor' | 'bureaucrat',
  ) => void;
  compassArchetype: 'urban' | 'rural';
  setCompassArchetype: (archetype: 'urban' | 'rural') => void;
}

export function AtlasCompassTab({
  compassStandpoint,
  setCompassStandpoint,
  compassArchetype,
  setCompassArchetype,
}: AtlasCompassTabProps) {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                Cybernetic Realism • POSIWID
              </span>
              <span className="text-xs text-[#824112] font-mono bg-[#f5eee1] px-2 py-0.5 rounded border border-[#e8dbca]">
                Systemantics Analytical Framework
              </span>
              <span className="text-xs text-[#246342] font-mono bg-[#ebf5ef] px-2 py-0.5 rounded border border-[#c3e3cf]">
                C-ARI Ground Truth Engine
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1714]">
              Systemantics &amp; Relational Compass
            </h2>
            <p className="text-sm text-[#615951] mt-2 leading-relaxed">
              Unmasking the cybernetic reality of Sri Lankan education beyond aggregate statistical
              illusions. This compass balances the life-saving material floor (universal nutrition,
              literacy, social flattening) against the relentless Red Queen credential treadmill,
              Ratio Theater deltas, and the physical limits of centralized logistics.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <a
              href="https://edlove.org/research"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1a1714] hover:bg-[#2c241e] text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>Read Canonical Treatises</span>
              <span>↗</span>
            </a>
            <span className="text-[11px] text-[#73685e] text-center font-mono">
              Stafford Beer • Gall • Hirsch
            </span>
          </div>
        </div>

        {/* Substrate Metrics Ribbon */}
        <div className="mt-6 pt-6 border-t border-[#f0e7d8] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#ebdccb]">
            <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
              Grounded Substrate
            </span>
            <span className="text-lg font-serif font-bold text-[#1a1714]">9,962 Schools</span>
            <span className="text-[11px] text-[#615951] block mt-0.5">
              Physical distribution points
            </span>
          </div>
          <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#ebdccb]">
            <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
              Thermodynamic Floor
            </span>
            <span className="text-lg font-serif font-bold text-[#246342]">1.6M Midday Meals</span>
            <span className="text-[11px] text-[#615951] block mt-0.5">
              Universal caloric anchor
            </span>
          </div>
          <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#ebdccb]">
            <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
              Ratio Theater Delta
            </span>
            <span className="text-lg font-serif font-bold text-[#c93018]">+26.4 Delta</span>
            <span className="text-[11px] text-[#615951] block mt-0.5">
              48:1 room vs 1:21 nominal
            </span>
          </div>
          <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#ebdccb]">
            <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
              Shadow Treasury Gap
            </span>
            <span className="text-lg font-serif font-bold text-[#a85022]">Rs. 68.5M vs 24K</span>
            <span className="text-[11px] text-[#615951] block mt-0.5">
              Urban SDS vs Estate Primary
            </span>
          </div>
        </div>
      </div>

      {/* 1. THE DIALECTIC OF THE FLOOR VS. THE RED QUEEN */}
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
            Dialectical Synthesis
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
            The Dialectic of the Floor and the Red Queen
          </h3>
          <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-3xl">
            A systemic critique that ignores the material floor is cruel; a defense that ignores the
            Red Queen race is blind. Here is the structural tension at the core of free education in
            Sri Lanka:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* The Floor Column */}
          <div className="bg-[#f7faf8] border-2 border-[#246342]/40 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#246342] tracking-wider bg-[#ebf5ef] px-2.5 py-1 rounded-md border border-[#c3e3cf]">
                The Material Floor (Positive Functions)
              </span>
              <span className="text-xs font-mono text-[#246342] font-bold">Upliftment</span>
            </div>
            <h4 className="text-base font-serif font-bold text-[#1a1714]">
              The Life-Saving Floor: Nutrition, Literacy &amp; Basic Flattening
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-[#3d3833] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#246342] font-bold">✓</span>
                <div>
                  <strong className="text-[#1a1714]">Universal Caloric Anchor:</strong> The free
                  mid-day meal (<span className="italic">Daval Ahāra</span>) sustains over 1.6
                  million primary students, preventing acute wasting in rural and plantation
                  communities where food poverty exceeds 40%.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#246342] font-bold">✓</span>
                <div>
                  <strong className="text-[#1a1714]">
                    The White Uniform (<span className="italic">Sudu Enduma</span>):
                  </strong>{' '}
                  Flattens caste, class, and estate distinctions during school hours, establishing a
                  shared civic baseline of dignity for every child regardless of household income.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#246342] font-bold">✓</span>
                <div>
                  <strong className="text-[#1a1714]">Universal Adult Literacy:</strong> Maintained
                  adult literacy above 92.5% for decades, paired with school dental clinics and
                  immunization drives that built Sri Lanka&apos;s celebrated PQLI indicators.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#246342] font-bold">✓</span>
                <div>
                  <strong className="text-[#1a1714]">Micro-Validity of Upward Mobility:</strong>{' '}
                  Real escape velocity for individual rural strivers (
                  <span className="italic">pahasukam nathi daruwan</span>) who reach state medical,
                  engineering, and administrative cadres through pure meritocratic grit.
                </div>
              </li>
            </ul>
          </div>

          {/* The Red Queen Column */}
          <div className="bg-[#fdfaf8] border-2 border-[#c93018]/40 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#c93018] tracking-wider bg-[#fbeeed] px-2.5 py-1 rounded-md border border-[#f5c7c2]">
                The Red Queen (Systemic Pathologies)
              </span>
              <span className="text-xs font-mono text-[#c93018] font-bold">Escalation</span>
            </div>
            <h4 className="text-base font-serif font-bold text-[#1a1714]">
              The Positional Treadmill: Credential Inflation &amp; Burnout
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-[#3d3833] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#c93018] font-bold">⚠</span>
                <div>
                  <strong className="text-[#1a1714]">Fred Hirsch Positional Competition:</strong>{' '}
                  Because high-wage modern jobs remain strictly bounded, credentials suffer rapid
                  inflation. When everyone stands on their tiptoes at the parade, nobody sees
                  better, but everyone&apos;s legs ache.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c93018] font-bold">⚠</span>
                <div>
                  <strong className="text-[#1a1714]">The Van Valen Red Queen Effect:</strong>{' '}
                  &quot;It takes all the running you can do, to keep in the same place.&quot; The
                  Grade 5 Scholarship that once guaranteed security now merely qualifies a child to
                  enter another 8-year gauntlet of tuition.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c93018] font-bold">⚠</span>
                <div>
                  <strong className="text-[#1a1714]">
                    The Transclasse Alienation of Climbers:
                  </strong>{' '}
                  Rural strivers who climb the pyramid find themselves dislocated from their village
                  roots, while facing subtle linguistic and social gatekeeping (
                  <span className="italic">Kaduwa</span>) in the Colombo corporate/administrative
                  elite.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c93018] font-bold">⚠</span>
                <div>
                  <strong className="text-[#1a1714]">Metabolic Cortisol Saturation:</strong>{' '}
                  12-to-14 hour schedules combining school, double-tuition, and homework create
                  chronic sleep deprivation, anxiety, and metabolic burnout in 10-to-18 year olds.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <AtlasCompassArchetypes
        compassArchetype={compassArchetype}
        setCompassArchetype={setCompassArchetype}
      />
      <AtlasCompassStandpoints
        compassStandpoint={compassStandpoint}
        setCompassStandpoint={setCompassStandpoint}
      />
      <AtlasCompassLogistics />
    </div>
  );
}
