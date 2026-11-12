'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AVAILABLE_ROLES_LIST,
  getRoleWorkspaceDescriptor,
  ROLE_WORKSPACE_DESCRIPTORS,
  type SanctuaryRoleKey,
} from '../../content/roleWorkspaceRegistry';
import { TypewriterText } from './TypewriterText';

export type SanctuaryTabId = 'self' | 'workspace' | 'community' | 'library';

interface TabRoomInfo {
  id: SanctuaryTabId;
  label: string;
  icon: string;
  tutiiSentence: string;
  previewTitle: string;
  previewDetail: string;
}

const STATIC_ROOMS: Record<Exclude<SanctuaryTabId, 'workspace'>, TabRoomInfo> = {
  self: {
    id: 'self',
    label: 'Self',
    icon: '💗',
    tutiiSentence:
      'Self is your personal sanctuary. Your reflections, breathing breaks, and private notes live here. Nobody else can see this.',
    previewTitle: 'Inside Self',
    previewDetail: 'Daily Sadhanas • Mood Lotus • 2-Minute Singing Bowl Chimes',
  },
  community: {
    id: 'community',
    label: 'Community',
    icon: '🤝',
    tutiiSentence:
      'Community is your school circle: verified staff notices, announcements, and circulars without phone number spam.',
    previewTitle: 'Inside Community',
    previewDetail: 'Verified Staff Circulars • Announcements • Zero Phone Number Leak',
  },
  library: {
    id: 'library',
    label: 'Library',
    icon: '📚',
    tutiiSentence:
      'Library holds verified textbooks, ministry pedagogical guidelines, and lesson plans right at your fingertips.',
    previewTitle: 'Inside Library',
    previewDetail: 'Curated Ministry Guidelines • Textbooks • Lesson Plans by Grade',
  },
};

const TAB_ORDER: SanctuaryTabId[] = ['self', 'workspace', 'community', 'library'];

// Sanctuary Resonance Rhythm:
// Full breath cycle: 5s Inhale (Tutti speaks calmly) + 5s Exhale (Bottom detail settles)
// Followed by 1 full resting breath cycle (4.5s) before any action or pointer is suggested.
const SPEECH_SPEED_MS = 650; // ~90 WPM: serene spoken delivery
const COGNITIVE_READ_PAUSE_MS = 4500; // 4.5 seconds resting stillness window

interface TuttiInteractiveSandboxProps {
  onExploreHeaderControls?: () => void;
}

