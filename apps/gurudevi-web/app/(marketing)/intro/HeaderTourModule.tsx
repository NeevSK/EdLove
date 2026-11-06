'use client';

import { Bell, HelpCircle, Moon, Search, Sun, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  HEADER_CONTROL_ORDER,
  HEADER_CONTROLS,
  HeaderControlId,
} from '../../../lib/tutii/content/headerControlsStory';
import { TypewriterText } from './TypewriterText';

interface HeaderTourModuleProps {
  onBackToMainTabs?: () => void;
  onFinish?: () => void;
}

// Sanctuary Resonance Rhythm:
// Full breath cycle: 5s Inhale (Tutti speaks calmly) + 5s Exhale (Bottom detail settles)
// Followed by 1 full resting breath cycle (4.5s) before any action or pointer is suggested.
const SPEECH_SPEED_MS = 650; // ~90 WPM: serene spoken delivery
const COGNITIVE_READ_PAUSE_MS = 4500; // 4.5 seconds resting stillness window

export function HeaderTourModule({ onBackToMainTabs, onFinish }: Readonly<HeaderTourModuleProps>) {
  const [activeControl, setActiveControl] = useState<HeaderControlId | null>(null);
  const [suggestedControl, setSuggestedControl] = useState<HeaderControlId>('search');
  const [exploredControls, setExploredControls] = useState<Set<HeaderControlId>>(new Set());

  // Strict Chained Milestones: Top speech finishes -> Bottom box streams -> Bottom finishes -> 2.4s cognitive silence -> CTA appears
  const [isTopSpeechComplete, setIsTopSpeechComplete] = useState<boolean>(false);
  const [isBottomDetailComplete, setIsBottomDetailComplete] = useState<boolean>(false);
  const [isCognitivePauseElapsed, setIsCognitivePauseElapsed] = useState<boolean>(false);

  // Directly click ANY header icon
  const handleSelectControl = useCallback((controlId: HeaderControlId) => {
    // 1. Instantly hide any active CTA pointer and reset pause
    setIsTopSpeechComplete(false);
    setIsBottomDetailComplete(false);
    setIsCognitivePauseElapsed(false);
    setActiveControl(controlId);

    setExploredControls((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(controlId);
      // Pick next unvisited control in order
      const remaining = HEADER_CONTROL_ORDER.find((c) => !nextSet.has(c));
      if (remaining) {
        setSuggestedControl(remaining);
      }
      return nextSet;
    });
  }, []);

  const handleTopSpeechComplete = useCallback(() => {
    setIsTopSpeechComplete(true);
  }, []);

  const handleBottomDetailComplete = useCallback(() => {
    setIsBottomDetailComplete(true);
  }, []);

  // Enforce the 2.4-second cognitive stabilization window before the CTA is allowed to appear
  useEffect(() => {
    if (activeControl === null && isTopSpeechComplete) {
      const timer = setTimeout(() => {
        setIsCognitivePauseElapsed(true);
      }, COGNITIVE_READ_PAUSE_MS);
      return () => clearTimeout(timer);
    }

    if (activeControl !== null && isBottomDetailComplete) {
      const timer = setTimeout(() => {
        setIsCognitivePauseElapsed(true);
      }, COGNITIVE_READ_PAUSE_MS);
      return () => clearTimeout(timer);
    }
  }, [activeControl, isTopSpeechComplete, isBottomDetailComplete]);

  const activeInfo = activeControl ? HEADER_CONTROLS[activeControl] : null;

  const currentSentence = activeInfo
    ? activeInfo.tutiiSentence
    : 'Now look up at the top bar. These are your everyday quick tools. Tap any icon to see how it works.';

  // CTA pointer ONLY appears AFTER both speech and bottom box detail finish + 2.4s cognitive silence!
  const showPointerCTA =
    activeControl === null
      ? isTopSpeechComplete && isCognitivePauseElapsed
      : isBottomDetailComplete &&
        isCognitivePauseElapsed &&
        !exploredControls.has(suggestedControl);

  return (
    <div className="relative min-h-[660px] w-full max-w-2xl mx-auto flex flex-col justify-between items-center select-none py-4">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP: LIVING TUTTI (SPEAKER & GUIDE)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full flex flex-col items-center pt-2">
        {/* Soft Ambient Gold Glow */}
        <div
          className="absolute -top-4 w-48 h-48 rounded-full bg-amber-400/15 blur-3xl pointer-events-none animate-pulse"
          aria-hidden="true"
        />

        {/* Mascot Character */}
        <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 shrink-0 transition-transform duration-700 animate-[bounce_4.5s_ease-in-out_infinite]">
          <Image
            src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
            alt="Tutti"
            width={96}
            height={96}
            className="object-contain filter drop-shadow-[0_0_24px_rgba(251,191,36,0.45)]"
            priority
          />
        </div>

        {/* Conversational Word-by-Word Speech Balloon */}
        <div className="relative z-20 mt-4 max-w-lg w-full px-4">
          <div className="relative bg-stone-900/95 border border-amber-500/30 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl transition-all duration-500 min-h-[88px] flex items-center justify-center">
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-900 border-t border-l border-amber-500/30 rotate-45"
              aria-hidden="true"
            />
            <p className="text-base sm:text-lg font-medium text-stone-100 text-center leading-relaxed">
              &ldquo;
              <TypewriterText
                key={activeControl ?? 'initial-header'}
                text={currentSentence}
                speedMs={SPEECH_SPEED_MS}
                onComplete={handleTopSpeechComplete}
              />
              &rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. THE STAGE: REAL HEADER TOOLBAR SIMULATION
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full flex-1 flex flex-col justify-center items-center py-6 px-4">
        <div className="w-full max-w-lg space-y-8 transition-all duration-500 ease-out animate-in fade-in">
          {/* Real Sanctuary Header Bar Mockup */}
          <div className="relative bg-stone-900/90 border border-stone-800 p-3 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {HEADER_CONTROL_ORDER.map((controlId) => {
                const item = HEADER_CONTROLS[controlId];
                const isSelected = activeControl === controlId;
                const isTargetCTA = showPointerCTA && suggestedControl === controlId && !isSelected;

                return (
                  <div key={controlId} className="relative flex flex-col items-center flex-1">
                    <button
                      type="button"
                      onClick={() => handleSelectControl(controlId)}
                      className={`w-full flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-500 ease-out cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 font-bold shadow-[0_0_24px_rgba(251,191,36,0.45)] scale-105'
                          : isTargetCTA
                            ? 'border-2 border-amber-400 bg-amber-400/10 text-amber-300 ring-4 ring-amber-400/20 hover:scale-105'
                            : 'text-stone-400 bg-stone-950/60 hover:text-stone-200 hover:bg-stone-900'
                      }`}
                    >
                      {/* Icon */}
                      <span className="mb-1 text-xl">
                        {item.iconName === 'search' && <Search className="w-5 h-5" />}
                        {item.iconName === 'sun' && <Sun className="w-5 h-5" />}
                        {item.iconName === 'help' && <HelpCircle className="w-5 h-5" />}
                        {item.iconName === 'bell' && (
                          <div className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                          </div>
                        )}
                        {item.iconName === 'user' && <User className="w-5 h-5" />}
                      </span>

                      <span className="text-[11px] font-semibold truncate max-w-full">
                        {item.label}
                      </span>
                    </button>

                    {/* Finger pointer: ONLY appears AFTER bottom box text finishes! Instantly vanishes on click */}
                    {isTargetCTA && (
                      <div className="absolute top-full mt-3 flex flex-col items-center animate-[bounce_2s_ease-in-out_infinite] z-30 pointer-events-none transition-all duration-500 ease-out animate-in fade-in zoom-in-95">
                        <span className="text-2xl mb-1">☝️</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-stone-950/95 px-2 py-0.5 rounded-full border border-amber-400/50 shadow-lg whitespace-nowrap">
                          Click {item.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOCUSED EXPLANATION: Starts ONLY when Tutti top speech finishes! */}
          {activeInfo && isTopSpeechComplete && (
            <div className="bg-stone-900 border border-amber-500/40 rounded-2xl p-5 text-center space-y-1.5 shadow-xl transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                {activeInfo.previewTitle}
              </span>
              <p className="text-xs sm:text-sm text-stone-200">
                <TypewriterText
                  key={`header-detail-${activeInfo.id}`}
                  text={activeInfo.previewDetail}
                  speedMs={SPEECH_SPEED_MS}
                  onComplete={handleBottomDetailComplete}
                />
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. BOTTOM: NAVIGATION CONTROLS & SWITCHER
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full border-t border-stone-900 pt-4 px-4 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2">
          {exploredControls.size > 0 && (
            <span className="text-stone-400">Explored {exploredControls.size} of 5 tools</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onBackToMainTabs && (
            <button
              type="button"
              onClick={onBackToMainTabs}
              className="text-stone-400 hover:text-white transition px-2 py-1"
            >
              ← Back to Main Rooms
            </button>
          )}

          {exploredControls.size >= 2 && onFinish && (
            <button
              type="button"
              onClick={onFinish}
              className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md transition duration-200"
            >
              I’m Ready to Start →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
