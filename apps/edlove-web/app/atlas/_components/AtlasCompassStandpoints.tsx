'use client';

import React from 'react';

export interface AtlasCompassStandpointsProps {
  compassStandpoint: 'child' | 'parent' | 'teacher' | 'tutor' | 'bureaucrat';
  setCompassStandpoint: (
    standpoint: 'child' | 'parent' | 'teacher' | 'tutor' | 'bureaucrat',
  ) => void;
}

export function AtlasCompassStandpoints({
  compassStandpoint,
  setCompassStandpoint,
}: AtlasCompassStandpointsProps) {
  return (
    <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
            Standpoint Epistemology
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
            5-Way Systemic Standpoint Matrix
          </h3>
          <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-3xl">
            Truth in complex human systems depends on where you stand. Select an actor to experience
            their lived reality, operational anxiety, and metabolic expenditure:
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-[#f5eee1] p-1.5 rounded-xl text-xs font-semibold">
          {(['child', 'parent', 'teacher', 'tutor', 'bureaucrat'] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setCompassStandpoint(s)}
              className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                compassStandpoint === s
                  ? 'bg-[#1a1714] text-white shadow-xs'
                  : 'text-[#615951] hover:text-[#1a1714]'
              }`}
            >
              {s === 'child' && '🧒 Child'}
              {s === 'parent' && '👨‍👩‍👧 Parent'}
              {s === 'teacher' && '👩‍🏫 Teacher'}
              {s === 'tutor' && '🧑‍🏫 Tuition Master'}
              {s === 'bureaucrat' && '🏛️ Bureaucrat'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#faf8f5] border border-[#ebdccb] p-6 rounded-2xl">
        {compassStandpoint === 'child' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧒</span>
              <div>
                <h4 className="font-serif font-bold text-lg text-[#1a1714]">
                  The Child: Somatic Strain, Hyper-Competition &amp; Play Scarcity
                </h4>
                <span className="text-xs font-mono text-[#a85022]">
                  Primary Recipient • Zero Systemic Voice
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#3d3833] leading-relaxed pt-2">
              <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                <strong className="text-[#1a1714] block mb-1">Urban Student Lived Horizon:</strong>
                Wakes up at 4:45 AM for the cramped school van. Spends 6 hours in a classroom of 48
                under corrugated asbestos. Rushes to tuition until 8:30 PM. Lives under chronic
                cortisol elevation, terrified of failing the Grade 5 Scholarship or O/L, with little
                time for spontaneous play or restorative sleep.
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                <strong className="text-[#1a1714] block mb-1">
                  Rural / Estate Student Lived Horizon:
                </strong>
                Walks 3–5 km on estate or village paths. Enters a multi-grade classroom where 1
                teacher handles Grades 2 and 3 simultaneously. Enjoys greater emotional safety and
                teacher attunement, but experiences the humiliation of lacking revision papers,
                English fluency, or shoes during inter-school sports.
              </div>
            </div>
          </div>
        )}

        {compassStandpoint === 'parent' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👨‍👩‍👧</span>
              <div>
                <h4 className="font-serif font-bold text-lg text-[#1a1714]">
                  The Parent: Positional Panic, Debt &amp; Transgenerational Sacrifice
                </h4>
                <span className="text-xs font-mono text-[#a85022]">
                  Primary Underwriter • Economic Risk Bearer
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#3d3833] leading-relaxed pt-2">
              <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                <strong className="text-[#1a1714] block mb-1">
                  Urban / Suburban Middle-Class Parent:
                </strong>
                Spends 25% to 45% of total household take-home income on private tuition fees,
                school development society (SDS) donations, and school transport. Lives under
                intense social shame if their child falls out of the A/L Science stream.
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                <strong className="text-[#1a1714] block mb-1">
                  Rural / Agrarian / Estate Parent:
                </strong>
                Cannot afford tuition centers in town. Sacrifices gold jewelry or takes microfinance
                loans at 36% APR to buy past papers and boarding fees during the child&apos;s final
                A/L exam year, hoping the child will escape manual labor.
              </div>
            </div>
          </div>
        )}

        {compassStandpoint === 'teacher' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👩‍🏫</span>
              <div>
                <h4 className="font-serif font-bold text-lg text-[#1a1714]">
                  The Classroom Teacher: Syllabus Rush, Crowd Control &amp; Burnout
                </h4>
                <span className="text-xs font-mono text-[#a85022]">
                  Frontline Labor • Emotional Shock Absorber
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#3d3833] leading-relaxed pt-2">
              <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                <strong className="text-[#1a1714] block mb-1">Urban School Teacher Dilemma:</strong>
                Faces 45–50 students in a 40-minute period (less than 50 seconds per child). Must
                rush through the mandatory syllabus (<span className="italic">Pādam Maḷāva</span>)
                to satisfy zonal inspectors, knowing the children will learn the actual concepts in
                evening tuition classes anyway.
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                <strong className="text-[#1a1714] block mb-1">
                  Rural / Remote School Teacher Dilemma:
                </strong>
                Must teach subjects outside their training (e.g., an arts graduate teaching primary
                mathematics and English). Suffers deep emotional exhaustion seeing children arrive
                unfed and barefoot, spending personal salary to purchase exercise books and pencils
                for destitute pupils.
              </div>
            </div>
          </div>
        )}

        {compassStandpoint === 'tutor' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧑‍🏫</span>
              <div>
                <h4 className="font-serif font-bold text-lg text-[#1a1714]">
                  The Tuition Master / Mudalali: Industrial Monetization of State Deficit
                </h4>
                <span className="text-xs font-mono text-[#a85022]">
                  Parallel Commercial Machine • Market Monopolist
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#3d3833] leading-relaxed pt-2">
              <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                <strong className="text-[#1a1714] block mb-1">
                  Mega-Hall Commercial Architecture:
                </strong>
                Rents air-conditioned cinema-style auditoriums holding 1,500 to 3,000 students.
                Combines exam paper prediction, charismatic stage performance, emotional motivation,
                and psychological monetization of parental fear.
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                <strong className="text-[#1a1714] block mb-1">
                  Cybernetic Role in the System:
                </strong>
                Functions as the true curriculum engine of Sri Lanka. While the state MoE issues
                guidelines, the tuition master decides which past-paper questions are drilled,
                effectively controlling national student study behavior.
              </div>
            </div>
          </div>
        )}

        {compassStandpoint === 'bureaucrat' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <h4 className="font-serif font-bold text-lg text-[#1a1714]">
                  The State Bureaucrat: Macro Auditing, Spreadsheets &amp; Circular Defense
                </h4>
                <span className="text-xs font-mono text-[#a85022]">
                  Isurupaya MoE • Administrative Optimizer
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#3d3833] leading-relaxed pt-2">
              <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                <strong className="text-[#1a1714] block mb-1">Administrative Incentives:</strong>
                Optimizes for macro aggregate indicators: maintaining a nominal national
                student-teacher ratio of 1:17, ensuring 100% textbook dispatch before January, and
                printing national exam papers without leaks.
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#e5dec9]">
                <strong className="text-[#1a1714] block mb-1">Institutional Blindspot:</strong>
                Completely blind to physical classroom room density and the emotional toll on rural
                teachers. Measures success by the volume of completed circulars and SQA audit forms
                filed, rather than the relational attunement of classrooms.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
