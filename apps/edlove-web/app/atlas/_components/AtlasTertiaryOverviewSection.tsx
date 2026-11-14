'use client';

import React from 'react';
import type {
  NvqLevel,
  TertiaryInstitution,
  TertiaryProgram,
  TransitionPathway,
} from '../_types/atlas.types';

export interface AtlasTertiaryOverviewSectionProps {
  selectedCohort: string;
  setSelectedCohort: (cohort: string) => void;
  selectedStream: string;
  setSelectedStream: (stream: string) => void;
  pathways: TransitionPathway[];
  selectedInstType: string;
  setSelectedInstType: (type: string) => void;
  instSearch: string;
  setInstSearch: (search: string) => void;
  tertiaryInstitutions: TertiaryInstitution[];
  tertiaryPrograms: TertiaryProgram[];
  selectedNvqStep: number | null;
  setSelectedNvqStep: (step: number | null) => void;
  nvqFramework: NvqLevel[];
}

export function AtlasTertiaryOverviewSection({
  selectedCohort,
  setSelectedCohort,
  selectedStream,
  setSelectedStream,
  pathways,
  selectedInstType,
  setSelectedInstType,
  instSearch,
  setInstSearch,
  tertiaryInstitutions,
  tertiaryPrograms,
  selectedNvqStep,
  setSelectedNvqStep,
  nvqFramework,
}: AtlasTertiaryOverviewSectionProps) {
  return (
    <>
      {/* SECTION 2: THE INTERACTIVE NVQ QUALIFICATION STEP-LADDER (LEVELS 1-7) */}
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebdccb] pb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#1a1714]">
              The TVEC National Vocational Qualification (NVQ) Step-Ladder
            </h3>
            <p className="text-xs text-[#73685e] mt-0.5">
              Climbing from Craftsman (Level 3-4) to Higher National Diploma (Level 6) and Bachelor
              of Technology Degree (Level 7)
            </p>
          </div>
          <div className="text-xs bg-[#eef5ee] text-[#246342] font-semibold px-3 py-1.5 rounded-lg border border-[#cce5cf]">
            💡 O/L Leavers can graduate with a BTech without sitting A/Ls!
          </div>
        </div>

        {/* Step-Ladder Interactive Visualizer */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-7 gap-2">
          {nvqFramework.map((lvl) => {
            const isSelected = selectedNvqStep === lvl.nvq_level;
            const isDegree = lvl.nvq_level === 7;
            const isDiploma = lvl.nvq_level >= 5;

            return (
              <button
                key={lvl.nvq_level}
                onClick={() => setSelectedNvqStep(isSelected ? null : lvl.nvq_level)}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1a1714] text-white border-[#1a1714] shadow-md scale-[1.02]'
                    : isDegree
                      ? 'bg-[#fbf4ee] border-[#e8cbb0] hover:border-[#a85022]'
                      : isDiploma
                        ? 'bg-[#f7f5ee] border-[#ddd7c4] hover:border-[#73685e]'
                        : 'bg-[#faf8f5] border-[#ebdccb] hover:border-[#a8a096]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : isDegree
                            ? 'bg-[#a85022] text-white'
                            : 'bg-[#e8dbca] text-[#615951]'
                      }`}
                    >
                      NVQ {lvl.nvq_level}
                    </span>
                    {isDegree && <span className="text-xs">🎓</span>}
                  </div>
                  <div
                    className={`font-bold text-xs mt-2 line-clamp-2 ${isSelected ? 'text-white' : 'text-[#1a1714]'}`}
                  >
                    {lvl.level_name_en.split(':')[1]?.trim() || lvl.level_name_en}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-black/10">
                  <div
                    className={`text-[10px] font-medium ${isSelected ? 'text-white/80' : 'text-[#73685e]'}`}
                  >
                    {lvl.equivalent_academic_tier}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Expanded NVQ Step Detail Card */}
        {selectedNvqStep &&
          (() => {
            const step = nvqFramework.find((n) => n.nvq_level === selectedNvqStep);
            if (!step) return null;
            const bodies: string[] = step.apex_awarding_bodies_json
              ? JSON.parse(step.apex_awarding_bodies_json)
              : [];

            return (
              <div className="mt-5 p-5 bg-[#faf8f5] border border-[#e5dec9] rounded-xl text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-[#1a1714] flex items-center gap-2">
                    <span className="bg-[#a85022] text-white px-2 py-0.5 rounded text-xs font-mono">
                      NVQ Level {step.nvq_level}
                    </span>
                    <span>{step.level_name_en}</span>
                    {step.level_name_si && (
                      <span className="text-[#73685e] font-serif font-normal">
                        ({step.level_name_si})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedNvqStep(null)}
                    className="text-[#73685e] hover:text-[#1a1714] font-bold text-sm"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                      Entry Requirement
                    </div>
                    <div className="text-xs text-[#1a1714] mt-1">{step.entry_requirement}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                      Academic Equivalence
                    </div>
                    <div className="text-xs font-bold text-[#246342] mt-1">
                      {step.equivalent_academic_tier}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                      Typical Career Tier
                    </div>
                    <div className="text-xs text-[#1a1714] mt-1">{step.typical_career_tier}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#ebdccb]">
                  <div className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider mb-1.5">
                    Apex Awarding Institutions & Bodies
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {bodies.map((b) => (
                      <span
                        key={b}
                        className="bg-white border border-[#d6cbba] px-2.5 py-1 rounded-md text-xs font-medium text-[#1a1714]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
      </div>

      {/* SECTION 3: ALTERNATIVE PATHWAY SIMULATOR ("LIFE AFTER A/LS & O/LS") */}
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
        <div className="border-b border-[#ebdccb] pb-4">
          <h3 className="text-lg font-serif font-bold text-[#1a1714]">
            Post-Secondary Transition Pathway Simulator
          </h3>
          <p className="text-xs text-[#73685e] mt-0.5">
            Filter proven trajectories tailored to your examination cohort and academic stream
          </p>
        </div>

        {/* Filters Strip */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Cohort Selector */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs font-bold text-[#73685e] mr-2 self-center">Cohort:</span>
            {[
              { id: 'al_qualified_ugc_unadmitted', label: 'Passed A/L (No Uni Seat)' },
              { id: 'al_attempted_unqualified', label: 'Attempted A/L (Unqualified)' },
              { id: 'ol_exit_direct', label: 'Direct G.C.E. O/L Exit' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCohort(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCohort === c.id
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'bg-[#faf8f5] border border-[#d6cbba] text-[#615951] hover:bg-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Stream Selector */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs font-bold text-[#73685e] mr-2 self-center">Stream:</span>
            {[
              { id: 'all', label: 'All Streams' },
              { id: 'physical_science', label: 'Maths' },
              { id: 'commerce', label: 'Commerce' },
              { id: 'technology', label: 'Technology' },
              { id: 'bio_science', label: 'Bio' },
              { id: 'arts', label: 'Arts' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStream(s.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedStream === s.id
                    ? 'bg-[#a85022] text-white'
                    : 'bg-[#faf8f5] border border-[#e5dec9] text-[#73685e] hover:bg-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pathway Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {pathways
            .filter((p) => {
              if (selectedCohort && p.starting_cohort_status !== selectedCohort) return false;
              if (
                selectedStream !== 'all' &&
                p.academic_stream !== selectedStream &&
                p.academic_stream !== 'any'
              ) {
                return false;
              }
              return true;
            })
            .map((p) => {
              const costColor =
                p.cost_profile === 'zero_cost_state_stipend'
                  ? 'bg-[#d6ebd9] text-[#246342]'
                  : p.cost_profile === 'moderate_professional'
                    ? 'bg-[#fbe9dc] text-[#a85022]'
                    : p.cost_profile === 'high_private'
                      ? 'bg-[#e2eaf4] text-[#1a3e6a]'
                      : 'bg-[#f4efe5] text-[#73685e]';

              const costLabel =
                p.cost_profile === 'zero_cost_state_stipend'
                  ? 'Free State (Stipend)'
                  : p.cost_profile === 'moderate_professional'
                    ? 'Low/Moderate Professional'
                    : p.cost_profile === 'high_private'
                      ? 'Self-Financed Private'
                      : 'Low Government Fee';

              return (
                <div
                  key={p.pathway_id}
                  className="bg-[#faf8f5] border border-[#e5dec9] p-5 rounded-xl flex flex-col justify-between hover:border-[#c5b8a3] transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-[#1a1714] leading-snug">
                        {p.title_en}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider ${costColor}`}
                      >
                        {costLabel}
                      </span>
                    </div>

                    <p className="text-xs text-[#615951] mt-2.5 leading-relaxed">
                      {p.description_en}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#ebdccb] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#73685e]">Horizon to Work:</span>
                      <span className="font-bold font-mono text-[#1a1714]">
                        {p.time_to_employment_months} Months
                      </span>
                    </div>

                    {p.strategic_advisory && (
                      <div className="bg-[#fffefb] border border-[#ebdccb] p-2.5 rounded-lg text-[11px] text-[#423c35] flex items-start gap-1.5">
                        <span className="text-xs">📌</span>
                        <span className="leading-snug">{p.strategic_advisory}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* SECTION 4: SOVEREIGN TERTIARY & VOCATIONAL INSTITUTIONS DIRECTORY */}
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdccb] pb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#1a1714]">
              Higher Education & Vocational Institutions Directory
            </h3>
            <p className="text-xs text-[#73685e] mt-0.5">
              55 sovereign universities, technological institutes, technical colleges, and chartered
              guilds
            </p>
          </div>

          {/* Search in Directory */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search institution or town..."
              value={instSearch}
              onChange={(e) => setInstSearch(e.target.value)}
              className="w-full bg-[#faf8f5] border border-[#d6cbba] px-3 py-1.5 rounded-lg text-xs focus:outline-hidden focus:border-[#a85022]"
            />
          </div>
        </div>

        {/* Institution Type Filter Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'all', label: `All Institutions (${tertiaryInstitutions.length})` },
            { id: 'state_ugc_university', label: '17 State Universities' },
            { id: 'state_technical_sliate', label: '19 SLIATE ATIs' },
            { id: 'state_vocational_dtet', label: 'Technical Colleges & CGTTI' },
            { id: 'state_non_ugc_institute', label: 'UNIVOTEC / Ocean Uni / KDU' },
            { id: 'semi_state_private_degree', label: 'SLIIT / NSBM / CINEC' },
            { id: 'professional_chartered_guild', label: 'Chartered Guilds (AAT / CA)' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedInstType(t.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedInstType === t.id
                  ? 'bg-[#1a1714] text-white shadow-xs'
                  : 'bg-[#faf8f5] border border-[#e5dec9] text-[#73685e] hover:bg-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Institutions Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tertiaryInstitutions
            .filter((inst) => {
              if (selectedInstType !== 'all' && inst.inst_type !== selectedInstType) return false;
              if (instSearch.trim()) {
                const q = instSearch.toLowerCase();
                const matchName =
                  inst.name_en.toLowerCase().includes(q) ||
                  (inst.name_si && inst.name_si.toLowerCase().includes(q));
                const matchTown = inst.address_town && inst.address_town.toLowerCase().includes(q);
                const matchNotes = inst.notes && inst.notes.toLowerCase().includes(q);
                if (!matchName && !matchTown && !matchNotes) return false;
              }
              return true;
            })
            .map((inst) => {
              const typeLabel =
                inst.inst_type === 'state_ugc_university'
                  ? 'State UGC University'
                  : inst.inst_type === 'state_technical_sliate'
                    ? 'SLIATE ATI'
                    : inst.inst_type === 'professional_chartered_guild'
                      ? 'Chartered Guild'
                      : inst.inst_type === 'semi_state_private_degree'
                        ? 'Semi-State / Private Degree'
                        : inst.inst_type === 'state_vocational_dtet'
                          ? 'Technical College / Apprentice'
                          : 'State Non-UGC';

              const typeColor =
                inst.inst_type === 'state_ugc_university'
                  ? 'bg-[#d6ebd9] text-[#246342]'
                  : inst.inst_type === 'state_technical_sliate'
                    ? 'bg-[#e2eaf4] text-[#1a3e6a]'
                    : inst.inst_type === 'professional_chartered_guild'
                      ? 'bg-[#fbe9dc] text-[#a85022]'
                      : 'bg-[#f4efe5] text-[#73685e]';

              return (
                <div
                  key={inst.inst_id}
                  className="bg-[#faf8f5] border border-[#e5dec9] p-4 rounded-xl flex flex-col justify-between hover:border-[#c5b8a3] transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor}`}
                      >
                        {typeLabel}
                      </span>
                      {inst.established_year && (
                        <span className="text-[10px] font-mono text-[#a8a096]">
                          Est. {inst.established_year}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-[#1a1714] mt-2 leading-snug">
                      {inst.name_en}
                    </h4>
                    {inst.name_si && (
                      <div className="text-xs text-[#73685e] font-serif mt-0.5">{inst.name_si}</div>
                    )}

                    <div className="text-xs text-[#615951] mt-2 flex items-center gap-1.5">
                      <span>📍</span>
                      <span>{inst.address_town || 'Sri Lanka'}</span>
                      {inst.district_name && (
                        <span className="text-[#a8a096]">({inst.district_name})</span>
                      )}
                    </div>

                    {inst.notes && (
                      <p className="text-[11px] text-[#73685e] mt-2.5 line-clamp-2 leading-relaxed">
                        {inst.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#ebdccb] flex items-center justify-between text-[11px]">
                    <span className="text-[#a8a096] font-mono">
                      {inst.annual_student_enrollment
                        ? `~${inst.annual_student_enrollment.toLocaleString()} students`
                        : 'Regulated'}
                    </span>
                    {inst.website_url && (
                      <a
                        href={inst.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#a85022] hover:underline font-semibold flex items-center gap-1"
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
    </>
  );
}
