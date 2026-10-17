'use client';

import React from 'react';

export function AtlasCompassLogistics() {
  return (
    <>
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
            Logistics &amp; Distribution Architecture
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
            The Logistics of Education: Trunk Lines, Zonal Hubs &amp; The Last Mile
          </h3>
          <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-3xl">
            Framing education as a physical logistics and freight problem reveals why centralized
            solutions fail and exposes the fallacy of &quot;zero marginal cost&quot; digital
            learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tier 1: Trunk Lines */}
          <div className="bg-[#faf8f5] border border-[#ebdccb] p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                Tier 1: Central Trunk
              </span>
              <span className="text-xs font-mono font-bold text-[#1a1714]">Isurupaya / NIE</span>
            </div>
            <h4 className="text-base font-serif font-bold text-[#1a1714]">
              Centralized Trunk Lines
            </h4>
            <p className="text-xs text-[#615951] leading-relaxed">
              National curriculum design, syllabi printing, textbook production, and national O/L
              and A/L examinations.
            </p>
            <div className="pt-2 border-t border-[#ebdccb] text-[11px] text-[#73685e] space-y-1">
              <div>
                <strong>Marginal Cost:</strong> Near zero (bulk printing &amp; broadcasting).
              </div>
              <div>
                <strong>Capability:</strong> Exceptional at standardization.
              </div>
              <div>
                <strong>Failure Mode:</strong> Completely context-blind.
              </div>
            </div>
          </div>

          {/* Tier 2: Zonal Hubs */}
          <div className="bg-[#faf8f5] border border-[#ebdccb] p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                Tier 2: Regional Relay
              </span>
              <span className="text-xs font-mono font-bold text-[#a85022]">100 Zonal Offices</span>
            </div>
            <h4 className="text-base font-serif font-bold text-[#1a1714]">
              Regional Distribution Hubs
            </h4>
            <p className="text-xs text-[#615951] leading-relaxed">
              Teacher transfers, circular compliance, school inspections, distribution of laboratory
              kits and sports equipment.
            </p>
            <div className="pt-2 border-t border-[#ebdccb] text-[11px] text-[#73685e] space-y-1">
              <div>
                <strong>Marginal Cost:</strong> High bureaucratic friction &amp; paper latency.
              </div>
              <div>
                <strong>Capability:</strong> Regional administrative oversight.
              </div>
              <div>
                <strong>Failure Mode:</strong> Patronage, delayed transfers, paper audits.
              </div>
            </div>
          </div>

          {/* Tier 3: The Last Mile */}
          <div className="bg-[#fbf7f0] border-2 border-[#a85022] p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#a85022] tracking-wider">
                Tier 3: The Edge
              </span>
              <span className="text-xs font-mono font-bold text-[#a85022]">9,962 Schools</span>
            </div>
            <h4 className="text-base font-serif font-bold text-[#1a1714]">The Human Last Mile</h4>
            <p className="text-xs text-[#615951] leading-relaxed">
              215,000 classrooms where a teacher looks a child in the eye, serves a meal, and
              co-regulates emotion.
            </p>
            <div className="pt-2 border-t border-[#ebdccb] text-[11px] text-[#73685e] space-y-1">
              <div>
                <strong>Marginal Cost:</strong> High metabolic &amp; somatic labor.
              </div>
              <div>
                <strong>Capability:</strong> True human development &amp; pastoral care.
              </div>
              <div>
                <strong>Failure Mode:</strong> Cannot be compressed or automated.
              </div>
            </div>
          </div>
        </div>

        {/* The AI Fallacy Callout */}
        <div className="bg-[#fff9f5] border border-[#f5c7c2] p-5 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#c93018] uppercase tracking-wider">
              The Convivial Limit:
            </span>
            <span className="text-xs font-serif font-bold text-[#1a1714]">
              Why Generative AI Cannot Solve the Last Mile
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#403933] leading-relaxed">
            Techno-solutionists claim generative AI offers &quot;zero marginal cost personal
            tutors&quot; for every child. This confuses <em>information reproduction</em> with{' '}
            <em>human education</em>. Education is not data retrieval; it is somatic presence,
            relational co-regulation, and biological nurture. An LLM cannot feed a hungry child in
            Nuwara Eliya, notice silent despair, or hold a classroom in loving stillness. AI can
            augment the teacher&apos;s administrative burden (exoskeleton), but it can never replace
            the human holding environment of the last mile.
          </p>
        </div>
      </div>

      {/* 5. THE RED QUEEN CREDENTIAL LADDER */}
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
            Historical Trajectory
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
            The Red Queen Credential Escalation Ladder (1960–2026)
          </h3>
          <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-3xl">
            Tracing how the positional value of educational credentials has decayed over six decades
            of hyper-credentialism:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#ebdccb]">
            <span className="text-xs font-mono font-bold text-[#73685e] block">
              1960s • Post-Independence
            </span>
            <div className="text-lg font-serif font-bold text-[#1a1714] mt-1">
              Grade 5 / O-Level
            </div>
            <p className="text-xs text-[#615951] mt-2 leading-relaxed">
              Passing the O-Level or Grade 5 Scholarship guaranteed a permanent government clerical
              job or village teacher post. Credential was a scarce, high-yield ticket to the middle
              class.
            </p>
          </div>

          <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#ebdccb]">
            <span className="text-xs font-mono font-bold text-[#73685e] block">
              1980s • Open Economy
            </span>
            <div className="text-lg font-serif font-bold text-[#1a1714] mt-1">
              A-Level &amp; State Degree
            </div>
            <p className="text-xs text-[#615951] mt-2 leading-relaxed">
              O-Level became table stakes. A-Level pass required for bank clerk posts; state
              university degree guaranteed rapid promotion into civil service or corporate
              management.
            </p>
          </div>

          <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#ebdccb]">
            <span className="text-xs font-mono font-bold text-[#73685e] block">
              2000s • IT &amp; Private TNE
            </span>
            <div className="text-lg font-serif font-bold text-[#1a1714] mt-1">
              Degree + CIMA / SLIIT
            </div>
            <p className="text-xs text-[#615951] mt-2 leading-relaxed">
              State degree diluted. Professional accounting (CIMA/ACCA), private IT degrees, and
              English fluency (<span className="italic">Kaduwa</span>) became mandatory to avoid
              unemployment.
            </p>
          </div>

          <div className="bg-[#fbf7f0] p-5 rounded-xl border-2 border-[#a85022]">
            <span className="text-xs font-mono font-bold text-[#a85022] block">
              2026 • Hyper-Inflation
            </span>
            <div className="text-lg font-serif font-bold text-[#a85022] mt-1">
              Master&apos;s + Global Portfolio
            </div>
            <p className="text-xs text-[#615951] mt-2 leading-relaxed">
              First degrees are universal hygiene factors. Entry into elite jobs requires foreign
              credentials, AI certifications, and social capital. O/L and A/L are merely screening
              filters.
            </p>
          </div>
        </div>
      </div>

      {/* 6. WHATSAPP BOT & OMNICHANNEL EXOSKELETON CALLOUT */}
      <div className="bg-[#1a1714] text-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#f5eee1] bg-[#332b24] px-2.5 py-0.5 rounded-full border border-[#4d4036]">
                Omnichannel Edge Gateway
              </span>
              <span className="text-xs text-[#a85022] font-mono">Meta Cloud API v21.0</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              EdLove WhatsApp Ground Truth Bot &amp; Teacher Exoskeleton
            </h3>
            <p className="text-xs sm:text-sm text-[#b8ada2] mt-1 max-w-2xl leading-relaxed">
              Bridging the digital divide by bringing the 9,962-school Education Atlas directly to
              WhatsApp—the only zero-friction platform with 100% household penetration in Sri Lanka.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <div className="bg-[#2c241e] border border-[#4d4036] p-3 rounded-xl text-center">
              <span className="text-[10px] text-[#b8ada2] uppercase tracking-wider block">
                Terminal Simulator
              </span>
              <span className="text-xs font-mono font-bold text-[#f5eee1]">
                whatsapp-simulator.mjs
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-[#241f1a] border border-[#3d332a] p-4 rounded-xl">
            <span className="text-xs font-bold text-[#f5eee1] flex items-center gap-1.5 mb-1">
              <span>📱</span> Civic School Ground Truth Bot (Parents)
            </span>
            <p className="text-xs text-[#b8ada2] leading-relaxed">
              Send{' '}
              <code className="text-[#f5eee1] bg-[#1a1714] px-1.5 py-0.5 rounded font-mono">
                Dharmapala
              </code>{' '}
              or{' '}
              <code className="text-[#f5eee1] bg-[#1a1714] px-1.5 py-0.5 rounded font-mono">
                01002
              </code>{' '}
              to WhatsApp. Receive an instant C-ARI score card, real classroom density (48:1), Ratio
              Theater Delta, and shadow tuition breakdown at zero data cost.
            </p>
          </div>

          <div className="bg-[#241f1a] border border-[#3d332a] p-4 rounded-xl">
            <span className="text-xs font-bold text-[#f5eee1] flex items-center gap-1.5 mb-1">
              <span>🎙️</span> Voice-to-Ledger Exoskeleton (Teachers)
            </span>
            <p className="text-xs text-[#b8ada2] leading-relaxed">
              Teacher sends a 30-second voice note in Sinhala or Tamil. Whisper/Gemini extracts
              structured JSON, auto-populating the daily lesson record (
              <span className="italic">Pādam Satahana</span>) and attendance without touching a
              browser.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
