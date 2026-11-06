'use client';

import Image from 'next/image';

interface LivingTuttiProps {
  spokenText: string;
  mood?: 'greeting' | 'explaining' | 'excited' | 'proud';
}

export function LivingTutti({ spokenText, mood = 'explaining' }: Readonly<LivingTuttiProps>) {
  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* ── Ambient Floating Glow Halo ── */}
      <div
        className="absolute -top-6 w-44 h-44 rounded-full bg-amber-400/15 blur-3xl pointer-events-none animate-pulse"
        aria-hidden="true"
      />

      {/* ── Orbiting Firefly Sparks ── */}
      <div className="absolute top-2 w-28 h-28 pointer-events-none" aria-hidden="true">
        <span
          className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 blur-[0.5px] shadow-[0_0_8px_#fde047] animate-ping"
          style={{ top: '15%', left: '10%', animationDuration: '3s' }}
        />
        <span
          className="absolute w-1 h-1 rounded-full bg-amber-400 blur-[0.5px] shadow-[0_0_6px_#fbbf24]"
          style={{ top: '75%', right: '15%', animation: 'bounce 2.2s infinite' }}
        />
        <span
          className="absolute w-2 h-2 rounded-full bg-amber-200/80 blur-[1px] shadow-[0_0_10px_#fef08a]"
          style={{ bottom: '10%', left: '20%', animation: 'pulse 1.8s infinite' }}
        />
      </div>

      {/* ── The Living Character Avatar (Gentle Organic Float) ── */}
      <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 shrink-0 transition-transform duration-500 hover:scale-110 cursor-pointer">
        <div className="w-full h-full animate-[bounce_3.5s_ease-in-out_infinite]">
          <Image
            src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
            alt="Tutti the Living Firefly Guide"
            width={96}
            height={96}
            className="object-contain filter drop-shadow-[0_0_20px_rgba(251,191,36,0.45)]"
            priority
          />
        </div>
      </div>

      {/* ── Organic Breathing Speech Balloon (Tailored, Alive) ── */}
      <div className="relative z-20 mt-3 max-w-lg mx-auto px-4">
        <div className="relative bg-gradient-to-b from-stone-900/90 to-stone-950/95 border border-amber-500/30 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300">
          {/* Subtle pointer notch angled up to Tutti */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-900 border-t border-l border-amber-500/30 rotate-45"
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Tutti
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-500">Guide</span>
          </div>

          <p className="relative text-sm sm:text-base font-medium text-stone-100 leading-relaxed text-center sm:text-left transition-opacity duration-300">
            &ldquo;{spokenText}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
