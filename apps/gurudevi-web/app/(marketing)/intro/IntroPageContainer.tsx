'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HeaderTourModule } from './HeaderTourModule';
import { TuttiInteractiveSandbox } from './TuttiInteractiveSandbox';

export function IntroPageContainer() {
  const [activeModule, setActiveModule] = useState<'main-tabs' | 'header-controls'>('main-tabs');

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Switcher Bar allowing users to test either module modularly */}
      <div className="w-full max-w-md mx-auto mb-4 flex items-center justify-center gap-2 p-1.5 rounded-full bg-stone-900 border border-stone-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveModule('main-tabs')}
          className={`px-4 py-1.5 rounded-full transition-all ${
            activeModule === 'main-tabs'
              ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          1. Main Rooms (Tabs)
        </button>

        <button
          type="button"
          onClick={() => setActiveModule('header-controls')}
          className={`px-4 py-1.5 rounded-full transition-all ${
            activeModule === 'header-controls'
              ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          2. Quick Tools (Top Bar)
        </button>
      </div>

      {/* Module 1: The 4 Main Sanctuary Rooms */}
      {activeModule === 'main-tabs' && (
        <TuttiInteractiveSandbox
          onExploreHeaderControls={() => setActiveModule('header-controls')}
        />
      )}

      {/* Module 2: The Top Bar Action Icons (Search, Day/Night, Help, Notifications, Profile) */}
      {activeModule === 'header-controls' && (
        <HeaderTourModule
          onBackToMainTabs={() => setActiveModule('main-tabs')}
          onFinish={() => {
            // Can redirect or show finish screen
          }}
        />
      )}
    </div>
  );
}