export function TuttiInteractiveSandbox({
  onExploreHeaderControls,
}: Readonly<TuttiInteractiveSandboxProps> = {}) {
  const [selectedRole, setSelectedRole] = useState<SanctuaryRoleKey>('teacher');
  const [phase, setPhase] = useState<'greeting' | 'nav-intro' | 'room-active' | 'finish'>(
    'greeting',
  );
  const [activeTab, setActiveTab] = useState<SanctuaryTabId | null>(null);
  const [suggestedTab, setSuggestedTab] = useState<SanctuaryTabId>('self');
  const [exploredTabs, setExploredTabs] = useState<Set<SanctuaryTabId>>(new Set());

  // Adapt the workspace room dynamically based on the active role
  const roleDescriptor = useMemo(() => getRoleWorkspaceDescriptor(selectedRole), [selectedRole]);

  const activeRoomsMap = useMemo<Record<SanctuaryTabId, TabRoomInfo>>(() => {
    return {
      self: STATIC_ROOMS.self,
      workspace: {
        id: 'workspace',
        label: roleDescriptor.tabLabel,
        icon: roleDescriptor.tabIcon,
        tutiiSentence: roleDescriptor.tutiiSentence,
        previewTitle: roleDescriptor.previewTitle,
        previewDetail: roleDescriptor.previewDetail,
      },
      community: STATIC_ROOMS.community,
      library: STATIC_ROOMS.library,
    };
  }, [roleDescriptor]);

  // Strict Chained Milestones:
  // Step 1: Top speech types
  // Step 2: Top speech completes
  // Step 3: Bottom box appears and types
  // Step 4: Bottom box completes
  // Step 5: Full resting breath cognitive silence/reading window -> ONLY THEN does the CTA finger appear!
  const [isTopSpeechDone, setIsTopSpeechDone] = useState<boolean>(false);
  const [isBottomDetailDone, setIsBottomDetailDone] = useState<boolean>(false);
  const [isCognitivePauseElapsed, setIsCognitivePauseElapsed] = useState<boolean>(false);

  // Directly handle switching roles live
  const handleSelectRole = useCallback((role: SanctuaryRoleKey) => {
    setSelectedRole(role);
    setIsTopSpeechDone(false);
    setIsBottomDetailDone(false);
    setIsCognitivePauseElapsed(false);
  }, []);

  // Directly handle clicking ANY tab
  const handleSelectTab = useCallback((tabId: SanctuaryTabId) => {
    // Instantly hide all CTAs and explanations while transitioning
    setIsTopSpeechDone(false);
    setIsBottomDetailDone(false);
    setIsCognitivePauseElapsed(false);

    setActiveTab(tabId);
    setPhase('room-active');

    setExploredTabs((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(tabId);
      const remaining = TAB_ORDER.find((t) => !nextSet.has(t));
      if (remaining) {
        setSuggestedTab(remaining);
      }
      return nextSet;
    });
  }, []);

  // When top speech completes, allow bottom box to mount
  const handleTopSpeechComplete = useCallback(() => {
    setIsTopSpeechDone(true);
  }, []);

  // When bottom explanation completes, initiate the resting cognitive absorption window
  const handleBottomDetailComplete = useCallback(() => {
    setIsBottomDetailDone(true);
  }, []);

  // Enforce the calm cognitive stabilization window before the CTA is allowed to appear
  useEffect(() => {
    if (phase === 'nav-intro' && isTopSpeechDone) {
      const timer = setTimeout(() => {
        setIsCognitivePauseElapsed(true);
      }, COGNITIVE_READ_PAUSE_MS);
      return () => clearTimeout(timer);
    }

    if (phase === 'room-active' && isBottomDetailDone) {
      const timer = setTimeout(() => {
        setIsCognitivePauseElapsed(true);
      }, COGNITIVE_READ_PAUSE_MS);
      return () => clearTimeout(timer);
    }
  }, [phase, isTopSpeechDone, isBottomDetailDone]);

  // Current spoken sentence
  const currentSentence = (() => {
    if (phase === 'greeting') {
      return 'Hey! I’m Tutti. Come with me, let’s walk through the app together.';
    }
    if (phase === 'nav-intro') {
      return `See this bar down here? As a ${roleDescriptor.roleLabel}, tap ${roleDescriptor.tabLabel} or any room to explore what it does.`;
    }
    if (phase === 'room-active' && activeTab) {
      return activeRoomsMap[activeTab].tutiiSentence;
    }
    return 'And that is the flow! Where would you like to step first?';
  })();

  const activeRoom = activeTab ? activeRoomsMap[activeTab] : null;

  // The CTA pointer ONLY appears AFTER the full 1.8s cognitive reading window has elapsed!
  const showPointerCTA =
    phase === 'nav-intro'
      ? isTopSpeechDone && isCognitivePauseElapsed
      : phase === 'room-active'
        ? isBottomDetailDone && isCognitivePauseElapsed && !exploredTabs.has(suggestedTab)
        : false;

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
          <img
            src="/mascot/firefly-guide-welcome-light-cutout-v2.webp"
            alt="Tutti"
            width={96}
            height={96}
            className="object-contain filter drop-shadow-[0_0_24px_rgba(251,191,36,0.45)]"
            priority
          />
        </div>

        {/* Word-by-Word Speech Balloon (Paced at 320ms / word) */}
        <div className="relative z-20 mt-4 max-w-lg w-full px-4">
          <div className="relative bg-stone-900/95 border border-amber-500/30 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl transition-all duration-500 min-h-[88px] flex items-center justify-center">
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-900 border-t border-l border-amber-500/30 rotate-45"
              aria-hidden="true"
            />
            <p className="text-base sm:text-lg font-medium text-stone-100 text-center leading-relaxed">
              &ldquo;
              <TypewriterText
                key={`${selectedRole}-${activeTab ?? phase}`}
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
          2. THE STAGE: STRICT PROGRESSIVE REVEAL
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full flex-1 flex flex-col justify-center items-center py-6 px-4">
        {/* BEAT 0: Empty stage, prompt to start */}
        {phase === 'greeting' && (
          <div className="text-center space-y-4 animate-in fade-in duration-700">
            <button
              type="button"
              onClick={() => setPhase('nav-intro')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span>Show Me the Rooms →</span>
            </button>
          </div>
        )}

        {/* ACTIVE NAVIGATION STAGE */}
        {(phase === 'nav-intro' || phase === 'room-active') && (
          <div className="w-full max-w-md space-y-6 transition-all duration-700 ease-out animate-in fade-in">
            {/* ROLE LENS SWITCHER: Demonstrates role-adaptive naming */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">
                Viewing As:
              </span>
              <div className="inline-flex items-center bg-stone-900/90 border border-stone-800/80 rounded-full p-1 shadow-inner gap-1">
                {AVAILABLE_ROLES_LIST.map((rKey) => {
                  const rDesc = ROLE_WORKSPACE_DESCRIPTORS[rKey];
                  const isCurrent = selectedRole === rKey;
                  return (
                    <button
                      key={rKey}
                      type="button"
                      onClick={() => handleSelectRole(rKey)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-amber-400 text-stone-950 font-bold shadow-md scale-105'
                          : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                      }`}
                    >
                      <span>{rDesc.roleEmoji}</span>
                      <span>{rDesc.roleLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* The 4 Sanctuary Tabs */}
            <div className="relative bg-stone-900/90 border border-stone-800 p-3 rounded-2xl shadow-xl">
              <div className="grid grid-cols-4 gap-3">
                {TAB_ORDER.map((tabId) => {
                  const item = activeRoomsMap[tabId];
                  const isSelected = activeTab === tabId;
                  const isTargetCTA = showPointerCTA && suggestedTab === tabId && !isSelected;

                  return (
                    <div key={tabId} className="relative flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => handleSelectTab(tabId)}
                        className={`w-full flex flex-col items-center py-3.5 px-2 rounded-xl transition-all duration-500 ease-out cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-[0_0_24px_rgba(251,191,36,0.45)] scale-105'
                            : isTargetCTA
                              ? 'border-2 border-amber-400 bg-amber-400/10 text-amber-300 ring-4 ring-amber-400/20 hover:scale-105'
                              : 'text-stone-400 bg-stone-950/60 hover:text-stone-200 hover:bg-stone-900'
                        }`}
                      >
                        <span className="text-2xl mb-1">{item.icon}</span>
                        <span className="text-xs font-semibold">{item.label}</span>
                      </button>

                      {/* Finger pointer: ONLY appears AFTER the 1.8-second cognitive window has fully elapsed! */}
                      {isTargetCTA && (
                        <div className="absolute top-full mt-3 flex flex-col items-center animate-[bounce_2s_ease-in-out_infinite] z-30 pointer-events-none transition-all duration-700 ease-out animate-in fade-in zoom-in-95">
                          <span className="text-2xl mb-1">☝️</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-stone-950/95 px-2.5 py-1 rounded-full border border-amber-400/50 shadow-lg whitespace-nowrap">
                            Click {item.label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FOCUSED EXPLANATION: Appears smoothly once Tutti top speech finishes */}
            {activeRoom && isTopSpeechDone && (
              <div className="bg-stone-900 border border-amber-500/40 rounded-2xl p-5 text-center space-y-1.5 shadow-xl transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                  {activeRoom.previewTitle}
                </span>
                <p className="text-xs sm:text-sm text-stone-200">
                  <TypewriterText
                    key={`detail-${activeRoom.id}`}
                    text={activeRoom.previewDetail}
                    speedMs={SPEECH_SPEED_MS}
                    onComplete={handleBottomDetailComplete}
                  />
                </p>
              </div>
            )}
          </div>
        )}

        {/* PHASE FINISH: Clean doorways */}
        {phase === 'finish' && (
          <div className="w-full max-w-sm space-y-3.5 text-center transition-all duration-700 ease-out animate-in fade-in zoom-in-95">
            <a
              href={roleDescriptor.href}
              className="block w-full p-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm shadow-xl transition duration-300"
            >
              Step Into {roleDescriptor.tabLabel} →
            </a>
            <a
              href="/self"
              className="block w-full p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-bold text-sm border border-stone-800 transition duration-300"
            >
              Step Into Self Sanctuary →
            </a>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. BOTTOM: EXPLORATION TRACKER
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full border-t border-stone-900 pt-4 px-4 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2">
          {exploredTabs.size > 0 && phase !== 'finish' && (
            <span className="text-stone-400">Explored {exploredTabs.size} of 4 rooms</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {exploredTabs.size >= 2 && phase !== 'finish' && (
            <button
              type="button"
              onClick={() => setPhase('finish')}
              className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md transition duration-200"
            >
              I’m Ready to Start →
            </button>
          )}

          <a href="/support" className="hover:text-stone-300 transition duration-200 px-2 py-1">
            Exit to Support
          </a>
        </div>
      </div>
    </div>
  );
}
