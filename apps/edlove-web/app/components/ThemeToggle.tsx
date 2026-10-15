'use client';

import React, { useSyncExternalStore } from 'react';
import { useTheme } from './ThemeProvider';

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="w-20 h-7 rounded-full bg-[#f0eade] dark:bg-[#23262f] animate-pulse" />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className="inline-flex items-center p-0.5 rounded-full bg-[#f0eade] dark:bg-[#23262f] border border-[#e2d8c3] dark:border-[#333742] text-xs transition-colors"
    >
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        onClick={() => setTheme('light')}
        title="Light theme"
        className={`px-2 py-1 rounded-full flex items-center gap-1 transition-all text-[11px] font-sans font-medium active:scale-95 ${
          theme === 'light'
            ? 'bg-[#fffefb] text-[#a85022] shadow-xs font-semibold'
            : 'text-[#615951] dark:text-[#9ea4b0] hover:text-[#1a1714] dark:hover:text-white'
        }`}
      >
        <span aria-hidden="true">☀️</span>
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        onClick={() => setTheme('dark')}
        title="Dark theme"
        className={`px-2 py-1 rounded-full flex items-center gap-1 transition-all text-[11px] font-sans font-medium active:scale-95 ${
          theme === 'dark'
            ? 'bg-[#181a1f] text-[#f09b6e] shadow-xs font-semibold border border-[#363a45]'
            : 'text-[#615951] dark:text-[#9ea4b0] hover:text-[#1a1714] dark:hover:text-white'
        }`}
      >
        <span aria-hidden="true">🌙</span>
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === 'system'}
        onClick={() => setTheme('system')}
        title="System preference"
        className={`px-2 py-1 rounded-full flex items-center gap-1 transition-all text-[11px] font-sans font-medium active:scale-95 ${
          theme === 'system'
            ? 'bg-[#fffefb] dark:bg-[#181a1f] text-[#1a1714] dark:text-[#f5f2eb] shadow-xs font-semibold border border-transparent dark:border-[#363a45]'
            : 'text-[#615951] dark:text-[#9ea4b0] hover:text-[#1a1714] dark:hover:text-white'
        }`}
      >
        <span aria-hidden="true">💻</span>
        <span className="hidden sm:inline">Auto</span>
      </button>
    </div>
  );
}
